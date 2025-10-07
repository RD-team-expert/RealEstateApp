<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;

class PaymentPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'property',
        'city_name',
        'unit',
        'tenant',
        'amount',
        'dates',
        'paid',
        'notes',
        'is_archived'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paid' => 'decimal:2',
        'dates' => 'date',
        'is_archived' => 'boolean'
    ];

    protected $appends = ['left_to_pay', 'status'];

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::addGlobalScope('not_archived', function (Builder $builder) {
            $builder->where('is_archived', false);
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

    public function getLeftToPayAttribute()
    {
        return $this->amount - $this->paid;
    }

    public function getStatusAttribute()
    {
        $leftToPay = $this->left_to_pay;

        if ($leftToPay == 0) {
            return 'Paid';
        } elseif ($leftToPay == $this->amount) {
            return "Didn't Pay";
        } elseif ($leftToPay > 0 && $leftToPay < $this->amount) {
            return "Paid Partly";
        }else{
            return "N/A";
        }
    }
}
