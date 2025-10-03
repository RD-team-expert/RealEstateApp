<?php
// app/Models/Tenant.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;

class Tenant extends Model
{
    use HasFactory;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'city',
        'property',
        'unit',
        'lease_start',
        'lease_end',
        'monthly_rent',
        'security_deposit',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_relationship',
        'is_archived',
    ];

    protected $casts = [
        'lease_start' => 'date',
        'lease_end' => 'date',
        'monthly_rent' => 'decimal:2',
        'security_deposit' => 'decimal:2',
        'is_archived' => 'boolean',
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

    // Accessor for full name
    public function getFullNameAttribute(): string
    {
        return $this->first_name . ' ' . $this->last_name;
    }

    // Accessor for formatted monthly rent
    public function getFormattedMonthlyRentAttribute(): string
    {
        return $this->monthly_rent ? '$' . number_format($this->monthly_rent, 2) : 'N/A';
    }

    // Accessor for formatted security deposit
    public function getFormattedSecurityDepositAttribute(): string
    {
        return $this->security_deposit ? '$' . number_format($this->security_deposit, 2) : 'N/A';
    }
}
