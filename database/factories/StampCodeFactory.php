<?php

namespace Database\Factories;

use App\Models\Business;
use App\Models\LoyaltyCard;
use App\Models\StampCode;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<StampCode>
 */
class StampCodeFactory extends Factory
{
    protected $model = StampCode::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'staff_id' => null,
            'business_id' => Business::factory(),
            'loyalty_card_id' => LoyaltyCard::factory(),
            'customer_id' => null,
            'branch_id' => null,
            'code' => strtoupper(Str::random(8)),
            'reference_number' => fake()->optional()->bothify('REF-####'),
            'used_at' => null,
            'is_expired' => false,
            'is_offline_code' => false,
        ];
    }
}
