<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;

/**
 * @property \Illuminate\Support\Carbon|null $date
 * @property-read string|null $formatted_date
 */
class Application extends Model
{
    use HasFactory;

    protected $fillable = [
        'unit_id',
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
        'unit_id' => 'integer',
    ];

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::addGlobalScope('not_archived', function (Builder $builder) {
            $builder->where('is_archived', false);
        });

        static::created(function ($application) {
            if ($application->unit_id) {
                Unit::updateApplicationCountForUnit($application->unit_id);
            }
        });

        static::updated(function ($application) {
            if ($application->unit_id) {
                Unit::updateApplicationCountForUnit($application->unit_id);
            }

            // If unit_id changed, update both old and new units
            if ($application->isDirty('unit_id')) {
                $originalUnitId = $application->getOriginal('unit_id');
                if ($originalUnitId) {
                    Unit::updateApplicationCountForUnit($originalUnitId);
                }
            }
        });

        static::deleted(function ($application) {
            if ($application->unit_id) {
                Unit::updateApplicationCountForUnit($application->unit_id);
            }
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
     * Restore archived record
     */
    public function restore(): bool
    {
        return $this->update(['is_archived' => false]);
    }

    /**
     * Get the unit that owns this application.
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }

    /**
     * Accessor for formatted date
     */
    public function getFormattedDateAttribute(): ?string
    {
        return $this->date ? $this->date->format('M d, Y') : null;
    }

    /**
     * Helper method to get the full attachment URL
     */
    public function getAttachmentUrlAttribute()
    {
        if ($this->attachment_path) {
            return asset('storage/' . $this->attachment_path);
        }
        return null;
    }

    /**
     * Helper method to check if attachment exists
     */
    public function hasAttachment(): bool
    {
        return !empty($this->attachment_path) && !empty($this->attachment_name);
    }

    /**
     * Scope for filtering by status
     */
    public function scopeByStatus($query, $status)
    {
        return $status ? $query->where('status', $status) : $query;
    }

    /**
     * Scope for filtering by stage
     */
    public function scopeByStage($query, $stage)
    {
        return $stage ? $query->where('stage_in_progress', $stage) : $query;
    }

    /**
     * Get applications by date range
     */
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

    /**
     * Validation rules for the model
     */
    public static function validationRules(): array
    {
        return [
            'unit_id' => 'nullable|integer|exists:units,id',
            'name' => 'required|string|max:255',
            'co_signer' => 'required|string|max:255',
            'status' => 'nullable|string|max:255',
            'date' => 'nullable|date',
            'stage_in_progress' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'attachment_name' => 'nullable|string|max:255',
            'attachment_path' => 'nullable|string|max:255',
        ];
    }

    /**
     * Validation rules for updating the model
     */
    public static function updateValidationRules($id = null): array
    {
        return [
            'unit_id' => 'sometimes|nullable|integer|exists:units,id',
            'name' => 'sometimes|required|string|max:255',
            'co_signer' => 'sometimes|required|string|max:255',
            'status' => 'sometimes|nullable|string|max:255',
            'date' => 'sometimes|nullable|date',
            'stage_in_progress' => 'sometimes|nullable|string|max:255',
            'notes' => 'sometimes|nullable|string',
            'attachment_name' => 'sometimes|nullable|string|max:255',
            'attachment_path' => 'sometimes|nullable|string|max:255',
        ];
    }
}
