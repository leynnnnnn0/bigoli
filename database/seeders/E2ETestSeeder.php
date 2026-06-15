<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Business;
use App\Models\Customer;
use App\Models\LoyaltyCard;
use App\Models\Perk;
use App\Models\Staff;
use App\Models\StampCode;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class E2ETestSeeder extends Seeder
{
    public function run(): void
    {
        $userId = DB::table('users')->insertGetId([
            'username' => 'e2e-business',
            'email' => 'e2e-business@example.com',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'role' => 'business',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $business = Business::create([
            'user_id' => $userId,
            'name' => 'E2E Coffee',
            'address' => 'E2E Street',
            'contact_email' => 'hello@e2e.test',
            'contact_phone' => '09170000000',
        ]);

        $branch = Branch::create([
            'business_id' => $business->id,
            'name' => 'E2E Main Branch',
            'address' => 'Main Road',
        ]);

        $card = LoyaltyCard::create([
            'business_id' => $business->id,
            'name' => 'E2E Rewards',
            'heading' => 'Collect e2e stamps',
            'subheading' => 'Earn rewards',
            'stampsNeeded' => 3,
            'valid_until' => now()->addYear()->toDateString(),
            'mechanics' => 'Collect stamps to earn rewards.',
            'backgroundColor' => '#FFFFFF',
            'textColor' => '#000000',
            'stampColor' => '#111111',
            'stampFilledColor' => '#222222',
            'stampEmptyColor' => '#CCCCCC',
            'footer' => 'Thanks',
            'stampShape' => 'circle',
        ]);

        $card->branches()->sync([$branch->id]);

        Perk::create([
            'loyalty_card_id' => $card->id,
            'stampNumber' => 2,
            'reward' => 'E2E Free Drink',
            'details' => 'Any regular drink',
            'color' => '#000000',
        ]);

        DB::table('customers')->insert([
            'business_id' => $business->id,
            'branch_id' => $branch->id,
            'username' => 'e2e-customer',
            'email' => 'e2e-customer@example.com',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Staff::create([
            'business_id' => $business->id,
            'branch_id' => $branch->id,
            'username' => 'e2e-staff',
            'password' => Hash::make('password'),
            'remarks' => 'E2E staff account',
            'is_active' => true,
        ]);

        Staff::create([
            'business_id' => $business->id,
            'branch_id' => $branch->id,
            'username' => 'e2e-inactive',
            'password' => Hash::make('password'),
            'is_active' => false,
        ]);

        StampCode::create([
            'user_id' => $userId,
            'business_id' => $business->id,
            'branch_id' => $branch->id,
            'loyalty_card_id' => $card->id,
            'code' => 'E2ECODE1',
            'is_expired' => false,
            'is_offline_code' => false,
        ]);
    }
}
