<?php

namespace Database\Factories;

use App\Models\BranchLoyaltyCard;
use App\Models\Branch;
use App\Models\LoyaltyCard;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BranchLoyaltyCard>
 */
class BranchLoyaltyCardFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'branch_id' => Branch::factory(),
            'loyalty_card_id' => LoyaltyCard::factory(),
        ];
    }
}
