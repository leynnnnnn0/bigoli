<?php

use Symfony\Component\HttpFoundation\Cookie;

function sessionCookieLifetimeInMinutes($response): int
{
    /** @var Cookie $cookie */
    $cookie = collect($response->headers->getCookies())
        ->first(fn (Cookie $cookie) => $cookie->getName() === config('session.cookie'));

    expect($cookie)->not->toBeNull();

    return (int) round(($cookie->getExpiresTime() - time()) / 60);
}

test('business sessions last one day', function () {
    $domain = config('portals.domains.admin');

    expect(sessionCookieLifetimeInMinutes($this->get("https://{$domain}/login")))->toBe(1440);
});

test('staff sessions last seven days', function () {
    $domain = config('portals.domains.staff');

    expect(sessionCookieLifetimeInMinutes($this->get("https://{$domain}/login")))->toBe(10080);
});

test('customer sessions last fourteen days', function () {
    $domain = config('portals.domains.customer');

    expect(sessionCookieLifetimeInMinutes($this->get("https://{$domain}/login")))->toBe(20160);
});
