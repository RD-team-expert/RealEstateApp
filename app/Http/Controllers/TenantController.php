<?php
// app/Http/Controllers/TenantController.php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTenantRequest;
use App\Http\Requests\UpdateTenantRequest;
use App\Http\Requests\ImportTenantsRequest;
use App\Models\Tenant;
use App\Models\Unit;
use App\Services\TenantService;
use App\Services\TenantImportService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class TenantController extends Controller
{
    public function __construct(
        protected TenantService $tenantService,
        protected TenantImportService $tenantImportService
    ) {
        $this->middleware('permission:tenants.index')->only('index');
        $this->middleware('permission:tenants.create')->only('create');
        $this->middleware('permission:tenants.store')->only('store');
        $this->middleware('permission:tenants.show')->only('show');
        $this->middleware('permission:tenants.edit')->only('edit');
        $this->middleware('permission:tenants.update')->only('update');
        $this->middleware('permission:tenants.destroy')->only('destroy');
        $this->middleware('permission:tenants.import')->only(['import', 'processImport', 'downloadTemplate']);
    }

    public function index(Request $request): InertiaResponse
    {
        $filters = [
            'search' => $request->get('search'),
            'city' => $request->get('city'),
            'property' => $request->get('property'),
            'unit_name' => $request->get('unit_name'),
        ];

        // Check if any filters are applied
        $hasFilters = array_filter($filters, function($value) {
            return !empty($value);
        });

        $tenants = $hasFilters
            ? $this->tenantService->filterTenants($filters)
            : $this->tenantService->getAllTenants();

        // Get dropdown data for the create drawer
        $cities = \App\Models\Cities::all();
        $properties = \App\Models\PropertyInfoWithoutInsurance::with('city')->get();
        
        // Get units data for dropdowns
        $units = \App\Models\Unit::select('property', 'unit_name')
            ->orderBy('property')
            ->orderBy('unit_name')
            ->get();

        // Create arrays for dropdowns
        $unitsByProperty = $units->groupBy('property')->map(function ($propertyUnits) {
            return $propertyUnits->pluck('unit_name')->unique()->values();
        });

        return Inertia::render('Tenants/Index', [
            'tenants' => $tenants,
            'search' => $filters['search'],
            'cities' => $cities,
            'properties' => $properties,
            'unitsByProperty' => $unitsByProperty,
        ]);
    }

    public function create(): InertiaResponse
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

    public function show(Tenant $tenant): InertiaResponse
    {
        return Inertia::render('Tenants/Show', [
            'tenant' => $tenant
        ]);
    }

    public function edit(Tenant $tenant): InertiaResponse
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

    // API endpoint for getting cities for autocomplete
    public function getCitiesForAutocomplete(Request $request)
    {
        $search = $request->get('search', '');
        
        $cities = \App\Models\Cities::where('city', 'like', "%{$search}%")
            ->orderBy('city')
            ->limit(10)
            ->get(['id', 'city']);

        return response()->json($cities);
    }

    // API endpoint for getting properties for autocomplete
    public function getPropertiesForAutocomplete(Request $request)
    {
        $search = $request->get('search', '');
        $cityId = $request->get('city_id');
        
        $query = \App\Models\PropertyInfoWithoutInsurance::query();
        
        if ($search) {
            $query->where('property_name', 'like', "%{$search}%");
        }
        
        if ($cityId) {
            $query->where('city_id', $cityId);
        }
        
        $properties = $query->orderBy('property_name')
            ->limit(10)
            ->get(['id', 'property_name', 'city_id']);

        return response()->json($properties);
    }

    // Import functionality
    public function import(): InertiaResponse
    {
        return Inertia::render('Tenants/Import');
    }

    public function processImport(ImportTenantsRequest $request): RedirectResponse
    {
        $skipDuplicates = $request->boolean('skip_duplicates', false);
        
        $result = $this->tenantImportService->importFromCsv(
            $request->file('file'),
            $skipDuplicates
        );

        if ($result['success']) {
            $redirectResponse = redirect()
                ->route('tenants.index')
                ->with('success', $result['message']);

            if (!empty($result['errors'])) {
                $redirectResponse->with('import_errors', $result['errors']);
            }

            if (!empty($result['warnings'])) {
                $redirectResponse->with('import_warnings', $result['warnings']);
            }

            return $redirectResponse->with('import_stats', $result['stats']);
        } else {
            return redirect()
                ->back()
                ->withErrors(['import' => $result['message']])
                ->withInput()
                ->with('import_errors', $result['errors']);
        }
    }

    public function downloadTemplate(): Response
    {
        $headers = $this->tenantImportService->getImportTemplate();
        
        $filename = 'tenant_import_template.csv';
        
        $handle = fopen('php://temp', 'w+');
        fputcsv($handle, $headers);
        
        rewind($handle);
        $csvContent = stream_get_contents($handle);
        fclose($handle);

        return response($csvContent, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
