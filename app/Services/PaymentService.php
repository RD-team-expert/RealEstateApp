<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\Unit;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class PaymentService
{
    public function getAllPayments(int $perPage = 15): LengthAwarePaginator
    {
        return Payment::orderBy('date', 'desc')
                     ->orderBy('created_at', 'desc')
                     ->paginate($perPage);
    }

    public function searchPayments(string $search, int $perPage = 15): LengthAwarePaginator
    {
        return Payment::where(function ($query) use ($search) {
                         $query->where('city', 'like', "%{$search}%")
                               ->orWhere('unit_name', 'like', "%{$search}%")
                               ->orWhere('status', 'like', "%{$search}%")
                               ->orWhere('notes', 'like', "%{$search}%");
                     })
                     ->orderBy('date', 'desc')
                     ->paginate($perPage);
    }

    public function createPayment(array $data): Payment
    {
        // Calculate left_to_pay if paid is provided
        if (isset($data['paid']) && $data['paid'] !== null) {
            $data['left_to_pay'] = $data['owes'] - $data['paid'];
        }

        return Payment::create($data);
    }

    public function updatePayment(Payment $payment, array $data): bool
    {
        // Calculate left_to_pay if paid is provided
        if (isset($data['paid']) && $data['paid'] !== null) {
            $data['left_to_pay'] = $data['owes'] - $data['paid'];
        }

        return $payment->update($data);
    }

    public function deletePayment(Payment $payment): bool
    {
        return $payment->delete();
    }

    public function getUnitsForDropdowns(): array
    {
        $units = Unit::select('city', 'unit_name')->orderBy('city')->orderBy('unit_name')->get();

        $cities = $units->pluck('city')->unique()->values()->toArray();
        $unitsByCity = $units->groupBy('city')->map(function ($cityUnits) {
            return $cityUnits->pluck('unit_name')->unique()->values()->toArray();
        })->toArray();

        return [
            'cities' => $cities,
            'unitsByCity' => $unitsByCity,
            'units' => $units
        ];
    }
}
