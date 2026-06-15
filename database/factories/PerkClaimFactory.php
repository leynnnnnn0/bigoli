<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\LoyaltyCard;
use App\Models\Perk;
use App\Models\PerkClaim;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PerkClaim>
 */
class PerkClaimFactory extends Factory
{
    protected $model = PerkClaim::class;

    public function definition(): array
    {
        return [
            'customer_id' => Customer::factory(),
            'loyalty_card_id' => LoyaltyCard::factory(),
            'perk_id' => Perk::factory(),
            'stamps_at_claim' => 3,
            'is_redeemed' => false,
            'redeemed_at' => null,
            'redeemed_by' => null,
            'redeemed_by_staff_id' => null,
            'remarks' => null,
        ];
    }
}
