<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('suggestions');
    }

    public function down(): void
    {
        Schema::create('suggestions', function (Blueprint $table) {
            $table->id();
            $table->string('email')->nullable();
            $table->string('suggestion');
            $table->timestamps();
        });
    }
};
