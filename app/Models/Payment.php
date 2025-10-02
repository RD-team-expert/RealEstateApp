<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'city',
        'unit_name',
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
    ];

    // Automatically calculate left_to_pay when owes or paid changes
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($payment) {
            if ($payment->paid !== null) {
                $payment->left_to_pay = $payment->owes - $payment->paid;
            }
        });

        // Global scope to filter out archived records by default
        static::addGlobalScope('not_archived', function (Builder $builder) {
            $builder->where('is_archived', false);
        });
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
        $leftToPay = (float) $this->left_to_pay;
        $owes = (float) $this->owes;

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
}
