<?php
// app/Models/PropertyInfo.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Carbon\Carbon;

class PropertyInfo extends Model
{
    use HasFactory;

    protected $table = 'properties_info';
    protected $appends = ['formatted_amount'];
    protected $fillable = [
        'property_name',
        'insurance_company_name',
        'amount',
        'policy_number',
        'effective_date',
        'expiration_date',
        'status'
    ];

    protected $casts = [
        'effective_date' => 'date',
        'expiration_date' => 'date',
        'amount' => 'decimal:2'
    ];

    // Accessor for formatted amount
    public function getFormattedAmountAttribute(): string
{
    if (is_null($this->amount)) {
        return '$0.00';
    }
    return '$' . number_format((float) $this->amount, 2);
}

    // Check if policy is expired based on expiration date
    public function getIsExpiredAttribute(): bool
    {
        return Carbon::now()->gt(Carbon::parse($this->expiration_date));
    }

    // Get days left until expiration (for potential future use)
    public function getDaysLeftAttribute(): int
    {
        return Carbon::now()->diffInDays(
            Carbon::parse($this->expiration_date),
            false
        );
    }

    // Update status based on expiration date
    public function updateStatus(): void
    {
        $this->status = $this->is_expired ? 'Expired' : 'Active';
        $this->save();
    }

}
