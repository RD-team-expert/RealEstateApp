<?php

namespace App\Services;

use App\Models\MoveOut;
use App\Models\Tenant;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class MoveOutService
{
    public function getAllMoveOuts(int $perPage = 15): LengthAwarePaginator
    {
        return MoveOut::orderBy('move_out_date', 'desc')
                      ->orderBy('created_at', 'desc')
                      ->paginate($perPage);
    }

    public function searchMoveOuts(string $search, int $perPage = 15): LengthAwarePaginator
    {
        return MoveOut::where(function ($query) use ($search) {
                          $query->where('tenants_name', 'like', "%{$search}%")
                                ->orWhere('units_name', 'like', "%{$search}%")
                                ->orWhere('lease_status', 'like', "%{$search}%")
                                ->orWhere('keys_location', 'like', "%{$search}%")
                                ->orWhere('walkthrough', 'like', "%{$search}%")
                                ->orWhere('repairs', 'like', "%{$search}%")
                                ->orWhere('notes', 'like', "%{$search}%");
                      })
                      ->orderBy('move_out_date', 'desc')
                      ->paginate($perPage);
    }

    public function createMoveOut(array $data): MoveOut
    {
        return MoveOut::create($data);
    }

    public function updateMoveOut(MoveOut $moveOut, array $data): bool
    {
        return $moveOut->update($data);
    }

    public function deleteMoveOut(MoveOut $moveOut): bool
    {
        return $moveOut->delete();
    }

    public function getDropdownData(): array
    {
        // Get tenants with their full names and unit numbers
        $tenants = DB::table('tenants')
            ->select(
                DB::raw("CONCAT(first_name, ' ', last_name) as full_name"),
                'unit_number'
            )
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get();

        $tenantNames = $tenants->pluck('full_name')->unique()->values()->toArray();

        // Group units by tenant names
        $unitsByTenant = $tenants->groupBy('full_name')->map(function ($tenantUnits) {
            return $tenantUnits->pluck('unit_number')->unique()->values()->toArray();
        })->toArray();

        return [
            'tenants' => $tenantNames,
            'unitsByTenant' => $unitsByTenant,
            'tenantsData' => $tenants
        ];
    }
}
