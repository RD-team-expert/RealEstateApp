<?php

namespace App\Services;

use App\Models\PaymentPlan;
use Illuminate\Support\Facades\DB;

class PaymentPlanService
{
    public function getAllPaymentPlans()
    {
        return PaymentPlan::orderBy('created_at', 'desc')->paginate(15);
    }

    public function getPaymentPlan($id)
    {
        return PaymentPlan::findOrFail($id);
    }

    public function createPaymentPlan(array $data)
    {
        return PaymentPlan::create($data);
    }

    public function updatePaymentPlan($id, array $data)
    {
        $paymentPlan = PaymentPlan::findOrFail($id);
        $paymentPlan->update($data);
        return $paymentPlan;
    }

    public function deletePaymentPlan($id)
    {
        $paymentPlan = PaymentPlan::findOrFail($id);
        return $paymentPlan->delete();
    }

    public function getDropdownData()
    {
        return [
            'properties' => DB::table('tenants')
                ->distinct()
                ->pluck('property_name', 'property_name'),
            'units' => DB::table('tenants')
                ->distinct()
                ->pluck('unit_number', 'unit_number'),
            'tenants' => DB::table('tenants')
                ->selectRaw("CONCAT(first_name, ' ', last_name) as full_name")
                ->pluck('full_name', 'full_name')
        ];
    }
}
