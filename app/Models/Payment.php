<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'unit_id',
        'owes',
        'paid',
        'left_to_pay',
        'status',
        'notes',
        'reversed_payments',
        'permanent',
        'is_archived',
    ];

    protected $casts = [
        'date' => 'date',
        'owes' => 'decimal:2',
        'paid' => 'decimal:2',
        'left_to_pay' => 'decimal:2',
        'is_archived' => 'boolean',
        'unit_id' => 'integer',
    ];

    // Automatically calculate left_to_pay when owes or paid changes
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($payment) {
            // Treat null paid as 0 for calculations
            $paid = $payment->paid ?? 0;
            $payment->left_to_pay = $payment->owes - $paid;

            // Auto-calculate and update status
            $payment->status = $payment->calculateStatus();
        });

        // Global scope to filter out archived records by default
        static::addGlobalScope('not_archived', function (Builder $builder) {
            $builder->where('is_archived', false);
        });
    }

    /**
     * Get the unit that this payment belongs to.
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'unit_id');
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
     * Check if record is archived
     */
    public function isArchived(): bool
    {
        return $this->is_archived;
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
     * Calculate status based on left_to_pay and owes values
     */
    public function calculateStatus(): string
    {
        // Derive left to pay based on owes and paid (null treated as 0)
        $owes = (float) $this->owes;
        $paid = (float) ($this->paid ?? 0);
        $leftToPay = $owes - $paid;

        if ($leftToPay == 0) {
            return 'Paid';
        } elseif ($leftToPay == $owes) {
            return 'Didn\'t Pay';
        } elseif ($leftToPay > 0 && $leftToPay < $owes) {
            return 'Paid Partly';
        }

        // Default fallback
        return 'Didn\'t Pay';
    }

    /**
     * Update status based on current left_to_pay value
     */
    public function updateStatus(): void
    {
        $this->status = $this->calculateStatus();
        $this->save();
    }

    /**
     * Get formatted owes amount
     */
    public function getFormattedOwesAttribute(): string
    {
        return '$' . number_format((float) ($this->owes ?? 0), 2);
    }

    /**
     * Get formatted paid amount
     */
    public function getFormattedPaidAttribute(): string
    {
        return '$' . number_format((float) ($this->paid ?? 0), 2);
    }

    /**
     * Get formatted left_to_pay amount
     */
    public function getFormattedLeftToPayAttribute(): string
    {
        return '$' . number_format((float) ($this->left_to_pay ?? 0), 2);
    }

    /**
     * Get property information through unit relationship
     */
    public function getPropertyAttribute()
    {
        return $this->unit ? $this->unit->property : null;
    }

    /**
     * Get property name through unit relationship
     */
    public function getPropertyNameAttribute(): ?string
    {
        return $this->unit && $this->unit->property ? $this->unit->property->property_name : null;
    }

    /**
     * Get city information through unit and property relationships
     */
    public function getCityAttribute()
    {
        return $this->unit && $this->unit->property ? $this->unit->property->city : null;
    }

    /**
     * Get city name through unit and property relationships
     */
    public function getCityNameAttribute(): ?string
    {
        return $this->unit && $this->unit->property && $this->unit->property->city ? $this->unit->property->city->city : null;
    }

    /**
     * Get unit name through unit relationship
     */
    public function getUnitNameAttribute(): ?string
    {
        return $this->unit ? $this->unit->unit_name : null;
    }

    /**
     * Validation rules for the model
     */
    public static function validationRules(): array
    {
        return [
            'date' => 'required|date',
            'unit_id' => 'nullable|integer|exists:units,id',
            'owes' => 'required|numeric|min:0',
            'paid' => 'nullable|numeric|min:0',
            'status' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'reversed_payments' => 'nullable|string|max:255',
            'permanent' => 'required|in:Yes,No',
        ];
    }

    /**
     * Validation rules for updating the model
     */
    public static function updateValidationRules($id = null): array
    {
        return [
            'date' => 'sometimes|required|date',
            'unit_id' => 'sometimes|nullable|integer|exists:units,id',
            'owes' => 'sometimes|required|numeric|min:0',
            'paid' => 'sometimes|nullable|numeric|min:0',
            'status' => 'sometimes|nullable|string|max:255',
            'notes' => 'sometimes|nullable|string',
            'reversed_payments' => 'sometimes|nullable|string|max:255',
            'permanent' => 'sometimes|required|in:Yes,No',
        ];
    }
}
