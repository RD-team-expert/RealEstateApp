<?php
// app/Models/VendorInfo.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class VendorInfo extends Model
{
    use HasFactory;

    protected $table = 'vendors_info';

    protected $fillable = [
        'city_id',
        'vendor_name',
        'number',
        'email',
        'service_type',
        'is_archived'
    ];

    protected $casts = [
        'is_archived' => 'boolean',
    ];

    // Global scope to exclude archived records by default
    protected static function booted(): void
    {
        static::addGlobalScope('active', function (Builder $query) {
            $query->where('is_archived', false);
        });
    }

    // Scope to include archived records when needed
    public function scopeWithArchived(Builder $query): Builder
    {
        return $query->withoutGlobalScope('active');
    }

    // Scope to get only archived records
    public function scopeOnlyArchived(Builder $query): Builder
    {
        return $query->withoutGlobalScope('active')->where('is_archived', true);
    }

    // Soft delete method
    public function archive(): bool
    {
        return $this->update(['is_archived' => true]);
    }

    // Restore method
    public function restore(): bool
    {
        return $this->update(['is_archived' => false]);
    }

    /**
     * Get the city that owns the vendor.
     */
    public function city(): BelongsTo
    {
        return $this->belongsTo(Cities::class, 'city_id');
    }

    /**
     * Get all tasks assigned to this vendor.
     */
    public function tasks(): HasMany
    {
        return $this->hasMany(VendorTaskTracker::class, 'vendor_id');
    }


    // Scope for filtering by city ID
    public function scopeByCityId(Builder $query, $cityId): Builder
    {
        return $cityId ? $query->where('city_id', $cityId) : $query;
    }

    // Scope for filtering by city name (through relationship)
    public function scopeByCity(Builder $query, $cityName): Builder
    {
        return $cityName ? $query->whereHas('city', function ($q) use ($cityName) {
            $q->where('city', 'like', '%' . $cityName . '%');
        }) : $query;
    }

    // Scope for filtering by vendor name
    public function scopeByVendorName(Builder $query, $vendorName): Builder
    {
        return $vendorName ? $query->where('vendor_name', 'like', '%' . $vendorName . '%') : $query;
    }

    // Get vendors by city ID
    public function scopeInCityId(Builder $query, $cityId): Builder
    {
        return $query->where('city_id', $cityId);
    }

    // Get vendors by city name (through relationship)
    public function scopeInCity(Builder $query, $cityName): Builder
    {
        return $query->whereHas('city', function ($q) use ($cityName) {
            $q->where('city', $cityName);
        });
    }

    // Accessor for formatted display name
    public function getDisplayNameAttribute(): string
    {
        $cityName = $this->city ? $this->city->city : 'Unknown City';
        return $this->vendor_name . ' (' . $cityName . ')';
    }
}
