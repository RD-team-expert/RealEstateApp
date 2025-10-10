<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\Unit;
use App\Models\Cities;
use App\Models\PropertyInfoWithoutInsurance;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class PaymentService
{
    public function getAllPayments(int $perPage = 15): LengthAwarePaginator
    {
        return Payment::with(['unit.property.city'])
                     ->orderBy('date', 'desc')
                     ->orderBy('created_at', 'desc')
                     ->paginate($perPage);
    }

    public function searchPayments(string $search, int $perPage = 15): LengthAwarePaginator
    {
        return Payment::with(['unit.property.city'])
                     ->where(function ($query) use ($search) {
                         $query->whereHas('unit.property.city', function ($q) use ($search) {
                             $q->where('city', 'like', "%{$search}%");
                         })
                         ->orWhereHas('unit.property', function ($q) use ($search) {
                             $q->where('property_name', 'like', "%{$search}%");
                         })
                         ->orWhereHas('unit', function ($q) use ($search) {
                             $q->where('unit_name', 'like', "%{$search}%");
                         })
                         ->orWhere('status', 'like', "%{$search}%")
                         ->orWhere('notes', 'like', "%{$search}%");
                     })
                     ->orderBy('date', 'desc')
                     ->paginate($perPage);
    }

    public function createPayment(array $data): Payment
    {
        // Normalize paid: treat null or empty as 0
        if (!array_key_exists('paid', $data) || $data['paid'] === null || $data['paid'] === '') {
            $data['paid'] = 0;
        }

        // Convert unit selection to unit_id if provided as names
        if (isset($data['city']) && isset($data['unit_name']) && !isset($data['unit_id'])) {
            $unit = $this->findUnitByNames($data['city'], $data['property_name'] ?? null, $data['unit_name']);
            if ($unit) {
                $data['unit_id'] = $unit->id;
            }
            // Remove the name fields as they're not stored directly
            unset($data['city'], $data['property_name'], $data['unit_name']);
        }

        // The model's boot method will automatically calculate left_to_pay and status
        return Payment::create($data);
    }

    public function updatePayment(Payment $payment, array $data): bool
    {
        // Normalize paid: treat null or empty as 0 when field is present
        if (array_key_exists('paid', $data) && ($data['paid'] === null || $data['paid'] === '')) {
            $data['paid'] = 0;
        }

        // Convert unit selection to unit_id if provided as names
        if (isset($data['city']) && isset($data['unit_name']) && !isset($data['unit_id'])) {
            $unit = $this->findUnitByNames($data['city'], $data['property_name'] ?? null, $data['unit_name']);
            if ($unit) {
                $data['unit_id'] = $unit->id;
            }
            // Remove the name fields as they're not stored directly
            unset($data['city'], $data['property_name'], $data['unit_name']);
        }

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
        $units = Unit::with(['property.city'])
                    ->select('id', 'property_id', 'unit_name')
                    ->orderBy('unit_name')
                    ->get();

        $cities = [];
        $properties = [];
        $unitsByCity = [];
        $unitsByProperty = [];
        $propertiesByCity = [];
        $unitsData = [];

        foreach ($units as $unit) {
            $cityName = $unit->property && $unit->property->city ? $unit->property->city->city : 'Unknown City';
            $propertyName = $unit->property ? $unit->property->property_name : 'Unknown Property';
            $unitName = $unit->unit_name;

            // Collect unique cities
            if (!in_array($cityName, $cities)) {
                $cities[] = $cityName;
            }

            // Collect unique properties
            if (!in_array($propertyName, $properties)) {
                $properties[] = $propertyName;
            }

            // Group units by city
            if (!isset($unitsByCity[$cityName])) {
                $unitsByCity[$cityName] = [];
            }
            if (!in_array($unitName, $unitsByCity[$cityName])) {
                $unitsByCity[$cityName][] = $unitName;
            }

            // Group units by property
            if (!isset($unitsByProperty[$propertyName])) {
                $unitsByProperty[$propertyName] = [];
            }
            if (!in_array($unitName, $unitsByProperty[$propertyName])) {
                $unitsByProperty[$propertyName][] = $unitName;
            }

            // Group properties by city
            if (!isset($propertiesByCity[$cityName])) {
                $propertiesByCity[$cityName] = [];
            }
            if (!in_array($propertyName, $propertiesByCity[$cityName])) {
                $propertiesByCity[$cityName][] = $propertyName;
            }

            // Store complete unit data with relationships
            $unitsData[] = [
                'id' => $unit->id,
                'unit_name' => $unitName,
                'property_name' => $propertyName,
                'city' => $cityName,
            ];
        }

        return [
            'cities' => $cities,
            'properties' => $properties,
            'unitsByCity' => $unitsByCity,
            'unitsByProperty' => $unitsByProperty,
            'propertiesByCity' => $propertiesByCity,
            'units' => $unitsData
        ];
    }

    /**
     * Get all cities from the database
     */
    public function getAllCities(): array
    {
        return Cities::orderBy('city')->pluck('city')->toArray();
    }

    /**
     * Get all properties from the database
     */
    public function getAllProperties(): array
    {
        return PropertyInfoWithoutInsurance::orderBy('property_name')->pluck('property_name')->toArray();
    }

    /**
     * Find unit by city, property, and unit names
     */
    public function findUnitByNames(?string $cityName, ?string $propertyName, string $unitName): ?Unit
    {
        $query = Unit::with(['property.city'])
                    ->where('unit_name', $unitName);

        if ($cityName) {
            $query->whereHas('property.city', function ($q) use ($cityName) {
                $q->where('city', $cityName);
            });
        }

        if ($propertyName) {
            $query->whereHas('property', function ($q) use ($propertyName) {
                $q->where('property_name', $propertyName);
            });
        }

        return $query->first();
    }

    /**
     * Get unit by ID with relationships
     */
    public function getUnitById(int $unitId): ?Unit
    {
        return Unit::with(['property.city'])->find($unitId);
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

    /**
     * Filter payments by city, property, and unit
     */
    public function filterPayments(?string $city, ?string $property, ?string $unit, int $perPage = 15): LengthAwarePaginator
    {
        $query = Payment::with(['unit.property.city']);

        if ($city) {
            $query->whereHas('unit.property.city', function ($q) use ($city) {
                $q->where('city', 'like', "%{$city}%");
            });
        }

        if ($property) {
            $query->whereHas('unit.property', function ($q) use ($property) {
                $q->where('property_name', 'like', "%{$property}%");
            });
        }

        if ($unit) {
            $query->whereHas('unit', function ($q) use ($unit) {
                $q->where('unit_name', 'like', "%{$unit}%");
            });
        }

        return $query->orderBy('date', 'desc')
                    ->orderBy('created_at', 'desc')
                    ->paginate($perPage);
    }
}
