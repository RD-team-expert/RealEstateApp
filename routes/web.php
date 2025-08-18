<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PropertyInfoController;
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
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::resource('properties-info', PropertyInfoController::class);

    // Additional routes for filtering
    Route::get('properties/expiring-soon', [PropertyInfoController::class, 'expiringSoon'])->name('properties.expiring-soon');
    Route::get('properties/expired', [PropertyInfoController::class, 'expired'])->name('properties.expired');

    // Applications dashboard
    Route::get('/applications/dashboard', [ApplicationController::class, 'dashboard'])->name('applications.dashboard');

    // Applications CRUD routes
    Route::resource('applications', ApplicationController::class);

    // Additional routes for filtering
    Route::get('applications/status/{status}', [ApplicationController::class, 'byStatus'])->name('applications.by-status');
    Route::get('applications/stage/{stage}', [ApplicationController::class, 'byStage'])->name('applications.by-stage');

    // API routes for dynamic dropdown loading
    Route::get('/api/properties-by-city', [ApplicationController::class, 'getPropertiesByCity'])->name('api.properties-by-city');
    Route::get('/api/units-by-property', [ApplicationController::class, 'getUnitsByProperty'])->name('api.units-by-property');
    // Vendors dashboard
    Route::get('/vendors/dashboard', [VendorInfoController::class, 'dashboard'])->name('vendors.dashboard');

    // Vendors CRUD routes
    Route::resource('vendors', VendorInfoController::class);

    // Additional routes for filtering
    Route::get('vendors/city/{city}', [VendorInfoController::class, 'byCity'])->name('vendors.by-city');

    Route::resource('tenants', controller: TenantController::class);

    // API route for dynamic unit loading
    Route::get('/api/units-by-property', [TenantController::class, 'getUnitsByProperty'])->name('api.units-by-property');
    // Units dashboard
    Route::get('/units/dashboard', [UnitController::class, 'dashboard'])->name('units.dashboard');

    // Units CRUD routes
    Route::resource('units', UnitController::class);

    Route::resource('payments', PaymentController::class);

    Route::resource('vendor-task-tracker', VendorTaskTrackerController::class);

    Route::resource('move-in', MoveInController::class);

    Route::resource('move-out', MoveOutController::class);

    Route::resource('offers_and_renewals', OffersAndRenewalController::class);

    Route::resource('notices', NoticeController::class);

    Route::resource('notice_and_evictions', NoticeAndEvictionController::class);

});

// Property Info CRUD routes


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
