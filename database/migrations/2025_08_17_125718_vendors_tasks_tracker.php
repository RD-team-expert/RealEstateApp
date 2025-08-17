<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vendors_tasks_tracker', function (Blueprint $table) {
            $table->id();
            $table->string('city');
            $table->date('task_submission_date');
            $table->string('vendor_name');
            $table->string('unit_name');
            $table->text('assigned_tasks');
            $table->date('any_scheduled_visits')->nullable();
            $table->text('notes')->nullable();
            $table->date('task_ending_date')->nullable();
            $table->string('status')->nullable();
            $table->enum('urgent', ['Yes', 'No']);
            $table->timestamps();

            // Add indexes for better query performance
            $table->index(['city', 'unit_name']);
            $table->index('vendor_name');
            $table->index('task_submission_date');
            $table->index('urgent');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vendors_tasks_tracker');
    }
};
