<?php

namespace Database\Seeders;

use App\Models\Business;
use App\Models\CompletedLoyaltyCard;
use App\Models\Customer;
use App\Models\LoyaltyCard;
use App\Models\Perk;
use App\Models\PerkClaim;
use App\Models\StampCode;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Business User
        $user = User::create([
            'username' => 'bigoli',
            'email' => 'bigoli@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'business',
            'email_verified_at' => now(),
        ]);

        // Create Business
        $business = Business::create([
            'user_id' => $user->id,
            'name' => 'Bigoli',
            'address' => '123 Main Street, Downtown City',
            'contact_email' => 'contact@democoffee.com',
            'contact_phone' => '+1234567890',
        ]);

      
    }

    /**
     * Generate a unique 8-character code
     */
    private function generateUniqueCode(): string
    {
        do {
            $code = strtoupper(Str::random(8));
        } while (StampCode::where('code', $code)->exists());

        return $code;
    }
}