<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stamp_codes', function (Blueprint $table) {
            $table->boolean('customer_rating')->nullable()->after('amount_spent');
            $table->timestamp('rating_dismissed_at')->nullable()->after('customer_rating');
        });

        DB::table('stamp_codes')
            ->whereNotNull('used_at')
            ->update(['rating_dismissed_at' => now()]);
    }

    public function down(): void
    {
        Schema::table('stamp_codes', function (Blueprint $table) {
            $table->dropColumn(['customer_rating', 'rating_dismissed_at']);
        });
    }
};
