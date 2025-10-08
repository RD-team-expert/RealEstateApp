<?php
// app/Services/UnitService.php

namespace App\Services;

use App\Models\Unit;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class UnitService
{
    public function getAllPaginated(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $query = Unit::query()->with(['property.city']);

        // Apply filters with relationship joins
        if (!empty($filters['city'])) {
            $query->whereHas('property.city', function ($q) use ($filters) {
                $q->where('city', 'like', '%' . $filters['city'] . '%');
            });
        }

        if (!empty($filters['property'])) {
            $query->whereHas('property', function ($q) use ($filters) {
                $q->where('property_name', 'like', '%' . $filters['property'] . '%');
            });
        }

        if (!empty($filters['unit_name'])) {
            $query->where('unit_name', 'like', '%' . $filters['unit_name'] . '%');
        }

        if (!empty($filters['vacant'])) {
            $query->where('vacant', $filters['vacant']);
        }

        if (!empty($filters['listed'])) {
            $query->where('listed', $filters['listed']);
        }

        if (!empty($filters['insurance'])) {
            $query->where('insurance', $filters['insurance']);
        }

        return $query->orderBy('property_id')
                    ->orderBy('unit_name')
                    ->paginate($perPage)
                    ->appends(request()->query());
    }

    public function create(array $data): Unit
    {
        // Clean empty strings to null for nullable fields
        $data = $this->cleanEmptyStringsForNullableFields($data);
        return Unit::create($data);
    }

    public function findById(int $id): Unit
    {
        return Unit::with(['property.city'])->findOrFail($id);
    }

    public function update(Unit $unit, array $data): Unit
    {
        // Clean empty strings to null for nullable fields
        $data = $this->cleanEmptyStringsForNullableFields($data);
        $unit->update($data);
        return $unit->fresh(['property.city']);
    }

    public function delete(Unit $unit): bool
    {
        return $unit->archive();
    }

    public function getStatistics(): array
    {
        $total = Unit::count();
        $vacant = Unit::where('vacant', 'Yes')->count();
        $occupied = Unit::where('vacant', 'No')->count();
        $listed = Unit::where('listed', 'Yes')->count();
        $totalApplications = Unit::sum('total_applications');

        $cityStats = Unit::with(['property.city'])
            ->get()
            ->groupBy('property.city.city')
            ->map(function ($units) {
                return $units->count();
            })
            ->sortDesc()
            ->toArray();

        return [
            'total' => $total,
            'vacant' => $vacant,
            'occupied' => $occupied,
            'listed' => $listed,
            'total_applications' => $totalApplications,
            'city_stats' => $cityStats,
        ];
    }

    public function getVacantUnits(): Collection
    {
        return Unit::with(['property.city'])
            ->where('vacant', 'Yes')
            ->orderBy('property_id')
            ->orderBy('unit_name')
            ->get();
    }

    public function getListedUnits(): Collection
    {
        return Unit::with(['property.city'])
            ->where('listed', 'Yes')
            ->orderBy('property_id')
            ->orderBy('unit_name')
            ->get();
    }

    private function cleanEmptyStringsForNullableFields(array $data): array
    {
        $nullableFields = [
            'tenants', 'lease_start', 'lease_end', 'count_beds', 'count_baths',
            'lease_status', 'monthly_rent', 'recurring_transaction', 'utility_status',
            'account_number', 'insurance', 'insurance_expiration_date'
        ];

        foreach ($nullableFields as $field) {
            if (isset($data[$field]) && $data[$field] === '') {
                $data[$field] = null;
            }
        }

        return $data;
    }
}
