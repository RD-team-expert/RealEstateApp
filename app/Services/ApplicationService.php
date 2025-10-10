<?php

namespace App\Services;

use App\Models\Application;
use App\Models\Unit;
use App\Models\PropertyInfoWithoutInsurance;
use App\Models\Cities;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class ApplicationService
{
    public function getAllPaginated(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $query = Application::with(['unit.property.city'])
            ->whereHas('unit', function ($unitQuery) {
                $unitQuery->where('is_archived', false);
            });

        // Apply filters using relationships
        if (!empty($filters['city'])) {
            $query->whereHas('unit.property.city', function ($cityQuery) use ($filters) {
                $cityQuery->where('city', 'like', '%' . $filters['city'] . '%');
            });
        }

        if (!empty($filters['property'])) {
            $query->whereHas('unit.property', function ($propertyQuery) use ($filters) {
                $propertyQuery->where('property_name', 'like', '%' . $filters['property'] . '%');
            });
        }

        if (!empty($filters['unit'])) {
            $query->whereHas('unit', function ($unitQuery) use ($filters) {
                $unitQuery->where('unit_name', 'like', '%' . $filters['unit'] . '%');
            });
        }

        if (!empty($filters['name'])) {
            $query->where('name', 'like', '%' . $filters['name'] . '%');
        }

        if (!empty($filters['co_signer'])) {
            $query->where('co_signer', 'like', '%' . $filters['co_signer'] . '%');
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['stage_in_progress'])) {
            $query->where('stage_in_progress', $filters['stage_in_progress']);
        }

        if (!empty($filters['date_from'])) {
            $query->where('date', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->where('date', '<=', $filters['date_to']);
        }

        return $query->orderBy('date', 'desc')->paginate($perPage);
    }

    public function create(array $data): Application
    {
        // Clean empty strings to null for nullable fields only
        $data = $this->cleanEmptyStringsForNullableFields($data);
        return Application::create($data);
    }

    public function findById(int $id): Application
    {
        return Application::with(['unit.property.city'])->findOrFail($id);
    }

    public function update(Application $application, array $data): Application
    {
        // Clean empty strings to null for nullable fields only
        $data = $this->cleanEmptyStringsForNullableFields($data);
        $application->update($data);
        return $application->fresh(['unit.property.city']);
    }

    public function delete(Application $application): bool
    {
        // Use soft delete by archiving instead of hard delete
        return $application->archive();
    }

    public function archive(Application $application): bool
    {
        return $application->archive();
    }

    public function restore(Application $application): bool
    {
        return $application->restore();
    }

    public function getByStatus(string $status): Collection
    {
        return Application::with(['unit.property.city'])
            ->where('status', $status)
            ->orderBy('date', 'desc')
            ->get();
    }

    public function getByStage(string $stage): Collection
    {
        return Application::with(['unit.property.city'])
            ->where('stage_in_progress', $stage)
            ->orderBy('date', 'desc')
            ->get();
    }

    public function getStatistics(): array
    {
        $total = Application::count();
        $statusCounts = Application::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $stageCounts = Application::selectRaw('stage_in_progress, COUNT(*) as count')
            ->groupBy('stage_in_progress')
            ->pluck('count', 'stage_in_progress')
            ->toArray();

        return [
            'total' => $total,
            'status_counts' => $statusCounts,
            'stage_counts' => $stageCounts,
        ];
    }

    public function getRecentApplications(int $limit = 10): Collection
    {
        return Application::with(['unit.property.city'])
            ->orderBy('date', 'desc')
            ->limit($limit)
            ->get();
    }

    public function getApplicationsThisMonth(): Collection
    {
        return Application::with(['unit.property.city'])
            ->whereMonth('date', now()->month)
            ->whereYear('date', now()->year)
            ->orderBy('date', 'desc')
            ->get();
    }

    private function cleanEmptyStringsForNullableFields(array $data): array
    {
        // Only clean nullable fields - unit_id, name, co_signer should not be cleaned
        $nullableFields = ['status', 'stage_in_progress', 'notes'];

        foreach ($nullableFields as $field) {
            if (isset($data[$field]) && $data[$field] === '') {
                $data[$field] = null;
            }
        }

        return $data;
    }
}
