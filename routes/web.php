<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PropertyInfoController;
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
});

// Property Info CRUD routes


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
