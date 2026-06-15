<?php

namespace Database\Factories;

use App\Models\Business;
use App\Models\Ticket;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Ticket>
 */
class TicketFactory extends Factory
{
    protected $model = Ticket::class;

    public function definition(): array
    {
        return [
            'business_id' => Business::factory(),
            'ticket_number' => Ticket::generateTicketNumber(),
            'subject' => fake()->sentence(4),
            'description' => fake()->paragraph(),
            'images' => [],
            'status' => 'open',
            'priority' => 'medium',
        ];
    }
}
