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
        Schema::table('offers_and_renewals', function (Blueprint $table) {
            $table->string('city_name')->nullable()->after('property');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('offers_and_renewals', function (Blueprint $table) {
            $table->dropColumn('city_name');
        });
    }
};
