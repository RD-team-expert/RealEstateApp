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
                               ->orWhere('property_name', 'like', "%{$search}%")
                               ->orWhere('unit_name', 'like', "%{$search}%")
                               ->orWhere('status', 'like', "%{$search}%")
                               ->orWhere('notes', 'like', "%{$search}%");
                     })
                     ->orderBy('date', 'desc')
                     ->paginate($perPage);
    }

    public function createPayment(array $data): Payment
    {
        // The model's boot method will automatically calculate left_to_pay and status
        return Payment::create($data);
    }

    public function updatePayment(Payment $payment, array $data): bool
    {
        // The model's boot method will automatically recalculate left_to_pay and status
        return $payment->update($data);
    }

    public function deletePayment(Payment $payment): bool
    {
        return $payment->archive();
    }

    /**
     * Archive a payment (soft delete)
     */
    public function archivePayment(Payment $payment): bool
    {
        return $payment->archive();
    }

    /**
     * Restore an archived payment
     */
    public function restorePayment(Payment $payment): bool
    {
        return $payment->restore();
    }

    public function getUnitsForDropdowns(): array
    {
        $units = Unit::select('city', 'property', 'unit_name')->orderBy('city')->orderBy('property')->orderBy('unit_name')->get();

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

    /**
     * Get all cities from the database
     */
    public function getAllCities(): array
    {
        return \App\Models\Cities::orderBy('city')->pluck('city')->toArray();
    }

    /**
     * Get all properties from the database
     */
    public function getAllProperties(): array
    {
        return \App\Models\PropertyInfoWithoutInsurance::orderBy('property_name')->pluck('property_name')->toArray();
    }

    /**
     * Update all payment statuses based on current left_to_pay values
     */
    public function updateAllStatuses(): void
    {
        // Only update non-archived payments
        $payments = Payment::all();
        
        foreach ($payments as $payment) {
            $newStatus = $payment->calculateStatus();
            
            // Only update if status has changed to avoid unnecessary database writes
            if ($payment->status !== $newStatus) {
                $payment->status = $newStatus;
                $payment->save();
            }
        }
    }

    /**
     * Get payment statistics
     */
    public function getStatistics(): array
    {
        // Statistics only for non-archived payments due to global scope
        $total = Payment::count();
        $paid = Payment::where('status', 'Paid')->count();
        $didntPay = Payment::where('status', 'Didn\'t Pay')->count();
        $paidPartly = Payment::where('status', 'Paid Partly')->count();

        return [
            'total' => $total,
            'paid' => $paid,
            'didnt_pay' => $didntPay,
            'paid_partly' => $paidPartly,
        ];
    }
}
