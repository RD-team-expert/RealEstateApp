<?php

namespace App\Traits;

use App\Models\{
    Unit, Application, MoveIn, MoveOut, NoticeAndEviction,
    OffersAndRenewal, Payment, PaymentPlan, Tenant, VendorTaskTracker
};

trait DashboardData
{
    public function getUnitData(?string $unit)
    {
        return $unit ? Unit::where('unit_name', $unit)->first() : null;
    }

    public function getApplicationData(?string $unit)
    {
        return $unit ? Application::where('unit', $unit)->first() : null;
    }

    public function getMoveInData(string $unit)
    {
        return $unit ?MoveIn::where('unit_name', $unit)->first(): null;
    }

    public function getMoveOutData(string $unit)
    {
        return $unit ? MoveOut::where('units_name', $unit)->first():null;
    }

    public function getNoticeData(string $unit)
    {
        return $unit ?NoticeAndEviction::where('unit_name', $unit)->first():null;
    }

    public function getOfferData(string $unit)
    {
        return $unit ?OffersAndRenewal::where('unit', $unit)->first():null;
    }

    public function getPaymentData(string $unit)
    {
        return $unit ?Payment::where('unit_name', $unit)->first():null;
    }

    public function getPaymentPlanData(string $unit)
    {
        return $unit ?PaymentPlan::where('unit', $unit)->first():null;
    }

    public function getTenantData(string $unit)
    {
        return $unit ?Tenant::where('unit_number', $unit)->first():null;
    }

    public function getVendorTaskData(string $unit)
    {
        return $unit ?VendorTaskTracker::where('unit_name', $unit)->first():null;
    }
}
