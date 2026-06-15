<?php

use App\Models\Business;
use App\Models\Customer;
use App\Models\LoyaltyCard;
use App\Models\Perk;
use App\Models\PerkClaim;
use App\Models\Staff;
use App\Models\User;

it('keeps protected dashboards behind their correct auth guards', function () {
    $customer = Customer::factory()->create();

    $this->get('/business/dashboard')->assertRedirect('/login');
    $this->get('/customer/dashboard')->assertRedirect(route('customer.login'));
    $this->get('/staff/dashboard')->assertRedirect(route('staff.login'));

    $this->actingAs($customer, 'customer')
        ->get('/business/dashboard')
        ->assertRedirect('/login');
});

it('authenticates active staff and rejects inactive staff', function () {
    $activeStaff = Staff::factory()->create([
        'username' => 'active-staff',
        'password' => bcrypt('password'),
        'is_active' => true,
    ]);
    $inactiveStaff = Staff::factory()->inactive()->create([
        'username' => 'inactive-staff',
        'password' => bcrypt('password'),
    ]);

    $this->post('/staff/login', [
        'username' => $inactiveStaff->username,
        'password' => 'password',
    ])->assertSessionHasErrors('username');

    $this->post('/staff/login', [
        'username' => $activeStaff->username,
        'password' => 'password',
    ])->assertRedirect(route('staff.dashboard'));

    $this->assertAuthenticatedAs($activeStaff, 'staff');
});

it('lets a business owner redeem and undo a perk claim for their business', function () {
    $user = User::factory()->create();
    $business = Business::factory()->for($user)->create();
    $customer = Customer::factory()->for($business)->create();
    $card = LoyaltyCard::factory()->for($business)->create();
    $perk = Perk::factory()->for($card)->create();
    $claim = PerkClaim::factory()->create([
        'customer_id' => $customer->id,
        'loyalty_card_id' => $card->id,
        'perk_id' => $perk->id,
    ]);

    $this->actingAs($user)
        ->post("/business/perk-claims/{$claim->id}/redeem", [
            'remarks' => 'Redeemed at counter',
        ])
        ->assertRedirect();

    expect($claim->fresh())
        ->is_redeemed->toBeTrue()
        ->redeemed_by->toBe($user->id)
        ->remarks->toBe('Redeemed at counter');

    $this->actingAs($user)
        ->post("/business/perk-claims/{$claim->id}/undo")
        ->assertRedirect();

    expect($claim->fresh())
        ->is_redeemed->toBeFalse()
        ->redeemed_at->toBeNull()
        ->redeemed_by->toBeNull();
});

it('prevents a business owner from redeeming another business perk claim', function () {
    $user = User::factory()->create();
    Business::factory()->for($user)->create();

    $otherBusiness = Business::factory()->create();
    $otherCustomer = Customer::factory()->for($otherBusiness)->create();
    $otherCard = LoyaltyCard::factory()->for($otherBusiness)->create();
    $otherPerk = Perk::factory()->for($otherCard)->create();
    $claim = PerkClaim::factory()->create([
        'customer_id' => $otherCustomer->id,
        'loyalty_card_id' => $otherCard->id,
        'perk_id' => $otherPerk->id,
    ]);

    $this->actingAs($user)
        ->post("/business/perk-claims/{$claim->id}/redeem")
        ->assertForbidden();

    expect($claim->fresh()->is_redeemed)->toBeFalse();
});

it('lets staff redeem perk claims only for their business', function () {
    $business = Business::factory()->create();
    $staff = Staff::factory()->for($business)->create();
    $customer = Customer::factory()->for($business)->create();
    $card = LoyaltyCard::factory()->for($business)->create();
    $perk = Perk::factory()->for($card)->create();
    $claim = PerkClaim::factory()->create([
        'customer_id' => $customer->id,
        'loyalty_card_id' => $card->id,
        'perk_id' => $perk->id,
    ]);

    $this->actingAs($staff, 'staff')
        ->post("/staff/perk-claims/{$claim->id}/redeem", [
            'remarks' => 'Staff redemption',
        ])
        ->assertRedirect();

    expect($claim->fresh())
        ->is_redeemed->toBeTrue()
        ->redeemed_by_staff_id->toBe($staff->id);
});
