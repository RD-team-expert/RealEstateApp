<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('offers_and_renewals', function (Blueprint $table) {
            $table->id();
            $table->string('property');
            $table->string('unit');
            $table->string('tenant');
            $table->date('date_sent_offer');
            $table->date('date_offer_expires')->nullable();
            $table->string('status')->nullable();
            $table->date('date_of_acceptance')->nullable();
            $table->date('last_notice_sent')->nullable();
            $table->string('notice_kind')->nullable();
            $table->string('lease_sent')->nullable();
            $table->date('date_sent_lease')->nullable();
            $table->date('date_lease_expires')->nullable();
            $table->string('lease_signed')->nullable();
            $table->date('date_signed')->nullable();
            $table->date('last_notice_sent_2')->nullable();
            $table->string('notice_kind_2')->nullable();
            $table->text('notes')->nullable();
            $table->integer('how_many_days_left')->nullable();
            $table->string('expired')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('offers_and_renewals');
    }
};
