<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            $table->string('property_name');
            $table->string('unit_number');
            $table->string('first_name');
            $table->string('last_name');
            $table->string('street_address_line')->nullable();
            $table->string('login_email')->nullable();
            $table->string('alternate_email')->nullable();
            $table->string('mobile')->nullable();
            $table->string('emergency_phone')->nullable();
            $table->enum('cash_or_check', ['Cash', 'Check'])->nullable();
            $table->enum('has_insurance', ['Yes', 'No'])->nullable();
            $table->enum('sensitive_communication', ['Yes', 'No'])->nullable();
            $table->enum('has_assistance', ['Yes', 'No'])->nullable();
            $table->decimal('assistance_amount', 8, 2)->nullable();
            $table->string('assistance_company')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
