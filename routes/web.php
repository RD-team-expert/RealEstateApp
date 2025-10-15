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
    // If you want to land on dashboard when authenticated, change to:
    // return redirect()->route('dashboard');
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::resource('roles', RoleController::class);

    // Main dashboard page - handles all states
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Optional: Specific routes for direct linking with parameters
    Route::get('/dashboard/city/{city_id}', [DashboardController::class, 'getProperties'])->name('dashboard.properties');
    Route::get('/dashboard/city/{city_id}/property/{property_id}', [DashboardController::class, 'getUnits'])->name('dashboard.units');
    Route::get('/dashboard/city/{city_id}/property/{property_id}/unit/{unit_id}', [DashboardController::class, 'getUnitInfo'])->name('dashboard.unit-info');
    /**
     * Properties quick filters
     */
    Route::get('properties/expiring-soon', [PropertyInfoController::class, 'expiringSoon'])
        ->name('properties.expiring-soon');
    Route::get('properties/expired', [PropertyInfoController::class, 'expired'])
        ->name('properties.expired');

    /**
     * Applications filters
     */
    Route::get('applications/status/{status}', [ApplicationController::class, 'byStatus'])
        ->name('applications.by-status');
    Route::get('applications/stage/{stage}', [ApplicationController::class, 'byStage'])
        ->name('applications.by-stage');

    /**
     * Small helper APIs used by various pages (kept under /api but in web.php with auth)
     * NOTE: Avoid duplicating the same path/controller combo.
     */
    Route::get('/api/properties-by-city', [ApplicationController::class, 'getPropertiesByCity'])
        ->name('api.properties-by-city');

    // Keep only ONE units-by-property helper route — choose the controller you actually use.
    Route::get('/api/units-by-property', [TenantController::class, 'getUnitsByProperty'])
        ->name('api.units-by-property');

    /**
     * Tenants helper APIs for autocomplete
     */
    Route::get('/api/tenants/cities', [TenantController::class, 'getCitiesForAutocomplete'])
        ->name('api.tenants.cities');
    Route::get('/api/tenants/properties', [TenantController::class, 'getPropertiesForAutocomplete'])
        ->name('api.tenants.properties');

    /**
     * CRUD & other resource routes
     */
    Route::resource('properties-info', PropertyInfoController::class);

    // Property Info Without Insurance
    Route::resource('all-properties', PropertyInfoWithoutInsuranceController::class);
    Route::get('/api/all-properties/by-city/{city}', [PropertyInfoWithoutInsuranceController::class, 'getByCity'])
        ->name('api.all-properties.by-city');

    Route::get('/all-properties/import', [PropertyInfoWithoutInsuranceController::class, 'showImport'])
        ->name('all-properties.import');
    Route::post('/all-properties/import', [PropertyInfoWithoutInsuranceController::class, 'import'])
        ->name('all-properties.import.store');

    // Units import
    Route::get('/units/import', [UnitController::class, 'showImport'])
        ->name('units.import.show');
    Route::post('/units/import', [UnitController::class, 'import'])
        ->name('units.import');

    // Tenants
    Route::resource('tenants', TenantController::class);
    Route::patch('/tenants/{tenant}/archive', [TenantController::class, 'archive'])
        ->name('tenants.archive')
        ->middleware('permission:tenants.destroy'); // same perm as delete
    /**
     * Additional tenant helper & import routes
     */
    // Dynamic units-by-property (for forms or AJAX)
    Route::get('tenants/units-by-property', [TenantController::class, 'getUnitsByProperty'])
        ->name('tenants.units-by-property');

    // Tenant import form (shows the upload page)
    Route::get('tenants/import/form', [TenantController::class, 'import'])
        ->name('tenants.import');

    // Process tenant import (handles uploaded file)
    Route::post('tenants/import/process', [TenantController::class, 'processImport'])
        ->name('tenants.import.process');

    // Download import template (Excel or CSV)
    Route::get('tenants/import/template', [TenantController::class, 'downloadTemplate'])
        ->name('tenants.import.template');

    // Units
    Route::resource('units', UnitController::class);

    // Payments
    Route::resource('payments', PaymentController::class);

    // Vendor Task Tracker
    Route::resource('vendor-task-tracker', VendorTaskTrackerController::class);

    // Move In
    Route::resource('move-in', MoveInController::class)->except(['create', 'edit', 'show']);

    // Demo route for MoveIn Drawer component
    Route::get('move-in-drawer-demo', function () {
        $units = ['Unit 101', 'Unit 102', 'Unit 201', 'Unit 202', 'Unit 301'];
        return Inertia::render('MoveInDrawerDemo', [
            'units' => $units,
        ]);
    })->name('move-in-drawer-demo');

    // Move Out
    Route::resource('move-out', MoveOutController::class);

    // Offers & Renewals
    Route::resource('offers_and_renewals', OffersAndRenewalController::class);

    // Notices
    Route::resource('notices', NoticeController::class);

    // Notice & Evictions
    Route::resource('notice_and_evictions', NoticeAndEvictionController::class);

    // Applications
    Route::resource('applications', ApplicationController::class);
    Route::get('/applications/{application}/download', [ApplicationController::class, 'downloadAttachment'])
        ->name('applications.download');

    // Vendors
    Route::resource('vendors', VendorInfoController::class);

    // Payment Plans
    Route::resource('payment-plans', PaymentPlanController::class);

    // Cities
    Route::get('cities', [CityController::class, 'index'])->name('cities.index');
    Route::post('cities', [CityController::class, 'store'])->name('cities.store');
    Route::delete('cities/{city}', [CityController::class, 'destroy'])->name('cities.destroy');

    // Users
    Route::resource('users', UserController::class);
});

// Additional route files
require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
