<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('notice_and_evictions', function (Blueprint $table) {
            $table->id();
            $table->string('unit_name');
            $table->string('tenants_name');
            $table->string('status')->nullable();
            $table->date('date')->nullable();
            $table->string('type_of_notice')->nullable();
            $table->string('have_an_exception')->nullable();
            $table->text('note')->nullable();
            $table->string('evictions')->nullable();
            $table->string('sent_to_atorney')->nullable();
            $table->date('hearing_dates')->nullable();
            $table->string('evected_or_payment_plan')->nullable();
            $table->string('if_left')->nullable();
            $table->date('writ_date')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('notice_and_evictions');
    }
};
