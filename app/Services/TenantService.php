<?php

namespace App\Services;

use App\Models\Tenant;
use Illuminate\Pagination\LengthAwarePaginator;

class TenantService
{
    public function getAllTenants(): \Illuminate\Database\Eloquent\Collection
    {
        return Tenant::orderBy('created_at', 'desc')->get();
    }

    public function getPaginatedTenants(int $perPage = 10): LengthAwarePaginator
    {
        return Tenant::orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function createTenant(array $data): Tenant
    {
        $data = $this->validateAssistanceFields($data);
        return Tenant::create($data);
    }

    public function updateTenant(Tenant $tenant, array $data): Tenant
    {
        $data = $this->validateAssistanceFields($data);
        $tenant->update($data);
        return $tenant->fresh();
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
        return $tenant->archive();
    }

    public function findTenant(int $id): ?Tenant
    {
        return Tenant::find($id);
    }

    public function searchTenants(string $search): \Illuminate\Database\Eloquent\Collection
    {
        return Tenant::where('first_name', 'like', "%{$search}%")
            ->orWhere('last_name', 'like', "%{$search}%")
            ->orWhere('property_name', 'like', "%{$search}%")
            ->orWhere('unit_number', 'like', "%{$search}%")
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function filterTenants(array $filters): \Illuminate\Database\Eloquent\Collection
    {
        $query = Tenant::query();

        // Apply city filter by joining with properties and cities
        if (!empty($filters['city'])) {
            $query->whereIn('property_name', function ($subQuery) use ($filters) {
                $subQuery->select('property_name')
                    ->from('property_info_without_insurance as p')
                    ->join('cities as c', 'p.city_id', '=', 'c.id')
                    ->where('c.city', 'like', "%{$filters['city']}%");
            });
        }

        // Apply property filter
        if (!empty($filters['property'])) {
            $query->where('property_name', 'like', "%{$filters['property']}%");
        }

        // Apply unit name filter
        if (!empty($filters['unit_name'])) {
            $query->where('unit_number', 'like', "%{$filters['unit_name']}%");
        }

        // Apply general search filter
        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('first_name', 'like', "%{$filters['search']}%")
                  ->orWhere('last_name', 'like', "%{$filters['search']}%")
                  ->orWhere('property_name', 'like', "%{$filters['search']}%")
                  ->orWhere('unit_number', 'like', "%{$filters['search']}%")
                  ->orWhere('street_address_line', 'like', "%{$filters['search']}%")
                  ->orWhere('login_email', 'like', "%{$filters['search']}%");
            });
        }

        return $query->orderBy('created_at', 'desc')->get();
    }
}
