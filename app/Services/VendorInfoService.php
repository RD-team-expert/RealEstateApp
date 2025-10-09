<?php
// app/Services/VendorInfoService.php

namespace App\Services;

use App\Models\VendorInfo;
use App\Models\Cities;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Collection as SupportCollection;

class VendorInfoService
{
    public function getAllPaginated(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $query = VendorInfo::with('city');

        // Apply filters using relationships
        if (!empty($filters['city'])) {
            $query->whereHas('city', function ($q) use ($filters) {
                $q->where('city', 'like', '%' . $filters['city'] . '%');
            });
        }

        if (!empty($filters['city_id'])) {
            $query->where('city_id', $filters['city_id']);
        }

        if (!empty($filters['vendor_name'])) {
            $query->where('vendor_name', 'like', '%' . $filters['vendor_name'] . '%');
        }

        if (!empty($filters['number'])) {
            $query->where('number', 'like', '%' . $filters['number'] . '%');
        }

        if (!empty($filters['email'])) {
            $query->where('email', 'like', '%' . $filters['email'] . '%');
        }

        return $query->orderBy('city_id', 'asc')->orderBy('vendor_name', 'asc')->paginate($perPage);
    }

    public function create(array $data): VendorInfo
    {
        // Clean empty strings to null for nullable fields only
        $data = $this->cleanEmptyStringsForNullableFields($data);
        return VendorInfo::create($data);
    }

    public function findById(int $id): VendorInfo
    {
        return VendorInfo::with('city')->findOrFail($id);
    }

    public function update(VendorInfo $vendorInfo, array $data): VendorInfo
    {
        // Clean empty strings to null for nullable fields only
        $data = $this->cleanEmptyStringsForNullableFields($data);
        $vendorInfo->update($data);
        return $vendorInfo->fresh('city');
    }

    public function delete(VendorInfo $vendorInfo): bool
    {
        // Use soft delete by setting is_archived to true
        $vendorInfo->archive();
        return true;
    }

    public function getByCityId(int $cityId): Collection
    {
        return VendorInfo::with('city')
            ->where('city_id', $cityId)
            ->orderBy('vendor_name', 'asc')
            ->get();
    }

    public function getByCity(string $cityName): Collection
    {
        return VendorInfo::with('city')
            ->whereHas('city', function ($q) use ($cityName) {
                $q->where('city', $cityName);
            })
            ->orderBy('vendor_name', 'asc')
            ->get();
    }

    // public function getStatistics(): array
    // {
    //     $total = VendorInfo::count();
        
    //     // Get city counts with city names using joins
    //     $cityCounts = VendorInfo::join('cities', 'vendors_info.city_id', '=', 'cities.id')
    //         ->selectRaw('cities.city, COUNT(*) as count')
    //         ->groupBy('cities.city')
    //         ->orderBy('count', 'desc')
    //         ->pluck('count', 'city')
    //         ->toArray();

    //     $withEmail = VendorInfo::whereNotNull('email')->count();
    //     $withNumber = VendorInfo::whereNotNull('number')->count();

    //     return [
    //         'total' => $total,
    //         'city_counts' => $cityCounts,
    //         'with_email' => $withEmail,
    //         'with_number' => $withNumber,
    //     ];
    // }

    public function getRecentVendors(int $limit = 10): Collection
    {
        return VendorInfo::with('city')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    public function getCities(): SupportCollection
    {
        return Cities::query()
            ->orderBy('city', 'asc')
            ->get(['id', 'city']); // returns Collection with id and city
    }

    private function cleanEmptyStringsForNullableFields(array $data): array
    {
        // Only clean nullable fields - city_id and vendor_name should not be cleaned
        $nullableFields = ['number', 'email', 'service_type'];

        foreach ($nullableFields as $field) {
            if (isset($data[$field]) && $data[$field] === '') {
                $data[$field] = null;
            }
        }

        return $data;
    }
}
