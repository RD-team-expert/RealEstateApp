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
        Schema::table('move_outs', function (Blueprint $table) {
            $table->string('city_name')->nullable()->after('units_name');
            $table->string('property_name')->nullable()->after('city_name');
            
            // Add indexes for better query performance
            $table->index('city_name');
            $table->index('property_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('move_outs', function (Blueprint $table) {
            $table->dropIndex(['city_name']);
            $table->dropIndex(['property_name']);
            $table->dropColumn(['city_name', 'property_name']);
        });
    }
};
