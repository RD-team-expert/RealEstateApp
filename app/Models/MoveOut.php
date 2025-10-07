<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class MoveOut extends Model
{
    use HasFactory;

    protected $table = 'move_outs';

    protected $fillable = [
        'tenants_name',
        'units_name',
        'city_name',
        'property_name',
        'move_out_date',
        'lease_status',
        'date_lease_ending_on_buildium',
        'keys_location',
        'utilities_under_our_name',
        'date_utility_put_under_our_name',
        'walkthrough',
        'repairs',
        'send_back_security_deposit',
        'notes',
        'cleaning',
        'list_the_unit',
        'move_out_form',
        'is_archived',
    ];

    protected $casts = [
        'move_out_date' => 'date',
        'date_lease_ending_on_buildium' => 'date',
        'date_utility_put_under_our_name' => 'date',
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
     * Query scope to include archived records
     */
    public function scopeWithArchived(Builder $query): Builder
    {
        return $query->withoutGlobalScope('not_archived');
    }

    /**
     * Query scope to get only archived records
     */
    public function scopeOnlyArchived(Builder $query): Builder
    {
        return $query->withoutGlobalScope('not_archived')->where('is_archived', true);
    }

    // Relationship with Tenant
    public function tenant()
    {
        return $this->belongsTo(Tenant::class, 'tenants_name', 'full_name');
    }
}
