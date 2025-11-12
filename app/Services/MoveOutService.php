<?php

namespace App\Services;

use App\Models\MoveOut;
use App\Models\Tenant;
use App\Models\Unit;
use App\Models\PropertyInfoWithoutInsurance;
use App\Models\Cities;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class MoveOutService
{
    public function getAllMoveOuts(int|string $perPage = 15): LengthAwarePaginator|Collection
    {
        $query = MoveOut::with(['unit.property.city'])
                        ->orderBy('move_out_date', 'desc')
                        ->orderBy('created_at', 'desc');

        if (is_string($perPage) && strtolower(trim($perPage)) === 'all') {
            return $query->get();
        }

        return $query->paginate((int) $perPage);
    }

    public function searchMoveOuts(string $search, int $perPage = 15): LengthAwarePaginator
    {
        return MoveOut::with(['unit.property.city'])
                      ->where(function ($query) use ($search) {
                          $query->where('lease_status', 'like', "%{$search}%")
                                ->orWhere('keys_location', 'like', "%{$search}%")
                                ->orWhere('walkthrough', 'like', "%{$search}%")
                                ->orWhere('repairs', 'like', "%{$search}%")
                                ->orWhere('notes', 'like', "%{$search}%")
                                ->orWhere('send_back_security_deposit', 'like', "%{$search}%")
                                ->orWhere('list_the_unit', 'like', "%{$search}%")
                                ->orWhere('tenants', 'like', "%{$search}%")
                                ->orWhere('utility_type', 'like', "%{$search}%")
                                ->orWhereHas('unit', function ($unitQuery) use ($search) {
                                    $unitQuery->where('unit_name', 'like', "%{$search}%");
                                })
                                ->orWhereHas('unit.property', function ($propertyQuery) use ($search) {
                                    $propertyQuery->where('property_name', 'like', "%{$search}%");
                                })
                                ->orWhereHas('unit.property.city', function ($cityQuery) use ($search) {
                                    $cityQuery->where('city', 'like', "%{$search}%");
                                });
                      })
                      ->orderBy('move_out_date', 'desc')
                      ->paginate($perPage);
    }

    public function createMoveOut(array $data): MoveOut
    {
        // Remove display-only fields that shouldn't be stored
        unset($data['unit_name'], $data['property_name'], $data['city_name']);
        
        return DB::transaction(function () use ($data) {
            $moveOut = MoveOut::create($data);

            // If lease status ended, mark the related unit as vacant and clear tenants
            $status = isset($data['lease_status']) ? strtolower(trim($data['lease_status'])) : null;
            if ($status === 'ended' && $moveOut->unit_id) {
                $unit = Unit::find($moveOut->unit_id);
                if ($unit) {
                    $unit->tenants = null;
                    $unit->is_new_lease = null;
                    $unit->vacant = 'Yes';
                    $unit->listed = 'No';
                    $unit->total_applications = 0;
                    $unit->saveQuietly();
                }
            }

            return $moveOut;
        });
    }

    public function updateMoveOut(MoveOut $moveOut, array $data): bool
    {
        // Remove display-only fields that shouldn't be stored
        unset($data['unit_name'], $data['property_name'], $data['city_name']);
        
        return DB::transaction(function () use ($moveOut, $data) {
            $updated = $moveOut->update($data);

            if ($updated) {
                $leaseStatus = $data['lease_status'] ?? $moveOut->lease_status;
                $status = isset($leaseStatus) ? strtolower(trim($leaseStatus)) : null;
                if ($status === 'ended' && $moveOut->unit_id) {
                    $unit = Unit::find($moveOut->unit_id);
                    if ($unit) {
                        $unit->tenants = null;
                        $unit->is_new_lease = null;
                        $unit->vacant = 'Yes';
                        $unit->listed = 'No';
                        $unit->total_applications = 0;
                        $unit->saveQuietly();
                    }
                }
            }

            return $updated;
        });
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
                      ->with(['unit.property.city'])
                      ->orderBy('move_out_date', 'desc')
                      ->orderBy('created_at', 'desc')
                      ->paginate($perPage);
    }

    public function getDropdownData(): array
    {
        $cities = Cities::orderBy('city')->get();
        $properties = PropertyInfoWithoutInsurance::with('city')
                     ->orderBy('property_name')
                     ->get();
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
                    'full_name' => $tenant->full_name
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

        $filterCities = $cities->pluck('city')->unique()->values()->all();
        $filterProperties = $properties->pluck('property_name')->unique()->values()->all();
        $filterUnits = $units->pluck('unit_name')->unique()->values()->all();

        return [
            'cities' => $cities,
            'properties' => $properties,
            'propertiesByCityId' => $propertiesByCityId,
            'unitsByPropertyId' => $unitsByPropertyId,
            'tenantsByUnitId' => $tenantsByUnitId,
            'allUnits' => $allUnits,
            'tenantsData' => $tenantsData,
            'filterCities' => $filterCities,
            'filterProperties' => $filterProperties,
            'filterUnits' => $filterUnits,
        ];
    }

    /**
     * Get move-out with proper relationships for display
     */
    public function getMoveOutWithRelations(int $id): ?MoveOut
    {
        return MoveOut::with(['unit.property.city'])->find($id);
    }

    /**
     * Search move-outs with filters using ID-based filtering
     */
    public function searchMoveOutsWithFilters(array $filters, int|string $perPage = 15): LengthAwarePaginator|Collection
    {
        $query = MoveOut::with(['unit.property.city']);

        if (!empty($filters['unit'])) {
            $value = trim($filters['unit']);
            $query->whereHas('unit', function ($unitQuery) use ($value) {
                $unitQuery->where('unit_name', 'like', "%{$value}%");
            });
        }

        if (!empty($filters['city'])) {
            $value = trim($filters['city']);
            $query->whereHas('unit.property.city', function ($cityQuery) use ($value) {
                $cityQuery->where('city', 'like', "%{$value}%");
            });
        }

        if (!empty($filters['property'])) {
            $value = trim($filters['property']);
            $query->whereHas('unit.property', function ($propertyQuery) use ($value) {
                $propertyQuery->where('property_name', 'like', "%{$value}%");
            });
        }

        $query = $query->orderBy('move_out_date', 'desc')
                       ->orderBy('created_at', 'desc');

        if (is_string($perPage) && strtolower(trim($perPage)) === 'all') {
            return $query->get();
        }

        return $query->paginate((int) $perPage);
    }

    public function getAdjacentMoveOutIds(int $currentId, array $filters): array
    {
        $query = MoveOut::with(['unit.property.city']);

        if (!empty($filters['unit'])) {
            $value = trim($filters['unit']);
            $query->whereHas('unit', function ($unitQuery) use ($value) {
                $unitQuery->where('unit_name', 'like', "%{$value}%");
            });
        }

        if (!empty($filters['city'])) {
            $value = trim($filters['city']);
            $query->whereHas('unit.property.city', function ($cityQuery) use ($value) {
                $cityQuery->where('city', 'like', "%{$value}%");
            });
        }

        if (!empty($filters['property'])) {
            $value = trim($filters['property']);
            $query->whereHas('unit.property', function ($propertyQuery) use ($value) {
                $propertyQuery->where('property_name', 'like', "%{$value}%");
            });
        }

        $items = $query->orderBy('move_out_date', 'desc')
                       ->orderBy('created_at', 'desc')
                       ->orderBy('id', 'desc')
                       ->get(['id', 'move_out_date', 'created_at']);

        $ids = $items->pluck('id')->values()->all();
        $index = array_search($currentId, $ids, true);
        if ($index === false) {
            return ['prevId' => null, 'nextId' => null];
        }
        $prevId = $index > 0 ? $ids[$index - 1] : null;
        $nextId = $index < count($ids) - 1 ? $ids[$index + 1] : null;

        return ['prevId' => $prevId, 'nextId' => $nextId];
    }
}
