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
    expect(sessionCookieLifetimeInMinutes($this->get('/login')))->toBe(1440);
});

test('staff sessions last seven days', function () {
    expect(sessionCookieLifetimeInMinutes($this->get('/staff/login')))->toBe(10080);
});

test('customer sessions last fourteen days', function () {
    expect(sessionCookieLifetimeInMinutes($this->get('/customer/login')))->toBe(20160);
});
