<?php
// app/Models/Application.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Carbon\Carbon;

/**
 * @property \Illuminate\Support\Carbon|null $date
 * @property-read string|null $formatted_date
 */
class Application extends Model
{
    use HasFactory;

    protected $fillable = [
        'city',
        'property',
        'name',
        'co_signer',
        'unit',
        'status',
        'date',
        'stage_in_progress',
        'notes'
    ];

    protected $casts = [
        'date' => 'date',
    ];

    // Accessor for formatted date
    public function getFormattedDateAttribute(): ?string
    {
        return $this->date ? $this->date->format('M d, Y') : null;
    }

    // Scope for filtering by status
    public function scopeByStatus($query, $status)
    {
        return $status ? $query->where('status', $status) : $query;
    }

    // Scope for filtering by stage
    public function scopeByStage($query, $stage)
    {
        return $stage ? $query->where('stage_in_progress', $stage) : $query;
    }

    // Get applications by date range
    public function scopeDateRange($query, $startDate = null, $endDate = null)
    {
        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }
        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }
        return $query;
    }

    protected static function boot()
{
    parent::boot();

    static::created(function ($application) {
        Unit::updateApplicationCountForUnit($application->unit);
    });

    static::updated(function ($application) {
        Unit::updateApplicationCountForUnit($application->unit);

        // If unit name changed, update both old and new units
        if ($application->isDirty('unit')) {
            $originalUnit = $application->getOriginal('unit');
            if ($originalUnit) {
                Unit::updateApplicationCountForUnit($originalUnit);
            }
        }
    });

    static::deleted(function ($application) {
        Unit::updateApplicationCountForUnit($application->unit);
    });
}
}
