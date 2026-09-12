<?php

use App\Models\Branch;
use App\Models\Business;
use Inertia\Testing\AssertableInertia as Assert;

test('customers can open registration without a QR and choose a Bigoli branch', function () {
    $business = Business::factory()->create(['name' => 'Bigoli']);
    $branches = Branch::factory()->for($business)->count(2)->create();

    $this->get('/customer/register')->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('Customer/Auth/Register')
        ->where('business.id', $business->id)
        ->where('branch_id', null)
        ->has('branches', 2)
        ->where('branches.0.id', $branches->sortBy('name')->first()->id)
        ->missing('businesses')
        ->missing('business.qr_token'));

    $this->post('/customer/register', [
        'branch_id' => $branches->first()->id,
        'username' => 'newcustomer',
        'email' => 'newcustomer@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ])->assertSessionHasNoErrors()->assertRedirect('/customer/dashboard');

    $this->assertAuthenticated('customer');
    $this->assertDatabaseHas('customers', [
        'username' => 'newcustomer',
        'business_id' => $business->id,
        'branch_id' => $branches->first()->id,
    ]);
});

test('QR registration preserves its business and branch selection', function () {
    $business = Business::factory()->create(['name' => 'Bigoli']);
    $branch = Branch::factory()->for($business)->create();

    $this->get("/customer/register?business={$business->qr_token}&branch_id={$branch->id}")
        ->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('business.id', $business->id)
            ->where('branch_id', $branch->id));
});

test('registration rejects a branch from a different business', function () {
    $business = Business::factory()->create(['name' => 'Bigoli']);
    $other = Branch::factory()->create();

    $this->post('/customer/register', [
        'branch_id' => $other->id,
        'username' => 'wrongbranch', 'email' => 'wrongbranch@example.com',
        'password' => 'password123', 'password_confirmation' => 'password123',
    ])->assertSessionHasErrors('branch_id');

    $this->assertGuest('customer');
});

test('registration requires a branch', function () {
    Business::factory()->create(['name' => 'Bigoli']);

    $this->post('/customer/register', [
        'username' => 'nobranch', 'email' => 'nobranch@example.com',
        'password' => 'password123', 'password_confirmation' => 'password123',
    ])->assertSessionHasErrors('branch_id');

    $this->assertGuest('customer');
});
