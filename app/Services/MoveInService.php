<?php

namespace App\Services;

use App\Models\MoveIn;
use App\Models\Unit;
use App\Models\Cities;
use App\Models\PropertyInfoWithoutInsurance;
use Illuminate\Pagination\LengthAwarePaginator;

class MoveInService
{
    public function getAllMoveIns(int $perPage = 15): LengthAwarePaginator
    {
        return MoveIn::with(['unit.property.city'])
                     ->orderBy('move_in_date', 'desc')
                     ->orderBy('created_at', 'desc')
                     ->paginate($perPage);
    }

    public function searchMoveIns($filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = MoveIn::with(['unit.property.city']);

        // Handle search parameter (general search)
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->whereHas('unit', function ($unitQuery) use ($search) {
                    $unitQuery->where('unit_name', 'like', "%{$search}%")
                             ->orWhereHas('property', function ($propertyQuery) use ($search) {
                                 $propertyQuery->where('property_name', 'like', "%{$search}%")
                                              ->orWhereHas('city', function ($cityQuery) use ($search) {
                                                  $cityQuery->where('city', 'like', "%{$search}%");
                                              });
                             });
                });
            });
        }

        // Handle city filter - convert city name to ID
        if (!empty($filters['city'])) {
            $cityName = $filters['city'];
            $cityIds = Cities::where('city', 'like', "%{$cityName}%")
                            ->pluck('id')
                            ->toArray();
            
            if (!empty($cityIds)) {
                $query->whereHas('unit.property', function ($propertyQuery) use ($cityIds) {
                    $propertyQuery->whereIn('city_id', $cityIds);
                });
            } else {
                // If no matching cities found, return empty result
                $query->whereRaw('1 = 0');
            }
        }

        // Handle property filter - convert property name to ID
        if (!empty($filters['property'])) {
            $propertyName = $filters['property'];
            $propertyIds = PropertyInfoWithoutInsurance::where('property_name', 'like', "%{$propertyName}%")
                                                      ->pluck('id')
                                                      ->toArray();
            
            if (!empty($propertyIds)) {
                $query->whereHas('unit', function ($unitQuery) use ($propertyIds) {
                    $unitQuery->whereIn('property_id', $propertyIds);
                });
            } else {
                // If no matching properties found, return empty result
                $query->whereRaw('1 = 0');
            }
        }

        return $query->orderBy('move_in_date', 'desc')
                     ->orderBy('created_at', 'desc')
                     ->paginate($perPage);
    }

    public function createMoveIn(array $data): MoveIn
    {
        return MoveIn::create($data);
    }

    public function updateMoveIn(MoveIn $moveIn, array $data): bool
    {
        return $moveIn->update($data);
    }

    public function deleteMoveIn(MoveIn $moveIn): bool
    {
        return $moveIn->archive();
    }

    public function getUnitsForDropdown(): array
    {
        $units = Unit::with(['property.city'])
                    ->select('id', 'unit_name', 'property_id')
                    ->orderBy('unit_name')
                    ->get()
                    ->map(function ($unit) {
                        return [
                            'id' => $unit->id,
                            'unit_name' => $unit->unit_name,
                            'property_name' => $unit->property?->property_name ?? 'N/A',
                            'city_name' => $unit->property?->city?->city ?? 'N/A'
                        ];
                    })
                    ->toArray();

        return [
            'units' => $units
        ];
    }

    public function getDropdownData(): array
    {
        // Get cities
        $cities = Cities::orderBy('city')->get();
        
        // Get properties with city relationships
        $properties = PropertyInfoWithoutInsurance::with('city')
                                                 ->orderBy('property_name')
                                                 ->get();
        
        // Get units data for dropdowns with relationships
        $units = Unit::with(['property.city'])
            ->select('id', 'unit_name', 'property_id')
            ->orderBy('unit_name')
            ->get();

        // Create arrays for dropdowns - group by property but include unit IDs
        $unitsByProperty = $properties->mapWithKeys(function ($property) use ($units) {
            $propertyUnits = $units->where('property_id', $property->id);
            return [
                $property->id => $propertyUnits->map(function ($unit) {
                    return [
                        'id' => $unit->id,
                        'unit_name' => $unit->unit_name
                    ];
                })->values()
            ];
        });

        return [
            'cities' => $cities,
            'properties' => $properties,
            'unitsByProperty' => $unitsByProperty,
            'units' => $units->map(function ($unit) {
                return [
                    'id' => $unit->id,
                    'unit_name' => $unit->unit_name,
                    'property_name' => $unit->property?->property_name ?? 'N/A',
                    'city_name' => $unit->property?->city?->city ?? 'N/A'
                ];
            })
        ];
    }
}
