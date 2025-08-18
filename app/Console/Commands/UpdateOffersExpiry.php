<?php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\OffersAndRenewal;

class UpdateOffersExpiry extends Command
{
    protected $signature = 'offers:update-expiry';

    protected $description = 'Update expiry status of all offers and renewals';

    public function handle()
    {
        OffersAndRenewal::whereNotNull('date_sent_lease')->get()->each(function($offer) {
            $offer->calculateExpiry();
            $offer->save();
        });
        $this->info('Expiry statuses were updated.');
    }
}
