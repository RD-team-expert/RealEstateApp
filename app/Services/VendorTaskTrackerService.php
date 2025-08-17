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

    public function searchTasks(string $search, int $perPage = 15): LengthAwarePaginator
    {
        return VendorTaskTracker::where(function ($query) use ($search) {
                                   $query->where('city', 'like', "%{$search}%")
                                         ->orWhere('vendor_name', 'like', "%{$search}%")
                                         ->orWhere('unit_name', 'like', "%{$search}%")
                                         ->orWhere('assigned_tasks', 'like', "%{$search}%")
                                         ->orWhere('status', 'like', "%{$search}%")
                                         ->orWhere('notes', 'like', "%{$search}%");
                               })
                               ->orderBy('task_submission_date', 'desc')
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
        return $task->delete();
    }

    public function getDropdownData(): array
    {
        // Get units data
        $units = Unit::select('city', 'unit_name')->orderBy('city')->orderBy('unit_name')->get();
        $cities = $units->pluck('city')->unique()->values()->toArray();
        $unitsByCity = $units->groupBy('city')->map(function ($cityUnits) {
            return $cityUnits->pluck('unit_name')->unique()->values()->toArray();
        })->toArray();

        // Get vendors data
        $vendors = VendorInfo::select('vendor_name')->orderBy('vendor_name')->pluck('vendor_name')->toArray();

        return [
            'cities' => $cities,
            'unitsByCity' => $unitsByCity,
            'vendors' => $vendors,
            'units' => $units
        ];
    }
}
