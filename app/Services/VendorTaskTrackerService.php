<?php

namespace App\Services;

use App\Models\VendorTaskTracker;
use App\Models\Unit;
use App\Models\VendorInfo;
use App\Models\Cities;
use App\Models\PropertyInfoWithoutInsurance;
use Illuminate\Database\Eloquent\Collection;

class VendorTaskTrackerService
{
    public function getAllTasks(): Collection
    {
        return VendorTaskTracker::with(['vendor.city', 'unit.property'])
                               ->orderBy('task_submission_date', 'desc')
                               ->orderBy('created_at', 'desc')
                               ->get();
    }

    public function getAllTasksExcludingCompleted(): Collection
    {
        return VendorTaskTracker::with(['vendor.city', 'unit.property'])
                               ->where('status', '!=', 'Completed')
                               ->orderBy('task_submission_date', 'desc')
                               ->orderBy('created_at', 'desc')
                               ->get();
    }

    public function filterTasks(array $filters): Collection
    {
        $query = VendorTaskTracker::with(['vendor.city', 'unit.property.city']);

        // Apply status filter
        if (!empty($filters['status'])) {
            if ($filters['status'] === 'exclude_completed') {
                $query->where('status', '!=', 'Completed');
            } elseif ($filters['status'] !== 'all') {
                // Filter by specific status
                $query->where('status', $filters['status']);
            }
            // If 'all', don't apply any status filter
        } else {
            // Default: exclude completed
            $query->where('status', '!=', 'Completed');
        }

        // Apply city filter through unit->property->city relationship
        if (!empty($filters['city'])) {
            $query->whereHas('unit.property.city', function ($q) use ($filters) {
                $q->where('city', 'like', "%{$filters['city']}%");
            });
        }

        // Apply property filter through unit->property relationship
        if (!empty($filters['property'])) {
            $query->whereHas('unit.property', function ($q) use ($filters) {
                $q->where('property_name', 'like', "%{$filters['property']}%");
            });
        }

        // Apply unit name filter through unit relationship
        if (!empty($filters['unit_name'])) {
            $query->whereHas('unit', function ($q) use ($filters) {
                $q->where('unit_name', 'like', "%{$filters['unit_name']}%");
            });
        }

        // Apply vendor name filter through vendor relationship
        if (!empty($filters['vendor_name'])) {
            $query->whereHas('vendor', function ($q) use ($filters) {
                $q->where('vendor_name', 'like', "%{$filters['vendor_name']}%");
            });
        }

        // Apply general search filter across multiple relationships
        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->whereHas('unit.property.city', function ($subQ) use ($filters) {
                    $subQ->where('city', 'like', "%{$filters['search']}%");
                })
                ->orWhereHas('unit.property', function ($subQ) use ($filters) {
                    $subQ->where('property_name', 'like', "%{$filters['search']}%");
                })
                ->orWhereHas('vendor', function ($subQ) use ($filters) {
                    $subQ->where('vendor_name', 'like', "%{$filters['search']}%");
                })
                ->orWhereHas('unit', function ($subQ) use ($filters) {
                    $subQ->where('unit_name', 'like', "%{$filters['search']}%");
                })
                ->orWhere('assigned_tasks', 'like', "%{$filters['search']}%")
                ->orWhere('status', 'like', "%{$filters['search']}%")
                ->orWhere('notes', 'like', "%{$filters['search']}%");
            });
        }

        return $query->orderBy('task_submission_date', 'desc')
                     ->orderBy('created_at', 'desc')
                     ->get();
    }

    public function createTask(array $data): VendorTaskTracker
    {
        // Convert names to IDs if provided
        $data = $this->convertNamesToIds($data);
        return VendorTaskTracker::create($data);
    }

    public function updateTask(VendorTaskTracker $task, array $data): bool
    {
        // Convert names to IDs if provided
        $data = $this->convertNamesToIds($data);
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

    public function getArchivedTasks(): Collection
    {
        return VendorTaskTracker::onlyArchived()
                               ->with(['vendor.city', 'unit.property'])
                               ->orderBy('task_submission_date', 'desc')
                               ->orderBy('created_at', 'desc')
                               ->get();
    }

    public function getAllTasksWithArchived(): Collection
    {
        return VendorTaskTracker::withArchived()
                               ->with(['vendor.city', 'unit.property'])
                               ->orderBy('task_submission_date', 'desc')
                               ->orderBy('created_at', 'desc')
                               ->get();
    }

    public function getDropdownData(): array
    {
        // Get cities with IDs
        $cities = Cities::select('id', 'city')->orderBy('city')->get();
        
        // Get properties with city information
        $properties = PropertyInfoWithoutInsurance::with('city')
            ->select('id', 'property_name', 'city_id')
            ->orderBy('property_name')
            ->get();

        // Get units with property and city information
        $units = Unit::with(['property.city'])
            ->select('id', 'unit_name', 'property_id')
            ->orderBy('unit_name')
            ->get();

        // Get vendors with city information
        $vendors = VendorInfo::with('city')
            ->select('id', 'vendor_name', 'city_id')
            ->orderBy('vendor_name')
            ->get();

        // Group properties by city
        $propertiesByCity = [];
        foreach ($properties as $property) {
            if ($property->city) {
                $cityName = $property->city->city;
                if (!isset($propertiesByCity[$cityName])) {
                    $propertiesByCity[$cityName] = [];
                }
                $propertiesByCity[$cityName][] = [
                    'id' => $property->id,
                    'property_name' => $property->property_name
                ];
            }
        }

        // Group units by property (nested by city)
        $unitsByProperty = [];
        foreach ($units as $unit) {
            if ($unit->property && $unit->property->city) {
                $cityName = $unit->property->city->city;
                $propertyName = $unit->property->property_name;
                
                if (!isset($unitsByProperty[$cityName])) {
                    $unitsByProperty[$cityName] = [];
                }
                if (!isset($unitsByProperty[$cityName][$propertyName])) {
                    $unitsByProperty[$cityName][$propertyName] = [];
                }
                
                $unitsByProperty[$cityName][$propertyName][] = [
                    'id' => $unit->id,
                    'unit_name' => $unit->unit_name
                ];
            }
        }

        // Group units by city for backward compatibility
        $unitsByCity = [];
        foreach ($units as $unit) {
            if ($unit->property && $unit->property->city) {
                $cityName = $unit->property->city->city;
                if (!isset($unitsByCity[$cityName])) {
                    $unitsByCity[$cityName] = [];
                }
                $unitsByCity[$cityName][] = [
                    'id' => $unit->id,
                    'unit_name' => $unit->unit_name
                ];
            }
        }

        // Group vendors by city (kept for backward compatibility but not used in dropdowns)
        $vendorsByCity = [];
        foreach ($vendors as $vendor) {
            if ($vendor->city) {
                $cityName = $vendor->city->city;
                if (!isset($vendorsByCity[$cityName])) {
                    $vendorsByCity[$cityName] = [];
                }
                $vendorsByCity[$cityName][] = [
                    'id' => $vendor->id,
                    'vendor_name' => $vendor->vendor_name
                ];
            }
        }

        return [
            'cities' => $cities->map(function ($city) {
                return [
                    'id' => $city->id,
                    'city' => $city->city
                ];
            })->toArray(),
            'properties' => $properties->map(function ($property) {
                return [
                    'id' => $property->id,
                    'property_name' => $property->property_name,
                    'city' => $property->city ? $property->city->city : null
                ];
            })->toArray(),
            'units' => $units->map(function ($unit) {
                return [
                    'id' => $unit->id,
                    'unit_name' => $unit->unit_name,
                    'property_name' => $unit->property ? $unit->property->property_name : null,
                    'city' => $unit->property && $unit->property->city ? $unit->property->city->city : null
                ];
            })->toArray(),
            'vendors' => $vendors->map(function ($vendor) {
                return [
                    'id' => $vendor->id,
                    'vendor_name' => $vendor->vendor_name,
                    'city' => $vendor->city ? $vendor->city->city : null
                ];
            })->toArray(),
            'propertiesByCity' => $propertiesByCity,
            'unitsByProperty' => $unitsByProperty,
            'unitsByCity' => $unitsByCity,
            'vendorsByCity' => $vendorsByCity,
        ];
    }

    /**
     * Convert names to IDs for database storage
     */
    private function convertNamesToIds(array $data): array
    {
        // Convert vendor_name to vendor_id
        if (isset($data['vendor_name']) && !isset($data['vendor_id'])) {
            $vendor = VendorInfo::where('vendor_name', $data['vendor_name'])->first();
            if ($vendor) {
                $data['vendor_id'] = $vendor->id;
            }
            unset($data['vendor_name']);
        }

        // Convert unit_name to unit_id (with optional city context)
        if (isset($data['unit_name']) && !isset($data['unit_id'])) {
            $unitQuery = Unit::where('unit_name', $data['unit_name']);
            
            // If city is provided, filter by city through property relationship
            if (isset($data['city'])) {
                $unitQuery->whereHas('property.city', function ($q) use ($data) {
                    $q->where('city', $data['city']);
                });
            }
            
            $unit = $unitQuery->first();
            if ($unit) {
                $data['unit_id'] = $unit->id;
            }
            unset($data['unit_name']);
        }

        // Remove city and property_name as they are accessible through relationships
        unset($data['city'], $data['property_name']);

        return $data;
    }

    /**
     * Get task with enriched data for display
     */
    public function getTaskWithNames(int $taskId): ?VendorTaskTracker
    {
        return VendorTaskTracker::with(['vendor.city', 'unit.property.city'])->find($taskId);
    }

    /**
     * Get tasks for export with all related data
     */
    public function getTasksForExport(): array
    {
        return VendorTaskTracker::with(['vendor.city', 'unit.property.city'])
            ->get()
            ->map(function ($task) {
                return [
                    'id' => $task->id,
                    'city' => $task->unit?->property?->city?->city ?? '',
                    'property_name' => $task->unit?->property?->property_name ?? '',
                    'unit_name' => $task->unit?->unit_name ?? '',
                    'vendor_name' => $task->vendor?->vendor_name ?? '',
                    'task_submission_date' => $task->task_submission_date,
                    'assigned_tasks' => $task->assigned_tasks,
                    'any_scheduled_visits' => $task->any_scheduled_visits,
                    'task_ending_date' => $task->task_ending_date,
                    'notes' => $task->notes,
                    'status' => $task->status,
                    'urgent' => $task->urgent,
                ];
            })
            ->toArray();
    }
}
