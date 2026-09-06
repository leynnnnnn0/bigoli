<?php

use App\Models\Branch;
use App\Models\Business;
use App\Models\Customer;
use App\Models\LoyaltyCard;
use App\Models\Perk;
use App\Models\StampCode;
use Inertia\Testing\AssertableInertia as Assert;

function requirementOwner(): array
{
    $business = Business::factory()->create();

    return [$business, $business->user];
}

function validCardRequest(array $overrides = []): array
{
    return array_merge([
        'name' => 'Regression Card',
        'heading' => 'Collect stamps',
        'subheading' => 'Earn rewards',
        'valid_until' => now()->addYear()->toDateString(),
        'stampsNeeded' => 5,
        'mechanics' => 'Collect five stamps.',
        'stampShape' => 'circle',
        'perks' => [],
        'branch_ids' => [],
    ], $overrides);
}

test('IS-03 requires a reference number whenever an online stamp code is requested', function () {
    [$business, $owner] = requirementOwner();
    $card = LoyaltyCard::factory()->for($business)->create();

    $this->actingAs($owner)
        ->get("/business/issue-stamp?loyalty_card_id={$card->id}")
        ->assertSessionHasErrors('reference_number');

    expect($business->stampCodes()->count())->toBe(0);
});

test('online stamp codes do not expire and remain redeemable until used', function () {
    [$business, $owner] = requirementOwner();
    $card = LoyaltyCard::factory()->for($business)->create(['stampsNeeded' => 10]);
    $customer = Customer::factory()->for($business)->create();
    $viewedCode = StampCode::factory()->create([
        'user_id' => $owner->id,
        'business_id' => $business->id,
        'loyalty_card_id' => $card->id,
        'code' => 'STALEVIEW',
        'created_at' => now()->subMinutes(16),
        'is_expired' => false,
        'is_offline_code' => false,
    ]);

    $this->actingAs($owner)->get('/business/issue-stamp')->assertOk();
    expect($viewedCode->fresh()->is_expired)->toBeFalse()
        ->and($viewedCode->fresh()->used_at)->toBeNull();

    $redeemedCode = StampCode::factory()->create([
        'user_id' => $owner->id,
        'business_id' => $business->id,
        'loyalty_card_id' => $card->id,
        'code' => 'STALEREDEEM',
        'created_at' => now()->subMinutes(16),
        'is_expired' => true,
        'is_offline_code' => false,
    ]);

    $this->actingAs($customer, 'customer')
        ->post('/stamps/record', ['code' => $redeemedCode->code, 'loyalty_card_id' => $card->id])
        ->assertSessionHasNoErrors();

    expect($redeemedCode->fresh()->is_expired)->toBeTrue()
        ->and($redeemedCode->fresh()->used_at)->not->toBeNull();
});

test('LC-03 creates a card when optional perk color is omitted', function () {
    [$business, $owner] = requirementOwner();

    $this->actingAs($owner)->post('/business/card-templates', validCardRequest([
        'perks' => [['stampNumber' => 3, 'reward' => 'Free drink']],
    ]))->assertRedirect();

    $card = $business->loyaltyCards()->where('name', 'Regression Card')->firstOrFail();
    expect($card->perks)->toHaveCount(1)
        ->and($card->perks->first()->color)->toBe('#000000');
});

test('LC-09 preserves an existing perk color when an edit omits the optional color', function () {
    [$business, $owner] = requirementOwner();
    $card = LoyaltyCard::factory()->for($business)->create(['name' => 'Existing Card']);
    $perk = Perk::factory()->for($card, 'loyaltyCard')->create(['color' => '#ABCDEF']);

    $this->actingAs($owner)->put("/business/card-templates/{$card->id}", validCardRequest([
        'name' => $card->name,
        'perks' => [['id' => $perk->id, 'stampNumber' => 4, 'reward' => 'Updated reward']],
    ]))->assertRedirect();

    expect($perk->fresh()->reward)->toBe('Updated reward')
        ->and($perk->fresh()->color)->toBe('#ABCDEF');
});

test('LC-06 rejects rewards outside the loyalty card stamp range', function () {
    [$business, $owner] = requirementOwner();

    $this->actingAs($owner)->post('/business/card-templates', validCardRequest([
        'stampsNeeded' => 5,
        'perks' => [['stampNumber' => 6, 'reward' => 'Impossible reward']],
    ]))->assertSessionHasErrors('perks.0.stampNumber');

    expect($business->loyaltyCards()->count())->toBe(0);
});

test('customer stamp history ignores the legacy expiration flag', function () {
    [$business, $owner] = requirementOwner();
    $branch = Branch::factory()->for($business)->create();
    $card = LoyaltyCard::factory()->for($business)->create();
    $customer = Customer::factory()->forBranch($branch)->create();
    StampCode::factory()->create([
        'user_id' => $owner->id,
        'business_id' => $business->id,
        'loyalty_card_id' => $card->id,
        'branch_id' => $branch->id,
        'customer_id' => $customer->id,
        'is_expired' => true,
    ]);

    $this->actingAs($owner)
        ->get("/business/customers/{$customer->id}")
        ->assertInertia(fn (Assert $page) => $page
            ->missing('customer.stamp_codes.0.is_expired')
            ->where('customer.stamp_codes.0.used_at', null));
});

test('B-07 blocks branch deletion when soft-deleted stamp history remains linked', function () {
    [$business, $owner] = requirementOwner();
    $branch = Branch::factory()->for($business)->create();
    $card = LoyaltyCard::factory()->for($business)->create();
    $stamp = StampCode::factory()->create([
        'user_id' => $owner->id,
        'business_id' => $business->id,
        'loyalty_card_id' => $card->id,
        'branch_id' => $branch->id,
    ]);
    $stamp->delete();

    $this->actingAs($owner)
        ->delete("/business/branches/{$branch->id}")
        ->assertSessionHas('error', 'Cannot delete branch because it has stamp codes linked to it.');

    $this->assertDatabaseHas('branches', ['id' => $branch->id]);
});
