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

    // Remove the date casting to prevent timezone conversion
    protected $casts = [
        'amount' => 'decimal:2'

    ];

    // Add custom accessors to handle dates properly
    public function getEffectiveDateAttribute($value)
    {
        return $value ? Carbon::parse($value)->format('Y-m-d') : null;
    }

    public function getExpirationDateAttribute($value)
    {
        return $value ? Carbon::parse($value)->format('Y-m-d') : null;
    }

    // Update mutators to store dates correctly
    public function setEffectiveDateAttribute($value)
    {
        $this->attributes['effective_date'] = $value ? Carbon::parse($value)->format('Y-m-d') : null;
    }

    public function setExpirationDateAttribute($value)
    {
        $this->attributes['expiration_date'] = $value ? Carbon::parse($value)->format('Y-m-d') : null;
    }

    // Rest of your methods remain the same...
    public function getFormattedAmountAttribute(): string
    {
        if (is_null($this->amount)) {
            return '$0.00';
        }
        return '$' . number_format((float) $this->amount, 2);
    }

    public function getIsExpiredAttribute(): bool
    {
        $today = Carbon::now()->startOfDay();
        $expirationDate = Carbon::parse($this->attributes['expiration_date'])->startOfDay();

        // Expired when expiration date is today or in the past
        return $today->gte($expirationDate);
    }

    public function getDaysLeftAttribute(): int
    {
        $today = Carbon::now()->startOfDay();
        $expirationDate = Carbon::parse($this->attributes['expiration_date'])->startOfDay();

        return $today->diffInDays($expirationDate, false);
    }

    public function updateStatus(): void
    {
        $this->status = $this->is_expired ? 'Expired' : 'Active';
        $this->save();
    }
}
