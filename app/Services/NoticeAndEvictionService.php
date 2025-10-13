<?php

namespace App\Services;

use App\Models\NoticeAndEviction;

class NoticeAndEvictionService
{
    public function create(array $data): NoticeAndEviction
    {
        $nev = NoticeAndEviction::create($data);
        $nev->calculateEvictions();
        $nev->save();
        return $nev;
    }

    public function update(NoticeAndEviction $nev, array $data): NoticeAndEviction
    {
        $nev->fill($data);
        $nev->calculateEvictions();
        $nev->save();
        return $nev;
    }

    public function delete(NoticeAndEviction $nev): void
    {
        $nev->archive();
    }

    public function listAll($filters = [])
    {
        $query = NoticeAndEviction::with(['tenant.unit.property.city']);

        // Handle individual filter parameters (ID-based filtering)
        if (isset($filters['city_id']) && $filters['city_id']) {
            $query->whereHas('tenant.unit.property.city', function ($q) use ($filters) {
                $q->where('id', $filters['city_id']);
            });
        }

        if (isset($filters['property_id']) && $filters['property_id']) {
            $query->whereHas('tenant.unit.property', function ($q) use ($filters) {
                $q->where('id', $filters['property_id']);
            });
        }

        if (isset($filters['unit_id']) && $filters['unit_id']) {
            $query->whereHas('tenant.unit', function ($q) use ($filters) {
                $q->where('id', $filters['unit_id']);
            });
        }

        if (isset($filters['tenant_id']) && $filters['tenant_id']) {
            $query->where('tenant_id', $filters['tenant_id']);
        }

        // Handle name-based filter parameters (for partial name searches)
        if (isset($filters['city_name']) && $filters['city_name']) {
            $query->whereHas('tenant.unit.property.city', function ($q) use ($filters) {
                $q->where('city', 'like', '%' . $filters['city_name'] . '%');
            });
        }

        if (isset($filters['property_name']) && $filters['property_name']) {
            $query->whereHas('tenant.unit.property', function ($q) use ($filters) {
                $q->where('property_name', 'like', '%' . $filters['property_name'] . '%');
            });
        }

        if (isset($filters['unit_name']) && $filters['unit_name']) {
            $query->whereHas('tenant.unit', function ($q) use ($filters) {
                $q->where('unit_name', 'like', '%' . $filters['unit_name'] . '%');
            });
        }

        if (isset($filters['tenant_name']) && $filters['tenant_name']) {
            $tenantName = $filters['tenant_name'];
            $query->whereHas('tenant', function ($q) use ($tenantName) {
                $q->where('first_name', 'like', "%{$tenantName}%")
                    ->orWhere('last_name', 'like', "%{$tenantName}%")
                    ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$tenantName}%"]);
            });
        }

        // Handle general search functionality
        if (isset($filters['search']) && $filters['search']) {
            $searchTerm = $filters['search'];
            $query->whereHas('tenant', function ($q) use ($searchTerm) {
                $q->where('first_name', 'like', "%{$searchTerm}%")
                    ->orWhere('last_name', 'like', "%{$searchTerm}%")
                    ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$searchTerm}%"]);
            })
                ->orWhereHas('tenant.unit', function ($q) use ($searchTerm) {
                    $q->where('unit_name', 'like', "%{$searchTerm}%");
                })
                ->orWhereHas('tenant.unit.property', function ($q) use ($searchTerm) {
                    $q->where('property_name', 'like', "%{$searchTerm}%");
                })
                ->orWhereHas('tenant.unit.property.city', function ($q) use ($searchTerm) {
                    $q->where('city', 'like', "%{$searchTerm}%");
                })
                ->orWhere('status', 'like', "%{$searchTerm}%")
                ->orWhere('type_of_notice', 'like', "%{$searchTerm}%");
        }

        return $query->get();
    }

    public function findById(int $id)
    {
        return NoticeAndEviction::with(['tenant.unit.property.city'])->findOrFail($id);
    }
}
