<?php

use App\Models\Business;
use App\Models\CompletedLoyaltyCard;
use App\Models\Customer;
use App\Models\LoyaltyCard;
use App\Models\PerkClaim;
use App\Models\Staff;
use App\Models\StampCode;
use App\Services\CardTemplateService;
use App\Services\LoyaltyStampService;
use App\Services\PerkClaimService;
use App\Services\StampCodeService;
use Database\Seeders\E2ETestSeeder;
use Illuminate\Validation\ValidationException;
use Inertia\Testing\AssertableInertia;

function loyaltySecurityFixture(): array
{
    test()->seed(E2ETestSeeder::class);
    $business = Business::firstOrFail();
    $customer = Customer::firstOrFail();
    $staff = Staff::where('is_active', true)->firstOrFail();
    $card = LoyaltyCard::firstOrFail();
    $signature = substr(hash_hmac('sha256', "{$customer->id}|{$business->id}", config('app.key')), 0, 24);

    return [$business, $customer, $staff, $card, [
        'customer_qr' => "stampbayan:customer:{$customer->id}:{$business->id}:{$signature}",
        'loyalty_card_id' => $card->id,
        'reference_number' => 'SECURITY-TEST',
    ]];
}

function earnedSecurityClaim(): array
{
    [$business, $customer, $staff, $card, $input] = loyaltySecurityFixture();
    $codes = app(StampCodeService::class);
    $loyalty = app(LoyaltyStampService::class);
    $codes->recordStaffCustomerScan($staff, $input, $loyalty);
    $codes->recordStaffCustomerScan($staff, $input, $loyalty);

    return [$business, $customer, $staff, $card, PerkClaim::firstOrFail()];
}

test('stale reward redemption requests cannot both succeed', function () {
    [$business, , $staff, , $claim] = earnedSecurityClaim();
    $otherRequest = PerkClaim::findOrFail($claim->id);
    $service = app(PerkClaimService::class);

    expect($service->redeem($claim, $business->id, null, $staff->id, 'First cashier'))->toBeTrue()
        ->and($service->redeem($otherRequest, $business->id, null, $staff->id, 'Second cashier'))->toBeFalse()
        ->and($claim->fresh()->remarks)->toBe('First cashier');
});

test('deactivating logged in staff prevents further loyalty actions', function () {
    [, , $staff, , $input] = loyaltySecurityFixture();
    $this->actingAs($staff, 'staff');
    $staff->update(['is_active' => false]);
    $this->postJson('/staff/scan-customer', $input)->assertForbidden();
    $this->assertGuest('staff');
    expect(StampCode::whereNotNull('used_at')->count())->toBe(0);
});

test('inactive staff cannot reopen or redeem rewards', function () {
    [, , $staff, , $claim] = earnedSecurityClaim();
    $staff->update(['is_active' => false]);
    $this->actingAs($staff, 'staff')->postJson("/staff/perk-claims/{$claim->id}/redeem")->assertForbidden();
    $this->actingAs($staff, 'staff')->postJson("/staff/perk-claims/{$claim->id}/undo")->assertForbidden();
    expect($claim->fresh()->is_redeemed)->toBeFalse();
});

test('removed offline endpoints cannot generate stamps', function () {
    [$business, , $staff, $card] = loyaltySecurityFixture();
    $this->actingAs($staff, 'staff')->get("/staff/generate-offline?id={$card->id}")->assertNotFound();
    $this->actingAs($business->user)->get("/business/issue-stamps/generate-offline?id={$card->id}")->assertNotFound();
    expect(StampCode::count())->toBe(1);
});

test('historical offline codes can no longer be redeemed', function () {
    [$business, $customer] = loyaltySecurityFixture();
    $code = StampCode::firstOrFail();
    $code->update(['is_offline_code' => true]);
    expect(app(StampCodeService::class)->redeemForCustomer($customer, $code->code, app(LoyaltyStampService::class)))->toBeNull()
        ->and($code->fresh()->used_at)->toBeNull()
        ->and(app(StampCodeService::class)->query($business->id, [])->count())->toBe(0);
    $code->update(['customer_id' => $customer->id, 'used_at' => now()]);
    expect(app(StampCodeService::class)->query($business->id, [])->count())->toBe(1);
});

test('expired loyalty cards cannot receive stamps through either path', function () {
    [, $customer, $staff, $card, $input] = loyaltySecurityFixture();
    $card->update(['valid_until' => now()->subDay()->toDateString()]);
    $code = StampCode::firstOrFail();
    $this->actingAs($customer, 'customer')->post('/stamps/record', ['code' => $code->code, 'loyalty_card_id' => $card->id])->assertSessionHasErrors('code');
    $this->actingAs($staff, 'staff')->post('/staff/scan-customer', $input)->assertSessionHasErrors('loyalty_card_id');
    expect($code->fresh()->used_at)->toBeNull()
        ->and(PerkClaim::count())->toBe(0);
});

test('earned perks cannot be modified removed or bypassed by deleting their card', function () {
    [$business, , , $card, $claim] = earnedSecurityClaim();
    $service = app(CardTemplateService::class);
    $data = $card->fresh()->toArray();
    $data['perks'] = $card->perks()->get()->toArray();
    $data['branch_ids'] = $card->branches()->pluck('branches.id')->all();
    foreach (['reward' => 'Changed', 'details' => 'Changed', 'stampNumber' => 1, 'color' => '#FFFFFF'] as $field => $value) {
        $edited = $data;
        $edited['perks'][0][$field] = $value;
        expect(fn () => $service->update($business, $card->id, $edited))->toThrow(ValidationException::class);
    }
    $removed = $data;
    $removed['perks'] = [];
    expect(fn () => $service->update($business, $card->id, $removed))->toThrow(ValidationException::class)
        ->and(fn () => $service->delete($business, $card->id))->toThrow(ValidationException::class)
        ->and($claim->fresh())->not->toBeNull();

    // Design/name edits still work when the earned reward is unchanged.
    $data['heading'] = 'New heading';
    expect($service->update($business, $card->id, $data)->heading)->toBe('New heading');
    $this->actingAs($business->user)->get("/business/card-templates/{$card->id}/edit")
        ->assertInertia(fn (AssertableInertia $page) => $page->where('cardTemplate.perks.0.claims_exists', true));
});

test('stamp cycles preserve exactly one milestone claim per cycle across issuance paths', function () {
    [$business, $customer, $staff, $card, $input] = loyaltySecurityFixture();
    $service = app(StampCodeService::class);
    $loyalty = app(LoyaltyStampService::class);
    $service->redeemForCustomer($customer, 'E2ECODE1', $loyalty);
    $input['branch_id'] = $staff->branch_id;
    $service->recordCustomerScan($business, $business->user_id, $input, $loyalty);
    $service->recordStaffCustomerScan($staff, $input, $loyalty);
    for ($i = 0; $i < 3; $i++) {
        $service->recordStaffCustomerScan($staff, $input, $loyalty);
    }
    expect(CompletedLoyaltyCard::orderBy('card_cycle')->pluck('card_cycle')->all())->toBe([1, 2])
        ->and(PerkClaim::count())->toBe(2)
        ->and(StampCode::where('customer_id', $customer->id)->count())->toBe(0)
        ->and(StampCode::withTrashed()->where('customer_id', $customer->id)->count())->toBe(6);
});
