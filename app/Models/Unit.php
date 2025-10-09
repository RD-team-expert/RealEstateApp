<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class Unit extends Model
{
    use HasFactory;

    protected $fillable = [
        'property_id',
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
        'count_beds' => 'decimal:1',
        'count_baths' => 'decimal:1',
        'total_applications' => 'integer',
        'is_archived' => 'boolean',
        'property_id' => 'integer',
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

    /**
     * Get the property that owns this unit.
     */
    public function property(): BelongsTo
    {
        return $this->belongsTo(PropertyInfoWithoutInsurance::class, 'property_id');
    }

    /**
     * Get all tenants for this unit.
     */
    public function tenants(): HasMany
    {
        return $this->hasMany(Tenant::class, 'unit_id');
    }

    /**
     * Get all applications for this unit.
     */
    public function applications(): HasMany
    {
        return $this->hasMany(Application::class, 'unit_id');
    }

    /**
     * Get all move-ins for this unit.
     */
    public function moveIns(): HasMany
    {
        return $this->hasMany(MoveIn::class, 'unit_id');
    }

    public function calculateFields()
    {
        // Calculate Vacant based on actual tenant relationships
        $this->vacant = $this->tenants()->count() > 0 ? 'No' : 'Yes';

        // Calculate Listed
        $this->listed = $this->vacant === 'Yes' ? 'Yes' : 'No';

        // Calculate Total Applications - use the proper relationship
        if ($this->listed === 'Yes') {
            $this->total_applications = $this->applications()->count();
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
    public static function updateApplicationCountForUnit($unitId)
    {
        $unit = static::find($unitId); // Use ID instead of name
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
