<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PropertyInfoController;
use App\Http\Controllers\PropertyInfoWithoutInsuranceController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\VendorInfoController;
use App\Http\Controllers\TenantController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\VendorTaskTrackerController;
use App\Http\Controllers\MoveInController;
use App\Http\Controllers\MoveOutController;
use App\Http\Controllers\NoticeController;
use App\Http\Controllers\OffersAndRenewalController;
use App\Http\Controllers\NoticeAndEvictionController;
use App\Http\Controllers\CityController;
use App\Http\Controllers\PaymentPlanController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\DashboardController;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()-> Route('login');
})->name('home');

Route::middleware(['auth'])->group(function () {

    Route::resource('roles', RoleController::class);

    // Route::get('dashboard', function () {
    //     return Inertia::render('dashboard');
    // })->name('dashboard');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Additional routes for filtering
    Route::get('properties/expiring-soon', [PropertyInfoController::class, 'expiringSoon'])->name('properties.expiring-soon');
    Route::get('properties/expired', [PropertyInfoController::class, 'expired'])->name('properties.expired');


    // Additional routes for filtering
    Route::get('applications/status/{status}', [ApplicationController::class, 'byStatus'])->name('applications.by-status');
    Route::get('applications/stage/{stage}', [ApplicationController::class, 'byStage'])->name('applications.by-stage');

    // API routes for dynamic dropdown loading
    Route::get('/api/properties-by-city', [ApplicationController::class, 'getPropertiesByCity'])->name('api.properties-by-city');
    Route::get('/api/units-by-property', [ApplicationController::class, 'getUnitsByProperty'])->name('api.units-by-property');

    // Additional routes for filtering
    Route::get('vendors/city/{city}', [VendorInfoController::class, 'byCity'])->name('vendors.by-city');

    Route::resource('tenants', controller: TenantController::class);

    // API route for dynamic unit loading
    Route::get('/api/units-by-property', [TenantController::class, 'getUnitsByProperty'])->name('api.units-by-property');

    Route::resource('properties-info', PropertyInfoController::class);

    // Property Info Without Insurance routes
    Route::resource('all-properties', PropertyInfoWithoutInsuranceController::class);
    
    // API route for getting properties by city
    Route::get('/api/all-properties/by-city/{city}', [PropertyInfoWithoutInsuranceController::class, 'getByCity'])
        ->name('api.all-properties.by-city');

    Route::resource('units', UnitController::class);

    Route::resource('payments', PaymentController::class);

    Route::resource('vendor-task-tracker', VendorTaskTrackerController::class);

    Route::resource('move-in', MoveInController::class)->except(['create', 'edit', 'show']);

    // Demo route for MoveIn Drawer component
    Route::get('move-in-drawer-demo', function () {
        $units = ['Unit 101', 'Unit 102', 'Unit 201', 'Unit 202', 'Unit 301'];
        return Inertia::render('MoveInDrawerDemo', [
            'units' => $units,
        ]);
    })->name('move-in-drawer-demo');

    Route::resource('move-out', MoveOutController::class);

    Route::resource('offers_and_renewals', OffersAndRenewalController::class);

    Route::resource('notices', NoticeController::class);

    Route::resource('notice_and_evictions', NoticeAndEvictionController::class);

    Route::resource('applications', ApplicationController::class);

    Route::get('/applications/{application}/download', [ApplicationController::class, 'downloadAttachment'])
    ->name('applications.download');

    Route::resource('vendors', VendorInfoController::class);

    Route::resource('payment-plans', PaymentPlanController::class);

    Route::get('cities', [CityController::class, 'index'])->name('cities.index');
    Route::post('cities', [CityController::class, 'store'])->name('cities.store');
    Route::delete('cities/{city}', [CityController::class, 'destroy'])->name('cities.destroy');

    Route::resource('users', UserController::class);
});

// Property Info CRUD routes


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
