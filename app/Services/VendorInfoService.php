<?php
// app/Services/VendorInfoService.php

namespace App\Services;

use App\Models\VendorInfo;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class VendorInfoService
{
    public function getAllPaginated(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $query = VendorInfo::query();

        // Apply filters
        if (!empty($filters['city'])) {
            $query->where('city', 'like', '%' . $filters['city'] . '%');
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

        return $query->orderBy('city', 'asc')->orderBy('vendor_name', 'asc')->paginate($perPage);
    }

    public function create(array $data): VendorInfo
    {
        // Clean empty strings to null for nullable fields only
        $data = $this->cleanEmptyStringsForNullableFields($data);
        return VendorInfo::create($data);
    }

    public function findById(int $id): VendorInfo
    {
        return VendorInfo::findOrFail($id);
    }

    public function update(VendorInfo $vendorInfo, array $data): VendorInfo
    {
        // Clean empty strings to null for nullable fields only
        $data = $this->cleanEmptyStringsForNullableFields($data);
        $vendorInfo->update($data);
        return $vendorInfo->fresh();
    }

    public function delete(VendorInfo $vendorInfo): bool
    {
        return $vendorInfo->delete();
    }

    public function getByCity(string $city): Collection
    {
        return VendorInfo::inCity($city)
            ->orderBy('vendor_name', 'asc')
            ->get();
    }

    public function getStatistics(): array
    {
        $total = VendorInfo::count();
        $cityCounts = VendorInfo::selectRaw('city, COUNT(*) as count')
            ->groupBy('city')
            ->orderBy('count', 'desc')
            ->pluck('count', 'city')
            ->toArray();

        $withEmail = VendorInfo::whereNotNull('email')->count();
        $withNumber = VendorInfo::whereNotNull('number')->count();

        return [
            'total' => $total,
            'city_counts' => $cityCounts,
            'with_email' => $withEmail,
            'with_number' => $withNumber,
        ];
    }

    public function getRecentVendors(int $limit = 10): Collection
    {
        return VendorInfo::orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    public function getCities(): Collection
    {
        return VendorInfo::select('city')
            ->distinct()
            ->orderBy('city', 'asc')
            ->get()
            ->pluck('city');
    }

    private function cleanEmptyStringsForNullableFields(array $data): array
    {
        // Only clean nullable fields - city and vendor_name should not be cleaned
        $nullableFields = ['number', 'email'];

        foreach ($nullableFields as $field) {
            if (isset($data[$field]) && $data[$field] === '') {
                $data[$field] = null;
            }
        }

        return $data;
    }
}
