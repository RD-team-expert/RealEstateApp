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
        return Tenant::create($data);
    }

    public function updateTenant(Tenant $tenant, array $data): Tenant
    {
        $tenant->update($data);
        return $tenant->fresh();
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
}
