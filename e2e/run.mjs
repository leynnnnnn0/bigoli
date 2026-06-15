/* global process */
import assert from 'node:assert/strict';
import { mkdtempSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import puppeteer from 'puppeteer';

const root = new URL('..', import.meta.url).pathname;
const port = Number(process.env.E2E_PORT ?? 3137);
const baseUrl = `http://127.0.0.1:${port}`;
const tempDir = mkdtempSync(join(tmpdir(), 'stampbayan-e2e-'));
const database = join(tempDir, 'database.sqlite');
const envFile = join(root, '.env.e2e');
const appKey = `base64:${randomBytes(32).toString('base64')}`;
writeFileSync(database, '');
writeFileSync(envFile, [
  'APP_NAME="StampBayan E2E"',
  'APP_ENV=e2e',
  `APP_KEY=${appKey}`,
  'APP_DEBUG=false',
  `APP_URL=${baseUrl}`,
  'DB_CONNECTION=sqlite',
  `DB_DATABASE=${database}`,
  'CACHE_STORE=array',
  'QUEUE_CONNECTION=sync',
  'SESSION_DRIVER=database',
  'MAIL_MAILER=array',
  '',
].join('\n'));

const env = {
  ...process.env,
  APP_ENV: 'e2e',
  APP_DEBUG: 'false',
  APP_KEY: appKey,
  APP_URL: baseUrl,
  DB_CONNECTION: 'sqlite',
  DB_DATABASE: database,
  CACHE_STORE: 'array',
  QUEUE_CONNECTION: 'sync',
  SESSION_DRIVER: 'database',
  MAIL_MAILER: 'array',
};

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: root, env, stdio: 'inherit' });
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(' ')} failed with ${code}`));
    });
  });
}

function start(command, args) {
  const child = spawn(command, args, { cwd: root, env, stdio: ['ignore', 'pipe', 'pipe'] });
  child.stdout.on('data', (chunk) => process.stdout.write(chunk));
  child.stderr.on('data', (chunk) => process.stderr.write(chunk));
  return child;
}

async function waitForServer() {
  const started = Date.now();

  while (Date.now() - started < 30000) {
    try {
      const response = await fetch(baseUrl);
      if (response.status < 500) return;
    } catch {
      // Server is still warming up.
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Timed out waiting for ${baseUrl}`);
}

async function pageText(page) {
  return page.evaluate(() => document.body.innerText);
}

async function login(page, path, fields) {
  await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle0' });

  const payload = {};
  for (const [selector, value] of Object.entries(fields)) {
    await page.waitForSelector(selector);
    await page.click(selector, { clickCount: 3 });
    await page.type(selector, value);
    payload[selector.replace(/^#/, '')] = value;
  }

  if (process.env.E2E_DEBUG === '1') {
    console.log(await page.$eval('form', (form) => ({
      action: form.action,
      method: form.method,
      html: form.outerHTML.slice(0, 300),
    })));
  }

  const cookies = await page.cookies();
  const xsrfToken = cookies.find((cookie) => cookie.name === 'XSRF-TOKEN')?.value;

  const result = await page.evaluate(async ({ path, payload, xsrfToken }) => {
    const response = await fetch(path, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(xsrfToken ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrfToken) } : {}),
      },
      credentials: 'same-origin',
      body: JSON.stringify(payload),
    });

    return {
      status: response.status,
      body: await response.text(),
    };
  }, { path, payload, xsrfToken });

  if (![200, 204, 302, 409, 422].includes(result.status)) {
    throw new Error(`Login request to ${path} failed with ${result.status}: ${result.body.slice(0, 300)}`);
  }

  return result;
}

async function withFreshPage(browser, callback) {
  const context = browser.createBrowserContext
    ? await browser.createBrowserContext()
    : await browser.createIncognitoBrowserContext();
  const page = await context.newPage();
  try {
    await callback(page);
  } finally {
    await context.close();
  }
}

let server;
let browser;

try {
  await run('php', ['artisan', 'config:clear']);
  await run('php', ['artisan', 'migrate:fresh', '--force']);
  await run('php', ['artisan', 'db:seed', '--class=E2ETestSeeder', '--force']);

  server = start('php', ['artisan', 'serve', '--host=127.0.0.1', `--port=${port}`]);
  await waitForServer();

  browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  await withFreshPage(browser, async (page) => {
    const response = await page.goto(baseUrl, { waitUntil: 'networkidle0' });
    assert.ok(response?.ok(), 'homepage should load');
    assert.match(await pageText(page), /StampBayan|stamp/i);
  });

  await withFreshPage(browser, async (page) => {
    await page.goto(`${baseUrl}/business/dashboard`, { waitUntil: 'networkidle0' });
    assert.ok(page.url().includes('/login'), 'business dashboard should redirect guests to business login');
  });

  await withFreshPage(browser, async (page) => {
    const result = await login(page, '/login', {
      '#email': 'e2e-business@example.com',
      '#password': 'password',
    });
    assert.notEqual(result.status, 422, `business login validation failed: ${result.body}`);
    await page.goto(`${baseUrl}/business/dashboard`, { waitUntil: 'networkidle0' });
    assert.ok(page.url().includes('/business/dashboard'), 'business user should reach dashboard');
    assert.match(await pageText(page), /Total Customers|Customer Traffic/i);
  });

  await withFreshPage(browser, async (page) => {
    const result = await login(page, '/customer/login', {
      '#email': 'e2e-customer@example.com',
      '#password': 'password',
    });
    assert.notEqual(result.status, 422, `customer login validation failed: ${result.body}`);
    await page.goto(`${baseUrl}/customer/dashboard`, { waitUntil: 'networkidle0' });
    assert.ok(page.url().includes('/customer/dashboard'), 'customer should reach dashboard');
    assert.match(await pageText(page), /E2E-CUSTOMER|E2E Rewards/i);
  });

  await withFreshPage(browser, async (page) => {
    const result = await login(page, '/staff/login', {
      '#username': 'e2e-staff',
      '#password': 'password',
    });
    assert.notEqual(result.status, 422, `staff login validation failed: ${result.body}`);
    await page.goto(`${baseUrl}/staff/dashboard`, { waitUntil: 'networkidle0' });
    assert.ok(page.url().includes('/staff/dashboard'), 'staff should reach dashboard');
    assert.match(await pageText(page), /E2E Rewards|E2E Main Branch/i);
  });

  await withFreshPage(browser, async (page) => {
    await login(page, '/staff/login', {
      '#username': 'e2e-inactive',
      '#password': 'password',
    });
    assert.ok(page.url().includes('/staff/login'), 'inactive staff should stay on login');
    assert.match(await pageText(page), /credentials|failed|Sign in/i);
  });

  console.log('E2E tests passed');
} finally {
  if (browser) await browser.close();
  if (server) server.kill('SIGTERM');
  try {
    unlinkSync(envFile);
  } catch {
    // The file may already have been removed.
  }
}
