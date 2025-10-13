<?php

namespace App\Services;

use App\Models\Cities;
use App\Models\PropertyInfoWithoutInsurance;
use App\Models\Unit;
use Illuminate\Database\Eloquent\Collection;

class DashboardService
{
    /**
     * Get all cities
     */
    public function getAllCities(): Collection
    {
        return Cities::select('id', 'city')
            ->orderBy('city')
            ->get();
    }

    /**
     * Get properties by city ID
     */
    public function getPropertiesByCity(int $cityId): Collection
    {
        return PropertyInfoWithoutInsurance::select('id', 'property_name', 'city_id')
            ->where('city_id', $cityId)
            ->orderBy('property_name')
            ->get();
    }

    /**
     * Get units by property ID
     */
    public function getUnitsByProperty(int $propertyId): Collection
    {
        return Unit::select('id', 'unit_name', 'property_id', 'vacant', 'monthly_rent')
            ->where('property_id', $propertyId)
            ->orderBy('unit_name')
            ->get();
    }

    /**
     * Get detailed unit information
     */
    public function getUnitInfo(int $unitId): ?Unit
    {
        return Unit::with(['property.city', 'applications'])
            ->find($unitId);
    }
}
