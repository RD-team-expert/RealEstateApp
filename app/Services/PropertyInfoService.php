<?php
// app/Services/PropertyInfoService.php

namespace App\Services;

use App\Models\PropertyInfo;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class PropertyInfoService
{
    public function getAllPaginated(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $query = PropertyInfo::query();

        // Apply filters
        if (!empty($filters['property_name'])) {
            $query->where('property_name', 'like', '%' . $filters['property_name'] . '%');
        }

        if (!empty($filters['insurance_company_name'])) {
            $query->where('insurance_company_name', 'like', '%' . $filters['insurance_company_name'] . '%');
        }

        if (!empty($filters['policy_number'])) {
            $query->where('policy_number', 'like', '%' . $filters['policy_number'] . '%');
        }

        if (!empty($filters['status'])) {
            switch ($filters['status']) {
                case 'expired':
                    $query->where('days_left', '<', 0);
                    break;
                case 'expiring_soon':
                    $query->whereBetween('days_left', [0, 30]);
                    break;
                case 'active':
                    $query->where('days_left', '>', 30);
                    break;
            }
        }

        return $query->orderBy('expiration_date', 'asc')->paginate($perPage);
    }

    public function create(array $data): PropertyInfo
    {
        return PropertyInfo::create($data);
    }

    public function findById(int $id): PropertyInfo
    {
        return PropertyInfo::findOrFail($id);
    }

    public function update(PropertyInfo $propertyInfo, array $data): PropertyInfo
    {
        $propertyInfo->update($data);
        return $propertyInfo->fresh();
    }

    public function delete(PropertyInfo $propertyInfo): bool
    {
        return $propertyInfo->delete();
    }

    public function getExpiringSoon(int $days = 30): Collection
    {
        return PropertyInfo::whereBetween('days_left', [0, $days])
            ->orderBy('days_left', 'asc')
            ->get();
    }

    public function getExpired(): Collection
    {
        return PropertyInfo::where('days_left', '<', 0)
            ->orderBy('days_left', 'asc')
            ->get();
    }

    public function getStatistics(): array
    {
        $total = PropertyInfo::count();
        $expired = PropertyInfo::where('days_left', '<', 0)->count();
        $expiringSoon = PropertyInfo::whereBetween('days_left', [0, 30])->count();
        $active = PropertyInfo::where('days_left', '>', 30)->count();

        return [
            'total' => $total,
            'expired' => $expired,
            'expiring_soon' => $expiringSoon,
            'active' => $active,
        ];
    }
}
