<?php

use App\Models\Customer;
use App\Models\Staff;
use Inertia\Testing\AssertableInertia as Assert;

dataset('portal login pages', [
    'admin' => ['admin', 'auth/login'],
    'customer' => ['customer', 'Customer/Auth/Login'],
    'staff' => ['staff', 'Staff/Auth/Login'],
]);

test('portal domains are configured and unique', function () {
    $domains = config('portals.domains');

    expect($domains)
        ->toMatchArray([
            'admin' => 'admin-rewards.bigoli.test',
            'customer' => 'rewards.bigoli.test',
            'staff' => 'store-staff-rewards.bigoli.test',
        ])
        ->and(array_unique($domains))->toHaveCount(3);
});

test('each portal renders its own login page at login', function (string $portal, string $component) {
    $domain = config("portals.domains.{$portal}");

    $this->get("https://{$domain}/login")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component($component));
})->with('portal login pages');

test('each protected dashboard redirects guests to its own login page', function (string $portal) {
    $domain = config("portals.domains.{$portal}");

    $this->get("https://{$domain}/dashboard")
        ->assertRedirect("https://{$domain}/login");
})->with([
    'admin',
    'customer',
    'staff',
]);

test('each portal root enters through its dashboard', function (string $portal) {
    $domain = config("portals.domains.{$portal}");

    $this->get("https://{$domain}")
        ->assertRedirect('/dashboard');
})->with([
    'admin',
    'staff',
]);

test('customer portal root renders the public welcome page', function () {
    $this->get(portalUrl('customer'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('welcome')
            ->where('customerLoginUrl', route('customer.login'))
            ->where('customerRegisterUrl', route('customer.register')));
});

test('legacy prefixed portal paths are removed', function () {
    $this->get(portalUrl('admin', '/business/dashboard'))->assertNotFound();
    $this->get(portalUrl('customer', '/customer/login'))->assertNotFound();
    $this->get(portalUrl('staff', '/staff/login'))->assertNotFound();
});

test('customer logout uses the clean portal path', function () {
    $customer = Customer::factory()->create();

    $this->actingAs($customer, 'customer')
        ->post(portalUrl('customer', '/logout'))
        ->assertRedirect(route('customer.login'));

    $this->assertGuest('customer');
});

test('staff logout uses the clean portal path', function () {
    $staff = Staff::factory()->create();

    $this->actingAs($staff, 'staff')
        ->post(portalUrl('staff', '/logout'))
        ->assertRedirect(route('staff.login'));

    $this->assertGuest('staff');
});
