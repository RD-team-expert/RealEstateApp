<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PropertyInfoController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\VendorInfoController;
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

    // Vendors dashboard
    Route::get('/vendors/dashboard', [VendorInfoController::class, 'dashboard'])->name('vendors.dashboard');

    // Vendors CRUD routes
    Route::resource('vendors', VendorInfoController::class);

    // Additional routes for filtering
    Route::get('vendors/city/{city}', [VendorInfoController::class, 'byCity'])->name('vendors.by-city');
});

// Property Info CRUD routes


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
