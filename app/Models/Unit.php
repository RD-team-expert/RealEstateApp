<?php
// app/Models/Unit.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

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
    ];

    protected $casts = [
        'lease_start' => 'date',
        'lease_end' => 'date',
        'insurance_expiration_date' => 'date',
        'monthly_rent' => 'decimal:2',
        'count_beds' => 'integer',
        'count_baths' => 'integer',
        'total_applications' => 'integer',
    ];

    // Relationship with applications
    public function applications()
    {
        return $this->hasMany(Application::class, 'unit', 'unit_name');
    }

    // Boot method to handle calculated fields
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($unit) {
            $unit->calculateFields();
        });
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
