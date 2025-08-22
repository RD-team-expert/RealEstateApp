<?php
// database/migrations/xxxx_xx_xx_create_properties_info_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('properties_info', function (Blueprint $table) {
            $table->id();
            $table->string('property_name');
            $table->string('insurance_company_name');
            $table->decimal('amount', 15, 2);
            $table->string('policy_number');
            $table->date('effective_date');
            $table->date('expiration_date');
            $table->enum('status', ['Active', 'Expired'])->default('Active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('properties_info');
    }
};
