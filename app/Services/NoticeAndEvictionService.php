<?php

namespace App\Services;

use App\Models\NoticeAndEviction;
use Illuminate\Database\Eloquent\Builder;

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

    /**
     * Apply filters to query builder
     */
    public function applyFilters(Builder $query, array $filters = []): Builder
    {
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

        // Updated tenant_name filter to search in both tenant and other_tenants
        if (isset($filters['tenant_name']) && $filters['tenant_name']) {
            $tenantName = $filters['tenant_name'];
            $query->where(function ($q) use ($tenantName) {
                // Search in main tenant
                $q->whereHas('tenant', function ($subQ) use ($tenantName) {
                    $subQ->where('first_name', 'like', "%{$tenantName}%")
                        ->orWhere('last_name', 'like', "%{$tenantName}%")
                        ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$tenantName}%"]);
                })
                // Also search in other_tenants field
                ->orWhere('other_tenants', 'like', "%{$tenantName}%");
            });
        }

        // Handle general search functionality
        if (isset($filters['search']) && $filters['search']) {
            $searchTerm = $filters['search'];
            $query->where(function ($q) use ($searchTerm) {
                $q->whereHas('tenant', function ($subQ) use ($searchTerm) {
                    $subQ->where('first_name', 'like', "%{$searchTerm}%")
                        ->orWhere('last_name', 'like', "%{$searchTerm}%")
                        ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$searchTerm}%"]);
                })
                    ->orWhereHas('tenant.unit', function ($subQ) use ($searchTerm) {
                        $subQ->where('unit_name', 'like', "%{$searchTerm}%");
                    })
                    ->orWhereHas('tenant.unit.property', function ($subQ) use ($searchTerm) {
                        $subQ->where('property_name', 'like', "%{$searchTerm}%");
                    })
                    ->orWhereHas('tenant.unit.property.city', function ($subQ) use ($searchTerm) {
                        $subQ->where('city', 'like', "%{$searchTerm}%");
                    })
                    ->orWhere('status', 'like', "%{$searchTerm}%")
                    ->orWhere('type_of_notice', 'like', "%{$searchTerm}%")
                    ->orWhere('other_tenants', 'like', "%{$searchTerm}%");
            });
        }

        return $query;
    }

    public function listAll($filters = [])
    {
        $query = NoticeAndEviction::with(['tenant.unit.property.city']);
        return $this->applyFilters($query, $filters)->get();
    }

    public function findById(int $id)
    {
        return NoticeAndEviction::with(['tenant.unit.property.city'])->findOrFail($id);
    }

    /**
     * Get next and previous records based on current filters
     * Returns an array with 'previous' and 'next' record IDs and basic info
     */
    public function getNavigationRecords(int $currentId, array $filters = []): array
    {
        // Build the base query with filters
        $query = NoticeAndEviction::with(['tenant.unit.property.city'])
            ->where('is_archived', false);
        
        $query = $this->applyFilters($query, $filters);
        
        // Get all filtered records ordered by ID (or by date desc, your preference)
        $allRecords = $query->orderBy('id', 'asc')->get(['id']);
        
        // Find the current record position
        $currentPosition = $allRecords->search(function ($record) use ($currentId) {
            return $record->id === $currentId;
        });

        $navigation = [
            'previous' => null,
            'next' => null,
            'total_in_filter' => $allRecords->count(),
            'current_position' => $currentPosition !== false ? $currentPosition + 1 : null,
        ];

        // Get previous record
        if ($currentPosition !== false && $currentPosition > 0) {
            $previousId = $allRecords[$currentPosition - 1]->id;
            $previousRecord = NoticeAndEviction::with(['tenant.unit.property.city'])->find($previousId);
            $navigation['previous'] = [
                'id' => $previousRecord->id,
                'tenant_name' => $previousRecord->tenant ? $previousRecord->tenant->first_name . ' ' . $previousRecord->tenant->last_name : 'N/A',
                'unit_name' => $previousRecord->tenant?->unit?->unit_name ?? 'N/A',
            ];
        }

        // Get next record
        if ($currentPosition !== false && $currentPosition < $allRecords->count() - 1) {
            $nextId = $allRecords[$currentPosition + 1]->id;
            $nextRecord = NoticeAndEviction::with(['tenant.unit.property.city'])->find($nextId);
            $navigation['next'] = [
                'id' => $nextRecord->id,
                'tenant_name' => $nextRecord->tenant ? $nextRecord->tenant->first_name . ' ' . $nextRecord->tenant->last_name : 'N/A',
                'unit_name' => $nextRecord->tenant?->unit?->unit_name ?? 'N/A',
            ];
        }

        return $navigation;
    }
}
