<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('loyalty_cards', function (Blueprint $table) {
            $table->decimal('minimum_amount_spent', 12, 2)->default(0)->after('stampsNeeded');
        });

        Schema::table('stamp_codes', function (Blueprint $table) {
            $table->renameColumn('reference_number', 'transaction_number');
        });

        Schema::table('stamp_codes', function (Blueprint $table) {
            $table->decimal('amount_spent', 12, 2)->default(0)->after('transaction_number');
        });
    }

    public function down(): void
    {
        Schema::table('stamp_codes', function (Blueprint $table) {
            $table->dropColumn('amount_spent');
        });

        Schema::table('stamp_codes', function (Blueprint $table) {
            $table->renameColumn('transaction_number', 'reference_number');
        });

        Schema::table('loyalty_cards', function (Blueprint $table) {
            $table->dropColumn('minimum_amount_spent');
        });
    }
};
