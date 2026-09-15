<?php

use App\Models\Business;
use App\Models\Customer;
use App\Models\LoyaltyCard;
use App\Models\Perk;
use App\Models\PerkClaim;
use App\Models\Staff;
use App\Models\StampCode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

function staffDashboardFixtures(): array
{
    $business = Business::factory()->create();
    $staff = Staff::factory()->for($business)->create();
    $card = LoyaltyCard::factory()->for($business)->create();

    return [$business, $staff, $card];
}

test('viewing or refreshing the staff dashboard does not generate a stamp code', function () {
    [, $staff, $card] = staffDashboardFixtures();

    $url = "/staff/dashboard?loyalty_card_id={$card->id}&transaction_number=ORDER-100";

    $this->actingAs($staff, 'staff')->get($url)->assertOk();
    $this->get($url)->assertOk();

    $this->assertDatabaseCount('stamp_codes', 0);
});

test('staff code generation creates exactly one code and refresh is safe', function () {
    [, $staff, $card] = staffDashboardFixtures();

    $response = $this->actingAs($staff, 'staff')->post('/staff/dashboard/generate-code', [
        'loyalty_card_id' => $card->id,
        'transaction_number' => 'ORDER-101',
        'amount_spent' => 0,
    ]);

    $response->assertRedirect('/staff/dashboard?tab=issue-stamp');
    $this->assertDatabaseCount('stamp_codes', 1);
    $this->assertDatabaseHas('stamp_codes', [
        'transaction_number' => 'ORDER-101',
        'amount_spent' => 0,
    ]);

    $this->get('/staff/dashboard?tab=issue-stamp')->assertOk();
    $this->assertDatabaseCount('stamp_codes', 1);
});

test('staff cannot generate a stamp below the loyalty card minimum spend', function () {
    [, $staff, $card] = staffDashboardFixtures();
    $card->update(['minimum_amount_spent' => 500]);

    $this->actingAs($staff, 'staff')->post('/staff/dashboard/generate-code', [
        'loyalty_card_id' => $card->id,
        'transaction_number' => 'ORDER-LOW',
        'amount_spent' => 499,
    ])->assertSessionHasErrors([
        'amount_spent' => 'Minimum amount spent should be 500.00 to generate a stamp.',
    ]);

    $this->assertDatabaseCount('stamp_codes', 0);
});

test('staff reward and code tabs are paginated by ten', function () {
    [$business, $staff, $card] = staffDashboardFixtures();
    $customer = Customer::factory()->for($business)->create();
    $perk = Perk::factory()->create(['loyalty_card_id' => $card->id]);

    PerkClaim::factory()->count(11)->create([
        'customer_id' => $customer->id,
        'loyalty_card_id' => $card->id,
        'perk_id' => $perk->id,
    ]);
    StampCode::factory()->count(11)->create([
        'user_id' => null,
        'staff_id' => $staff->id,
        'business_id' => $business->id,
        'loyalty_card_id' => $card->id,
    ]);

    $this->actingAs($staff, 'staff')
        ->get('/staff/dashboard?tab=stamp-codes')
        ->assertInertia(fn (Assert $page) => $page
            ->component('Staff/Dashboard/Index')
            ->where('active_tab', 'stamp-codes')
            ->has('perkClaims.data', 10)
            ->where('perkClaims.per_page', 10)
            ->where('perkClaims.total', 11)
            ->has('stampCodes.data', 10)
            ->where('stampCodes.per_page', 10)
            ->where('stampCodes.total', 11)
        );
});

test('staff dashboard identifies the staff member who redeemed a perk', function () {
    [$business, $staff, $card] = staffDashboardFixtures();
    $customer = Customer::factory()->for($business)->create();
    $perk = Perk::factory()->create(['loyalty_card_id' => $card->id]);

    PerkClaim::factory()->create([
        'customer_id' => $customer->id,
        'loyalty_card_id' => $card->id,
        'perk_id' => $perk->id,
        'is_redeemed' => true,
        'redeemed_at' => now(),
        'redeemed_by_staff_id' => $staff->id,
    ]);

    $this->actingAs($staff, 'staff')
        ->get('/staff/dashboard?tab=perk-claims')
        ->assertInertia(fn (Assert $page) => $page
            ->where('active_tab', 'perk-claims')
            ->where('perkClaims.data.0.redeemed_by_staff.username', $staff->username)
        );
});
