<?php

use App\Models\Business;
use App\Models\User;
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

test('QR Studio uses the branch selected for the download instead of the stored branch', function () {
    config()->set('portals.customer_register_url', 'https://dev-rewards.bigoli.ph/register');

    $business = Business::factory()->create();
    $storedBranch = $business->branches()->create(['name' => 'Stored Branch']);
    $selectedBranch = $business->branches()->create(['name' => 'Selected Branch']);
    $business->qr_code()->create([
        'heading' => 'Join us',
        'subheading' => 'Scan to register',
        'branch_id' => $storedBranch->id,
    ]);

    $service = new class extends QRStudioService
    {
        protected function generateQrImage(string $url): string
        {
            return 'test-qr-image';
        }
    };

    $data = $service->downloadData($business, $selectedBranch->id);

    expect($data['qrUrl'])
        ->toContain("branch_id={$selectedBranch->id}")
        ->not->toContain("branch_id={$storedBranch->id}");
});

test('QR Studio passes the selected branch from the download request to the generator', function () {
    $user = User::factory()->create();
    $business = Business::factory()->for($user)->create();
    $branch = $business->branches()->create(['name' => 'Selected Branch']);

    $qrStudio = Mockery::mock(QRStudioService::class);
    $qrStudio->shouldReceive('downloadData')
        ->once()
        ->withArgs(fn (Business $actualBusiness, ?int $branchId) => $actualBusiness->is($business) && $branchId === $branch->id)
        ->andReturn([
            'heading' => 'Join us',
            'subheading' => 'Scan to register',
            'backgroundColor' => '#ffffff',
            'textColor' => '#000000',
            'qrCodeBase64' => null,
            'logoBase64' => null,
            'backgroundImageBase64' => null,
        ]);
    $this->app->instance(QRStudioService::class, $qrStudio);

    $this->actingAs($user)
        ->get(portalUrl('admin', "/qr-studio/download?branch_id={$branch->id}"))
        ->assertOk();
});
