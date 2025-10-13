<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property Carbon|null $date_sent_offer
 * @property Carbon|null $date_sent_lease
 * @property Carbon|null $date_offer_expires
 * @property Carbon|null $lease_expires
 */
class OffersAndRenewal extends Model
{
    use HasFactory;

    protected $table = 'offers_and_renewals';

    protected $fillable = [
        'tenant_id',
        'date_sent_offer',
        'date_offer_expires',
        'status',
        'date_of_acceptance',
        'last_notice_sent',
        'notice_kind',
        'lease_sent',
        'date_sent_lease',
        'lease_expires',
        'lease_signed',
        'date_signed',
        'last_notice_sent_2',
        'notice_kind_2',
        'notes',
        'how_many_days_left',
        'expired',
        'is_archived',
    ];

    protected $casts = [
        'tenant_id' => 'integer',
        'date_sent_offer' => 'date',
        'date_offer_expires' => 'date',
        'date_of_acceptance' => 'date',
        'last_notice_sent' => 'date',
        'date_sent_lease' => 'date',
        'lease_expires' => 'date',
        'date_signed' => 'date',
        'last_notice_sent_2' => 'date',
        'how_many_days_left' => 'integer',
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

        static::saving(function ($offersAndRenewal) {
            $offersAndRenewal->calculateExpiry();
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
     * Get the tenant that this offer/renewal belongs to.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class, 'tenant_id');
    }

    /**
     * Calculate expiry dates and status based on the business logic
     */
    public function calculateExpiry(): void
    {
        $now = now();

        if ($this->how_many_days_left !== null) {
            if ($this->status !== 'Accepted') {
                $this->date_offer_expires = $this->date_sent_offer
                    ? $this->date_sent_offer->clone()->addDays($this->how_many_days_left)
                    : null;
                if ($this->date_offer_expires && $this->date_offer_expires->lte($now)) {
                    $this->expired = 'expired';
                } else {
                    $this->expired = 'active';
                }
                $this->lease_expires = null;
            } else {
                $this->lease_expires = $this->date_sent_lease
                    ? $this->date_sent_lease->clone()->addDays($this->how_many_days_left)
                    : null;
                if ($this->lease_expires && $this->lease_expires->lte($now)) {
                    $this->expired = 'expired';
                } else {
                    $this->expired = 'active';
                }
                $this->date_offer_expires = null;
            }
            return;
        }

        // If no manual days left, calculate how_many_days_left and expiration from date_sent_lease
        if ($this->date_sent_lease) {
            $diff = $this->date_sent_lease->diffInDays($now, false);
            $this->how_many_days_left = max(0, 30 - $diff);

            if ($this->status !== 'Accepted') {
                $this->date_offer_expires = $this->date_sent_offer
                    ? $this->date_sent_offer->clone()->addDays($this->how_many_days_left)
                    : null;
                if ($this->date_offer_expires && $this->date_offer_expires->lte($now)) {
                    $this->expired = 'expired';
                } else {
                    $this->expired = 'active';
                }
                $this->lease_expires = null;
            } else {
                $this->lease_expires = $this->date_sent_lease
                    ? $this->date_sent_lease->clone()->addDays($this->how_many_days_left)
                    : null;
                if ($this->lease_expires && $this->lease_expires->lte($now)) {
                    $this->expired = 'expired';
                } else {
                    $this->expired = 'active';
                }
                $this->date_offer_expires = null;
            }
        } else {
            $this->how_many_days_left = null;
            $this->date_offer_expires = null;
            $this->lease_expires = null;
            $this->expired = null;
        }
    }

    /**
     * Accessor to get tenant's full name through relationship
     */
    public function getTenantNameAttribute(): ?string
    {
        return $this->tenant ? $this->tenant->full_name : null;
    }

    /**
     * Accessor to get unit name through relationships
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
     * Validation rules for the model
     */
    public static function validationRules(): array
    {
        return [
            'tenant_id' => 'nullable|integer|exists:tenants,id',
            'date_sent_offer' => 'required|date',
            'date_offer_expires' => 'nullable|date|after_or_equal:date_sent_offer',
            'status' => 'nullable|string|max:255',
            'date_of_acceptance' => 'nullable|date',
            'last_notice_sent' => 'nullable|date',
            'notice_kind' => 'nullable|string|max:255',
            'lease_sent' => 'nullable|string|max:255',
            'date_sent_lease' => 'nullable|date',
            'lease_expires' => 'nullable|date',
            'lease_signed' => 'nullable|string|max:255',
            'date_signed' => 'nullable|date',
            'last_notice_sent_2' => 'nullable|date',
            'notice_kind_2' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'how_many_days_left' => 'nullable|integer|min:0',
            'expired' => 'nullable|string|max:255',
        ];
    }

    /**
     * Validation rules for updating the model
     */
    public static function updateValidationRules($id = null): array
    {
        return [
            'tenant_id' => 'sometimes|nullable|integer|exists:tenants,id',
            'date_sent_offer' => 'sometimes|required|date',
            'date_offer_expires' => 'sometimes|nullable|date|after_or_equal:date_sent_offer',
            'status' => 'sometimes|nullable|string|max:255',
            'date_of_acceptance' => 'sometimes|nullable|date',
            'last_notice_sent' => 'sometimes|nullable|date',
            'notice_kind' => 'sometimes|nullable|string|max:255',
            'lease_sent' => 'sometimes|nullable|string|max:255',
            'date_sent_lease' => 'sometimes|nullable|date',
            'lease_expires' => 'sometimes|nullable|date',
            'lease_signed' => 'sometimes|nullable|string|max:255',
            'date_signed' => 'sometimes|nullable|date',
            'last_notice_sent_2' => 'sometimes|nullable|date',
            'notice_kind_2' => 'sometimes|nullable|string|max:255',
            'notes' => 'sometimes|nullable|string',
            'how_many_days_left' => 'sometimes|nullable|integer|min:0',
            'expired' => 'sometimes|nullable|string|max:255',
        ];
    }
}
