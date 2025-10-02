<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

use App\Models\Unit;
class VendorTaskTracker extends Model
{
    use HasFactory;

    protected $table = 'vendors_tasks_tracker';

    protected $fillable = [
        'city',
        'task_submission_date',
        'vendor_name',
        'unit_name',
        'assigned_tasks',
        'any_scheduled_visits',
        'notes',
        'task_ending_date',
        'status',
        'urgent',
        'is_archived',
    ];

    protected $casts = [
        'task_submission_date' => 'date',
        'any_scheduled_visits' => 'date',
        'task_ending_date' => 'date',
        'is_archived' => 'boolean',
    ];

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        // Global scope to exclude archived records by default
        static::addGlobalScope('not_archived', function (Builder $query) {
            $query->where('is_archived', false);
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
        $this->is_archived = true;
        return $this->save();
    }

    /**
     * Restore archived record
     */
    public function restore(): bool
    {
        $this->is_archived = false;
        return $this->save();
    }

    /**
     * Check if the record is archived
     */
    public function isArchived(): bool
    {
        return $this->is_archived;
    }

    // Relationships
    public function unit()
    {
        return $this->belongsTo(Unit::class, ['city', 'unit_name'], ['city', 'unit_name']);
    }


    public function vendorInfo()
    {
        return $this->belongsTo(VendorInfo::class, 'vendor_name', 'vendor_name');
    }
}
