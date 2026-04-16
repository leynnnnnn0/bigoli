<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stamp_codes', function (Blueprint $table) {
            $table->foreignId('staff_id')->nullable()->constrained('staff')->nullOnDelete()->after('user_id');

            // Don't redeclare foreignId — just modify the existing column
            $table->unsignedBigInteger('user_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('stamp_codes', function (Blueprint $table) {
            $table->dropForeign(['staff_id']);
            $table->dropColumn('staff_id');

            // Revert to not nullable
            $table->unsignedBigInteger('user_id')->nullable(false)->change();
        });
    }
};
