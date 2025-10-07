<?php

namespace App\Services;

use App\Models\MoveIn;
use App\Models\Unit;
use Illuminate\Pagination\LengthAwarePaginator;

class MoveInService
{
    public function getAllMoveIns(int $perPage = 15): LengthAwarePaginator
    {
        return MoveIn::orderBy('move_in_date', 'desc')
                     ->orderBy('created_at', 'desc')
                     ->paginate($perPage);
    }

    public function searchMoveIns(string $search, int $perPage = 15): LengthAwarePaginator
    {
        return MoveIn::where(function ($query) use ($search) {
                         $query->where('unit_name', 'like', "%{$search}%")
                               ->orWhere('signed_lease', 'like', "%{$search}%")
                               ->orWhere('paid_security_deposit_first_month_rent', 'like', "%{$search}%")
                               ->orWhere('handled_keys', 'like', "%{$search}%")
                               ->orWhere('filled_move_in_form', 'like', "%{$search}%")
                               ->orWhere('submitted_insurance', 'like', "%{$search}%");
                     })
                     ->orderBy('move_in_date', 'desc')
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
        $units = Unit::select('unit_name')->orderBy('unit_name')->pluck('unit_name')->toArray();

        return [
            'units' => $units
        ];
    }

    public function getDropdownData(): array
    {
        // Get cities
        $cities = \App\Models\Cities::all();
        
        // Get properties with city relationships
        $properties = \App\Models\PropertyInfoWithoutInsurance::with('city')->get();
        
        // Get units data for dropdowns
        $units = Unit::select('city', 'property', 'unit_name')
            ->orderBy('city')
            ->orderBy('property')
            ->orderBy('unit_name')
            ->get();

        // Create arrays for dropdowns
        $unitsByProperty = $units->groupBy('property')->map(function ($propertyUnits) {
            return $propertyUnits->pluck('unit_name')->unique()->values();
        });

        return [
            'cities' => $cities,
            'properties' => $properties,
            'unitsByProperty' => $unitsByProperty,
            'units' => $units
        ];
    }
}
