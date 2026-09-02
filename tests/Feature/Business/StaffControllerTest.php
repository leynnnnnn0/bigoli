<?php

use App\Models\Branch;
use App\Models\Business;
use App\Models\PerkClaim;
use App\Models\Staff;
use App\Models\StampCode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

function businessOwner(): array
{
    $business = Business::factory()->create();

    return [$business, $business->user];
}

test('business owners can view only their staff accounts', function () {
    [$business, $owner] = businessOwner();
    $branch = Branch::factory()->for($business)->create(['name' => 'Main Branch']);
    $staff = Staff::factory()->for($business)->create([
        'branch_id' => $branch->id,
        'username' => 'owner-staff',
    ]);
    $otherStaff = Staff::factory()->create(['username' => 'other-staff']);

    $this->actingAs($owner)
        ->get('/business/staffs')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Business/Staff/Index')
            ->has('staffs', 1)
            ->where('staffs.0.id', $staff->id)
            ->where('staffs.0.username', 'owner-staff')
            ->missing('staffs.1')
            ->has('branches', 1)
            ->where('branches.0.id', $branch->id)
        );

    expect($otherStaff->business_id)->not->toBe($business->id);
});

test('business owners can create staff for their own branch', function () {
    [$business, $owner] = businessOwner();
    $branch = Branch::factory()->for($business)->create();

    $response = $this->actingAs($owner)->post('/business/staffs', [
        'branch_id' => $branch->id,
        'username' => 'new-staff',
        'password' => 'secure-password',
        'confirm_password' => 'secure-password',
        'remarks' => 'Morning shift',
        'is_active' => true,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('staff', [
        'business_id' => $business->id,
        'branch_id' => $branch->id,
        'username' => 'new-staff',
        'remarks' => 'Morning shift',
        'is_active' => true,
    ]);

    expect(Hash::check('secure-password', Staff::where('username', 'new-staff')->value('password')))->toBeTrue();
});

test('business owners cannot create staff for another business branch', function () {
    [$business, $owner] = businessOwner();
    $otherBranch = Branch::factory()->create();

    $this->actingAs($owner)
        ->post('/business/staffs', [
            'branch_id' => $otherBranch->id,
            'username' => 'unauthorized-staff',
            'password' => 'secure-password',
            'confirm_password' => 'secure-password',
        ])
        ->assertForbidden();

    $this->assertDatabaseMissing('staff', [
        'business_id' => $business->id,
        'username' => 'unauthorized-staff',
    ]);
});

test('business owners can update their staff without changing the password', function () {
    [$business, $owner] = businessOwner();
    $currentBranch = Branch::factory()->for($business)->create();
    $newBranch = Branch::factory()->for($business)->create();
    $staff = Staff::factory()->for($business)->create([
        'branch_id' => $currentBranch->id,
        'username' => 'existing-staff',
        'password' => Hash::make('current-password'),
    ]);

    $this->actingAs($owner)
        ->put("/business/staffs/{$staff->id}", [
            'branch_id' => $newBranch->id,
            'username' => 'updated-staff',
            'remarks' => 'Evening shift',
            'is_active' => false,
        ])
        ->assertRedirect();

    $staff->refresh();

    expect($staff)
        ->branch_id->toBe($newBranch->id)
        ->username->toBe('updated-staff')
        ->remarks->toBe('Evening shift')
        ->is_active->toBe(0);
    expect(Hash::check('current-password', $staff->password))->toBeTrue();
});

test('business owners cannot update or delete staff from another business', function () {
    [, $owner] = businessOwner();
    $otherStaff = Staff::factory()->create();
    $otherBranch = Branch::factory()->for($otherStaff->business)->create();

    $this->actingAs($owner)
        ->put("/business/staffs/{$otherStaff->id}", [
            'branch_id' => $otherBranch->id,
            'username' => 'changed-staff',
        ])
        ->assertForbidden();

    $this->actingAs($owner)
        ->delete("/business/staffs/{$otherStaff->id}")
        ->assertForbidden();

    $this->assertDatabaseHas('staff', ['id' => $otherStaff->id]);
});

test('business owners can delete their own staff account', function () {
    [$business, $owner] = businessOwner();
    $staff = Staff::factory()->for($business)->create();

    $this->actingAs($owner)
        ->delete("/business/staffs/{$staff->id}")
        ->assertRedirect();

    $this->assertDatabaseMissing('staff', ['id' => $staff->id]);
});

test('business owners cannot delete staff with recorded activity', function () {
    [$business, $owner] = businessOwner();
    $staff = Staff::factory()->for($business)->create();

    StampCode::factory()->create(['staff_id' => $staff->id]);
    PerkClaim::factory()->create(['redeemed_by_staff_id' => $staff->id]);

    $this->actingAs($owner)
        ->delete("/business/staffs/{$staff->id}")
        ->assertRedirect()
        ->assertSessionHas('error', 'This staff account cannot be deleted because it has recorded activity.');

    $this->assertDatabaseHas('staff', ['id' => $staff->id]);
});
