<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\OffersAndRenewal;

class UpdateOfferExpirations extends Command
{
    protected $signature = 'offers:update-expirations';
    protected $description = 'Update offer and lease expiration calculations';

    public function handle()
    {
        OffersAndRenewal::chunk(100, function ($offers) {
            foreach ($offers as $offer) {
                $offer->calculateDaysLeft();
                $offer->save();
            }
        });

        $this->info('Offer expirations updated successfully.');
    }
}
