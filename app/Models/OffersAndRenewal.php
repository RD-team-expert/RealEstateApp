<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OffersAndRenewal extends Model
{
    use HasFactory;

    protected $table = 'offers_and_renewals';

    protected $fillable = [
        'unit', 'tenant', 'date_sent_offer', 'status', 'date_of_acceptance', 'last_notice_sent', 'notice_kind',
        'lease_sent', 'date_sent_lease', 'lease_signed', 'date_signed', 'last_notice_sent_2', 'notice_kind_2', 'notes',
        'how_many_days_left', 'expired'
    ];

    protected $casts = [
        'date_sent_offer' => 'date',
        'date_of_acceptance' => 'date',
        'last_notice_sent' => 'date',
        'date_sent_lease' => 'date',
        'date_signed' => 'date',
        'last_notice_sent_2' => 'date',
        'how_many_days_left' => 'integer',
    ];

    // Dynamically calculate "how_many_days_left" and "expired"
    public function calculateExpiry()
    {
        if ($this->how_many_days_left !== null) {
            // If user input exists, handle by value:
            if ($this->how_many_days_left <= 0) {
                $this->expired = 'expired';
                return;
            } else {
                // daily job will decrement (see scheduler below)
                $this->expired = null;
                return;
            }
        }

        // If no manual input, auto-calculate from date_sent_lease if exists
        if ($this->date_sent_lease) {
            $leaseDate = $this->date_sent_lease;
            $now = now();
            $diff = $leaseDate->diffInDays($now, false);
            $calculated_days = max(0, 30 - $diff); // 30 is your logic—it can be another value.
            $this->how_many_days_left = $calculated_days;
            $this->expired = ($calculated_days <= 0) ? 'expired' : null;
        } else {
            $this->how_many_days_left = null;
            $this->expired = null;
        }
    }
}
