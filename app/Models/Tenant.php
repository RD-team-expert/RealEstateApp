<?php
// app/Models/Tenant.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Tenant extends Model
{
    use HasFactory;

    protected $fillable = [
        'unit_id',  // Changed from property_name and unit_number
        'first_name',
        'last_name',  
        'street_address_line',
        'login_email',
        'alternate_email',
        'mobile',
        'emergency_phone',
        'cash_or_check',
        'has_insurance',
        'sensitive_communication',
        'has_assistance',
        'assistance_amount',
        'assistance_company',
        'is_archived',
    ];

    protected $casts = [
        'cash_or_check' => 'string',
        'has_insurance' => 'string',
        'sensitive_communication' => 'string',
        'has_assistance' => 'string',
        'assistance_amount' => 'decimal:2',
        'is_archived' => 'boolean',
        'unit_id' => 'integer',  // Added cast for foreign key
    ];

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::addGlobalScope('not_archived', function (Builder $builder) {
            $builder->where('is_archived', false);
        });
    }

    /**
     * Scope to include archived records
     */
    public function scopeWithArchived(Builder $query): Builder
    {
        return $query->withoutGlobalScope('not_archived');
    }

    /**
     * Scope to get only archived records
     */
    public function scopeOnlyArchived(Builder $query): Builder
    {
        return $query->withoutGlobalScope('not_archived')->where('is_archived', true);
    }

    /**
     * Soft delete by setting is_archived to true
     */
    public function archive(): bool
    {
        return $this->update(['is_archived' => true]);
    }

    /**
     * Get the unit that this tenant belongs to.
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }

    // Accessor for full name
    public function getFullNameAttribute(): string
    {
        return $this->first_name . ' ' . $this->last_name;
    }

    // Remove these accessors as they don't exist in the tenant schema
    // getFormattedMonthlyRentAttribute and getFormattedSecurityDepositAttribute
    // should be removed since monthly_rent is in the units table, not tenants

    // Accessor for formatted assistance amount
    public function getFormattedAssistanceAmountAttribute(): string
    {
        return $this->assistance_amount ? '$' . number_format($this->assistance_amount, 2) : 'N/A';
    }
}
