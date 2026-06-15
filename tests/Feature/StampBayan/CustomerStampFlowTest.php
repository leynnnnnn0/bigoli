<?php

use App\Models\Branch;
use App\Models\Business;
use App\Models\CompletedLoyaltyCard;
use App\Models\Customer;
use App\Models\LoyaltyCard;
use App\Models\Perk;
use App\Models\PerkClaim;
use App\Models\StampCode;
use App\Models\User;

it('registers a customer for a selected business and branch', function () {
    $user = User::factory()->create();
    $business = Business::factory()->for($user)->create();
    $branch = Branch::factory()->for($business)->create();

    $this->post('/customer/register', [
        'business_id' => $business->id,
        'branch_id' => $branch->id,
        'username' => 'maria',
        'email' => 'maria@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertRedirect(route('customer.dashboard'));

    $this->assertAuthenticatedAs(Customer::firstWhere('email', 'maria@example.com'), 'customer');

    expect(Customer::firstWhere('email', 'maria@example.com'))
        ->business_id->toBe($business->id)
        ->branch_id->toBe($branch->id);
});

it('rejects customer registration when the branch belongs to another business', function () {
    $business = Business::factory()->create();
    $otherBranch = Branch::factory()->create();

    $this->post('/customer/register', [
        'business_id' => $business->id,
        'branch_id' => $otherBranch->id,
        'username' => 'wrongbranch',
        'email' => 'wrongbranch@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertSessionHasErrors('branch_id');
});

it('records stamps, unlocks perks, and completes a loyalty card', function () {
    $user = User::factory()->create();
    $business = Business::factory()->for($user)->create();
    $customer = Customer::factory()->for($business)->create();
    $card = LoyaltyCard::factory()->for($business)->create([
        'stampsNeeded' => 2,
    ]);
    $firstStampPerk = Perk::factory()->for($card)->create([
        'stampNumber' => 1,
        'reward' => 'Free cookie',
    ]);
    $completionPerk = Perk::factory()->for($card)->create([
        'stampNumber' => 2,
        'reward' => 'Free coffee',
    ]);

    $firstCode = StampCode::factory()->create([
        'user_id' => $user->id,
        'business_id' => $business->id,
        'loyalty_card_id' => $card->id,
        'code' => 'FIRST123',
    ]);
    $secondCode = StampCode::factory()->create([
        'user_id' => $user->id,
        'business_id' => $business->id,
        'loyalty_card_id' => $card->id,
        'code' => 'SECOND12',
    ]);

    $this->actingAs($customer, 'customer')
        ->post('/stamps/record', [
            'code' => $firstCode->code,
            'loyalty_card_id' => $card->id,
        ])
        ->assertRedirect()
        ->assertSessionHas('success', true)
        ->assertSessionHas('card_completed', false);

    expect($firstCode->fresh())
        ->customer_id->toBe($customer->id)
        ->used_at->not->toBeNull();

    expect(PerkClaim::where('customer_id', $customer->id)->where('perk_id', $firstStampPerk->id)->exists())->toBeTrue();

    $this->actingAs($customer, 'customer')
        ->post('/stamps/record', [
            'code' => $secondCode->code,
            'loyalty_card_id' => $card->id,
        ])
        ->assertRedirect()
        ->assertSessionHas('success', true)
        ->assertSessionHas('card_completed', true);

    expect(PerkClaim::where('customer_id', $customer->id)->where('perk_id', $completionPerk->id)->exists())->toBeTrue();
    expect(CompletedLoyaltyCard::where('customer_id', $customer->id)->where('loyalty_card_id', $card->id)->exists())->toBeTrue();
    expect(StampCode::withTrashed()->where('customer_id', $customer->id)->whereNotNull('deleted_at')->count())->toBe(2);
});

it('rejects stamp codes from another business', function () {
    $customer = Customer::factory()->create();
    $otherBusiness = Business::factory()->create();
    $otherCard = LoyaltyCard::factory()->for($otherBusiness)->create();
    $otherCode = StampCode::factory()->create([
        'business_id' => $otherBusiness->id,
        'loyalty_card_id' => $otherCard->id,
        'code' => 'OTHER999',
    ]);

    $this->actingAs($customer, 'customer')
        ->post('/stamps/record', [
            'code' => $otherCode->code,
            'loyalty_card_id' => $otherCard->id,
        ])
        ->assertSessionHasErrors('code');
});

it('updates customer profile and password after validating the current password', function () {
    $customer = Customer::factory()->create([
        'username' => 'old-name',
        'password' => bcrypt('password'),
    ]);

    $this->actingAs($customer, 'customer')
        ->post('/customer/profile/update', [
            'username' => 'new-name',
        ])
        ->assertRedirect();

    expect($customer->fresh()->username)->toBe('new-name');

    $this->actingAs($customer, 'customer')
        ->post('/customer/password/update', [
            'current_password' => 'wrong-password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ])
        ->assertSessionHasErrors('current_password');

    $this->actingAs($customer, 'customer')
        ->post('/customer/password/update', [
            'current_password' => 'password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ])
        ->assertRedirect();
});
