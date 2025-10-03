<?php
// app/Models/VendorInfo.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class VendorInfo extends Model
{
    use HasFactory;

    protected $table = 'vendors_info';

    protected $fillable = [
        'city',
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
    protected static function booted()
    {
        static::addGlobalScope('active', function ($query) {
            $query->where('is_archived', false);
        });
    }

    // Scope to include archived records when needed
    public function scopeWithArchived($query)
    {
        return $query->withoutGlobalScope('active');
    }

    // Scope to get only archived records
    public function scopeOnlyArchived($query)
    {
        return $query->withoutGlobalScope('active')->where('is_archived', true);
    }

    // Soft delete method
    public function archive()
    {
        $this->update(['is_archived' => true]);
    }

    // Restore method
    public function restore()
    {
        $this->update(['is_archived' => false]);
    }

    // Scope for filtering by city
    public function scopeByCity($query, $city)
    {
        return $city ? $query->where('city', 'like', '%' . $city . '%') : $query;
    }

    // Scope for filtering by vendor name
    public function scopeByVendorName($query, $vendorName)
    {
        return $vendorName ? $query->where('vendor_name', 'like', '%' . $vendorName . '%') : $query;
    }

    // Get vendors by city
    public function scopeInCity($query, $city)
    {
        return $query->where('city', $city);
    }

    // Accessor for formatted display name
    public function getDisplayNameAttribute(): string
    {
        return $this->vendor_name . ' (' . $this->city . ')';
    }
}
