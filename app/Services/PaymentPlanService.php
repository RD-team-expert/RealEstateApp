<?php

namespace App\Services;

use App\Models\PaymentPlan;
use App\Models\Tenant;
use App\Models\Unit;
use App\Models\PropertyInfoWithoutInsurance;
use App\Models\Cities;
use Illuminate\Support\Facades\DB;

class PaymentPlanService
{
    public function getAllPaymentPlans()
    {
        return PaymentPlan::with(['tenant.unit.property.city'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);
    }

    public function searchPaymentPlans(string $search)
    {
        return PaymentPlan::with(['tenant.unit.property.city'])
            ->where(function ($query) use ($search) {
                $query->where('notes', 'like', "%{$search}%")
                      ->orWhere('amount', 'like', "%{$search}%")
                      ->orWhere('paid', 'like', "%{$search}%")
                      ->orWhere('dates', 'like', "%{$search}%")
                      ->orWhereHas('tenant', function ($tenantQuery) use ($search) {
                          $tenantQuery->whereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$search}%"])
                                     ->orWhereHas('unit', function ($unitQuery) use ($search) {
                                         $unitQuery->where('unit_name', 'like', "%{$search}%")
                                                  ->orWhereHas('property', function ($propertyQuery) use ($search) {
                                                      $propertyQuery->where('property_name', 'like', "%{$search}%")
                                                                   ->orWhereHas('city', function ($cityQuery) use ($search) {
                                                                       $cityQuery->where('city', 'like', "%{$search}%");
                                                                   });
                                                  });
                                     });
                      });
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15);
    }

    /**
     * Filter payment plans by ID-based filters for city, property, unit, and tenant.
     */
    public function filterPaymentPlansByIds($cityId = null, $propertyId = null, $unitId = null, $tenantId = null)
    {
        $query = PaymentPlan::with(['tenant.unit.property.city']);

        // Apply tenant filter directly on payment_plans table
        if (!empty($tenantId)) {
            $query->where('tenant_id', $tenantId);
        }

        // Apply nested relationship filters
        if (!empty($unitId)) {
            $query->whereHas('tenant.unit', function ($q) use ($unitId) {
                $q->where('id', $unitId);
            });
        }

        if (!empty($propertyId)) {
            $query->whereHas('tenant.unit.property', function ($q) use ($propertyId) {
                $q->where('id', $propertyId);
            });
        }

        if (!empty($cityId)) {
            $query->whereHas('tenant.unit.property.city', function ($q) use ($cityId) {
                $q->where('id', $cityId);
            });
        }

        return $query->orderBy('created_at', 'desc')->paginate(15);
    }

    public function getPaymentPlan($id)
    {
        return PaymentPlan::with(['tenant.unit.property.city'])->findOrFail($id);
    }

    public function createPaymentPlan(array $data)
    {
        // If tenant_id is provided, use it directly
        if (isset($data['tenant_id'])) {
            return PaymentPlan::create($data);
        }

        // If tenant name is provided, find the tenant_id
        if (isset($data['tenant_name'])) {
            $tenant = $this->findTenantByName($data['tenant_name']);
            if ($tenant) {
                $data['tenant_id'] = $tenant->id;
                unset($data['tenant_name']);
                return PaymentPlan::create($data);
            }
        }

        return PaymentPlan::create($data);
    }

    public function updatePaymentPlan($id, array $data)
    {
        $paymentPlan = PaymentPlan::findOrFail($id);
        
        // If tenant name is provided, find the tenant_id
        if (isset($data['tenant_name'])) {
            $tenant = $this->findTenantByName($data['tenant_name']);
            if ($tenant) {
                $data['tenant_id'] = $tenant->id;
                unset($data['tenant_name']);
            }
        }

        $paymentPlan->update($data);
        return $paymentPlan;
    }

    public function deletePaymentPlan($id)
    {
        $paymentPlan = PaymentPlan::findOrFail($id);
        return $paymentPlan->archive();
    }

    public function getDropdownData()
    {
        // Get cities
        $cities = Cities::orderBy('city')->get();
        
        // Get properties with city relationships
        $properties = PropertyInfoWithoutInsurance::with('city')
                     ->orderBy('property_name')
                     ->get();
        
        // Get units with their relationships for dropdowns
        $units = Unit::with(['property.city'])
                    ->orderBy('unit_name')
                    ->get();

        // Create ID-keyed lookup maps for cascading
        $propertiesByCityId = $properties->groupBy('city_id')->map(function ($cityProperties) {
            return $cityProperties->map(function ($property) {
                return [
                    'id' => $property->id,
                    'property_name' => $property->property_name,
                    'city_id' => $property->city_id,
                    'created_at' => $property->created_at,
                    'updated_at' => $property->updated_at
                ];
            })->values();
        });

        $unitsByPropertyId = $units->groupBy('property_id')->map(function ($propertyUnits) {
            return $propertyUnits->map(function ($unit) {
                return [
                    'id' => $unit->id,
                    'unit_name' => $unit->unit_name
                ];
            })->values();
        });

        // Get tenants with their relationships
        $tenants = Tenant::with(['unit.property.city'])
                         ->orderBy('first_name')
                         ->orderBy('last_name')
                         ->get();

        // Group tenants by unit ID
        $tenantsByUnitId = $tenants->groupBy('unit_id')->map(function ($unitTenants) {
            return $unitTenants->map(function ($tenant) {
                return [
                    'id' => $tenant->id,
                    'full_name' => $tenant->full_name,
                    'tenant_id' => $tenant->id
                ];
            })->values();
        });

        // Get all units with their complete information for edit drawer
        $allUnits = $units->map(function ($unit) {
            return [
                'id' => $unit->id,
                'unit_name' => $unit->unit_name,
                'property_name' => $unit->property ? $unit->property->property_name : null,
                'city_name' => $unit->property && $unit->property->city ? $unit->property->city->city : null
            ];
        });

        // Format tenants data for frontend with ID-based mapping
        $tenantsData = $tenants->map(function ($tenant) {
            return [
                'id' => $tenant->id,
                'full_name' => $tenant->full_name,
                'unit_name' => $tenant->unit ? $tenant->unit->unit_name : null,
                'property_name' => $tenant->unit && $tenant->unit->property ? $tenant->unit->property->property_name : null,
                'city_name' => $tenant->unit && $tenant->unit->property && $tenant->unit->property->city ? $tenant->unit->property->city->city : null
            ];
        });

        return [
            'cities' => $cities,
            'properties' => $properties->map(function ($property) {
                return [
                    'id' => $property->id,
                    'property_name' => $property->property_name,
                    'city_id' => $property->city_id,
                    'created_at' => $property->created_at,
                    'updated_at' => $property->updated_at
                ];
            }),
            'propertiesByCityId' => $propertiesByCityId,
            'unitsByPropertyId' => $unitsByPropertyId,
            'tenantsByUnitId' => $tenantsByUnitId,
            'allUnits' => $allUnits,
            'tenantsData' => $tenantsData->map(function ($tenant) {
                return [
                    'id' => $tenant['id'],
                    'full_name' => $tenant['full_name'],
                    'tenant_id' => $tenant['id'],
                    'unit_name' => $tenant['unit_name'],
                    'property_name' => $tenant['property_name'],
                    'city_name' => $tenant['city_name']
                ];
            })
        ];
    }

    private function findTenantByName(string $tenantName)
    {
        return Tenant::whereRaw("CONCAT(first_name, ' ', last_name) = ?", [$tenantName])->first();
    }

    public function getTenantsForDropdown()
    {
        return Tenant::with(['unit.property.city'])
            ->get()
            ->map(function ($tenant) {
                return [
                    'id' => $tenant->id,
                    'label' => $tenant->full_name . 
                        ($tenant->unit ? ' - ' . $tenant->unit->unit_name : '') .
                        ($tenant->unit && $tenant->unit->property ? ' (' . $tenant->unit->property->property_name . ')' : ''),
                    'unit_id' => $tenant->unit_id,
                    'unit_name' => $tenant->unit ? $tenant->unit->unit_name : null,
                    'property_name' => $tenant->unit && $tenant->unit->property ? $tenant->unit->property->property_name : null,
                    'city_name' => $tenant->unit && $tenant->unit->property && $tenant->unit->property->city ? $tenant->unit->property->city->city : null
                ];
            })
            ->values()
            ->toArray();
    }
}
