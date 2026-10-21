<?php

use App\Models\Business;
use App\Services\QRStudioService;

test('QR Studio uses the configured customer registration URL', function () {
    config()->set('portals.customer_register_url', 'https://dev-rewards.bigoli.ph/register');

    $business = Business::factory()->create();
    $business->forceFill(['subdomain' => 'bigoli.stampbayan.com'])->save();

    $url = app(QRStudioService::class)->registrationUrl($business, 4);

    expect($url)->toBe(
        "https://dev-rewards.bigoli.ph/register?business={$business->qr_token}&branch_id=4"
    )->not->toContain('bigoli.stampbayan.com');
});

test('QR Studio omits the branch when generating an all-branches URL', function () {
    config()->set('portals.customer_register_url', 'https://dev-rewards.bigoli.ph/register');

    $business = Business::factory()->create();

    expect(app(QRStudioService::class)->registrationUrl($business))
        ->toBe("https://dev-rewards.bigoli.ph/register?business={$business->qr_token}")
        ->not->toContain('branch_id');
});
