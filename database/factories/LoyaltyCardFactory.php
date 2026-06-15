<?php

namespace Database\Factories;

use App\Models\Business;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\LoyaltyCard>
 */
class LoyaltyCardFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'business_id' => Business::factory(),
            'name' => fake()->unique()->words(3, true),
            'heading' => 'Collect stamps',
            'subheading' => 'Earn rewards every visit',
            'stampsNeeded' => 8,
            'valid_until' => now()->addMonths(6)->toDateString(),
            'mechanics' => 'Collect stamps and redeem rewards.',
            'backgroundColor' => '#FFFFFF',
            'textColor' => '#000000',
            'stampColor' => '#FF0000',
            'stampFilledColor' => '#FF0000',
            'stampEmptyColor' => '#CCCCCC',
            'footer' => 'Thank you for visiting.',
            'stampShape' => 'circle',
        ];
    }
}
