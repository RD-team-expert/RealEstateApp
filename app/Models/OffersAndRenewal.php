<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property Carbon|null $date_sent_offer
 * @property Carbon|null $date_sent_lease
 * @property Carbon|null $date_offer_expires
 * @property Carbon|null $date_lease_expires
 */
class OffersAndRenewal extends Model
{
    use HasFactory;

    protected $table = 'offers_and_renewals';

    protected $fillable = [
        'property','unit','tenant','date_sent_offer','status','date_of_acceptance',
        'last_notice_sent','notice_kind','lease_sent','date_sent_lease',
        'lease_signed','date_signed','last_notice_sent_2','notice_kind_2',
        'notes','how_many_days_left','expired','date_offer_expires','date_lease_expires',
    ];

    protected $casts = [
        // use 'datetime' if you need time; 'date' is ok too (both return Carbon)
        'date_sent_offer'   => 'datetime',
        'date_of_acceptance'=> 'datetime',
        'last_notice_sent'  => 'datetime',
        'date_sent_lease'   => 'datetime',
        'date_signed'       => 'datetime',
        'last_notice_sent_2'=> 'datetime',
        'date_offer_expires'=> 'datetime',
        'date_lease_expires'=> 'datetime',
        'how_many_days_left'=> 'integer',
    ];

    public function calculateExpiry(): void
    {
        $now = now();

        if ($this->how_many_days_left !== null) {
            if ($this->status !== 'Accepted') {
                $this->date_offer_expires = $this->date_sent_offer
                    ? $this->date_sent_offer->clone()->addDays($this->how_many_days_left)
                    : null;
                if ($this->date_offer_expires && $this->date_offer_expires->lte($now)) {
                    $this->expired = 'expired';
                } else {
                    $this->expired = 'active';
                }
                $this->date_lease_expires = null;
            } else {
                $this->date_lease_expires = $this->date_sent_lease
                    ? $this->date_sent_lease->clone()->addDays($this->how_many_days_left)
                    : null;
                if ($this->date_lease_expires && $this->date_lease_expires->lte($now)) {
                    $this->expired = 'expired';
                } else {
                    $this->expired = 'active';
                }
                $this->date_offer_expires = null;
            }
            return;
        }

        // If no manual days left, calculate how_many_days_left and expiration from date_sent_lease
        if ($this->date_sent_lease) {
            $diff = $this->date_sent_lease->diffInDays($now, false);
            $this->how_many_days_left = max(0, 30 - $diff);

            if ($this->status !== 'Accepted') {
                $this->date_offer_expires = $this->date_sent_offer
                    ? $this->date_sent_offer->clone()->addDays($this->how_many_days_left)
                    : null;
                if ($this->date_offer_expires && $this->date_offer_expires->lte($now)) {
                    $this->expired = 'expired';
                } else {
                    $this->expired = 'active';
                }
                $this->date_lease_expires = null;
            } else {
                $this->date_lease_expires = $this->date_sent_lease
                    ? $this->date_sent_lease->clone()->addDays($this->how_many_days_left)
                    : null;
                if ($this->date_lease_expires && $this->date_lease_expires->lte($now)) {
                    $this->expired = 'expired';
                } else {
                    $this->expired = 'active';
                }
                $this->date_offer_expires = null;
            }
        } else {
            $this->how_many_days_left = null;
            $this->date_offer_expires = null;
            $this->date_lease_expires = null;
            $this->expired = null;
        }
    }
}
