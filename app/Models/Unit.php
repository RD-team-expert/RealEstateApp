<?php
// app/Models/Unit.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;

class Unit extends Model
{
    use HasFactory;

    protected $fillable = [
        'city',
        'property',
        'unit_name',
        'tenants',
        'lease_start',
        'lease_end',
        'count_beds',
        'count_baths',
        'lease_status',
        'monthly_rent',
        'recurring_transaction',
        'utility_status',
        'account_number',
        'insurance',
        'insurance_expiration_date',
        'vacant',
        'listed',
        'total_applications',
        'is_archived',
    ];

    protected $casts = [
        'lease_start' => 'date',
        'lease_end' => 'date',
        'insurance_expiration_date' => 'date',
        'monthly_rent' => 'decimal:2',
        'count_beds' => 'decimal:1',      // Changed from 'integer'
        'count_baths' => 'decimal:1',     // Changed from 'integer'
        'total_applications' => 'integer',
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

        static::saving(function ($unit) {
            $unit->calculateFields();
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

    // Relationship with applications
    public function applications()
    {
        return $this->hasMany(Application::class, 'unit', 'unit_name');
    }

    public function calculateFields()
    {
        // Calculate Vacant
        $this->vacant = empty($this->tenants) ? 'Yes' : 'No';

        // Calculate Listed
        $this->listed = $this->vacant === 'Yes' ? 'Yes' : 'No';

        // Calculate Total Applications
        if ($this->listed === 'Yes') {
            $this->total_applications = Application::where('unit', $this->unit_name)->count();
        } else {
            $this->total_applications = 0;
        }
    }

    // Static method to update all units' application counts
    public static function updateAllApplicationCounts()
    {
        $units = static::all();
        foreach ($units as $unit) {
            $unit->calculateFields();
            $unit->saveQuietly(); // Use saveQuietly to avoid triggering boot again
        }
    }

    // Method to update application count for specific unit
    public static function updateApplicationCountForUnit($unitName)
    {
        $unit = static::where('unit_name', $unitName)->first();
        if ($unit) {
            $unit->calculateFields();
            $unit->saveQuietly();
        }
    }

    // Accessor for formatted monthly rent
    public function getFormattedMonthlyRentAttribute(): string
    {
        return $this->monthly_rent ? '$' . number_format($this->monthly_rent, 2) : 'N/A';
    }
}
