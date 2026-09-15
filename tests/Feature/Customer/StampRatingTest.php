<?php

use App\Models\Business;
use App\Models\Customer;
use App\Models\LoyaltyCard;
use App\Models\StampCode;
use Inertia\Testing\AssertableInertia as Assert;

function receivedStamp(Customer $customer, LoyaltyCard $card, array $attributes = []): StampCode
{
    return StampCode::factory()->create(array_merge([
        'user_id' => $card->business->user_id,
        'business_id' => $card->business_id,
        'loyalty_card_id' => $card->id,
        'customer_id' => $customer->id,
        'used_at' => now(),
    ], $attributes));
}

test('customer is prompted to rate each received stamp and can give a thumbs up', function () {
    $business = Business::factory()->create();
    $customer = Customer::factory()->for($business)->create();
    $card = LoyaltyCard::factory()->for($business)->create(['name' => 'Coffee Card']);
    $stamp = receivedStamp($customer, $card);

    $this->actingAs($customer, 'customer')
        ->get('/customer/dashboard')
        ->assertInertia(fn (Assert $page) => $page
            ->where('pendingStampRating.id', $stamp->id)
            ->where('pendingStampRating.loyalty_card_name', 'Coffee Card'));

    $this->post("/customer/stamps/{$stamp->id}/rating", ['rating' => 'up'])
        ->assertSessionHasNoErrors();

    expect($stamp->fresh()->customer_rating)->toBeTrue()
        ->and($stamp->fresh()->rating_dismissed_at)->toBeNull();

    $this->get('/customer/dashboard')
        ->assertInertia(fn (Assert $page) => $page->where('pendingStampRating', null));
});

test('customer can dismiss a stamp rating and completed-card stamps remain rateable', function () {
    $business = Business::factory()->create();
    $customer = Customer::factory()->for($business)->create();
    $card = LoyaltyCard::factory()->for($business)->create();
    $stamp = receivedStamp($customer, $card);
    $stamp->delete();

    $this->actingAs($customer, 'customer')
        ->post("/customer/stamps/{$stamp->id}/rating", ['rating' => null])
        ->assertSessionHasNoErrors();

    $stamp = StampCode::withTrashed()->findOrFail($stamp->id);
    expect($stamp->customer_rating)->toBeNull()
        ->and($stamp->rating_dismissed_at)->not->toBeNull();
});

test('customer cannot rate another customer stamp or submit an invalid rating', function () {
    $business = Business::factory()->create();
    $customer = Customer::factory()->for($business)->create();
    $otherCustomer = Customer::factory()->for($business)->create();
    $card = LoyaltyCard::factory()->for($business)->create();
    $stamp = receivedStamp($otherCustomer, $card);

    $this->actingAs($customer, 'customer')
        ->post("/customer/stamps/{$stamp->id}/rating", ['rating' => 'up'])
        ->assertNotFound();

    $ownStamp = receivedStamp($customer, $card);
    $this->post("/customer/stamps/{$ownStamp->id}/rating", ['rating' => 'maybe'])
        ->assertSessionHasErrors('rating');
});
