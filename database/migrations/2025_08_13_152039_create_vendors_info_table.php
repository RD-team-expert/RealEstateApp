<?php
// database/migrations/xxxx_xx_xx_create_vendors_info_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vendors_info', function (Blueprint $table) {
            $table->id();
            $table->string('city'); // Not nullable
            $table->string('vendor_name'); // Not nullable
            $table->string('number')->nullable();
            $table->string('email')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vendors_info');
    }
};
