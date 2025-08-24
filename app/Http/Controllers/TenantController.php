<?php
// app/Http/Controllers/TenantController.php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTenantRequest;
use App\Http\Requests\UpdateTenantRequest;
use App\Models\Tenant;
use App\Models\Unit; // Add this import
use App\Services\TenantService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TenantController extends Controller
{
    public function __construct(
        protected TenantService $tenantService
    ) {
        $this->middleware('permission:tenants.index')->only('index');
        $this->middleware('permission:tenants.create')->only('create');
        $this->middleware('permission:tenants.store')->only('store');
        $this->middleware('permission:tenants.show')->only('show');
        $this->middleware('permission:tenants.edit')->only('edit');
        $this->middleware('permission:tenants.update')->only('update');
        $this->middleware('permission:tenants.destroy')->only('destroy');
    }

    public function index(Request $request): Response
    {
        $search = $request->get('search');

        $tenants = $search
            ? $this->tenantService->searchTenants($search)
            : $this->tenantService->getAllTenants();

        return Inertia::render('Tenants/Index', [
            'tenants' => $tenants,
            'search' => $search,
        ]);
    }

    public function create(): Response
    {
        // Get units data for dropdowns
        $units = Unit::select('property', 'unit_name')
            ->orderBy('property')
            ->orderBy('unit_name')
            ->get();

        // Create arrays for dropdowns
        $properties = $units->pluck('property')->unique()->values();
        $unitsByProperty = $units->groupBy('property')->map(function ($propertyUnits) {
            return $propertyUnits->pluck('unit_name')->unique()->values();
        });

        return Inertia::render('Tenants/Create', [
            'units' => $units,
            'properties' => $properties,
            'unitsByProperty' => $unitsByProperty,
        ]);
    }

    public function store(StoreTenantRequest $request): RedirectResponse
    {
        $this->tenantService->createTenant($request->validated());

        return redirect()
            ->route('tenants.index')
            ->with('success', 'Tenant created successfully.');
    }

    public function show(Tenant $tenant): Response
    {
        return Inertia::render('Tenants/Show', [
            'tenant' => $tenant
        ]);
    }

    public function edit(Tenant $tenant): Response
    {
        // Get units data for dropdowns
        $units = Unit::select('property', 'unit_name')
            ->orderBy('property')
            ->orderBy('unit_name')
            ->get();

        // Create arrays for dropdowns
        $properties = $units->pluck('property')->unique()->values();
        $unitsByProperty = $units->groupBy('property')->map(function ($propertyUnits) {
            return $propertyUnits->pluck('unit_name')->unique()->values();
        });

        return Inertia::render('Tenants/Edit', [
            'tenant' => $tenant,
            'units' => $units,
            'properties' => $properties,
            'unitsByProperty' => $unitsByProperty,
        ]);
    }

    public function update(UpdateTenantRequest $request, Tenant $tenant): RedirectResponse
    {
        $this->tenantService->updateTenant($tenant, $request->validated());

        return redirect()
            ->route('tenants.index')
            ->with('success', 'Tenant updated successfully.');
    }

    public function destroy(Tenant $tenant): RedirectResponse
    {
        $this->tenantService->deleteTenant($tenant);

        return redirect()
            ->route('tenants.index')
            ->with('success', 'Tenant deleted successfully.');
    }

    // API endpoint for getting units by property
    public function getUnitsByProperty(Request $request)
    {
        $property = $request->get('property');

        $units = Unit::where('property', $property)
            ->select('unit_name')
            ->distinct()
            ->orderBy('unit_name')
            ->pluck('unit_name');

        return response()->json($units);
    }
}
