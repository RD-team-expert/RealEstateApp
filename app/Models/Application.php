<?php
// app/Models/Application.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use Carbon\Carbon;

/**
 * @property \Illuminate\Support\Carbon|null $date
 * @property-read string|null $formatted_date
 */
class Application extends Model
{
    use HasFactory;

    protected $fillable = [
    'unit_id',        // Changed from 'unit' to 'unit_id'
    'name',
    'co_signer',
    'status',
    'date',
    'stage_in_progress',
    'notes',
    'attachment_name',
    'attachment_path',
    'is_archived',
];


    protected $casts = [
        'date' => 'date',
        'is_archived' => 'boolean',
    ];

    // Accessor for formatted date
    public function getFormattedDateAttribute(): ?string
    {
        return $this->date ? $this->date->format('M d, Y') : null;
    }

    // Add this method to establish the belongsTo relationship
public function unit(): BelongsTo
{
    return $this->belongsTo(Unit::class, 'unit_id');
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

    // Scope to exclude archived records (default behavior)
    public function scopeNotArchived($query)
    {
        return $query->where('is_archived', false);
    }

    // Scope to include only archived records
    public function scopeArchived($query)
    {
        return $query->where('is_archived', true);
    }

    // Soft delete method - archives the record instead of deleting
    public function archive(): bool
    {
        return $this->update(['is_archived' => true]);
    }

    // Restore archived record
    public function restore(): bool
    {
        return $this->update(['is_archived' => false]);
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

    // Helper method to get the full attachment URL
    public function getAttachmentUrlAttribute()
    {
        if ($this->attachment_path) {
            return asset('storage/' . $this->attachment_path);
        }
        return null;
    }

    // Helper method to check if attachment exists
    public function hasAttachment(): bool
    {
        return !empty($this->attachment_path) && !empty($this->attachment_name);
    }
}
