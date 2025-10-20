<?php
// app/Http/Controllers/TenantController.php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTenantRequest;
use App\Http\Requests\UpdateTenantRequest;
use App\Http\Requests\ImportTenantsRequest;
use App\Models\Tenant;
use App\Models\Unit;
use App\Models\Cities;
use App\Models\PropertyInfoWithoutInsurance;
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
        $hasFilters = array_filter($filters, function ($value) {
            return !empty($value);
        });

        $tenants = $hasFilters
            ? $this->tenantService->filterTenants($filters)
            : $this->tenantService->getAllTenants();

        // Transform tenants to include readable names while keeping IDs
        $transformedTenants = $tenants->map(function ($tenant) {
            return [
                'id' => $tenant->id,
                'unit_id' => $tenant->unit_id,
                'first_name' => $tenant->first_name,
                'last_name' => $tenant->last_name,
                'street_address_line' => $tenant->street_address_line,
                'login_email' => $tenant->login_email,
                'alternate_email' => $tenant->alternate_email,
                'mobile' => $tenant->mobile,
                'emergency_phone' => $tenant->emergency_phone,
                'cash_or_check' => $tenant->cash_or_check,
                'has_insurance' => $tenant->has_insurance,
                'sensitive_communication' => $tenant->sensitive_communication,
                'has_assistance' => $tenant->has_assistance,
                'assistance_amount' => $tenant->assistance_amount,
                'assistance_company' => $tenant->assistance_company,
                // Add readable names for display
                'property_name' => $tenant->unit?->property?->property_name ?? 'N/A',
                'unit_number' => $tenant->unit?->unit_name ?? 'N/A',
                'city_name' => $tenant->unit?->property?->city?->city ?? 'N/A',
                'created_at' => $tenant->created_at,
                'updated_at' => $tenant->updated_at,
            ];
        });

        // Get dropdown data for the create drawer
        $cities = Cities::all();
        $properties = PropertyInfoWithoutInsurance::with('city')->get();

        // Get units data for dropdowns - using the correct relationship
        $units = Unit::withArchived()->with('property')->get();

        // Create arrays for dropdowns by property name
        $unitsByProperty = $units->groupBy(function ($unit) {
            return $unit->property ? $unit->property->property_name : 'Unknown Property';
        })->map(function ($propertyUnits) {
            return $propertyUnits->map(function ($unit) {
                return [
                    'id' => $unit->id,
                    'unit_name' => $unit->unit_name
                ];
            })->values();
        });

        return Inertia::render('Tenants/Index', [
            'tenants' => $transformedTenants,
            'search' => $filters['search'],
            'cities' => $cities,
            'properties' => $properties,
            'unitsByProperty' => $unitsByProperty,
        ]);
    }

    public function create(): InertiaResponse
    {
        // Get units data for dropdowns
        $units = Unit::withArchived()->with('property')->get();

        // Create arrays for dropdowns
        $properties = $units->pluck('property.property_name')->filter()->unique()->values();
        $unitsByProperty = $units->groupBy(function ($unit) {
            return $unit->property ? $unit->property->property_name : 'Unknown Property';
        })->map(function ($propertyUnits) {
            return $propertyUnits->map(function ($unit) {
                return [
                    'id' => $unit->id,
                    'unit_name' => $unit->unit_name
                ];
            })->values();
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
        $tenant->load(['unit' => function ($query) {
            $query->withArchived();
        }, 'unit.property.city']);

        return Inertia::render('Tenants/Show', [
            'tenant' => [
                'id' => $tenant->id,
                'unit_id' => $tenant->unit_id,
                'first_name' => $tenant->first_name,
                'last_name' => $tenant->last_name,
                'street_address_line' => $tenant->street_address_line,
                'login_email' => $tenant->login_email,
                'alternate_email' => $tenant->alternate_email,
                'mobile' => $tenant->mobile,
                'emergency_phone' => $tenant->emergency_phone,
                'cash_or_check' => $tenant->cash_or_check,
                'has_insurance' => $tenant->has_insurance,
                'sensitive_communication' => $tenant->sensitive_communication,
                'has_assistance' => $tenant->has_assistance,
                'assistance_amount' => $tenant->assistance_amount,
                'assistance_company' => $tenant->assistance_company,
                'property_name' => $tenant->unit?->property?->property_name ?? 'N/A',
                'unit_number' => $tenant->unit?->unit_name ?? 'N/A',
                'city_name' => $tenant->unit?->property?->city?->city ?? 'N/A',
                'created_at' => $tenant->created_at,
                'updated_at' => $tenant->updated_at,
            ]
        ]);
    }

    public function edit(Tenant $tenant): InertiaResponse
    {
        $tenant->load(['unit' => function ($query) {
            $query->withArchived();
        }, 'unit.property.city']);

        // Get units data for dropdowns
        $units = Unit::withArchived()->with('property')->get();

        // Create arrays for dropdowns
        $properties = $units->pluck('property.property_name')->filter()->unique()->values();
        $unitsByProperty = $units->groupBy(function ($unit) {
            return $unit->property ? $unit->property->property_name : 'Unknown Property';
        })->map(function ($propertyUnits) {
            return $propertyUnits->map(function ($unit) {
                return [
                    'id' => $unit->id,
                    'unit_name' => $unit->unit_name
                ];
            })->values();
        });

        return Inertia::render('Tenants/Edit', [
            'tenant' => [
                'id' => $tenant->id,
                'unit_id' => $tenant->unit_id,
                'first_name' => $tenant->first_name,
                'last_name' => $tenant->last_name,
                'street_address_line' => $tenant->street_address_line,
                'login_email' => $tenant->login_email,
                'alternate_email' => $tenant->alternate_email,
                'mobile' => $tenant->mobile,
                'emergency_phone' => $tenant->emergency_phone,
                'cash_or_check' => $tenant->cash_or_check,
                'has_insurance' => $tenant->has_insurance,
                'sensitive_communication' => $tenant->sensitive_communication,
                'has_assistance' => $tenant->has_assistance,
                'assistance_amount' => $tenant->assistance_amount,
                'assistance_company' => $tenant->assistance_company,
                'property_name' => $tenant->unit?->property?->property_name ?? 'N/A',
                'unit_number' => $tenant->unit?->unit_name ?? 'N/A',
                'city_name' => $tenant->unit?->property?->city?->city ?? 'N/A',
            ],
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

    // API endpoint for getting units by property name
    public function getUnitsByProperty(Request $request)
    {
        $propertyName = $request->get('property');

        $property = PropertyInfoWithoutInsurance::where('property_name', $propertyName)->first();

        if (!$property) {
            return response()->json([]);
        }

        $units = Unit::where('property_id', $property->id)
            ->select('id', 'unit_name')
            ->orderBy('unit_name')
            ->get()
            ->map(function ($unit) {
                return [
                    'id' => $unit->id,
                    'unit_name' => $unit->unit_name
                ];
            });

        return response()->json($units);
    }

    // API endpoint for getting cities for autocomplete
    public function getCitiesForAutocomplete(Request $request)
    {
        $search = $request->get('search', '');

        $cities = Cities::where('city', 'like', "%{$search}%")
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

        $query = PropertyInfoWithoutInsurance::query();

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

    public function archive(Tenant $tenant): RedirectResponse
    {
        $this->tenantService->deleteTenant($tenant); // sets is_archived = true
        return back()->with('success', 'Tenant archived successfully.');
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
