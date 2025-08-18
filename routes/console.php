<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use App\Models\OffersAndRenewal;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');


Schedule::call(function () {
    OffersAndRenewal::whereNotNull('how_many_days_left')->get()->each(function ($offer) {
        if ($offer->how_many_days_left > 0) {
            $offer->how_many_days_left = $offer->how_many_days_left - 1;
            if ($offer->how_many_days_left <= 0) {
                $offer->expired = 'expired';
            } else {
                $offer->expired = null;
            }
            $offer->save();
        } elseif ($offer->how_many_days_left <= 0 && $offer->expired !== 'expired') {
            $offer->expired = 'expired';
            $offer->save();
        }
    });

    // For records with no manual "how_many_days_left" (null), fallback to old date calculation for expired:
    OffersAndRenewal::whereNull('how_many_days_left')->whereNotNull('date_sent_lease')->get()->each(function ($offer) {
        $offer->calculateExpiry();
        $offer->save();
    });
})->daily();
