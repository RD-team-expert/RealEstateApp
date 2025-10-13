<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Notice;

class NoticeAndEviction extends Model
{
    use HasFactory;

    protected $table = 'notice_and_evictions';

    protected $fillable = [
        'tenant_id',
        'status',
        'date',
        'type_of_notice',
        'have_an_exception',
        'note',
        'evictions',
        'sent_to_atorney',
        'hearing_dates',
        'evected_or_payment_plan',
        'if_left',
        'writ_date',
        'is_archived'
    ];

    protected $casts = [
        'tenant_id' => 'integer',
        'date' => 'date',
        'hearing_dates' => 'date',
        'writ_date' => 'date',
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

        static::saving(function ($noticeAndEviction) {
            $noticeAndEviction->calculateEvictions();
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
     * Get the tenant that this notice and eviction belongs to.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class, 'tenant_id');
    }

    /**
     * Accessor to get tenant's full name
     */
    public function getTenantsNameAttribute(): ?string
    {
        return $this->tenant ? $this->tenant->full_name : null;
    }

    /**
     * Accessor to get unit name through tenant relationship
     */
    public function getUnitNameAttribute(): ?string
    {
        return $this->tenant && $this->tenant->unit ? $this->tenant->unit->unit_name : null;
    }

    /**
     * Accessor to get property name through relationships
     */
    public function getPropertyNameAttribute(): ?string
    {
        return $this->tenant && $this->tenant->unit && $this->tenant->unit->property 
            ? $this->tenant->unit->property->property_name 
            : null;
    }

    /**
     * Accessor to get city name through relationships
     */
    public function getCityNameAttribute(): ?string
    {
        return $this->tenant && $this->tenant->unit && $this->tenant->unit->property && $this->tenant->unit->property->city 
            ? $this->tenant->unit->property->city->city 
            : null;
    }

    /**
     * Calculate computed evictions field
     */
    public function calculateEvictions()
    {
        if ($this->have_an_exception === 'Yes') {
            $this->evictions = 'Have An Exception';
            return;
        }

        if ($this->type_of_notice && $this->date) {
            $notice = Notice::where('notice_name', $this->type_of_notice)->first();
            if ($notice) {
                $days = $notice->days;
                $evictionDay = $this->date->copy()->addDays($days);
                if ($evictionDay->lessThanOrEqualTo(now())) {
                    $this->evictions = 'Alert';
                } else {
                    $this->evictions = '';
                }
            }
        }
    }

    /**
     * Validation rules for the model
     */
    public static function validationRules(): array
    {
        return [
            'tenant_id' => 'nullable|integer|exists:tenants,id',
            'status' => 'nullable|string|max:255',
            'date' => 'nullable|date',
            'type_of_notice' => 'nullable|string|max:255',
            'have_an_exception' => 'nullable|string|max:255',
            'note' => 'nullable|string',
            'evictions' => 'nullable|string|max:255',
            'sent_to_atorney' => 'nullable|string|max:255',
            'hearing_dates' => 'nullable|date',
            'evected_or_payment_plan' => 'nullable|string|max:255',
            'if_left' => 'nullable|string|max:255',
            'writ_date' => 'nullable|date',
        ];
    }

    /**
     * Validation rules for updating the model
     */
    public static function updateValidationRules($id = null): array
    {
        return [
            'tenant_id' => 'sometimes|nullable|integer|exists:tenants,id',
            'status' => 'sometimes|nullable|string|max:255',
            'date' => 'sometimes|nullable|date',
            'type_of_notice' => 'sometimes|nullable|string|max:255',
            'have_an_exception' => 'sometimes|nullable|string|max:255',
            'note' => 'sometimes|nullable|string',
            'evictions' => 'sometimes|nullable|string|max:255',
            'sent_to_atorney' => 'sometimes|nullable|string|max:255',
            'hearing_dates' => 'sometimes|nullable|date',
            'evected_or_payment_plan' => 'sometimes|nullable|string|max:255',
            'if_left' => 'sometimes|nullable|string|max:255',
            'writ_date' => 'sometimes|nullable|date',
        ];
    }
}
