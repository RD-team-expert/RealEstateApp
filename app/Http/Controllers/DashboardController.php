<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\{
    Unit, Application, MoveIn, MoveOut, NoticeAndEviction,
    OffersAndRenewal, Payment, PaymentPlan, Tenant, VendorTaskTracker
};

class DashboardController extends Controller
{
    public function index(Request $request)
{
    $unit = $request->query('unit');          // e.g. “Unit one”

    $one = fn ($model, $col) =>
        $model::where($col, $unit)->first();  // returns null if none found

    return Inertia::render('Dashboard', [
        'units'        => Unit::pluck('unit_name'),
        'selectedUnit' => $unit,

        // send ONE record per table – or null
        'unitRecord'   => $one(Unit::class,              'unit_name'),
        'application'  => $one(Application::class,       'unit'),
        'moveIn'       => $one(MoveIn::class,            'unit_name'),
        'moveOut'      => $one(MoveOut::class,           'units_name'),
        'notice'       => $one(NoticeAndEviction::class, 'unit_name'),
        'offer'        => $one(OffersAndRenewal::class,  'unit'),
        'payment'      => $one(Payment::class,           'unit_name'),
        'paymentPlan'  => $one(PaymentPlan::class,       'unit'),
        'tenant'       => $one(Tenant::class,            'unit_number'),
        'vendorTask'   => $one(VendorTaskTracker::class, 'unit_name'),
    ]);
}
}

