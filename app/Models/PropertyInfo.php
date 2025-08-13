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

    protected $fillable = [
        'property_name',
        'insurance_company_name',
        'amount',
        'policy_number',
        'effective_date',
        'expiration_date',
        'days_left'
    ];

    protected $casts = [
        'effective_date' => 'date',
        'expiration_date' => 'date',
        'amount' => 'decimal:2'
    ];

    // Auto-calculate days_left when saving
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($propertyInfo) {
            if ($propertyInfo->expiration_date) {
                $propertyInfo->days_left = Carbon::now()->diffInDays(
                    Carbon::parse($propertyInfo->expiration_date),
                    false
                );
            }
        });
    }

    // Accessor for formatted amount
    public function getFormattedAmountAttribute(): string
    {
        return '$' . number_format((float) ($this->amount ?? 0), 2);
    }

    // Check if policy is expired
    public function getIsExpiredAttribute(): bool
    {
        return $this->days_left < 0;
    }

    // Check if policy is expiring soon (within 30 days)
    public function getIsExpiringSoonAttribute(): bool
    {
        return $this->days_left >= 0 && $this->days_left <= 30;
    }
}
