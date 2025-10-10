<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreApplicationRequest;
use App\Http\Requests\UpdateApplicationRequest;
use App\Models\Application;
use App\Models\Unit;
use App\Models\PropertyInfoWithoutInsurance;
use App\Models\Cities;
use App\Services\ApplicationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;

class ApplicationController extends Controller
{
    public function __construct(
        private ApplicationService $applicationService
    ) {
        $this->middleware('permission:properties.index')->only('index');
        $this->middleware('permission:properties.create')->only('create');
        $this->middleware('permission:properties.store')->only('store');
        $this->middleware('permission:properties.show')->only('show');
        $this->middleware('permission:properties.edit')->only('edit');
        $this->middleware('permission:properties.update')->only('update');
        $this->middleware('permission:properties.destroy')->only('destroy');
    }

    public function index(Request $request): Response
    {
        $perPage = $request->get('per_page', 15);
        $filters = $request->only(['city', 'property', 'name', 'co_signer', 'unit', 'status', 'stage_in_progress', 'date_from', 'date_to']);

        $applications = $this->applicationService->getAllPaginated($perPage, $filters);
        $statistics = $this->applicationService->getStatistics();

        // Transform applications to include display names
        $applications->getCollection()->transform(function ($application) {
            $application->city = $application->unit->property->city->city ?? 'N/A';
            $application->property = $application->unit->property->property_name ?? 'N/A';
            $application->unit_name = $application->unit->unit_name ?? 'N/A';
            return $application;
        });

        // Get hierarchical data for dropdowns
        $cities = Cities::orderBy('city')->get();
        $properties = PropertyInfoWithoutInsurance::with('city')->orderBy('property_name')->get();
        $units = Unit::with(['property.city'])->orderBy('unit_name')->get();

        // Create structured data for frontend
        $citiesData = $cities->map(function ($city) {
            return [
                'id' => $city->id,
                'name' => $city->city,
            ];
        });

        $propertiesData = $properties->groupBy('city_id')->map(function ($cityProperties, $cityId) {
            return $cityProperties->map(function ($property) {
                return [
                    'id' => $property->id,
                    'name' => $property->property_name,
                    'city_id' => $property->city_id,
                ];
            })->values();
        });

        $unitsData = $units->groupBy('property_id')->map(function ($propertyUnits, $propertyId) {
            return $propertyUnits->map(function ($unit) {
                return [
                    'id' => $unit->id,
                    'name' => $unit->unit_name,
                    'property_id' => $unit->property_id,
                ];
            })->values();
        });

        return Inertia::render('Applications/Index', [
            'applications' => $applications,
            'statistics' => $statistics,
            'filters' => $filters,
            'cities' => $citiesData,
            'properties' => $propertiesData,
            'units' => $unitsData,
        ]);
    }

    public function create(): Response
    {
        // Get hierarchical data for dropdowns
        $cities = Cities::orderBy('city')->get();
        $properties = PropertyInfoWithoutInsurance::with('city')->orderBy('property_name')->get();
        $units = Unit::with(['property.city'])->orderBy('unit_name')->get();

        // Create structured data for frontend
        $citiesData = $cities->map(function ($city) {
            return [
                'id' => $city->id,
                'name' => $city->city,
            ];
        });

        $propertiesData = $properties->groupBy('city_id')->map(function ($cityProperties, $cityId) {
            return $cityProperties->map(function ($property) {
                return [
                    'id' => $property->id,
                    'name' => $property->property_name,
                    'city_id' => $property->city_id,
                ];
            })->values();
        });

        $unitsData = $units->groupBy('property_id')->map(function ($propertyUnits, $propertyId) {
            return $propertyUnits->map(function ($unit) {
                return [
                    'id' => $unit->id,
                    'name' => $unit->unit_name,
                    'property_id' => $unit->property_id,
                ];
            })->values();
        });

        return Inertia::render('Applications/Create', [
            'cities' => $citiesData,
            'properties' => $propertiesData,
            'units' => $unitsData,
        ]);
    }

    public function store(StoreApplicationRequest $request): RedirectResponse
    {
        try {
            $data = $request->validated();

            // Handle file upload
            if ($request->hasFile('attachment')) {
                $file = $request->file('attachment');
                $filename = time() . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('applications', $filename, 'public');

                $data['attachment_name'] = $file->getClientOriginalName();
                $data['attachment_path'] = $path;
            }

            $this->applicationService->create($data);

            return redirect()->route('applications.index')
                ->with('success', 'Application created successfully');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to create application: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function show(string $id): Response
    {
        $application = $this->applicationService->findById((int) $id);

        // Add display names
        $application->city = $application->unit->property->city->city ?? 'N/A';
        $application->property = $application->unit->property->property_name ?? 'N/A';
        $application->unit_name = $application->unit->unit_name ?? 'N/A';

        return Inertia::render('Applications/Show', [
            'application' => $application,
        ]);
    }

    public function edit(string $id): Response
    {
        $application = $this->applicationService->findById((int) $id);

        // Get hierarchical data for dropdowns
        $cities = Cities::orderBy('city')->get();
        $properties = PropertyInfoWithoutInsurance::with('city')->orderBy('property_name')->get();
        $units = Unit::with(['property.city'])->orderBy('unit_name')->get();

        // Create structured data for frontend
        $citiesData = $cities->map(function ($city) {
            return [
                'id' => $city->id,
                'name' => $city->city,
            ];
        });

        $propertiesData = $properties->groupBy('city_id')->map(function ($cityProperties, $cityId) {
            return $cityProperties->map(function ($property) {
                return [
                    'id' => $property->id,
                    'name' => $property->property_name,
                    'city_id' => $property->city_id,
                ];
            })->values();
        });

        $unitsData = $units->groupBy('property_id')->map(function ($propertyUnits, $propertyId) {
            return $propertyUnits->map(function ($unit) {
                return [
                    'id' => $unit->id,
                    'name' => $unit->unit_name,
                    'property_id' => $unit->property_id,
                ];
            })->values();
        });

        // Add current selection data
        $application->city = $application->unit->property->city->city ?? 'N/A';
        $application->property = $application->unit->property->property_name ?? 'N/A';
        $application->unit_name = $application->unit->unit_name ?? 'N/A';
        $application->selected_city_id = $application->unit->property->city_id ?? null;
        $application->selected_property_id = $application->unit->property_id ?? null;

        return Inertia::render('Applications/Edit', [
            'application' => $application,
            'cities' => $citiesData,
            'properties' => $propertiesData,
            'units' => $unitsData,
        ]);
    }

    public function update(UpdateApplicationRequest $request, string $id): RedirectResponse
    {
        try {
            $application = $this->applicationService->findById((int) $id);
            $data = $request->validated();

            // Handle file upload
            if ($request->hasFile('attachment')) {
                // Delete old file if exists
                if ($application->attachment_path) {
                    Storage::disk('public')->delete($application->attachment_path);
                }

                $file = $request->file('attachment');
                $filename = time() . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('applications', $filename, 'public');

                $data['attachment_name'] = $file->getClientOriginalName();
                $data['attachment_path'] = $path;
            }

            $this->applicationService->update($application, $data);

            return redirect()->route('applications.index')
                ->with('success', 'Application updated successfully');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to update application: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function destroy(string $id): RedirectResponse
    {
        try {
            $application = $this->applicationService->findById((int) $id);

            // Use soft delete (archive) instead of hard delete
            $this->applicationService->delete($application);

            return redirect()->route('applications.index')
                ->with('success', 'Application archived successfully');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to archive application: ' . $e->getMessage());
        }
    }

    public function downloadAttachment(string $id)
    {
        $application = $this->applicationService->findById((int) $id);

        if (!$application->attachment_path || !$application->attachment_name) {
            abort(404, 'Attachment not found.');
        }

        $filePath = storage_path('app/public/' . $application->attachment_path);

        if (!file_exists($filePath)) {
            abort(404, 'File not found.');
        }

        return response()->download($filePath, $application->attachment_name);
    }

    // API endpoints for dynamic loading
    public function getPropertiesByCity(Request $request): JsonResponse
    {
        $cityId = $request->get('city_id');
        
        $properties = PropertyInfoWithoutInsurance::where('city_id', $cityId)
            ->orderBy('property_name')
            ->get()
            ->map(function ($property) {
                return [
                    'id' => $property->id,
                    'name' => $property->property_name,
                ];
            });

        return response()->json($properties);
    }

    public function getUnitsByProperty(Request $request): JsonResponse
    {
        $propertyId = $request->get('property_id');

        $units = Unit::where('property_id', $propertyId)
            ->orderBy('unit_name')
            ->get()
            ->map(function ($unit) {
                return [
                    'id' => $unit->id,
                    'name' => $unit->unit_name,
                ];
            });

        return response()->json($units);
    }
}
