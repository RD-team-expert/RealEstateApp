<?php
// app/Services/PropertyInfoService.php

namespace App\Services;

use App\Models\PropertyInfo;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Carbon\Carbon;

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
            $query->where('status', $filters['status']);
        }

        return $query->orderBy('expiration_date', 'asc')->paginate($perPage);
    }

    public function create(array $data): PropertyInfo
    {
        $property = PropertyInfo::create($data);
        // Set initial status based on expiration date
        $property->updateStatus();
        return $property;
    }

    public function findById(int $id): PropertyInfo
    {
        return PropertyInfo::findOrFail($id);
    }

    public function update(PropertyInfo $propertyInfo, array $data): PropertyInfo
    {
        $propertyInfo->update($data);
        // Update status after updating the property
        $propertyInfo->updateStatus();
        return $propertyInfo->fresh();
    }

    public function delete(PropertyInfo $propertyInfo): bool
    {
        return $propertyInfo->delete();
    }

    public function getExpired(): Collection
    {
        return PropertyInfo::where('status', 'Expired')
            ->orderBy('expiration_date', 'asc')
            ->get();
    }

    public function getStatistics(): array
    {
        $total = PropertyInfo::count();
        $expired = PropertyInfo::where('status', 'Expired')->count();
        $active = PropertyInfo::where('status', 'Active')->count();

        return [
            'total' => $total,
            'expired' => $expired,
            'active' => $active,
        ];
    }

    public function updateAllStatuses(): void
    {
        $properties = PropertyInfo::all();
        
        foreach ($properties as $property) {
            $newStatus = Carbon::now()->gt(Carbon::parse($property->expiration_date)) ? 'Expired' : 'Active';
            
            // Only update if status has changed to avoid unnecessary database writes
            if ($property->status !== $newStatus) {
                $property->status = $newStatus;
                $property->save();
            }
        }
    }
}
