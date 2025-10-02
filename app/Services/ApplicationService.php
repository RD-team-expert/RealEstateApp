<?php
// app/Services/ApplicationService.php

namespace App\Services;

use App\Models\Application;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class ApplicationService
{
    public function getAllPaginated(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $query = Application::query()->notArchived(); // Only get non-archived records

        // Apply filters

        if (!empty($filters['city'])) {
        $query->where('city', 'like', '%' . $filters['city'] . '%');
        }
        if (!empty($filters['property'])) {
            $query->where('property', 'like', '%' . $filters['property'] . '%');
        }

        if (!empty($filters['name'])) {
            $query->where('name', 'like', '%' . $filters['name'] . '%');
        }

        if (!empty($filters['co_signer'])) {
            $query->where('co_signer', 'like', '%' . $filters['co_signer'] . '%');
        }

        if (!empty($filters['unit'])) {
            $query->where('unit', 'like', '%' . $filters['unit'] . '%');
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
        return Application::notArchived()->findOrFail($id);
    }

    public function update(Application $application, array $data): Application
    {
        // Clean empty strings to null for nullable fields only
        $data = $this->cleanEmptyStringsForNullableFields($data);
        $application->update($data);
        return $application->fresh();
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
        return Application::notArchived()
            ->where('status', $status)
            ->orderBy('date', 'desc')
            ->get();
    }

    public function getByStage(string $stage): Collection
    {
        return Application::notArchived()
            ->where('stage_in_progress', $stage)
            ->orderBy('date', 'desc')
            ->get();
    }

    public function getStatistics(): array
    {
        $total = Application::notArchived()->count();
        $statusCounts = Application::notArchived()
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $stageCounts = Application::notArchived()
            ->selectRaw('stage_in_progress, COUNT(*) as count')
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
        return Application::notArchived()
            ->orderBy('date', 'desc')
            ->limit($limit)
            ->get();
    }

    public function getApplicationsThisMonth(): Collection
    {
        return Application::notArchived()
            ->whereMonth('date', now()->month)
            ->whereYear('date', now()->year)
            ->orderBy('date', 'desc')
            ->get();
    }

    private function cleanEmptyStringsForNullableFields(array $data): array
    {
        // Only clean nullable fields - property, name, co_signer, unit should not be cleaned
        $nullableFields = ['status', 'stage_in_progress', 'notes'];

        foreach ($nullableFields as $field) {
            if (isset($data[$field]) && $data[$field] === '') {
                $data[$field] = null;
            }
        }

        return $data;
    }
}
