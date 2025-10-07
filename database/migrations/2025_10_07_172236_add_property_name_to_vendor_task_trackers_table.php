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
        Schema::table('vendors_tasks_tracker', function (Blueprint $table) {
            $table->string('property_name')->nullable()->after('city');
            $table->index('property_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vendors_tasks_tracker', function (Blueprint $table) {
            $table->dropIndex(['property_name']);
            $table->dropColumn('property_name');
        });
    }
};
