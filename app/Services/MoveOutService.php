<?php

namespace App\Services;

use App\Models\MoveOut;
use App\Models\Tenant;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class MoveOutService
{
    public function getAllMoveOuts(int $perPage = 15): LengthAwarePaginator
    {
        return MoveOut::orderBy('move_out_date', 'desc')
                      ->orderBy('created_at', 'desc')
                      ->paginate($perPage);
    }

    public function searchMoveOuts(string $search, int $perPage = 15): LengthAwarePaginator
    {
        return MoveOut::where(function ($query) use ($search) {
                          $query->where('tenants_name', 'like', "%{$search}%")
                                ->orWhere('units_name', 'like', "%{$search}%")
                                ->orWhere('city_name', 'like', "%{$search}%")
                                ->orWhere('property_name', 'like', "%{$search}%")
                                ->orWhere('lease_status', 'like', "%{$search}%")
                                ->orWhere('keys_location', 'like', "%{$search}%")
                                ->orWhere('walkthrough', 'like', "%{$search}%")
                                ->orWhere('repairs', 'like', "%{$search}%")
                                ->orWhere('notes', 'like', "%{$search}%");
                      })
                      ->orderBy('move_out_date', 'desc')
                      ->paginate($perPage);
    }

    public function createMoveOut(array $data): MoveOut
    {
        return MoveOut::create($data);
    }

    public function updateMoveOut(MoveOut $moveOut, array $data): bool
    {
        return $moveOut->update($data);
    }

    public function deleteMoveOut(MoveOut $moveOut): bool
    {
        return $moveOut->archive();
    }

    public function archiveMoveOut(MoveOut $moveOut): bool
    {
        return $moveOut->archive();
    }

    public function restoreMoveOut(MoveOut $moveOut): bool
    {
        return $moveOut->restore();
    }

    public function getArchivedMoveOuts(int $perPage = 15): LengthAwarePaginator
    {
        return MoveOut::onlyArchived()
                      ->orderBy('move_out_date', 'desc')
                      ->orderBy('created_at', 'desc')
                      ->paginate($perPage);
    }

    public function getDropdownData(): array
    {
        // Get cities
        $cities = \App\Models\Cities::all();
        
        // Get properties with city relationships
        $properties = \App\Models\PropertyInfoWithoutInsurance::with('city')->get();
        
        // Get units data for dropdowns
        $units = \App\Models\Unit::select('city', 'property', 'unit_name')
            ->orderBy('city')
            ->orderBy('property')
            ->orderBy('unit_name')
            ->get();

        // Create arrays for dropdowns
        $unitsByProperty = $units->groupBy('property')->map(function ($propertyUnits) {
            return $propertyUnits->pluck('unit_name')->unique()->values();
        });

        // Get tenants with their full names, unit numbers, and property info
        $tenants = DB::table('tenants')
            ->select(
                DB::raw("CONCAT(first_name, ' ', last_name) as full_name"),
                'unit_number',
                'property_name'
            )
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get();

        // Group tenants by unit
        $tenantsByUnit = $tenants->groupBy('unit_number')->map(function ($unitTenants) {
            return $unitTenants->map(function ($tenant) {
                return [
                    'id' => $tenant->full_name, // Using full_name as ID for consistency
                    'full_name' => $tenant->full_name
                ];
            })->values();
        });

        // Get all units with their city and property info for the edit drawer
        $allUnits = $units->map(function ($unit) {
            return [
                'id' => $unit->unit_name,
                'unit_number' => $unit->unit_name,
                'property_name' => $unit->property,
                'city_name' => $unit->city
            ];
        });

        return [
            'cities' => $cities,
            'properties' => $properties,
            'unitsByProperty' => $unitsByProperty,
            'tenantsByUnit' => $tenantsByUnit,
            'allUnits' => $allUnits,
            'tenantsData' => $tenants
        ];
    }
}
