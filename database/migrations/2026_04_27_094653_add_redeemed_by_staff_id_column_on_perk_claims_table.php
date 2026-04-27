<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('perk_claims', function (Blueprint $table) {
            $table->foreignId('redeemed_by_staff_id')
                ->nullable()
                ->constrained('staff')
                ->onDelete('set null')
                ->after('redeemed_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('perk_claims', function (Blueprint $table) {
            $table->dropForeign(['redeemed_by_staff_id']);
            $table->dropColumn('redeemed_by_staff_id');
        });
    }
};
