<?php

namespace App\Services;

use App\Models\VendorTaskTracker;
use App\Models\Unit;
use App\Models\VendorInfo;
use Illuminate\Pagination\LengthAwarePaginator;

class VendorTaskTrackerService
{
    public function getAllTasks(int $perPage = 15): LengthAwarePaginator
    {
        return VendorTaskTracker::orderBy('task_submission_date', 'desc')
                               ->orderBy('created_at', 'desc')
                               ->paginate($perPage);
    }

    public function filterTasks(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = VendorTaskTracker::query();

        // Apply city filter
        if (!empty($filters['city'])) {
            $query->where('city', 'like', "%{$filters['city']}%");
        }

        // Apply property filter - need to join with units to get property info
        if (!empty($filters['property'])) {
            $query->whereIn('unit_name', function ($subQuery) use ($filters) {
                $subQuery->select('unit_name')
                    ->from('units')
                    ->where('property', 'like', "%{$filters['property']}%");
            });
        }

        // Apply unit name filter
        if (!empty($filters['unit_name'])) {
            $query->where('unit_name', 'like', "%{$filters['unit_name']}%");
        }

        // Apply general search filter
        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('city', 'like', "%{$filters['search']}%")
                  ->orWhere('vendor_name', 'like', "%{$filters['search']}%")
                  ->orWhere('unit_name', 'like', "%{$filters['search']}%")
                  ->orWhere('assigned_tasks', 'like', "%{$filters['search']}%")
                  ->orWhere('status', 'like', "%{$filters['search']}%")
                  ->orWhere('notes', 'like', "%{$filters['search']}%");
            });
        }

        return $query->orderBy('task_submission_date', 'desc')
                     ->orderBy('created_at', 'desc')
                     ->paginate($perPage);
    }

    public function createTask(array $data): VendorTaskTracker
    {
        return VendorTaskTracker::create($data);
    }

    public function updateTask(VendorTaskTracker $task, array $data): bool
    {
        return $task->update($data);
    }

    public function deleteTask(VendorTaskTracker $task): bool
    {
        return $task->archive();
    }

    public function archiveTask(VendorTaskTracker $task): bool
    {
        return $task->archive();
    }

    public function restoreTask(VendorTaskTracker $task): bool
    {
        return $task->restore();
    }

    public function getArchivedTasks(int $perPage = 15): LengthAwarePaginator
    {
        return VendorTaskTracker::onlyArchived()
                               ->orderBy('task_submission_date', 'desc')
                               ->orderBy('created_at', 'desc')
                               ->paginate($perPage);
    }

    public function getAllTasksWithArchived(int $perPage = 15): LengthAwarePaginator
    {
        return VendorTaskTracker::withArchived()
                               ->orderBy('task_submission_date', 'desc')
                               ->orderBy('created_at', 'desc')
                               ->paginate($perPage);
    }

    public function getDropdownData(): array
    {
        // Get cities from units
        $cities = Unit::select('city')->distinct()->orderBy('city')->pluck('city')->toArray();
        
        // Get properties by city
        $propertiesByCity = Unit::select('city', 'property')
            ->distinct()
            ->orderBy('city')
            ->orderBy('property')
            ->get()
            ->groupBy('city')
            ->map(function ($cityUnits) {
                return $cityUnits->pluck('property')->unique()->values()->toArray();
            })
            ->toArray();

        // Get units by property (nested by city)
        $unitsByProperty = Unit::select('city', 'property', 'unit_name')
            ->orderBy('city')
            ->orderBy('property')
            ->orderBy('unit_name')
            ->get()
            ->groupBy('city')
            ->map(function ($cityUnits) {
                return $cityUnits->groupBy('property')->map(function ($propertyUnits) {
                    return $propertyUnits->pluck('unit_name')->unique()->values()->toArray();
                })->toArray();
            })
            ->toArray();

        // Get vendors by city
        $vendorsByCity = VendorInfo::select('city', 'vendor_name')
            ->orderBy('city')
            ->orderBy('vendor_name')
            ->get()
            ->groupBy('city')
            ->map(function ($cityVendors) {
                return $cityVendors->pluck('vendor_name')->unique()->values()->toArray();
            })
            ->toArray();

        // Get all units for backward compatibility
        $units = Unit::select('city', 'unit_name')->orderBy('city')->orderBy('unit_name')->get();
        
        // Get all vendors for backward compatibility
        $vendors = VendorInfo::select('vendor_name')->orderBy('vendor_name')->pluck('vendor_name')->toArray();

        return [
            'cities' => $cities,
            'propertiesByCity' => $propertiesByCity,
            'unitsByProperty' => $unitsByProperty,
            'vendorsByCity' => $vendorsByCity,
            'units' => $units, // Keep for backward compatibility
            'vendors' => $vendors, // Keep for backward compatibility
            'unitsByCity' => $units->groupBy('city')->map(function ($cityUnits) {
                return $cityUnits->pluck('unit_name')->unique()->values()->toArray();
            })->toArray(), // Keep for backward compatibility
        ];
    }
}
