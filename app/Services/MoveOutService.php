<?php

namespace App\Services;

use App\Models\MoveOut;
use App\Models\Tenant;
use App\Models\Unit;
use App\Models\PropertyInfoWithoutInsurance;
use App\Models\Cities;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class MoveOutService
{
    public function getAllMoveOuts(int $perPage = 15): LengthAwarePaginator
    {
        return MoveOut::with(['tenant.unit.property.city'])
                      ->orderBy('move_out_date', 'desc')
                      ->orderBy('created_at', 'desc')
                      ->paginate($perPage);
    }

    public function searchMoveOuts(string $search, int $perPage = 15): LengthAwarePaginator
    {
        return MoveOut::with(['tenant.unit.property.city'])
                      ->where(function ($query) use ($search) {
                          $query->where('lease_status', 'like', "%{$search}%")
                                ->orWhere('keys_location', 'like', "%{$search}%")
                                ->orWhere('walkthrough', 'like', "%{$search}%")
                                ->orWhere('repairs', 'like', "%{$search}%")
                                ->orWhere('notes', 'like', "%{$search}%")
                                ->orWhere('send_back_security_deposit', 'like', "%{$search}%")
                                ->orWhere('list_the_unit', 'like', "%{$search}%")
                                ->orWhereHas('tenant', function ($tenantQuery) use ($search) {
                                    $tenantQuery->whereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$search}%"]);
                                })
                                ->orWhereHas('tenant.unit', function ($unitQuery) use ($search) {
                                    $unitQuery->where('unit_name', 'like', "%{$search}%");
                                })
                                ->orWhereHas('tenant.unit.property', function ($propertyQuery) use ($search) {
                                    $propertyQuery->where('property_name', 'like', "%{$search}%");
                                })
                                ->orWhereHas('tenant.unit.property.city', function ($cityQuery) use ($search) {
                                    $cityQuery->where('city', 'like', "%{$search}%");
                                });
                      })
                      ->orderBy('move_out_date', 'desc')
                      ->paginate($perPage);
    }

    public function createMoveOut(array $data): MoveOut
    {
        // Remove display-only fields that shouldn't be stored
        unset($data['units_name'], $data['property_name'], $data['city_name'], $data['tenants_name']);
        
        return MoveOut::create($data);
    }

    public function updateMoveOut(MoveOut $moveOut, array $data): bool
    {
        // Remove display-only fields that shouldn't be stored
        unset($data['units_name'], $data['property_name'], $data['city_name'], $data['tenants_name']);
        
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
                      ->with(['tenant.unit.property.city'])
                      ->orderBy('move_out_date', 'desc')
                      ->orderBy('created_at', 'desc')
                      ->paginate($perPage);
    }

    public function getDropdownData(): array
    {
        // Get cities
        $cities = Cities::orderBy('city')->get();
        
        // Get properties with city relationships
        $properties = PropertyInfoWithoutInsurance::with('city')
                     ->orderBy('property_name')
                     ->get();
        
        // Get units with their relationships for dropdowns
        $units = Unit::with(['property.city'])
                    ->orderBy('unit_name')
                    ->get();

        // Create ID-keyed lookup maps for cascading
        $propertiesByCityId = $properties->groupBy('city_id')->map(function ($cityProperties) {
            return $cityProperties->map(function ($property) {
                return [
                    'id' => $property->id,
                    'property_name' => $property->property_name
                ];
            })->values();
        });

        $unitsByPropertyId = $units->groupBy('property_id')->map(function ($propertyUnits) {
            return $propertyUnits->map(function ($unit) {
                return [
                    'id' => $unit->id,
                    'unit_name' => $unit->unit_name
                ];
            })->values();
        });

        // Get tenants with their relationships
        $tenants = Tenant::with(['unit.property.city'])
                         ->orderBy('first_name')
                         ->orderBy('last_name')
                         ->get();

        // Group tenants by unit ID
        $tenantsByUnitId = $tenants->groupBy('unit_id')->map(function ($unitTenants) {
            return $unitTenants->map(function ($tenant) {
                return [
                    'id' => $tenant->id,
                    'full_name' => $tenant->full_name,
                    'tenant_id' => $tenant->id
                ];
            })->values();
        });

        // Get all units with their complete information for edit drawer
        $allUnits = $units->map(function ($unit) {
            return [
                'id' => $unit->id,
                'unit_name' => $unit->unit_name,
                'property_name' => $unit->property ? $unit->property->property_name : null,
                'city_name' => $unit->property && $unit->property->city ? $unit->property->city->city : null
            ];
        });

        // Format tenants data for frontend with ID-based mapping
        $tenantsData = $tenants->map(function ($tenant) {
            return [
                'id' => $tenant->id,
                'full_name' => $tenant->full_name,
                'unit_name' => $tenant->unit ? $tenant->unit->unit_name : null,
                'property_name' => $tenant->unit && $tenant->unit->property ? $tenant->unit->property->property_name : null,
                'city_name' => $tenant->unit && $tenant->unit->property && $tenant->unit->property->city ? $tenant->unit->property->city->city : null
            ];
        });

        return [
            'cities' => $cities,
            'properties' => $properties,
            'propertiesByCityId' => $propertiesByCityId,
            'unitsByPropertyId' => $unitsByPropertyId,
            'tenantsByUnitId' => $tenantsByUnitId,
            'allUnits' => $allUnits,
            'tenantsData' => $tenantsData
        ];
    }

    /**
     * Get move-out with proper relationships for display
     */
    public function getMoveOutWithRelations(int $id): ?MoveOut
    {
        return MoveOut::with(['tenant.unit.property.city'])->find($id);
    }

    /**
     * Search move-outs with filters using ID-based filtering
     */
    public function searchMoveOutsWithFilters(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = MoveOut::with(['tenant.unit.property.city']);

        // Apply unit filter by ID
        if (!empty($filters['unit_id'])) {
            $query->whereHas('tenant', function ($tenantQuery) use ($filters) {
                $tenantQuery->where('unit_id', $filters['unit_id']);
            });
        }

        // Apply tenant filter by ID
        if (!empty($filters['tenant_id'])) {
            $query->where('tenant_id', $filters['tenant_id']);
        }

        // Apply city filter by ID
        if (!empty($filters['city_id'])) {
            $query->whereHas('tenant.unit.property', function ($propertyQuery) use ($filters) {
                $propertyQuery->where('city_id', $filters['city_id']);
            });
        }

        // Apply property filter by ID
        if (!empty($filters['property_id'])) {
            $query->whereHas('tenant.unit', function ($unitQuery) use ($filters) {
                $unitQuery->where('property_id', $filters['property_id']);
            });
        }

        return $query->orderBy('move_out_date', 'desc')
                    ->orderBy('created_at', 'desc')
                    ->paginate($perPage);
    }
}
