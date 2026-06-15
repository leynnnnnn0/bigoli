<?php

namespace Database\Factories;

use App\Models\LoyaltyCard;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Perk>
 */
class PerkFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'loyalty_card_id' => LoyaltyCard::factory(),
            'stampNumber' => 3,
            'reward' => fake()->randomElement(['Free drink', '10% discount', 'Free upgrade']),
            'details' => fake()->sentence(),
            'color' => '#000000',
        ];
    }
}
