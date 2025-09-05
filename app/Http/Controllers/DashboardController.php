<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Unit;
use App\Traits\DashboardData;

class DashboardController extends Controller
{
    use DashboardData;

    public function index(Request $request)
    {
        $unit = $request->query('unit');

        // Handle null unit parameter
        if (!$unit) {
            // Option 1: Use first available unit as default
            $unit = Unit::pluck('unit_name')->first();

            // Option 2: Or redirect to first unit
            // return redirect()->route('dashboard', ['unit' => Unit::pluck('unit_name')->first()]);
        }

        return Inertia::render('Dashboard', [
            'units'        => Unit::pluck('unit_name'),
            'selectedUnit' => $unit,

            'unitRecord'   => $unit ? $this->getUnitData($unit) : null,
            'application'  => $unit ? $this->getApplicationData($unit) : null,
            'moveIn'       => $unit ? $this->getMoveInData($unit) : null,
            'moveOut'      => $unit ? $this->getMoveOutData($unit) : null,
            'notice'       => $unit ? $this->getNoticeData($unit) : null,
            'offer'        => $unit ? $this->getOfferData($unit) : null,
            'payment'      => $unit ? $this->getPaymentData($unit) : null,
            'paymentPlan'  => $unit ? $this->getPaymentPlanData($unit) : null,
            'tenant'       => $unit ? $this->getTenantData($unit) : null,
            'vendorTask'   => $unit ? $this->getVendorTaskData($unit) : null,
        ]);
    }
}
