<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\Unit;
use Illuminate\Pagination\LengthAwarePaginator;

class TenantService
{
    public function getAllTenants(): \Illuminate\Database\Eloquent\Collection
    {
        return Tenant::with(['unit' => function ($query) {
                $query->withArchived();
            }, 'unit.property.city'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getPaginatedTenants(int $perPage = 10): LengthAwarePaginator
    {
        return Tenant::with(['unit' => function ($query) {
                $query->withArchived();
            }, 'unit.property.city'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function createTenant(array $data): Tenant
    {
        $data = $this->validateAssistanceFields($data);
        $tenant = Tenant::create($data);
        
        // Update unit calculations after creating tenant
        Unit::updateApplicationCountForUnit($data['unit_id']);
        
        return $tenant;
    }

    public function updateTenant(Tenant $tenant, array $data): Tenant
    {
        $data = $this->validateAssistanceFields($data);
        $oldUnitId = $tenant->unit_id;
        
        $tenant->update($data);
        
        // Update calculations for both old and new units if unit changed
        if ($oldUnitId !== $data['unit_id']) {
            Unit::updateApplicationCountForUnit($oldUnitId);
            Unit::updateApplicationCountForUnit($data['unit_id']);
        } else {
            Unit::updateApplicationCountForUnit($data['unit_id']);
        }
        
        return $tenant->fresh(['unit.property.city']);
    }

    /**
     * Validate assistance fields and set them to null if has_assistance is "No"
     */
    private function validateAssistanceFields(array $data): array
    {
        if (isset($data['has_assistance']) && $data['has_assistance'] === 'No') {
            $data['assistance_amount'] = null;
            $data['assistance_company'] = null;
        }
        
        return $data;
    }

    public function deleteTenant(Tenant $tenant): bool
    {
        $unitId = $tenant->unit_id;
        $result = $tenant->archive();
        
        // Update unit calculations after archiving tenant
        if ($result) {
            Unit::updateApplicationCountForUnit($unitId);
        }
        
        return $result;
    }

    public function findTenant(int $id): ?Tenant
    {
        return Tenant::with(['unit' => function ($query) {
                $query->withArchived();
            }, 'unit.property.city'])->find($id);
    }

    public function searchTenants(string $search): \Illuminate\Database\Eloquent\Collection
    {
        return Tenant::with(['unit' => function ($query) {
                $query->withArchived();
            }, 'unit.property.city'])
            ->where(function ($query) use ($search) {
                $query->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhereHas('unit', function ($unitQuery) use ($search) {
                        $unitQuery->withArchived()->where('unit_name', 'like', "%{$search}%")
                            ->orWhereHas('property', function ($propertyQuery) use ($search) {
                                $propertyQuery->where('property_name', 'like', "%{$search}%");
                            });
                    });
            })
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function filterTenants(array $filters): \Illuminate\Database\Eloquent\Collection
    {
        $query = Tenant::with(['unit' => function ($query) {
            $query->withArchived();
        }, 'unit.property.city']);

        // Apply city filter by joining with properties and cities
        if (!empty($filters['city'])) {
            $query->whereHas('unit.property.city', function ($cityQuery) use ($filters) {
                $cityQuery->where('city', 'like', "%{$filters['city']}%");
            });
        }

        // Apply property filter
        if (!empty($filters['property'])) {
            $query->whereHas('unit.property', function ($propertyQuery) use ($filters) {
                $propertyQuery->where('property_name', 'like', "%{$filters['property']}%");
            });
        }

        // Apply unit name filter
        if (!empty($filters['unit_name'])) {
            $query->whereHas('unit', function ($unitQuery) use ($filters) {
                $unitQuery->withArchived()->where('unit_name', 'like', "%{$filters['unit_name']}%");
            });
        }

        // Apply general search filter
        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('first_name', 'like', "%{$filters['search']}%")
                  ->orWhere('last_name', 'like', "%{$filters['search']}%")
                  ->orWhere('street_address_line', 'like', "%{$filters['search']}%")
                  ->orWhere('login_email', 'like', "%{$filters['search']}%")
                  ->orWhereHas('unit', function ($unitQuery) use ($filters) {
                      $unitQuery->withArchived()->where('unit_name', 'like', "%{$filters['search']}%")
                          ->orWhereHas('property', function ($propertyQuery) use ($filters) {
                              $propertyQuery->where('property_name', 'like', "%{$filters['search']}%");
                          });
                  });
            });
        }

        return $query->orderBy('created_at', 'desc')->get();
    }
}
