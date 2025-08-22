<?php
// app/Http/Controllers/ApplicationController.php

namespace App\Http\Controllers;

use App\Http\Requests\StoreApplicationRequest;
use App\Http\Requests\UpdateApplicationRequest;
use App\Models\Application;
use App\Models\Unit; // Add this import
use App\Services\ApplicationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class ApplicationController extends Controller
{
    public function __construct(
        private ApplicationService $applicationService
    ) {}

    public function index(Request $request): Response
    {
        $perPage = $request->get('per_page', 15);
        $filters = $request->only(['city','property', 'name', 'co_signer', 'unit', 'status', 'stage_in_progress', 'date_from', 'date_to']);

        $applications = $this->applicationService->getAllPaginated($perPage, $filters);
        $statistics = $this->applicationService->getStatistics();

        return Inertia::render('Applications/Index', [
            'applications' => $applications,
            'statistics' => $statistics,
            'filters' => $filters,
        ]);
    }

    public function create(): Response
    {
        // Get units data for dropdowns
        $units = Unit::select('city', 'property', 'unit_name')
            ->orderBy('city')
            ->orderBy('property')
            ->orderBy('unit_name')
            ->get();

        // Create separate arrays for each dropdown
        $cities = $units->pluck('city')->unique()->values();
        $properties = $units->groupBy('city')->map(function ($cityUnits) {
            return $cityUnits->pluck('property')->unique()->values();
        });
        $unitsByProperty = $units->groupBy(['city', 'property'])->map(function ($cityGroup) {
            return $cityGroup->map(function ($propertyGroup) {
                return $propertyGroup->pluck('unit_name')->unique()->values();
            });
        });

        return Inertia::render('Applications/Create', [
            'units' => $units,
            'cities' => $cities,
            'properties' => $properties,
            'unitsByProperty' => $unitsByProperty,
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

        return Inertia::render('Applications/Show', [
            'application' => $application,
        ]);
    }

    public function edit(string $id): Response
    {
        $application = $this->applicationService->findById((int) $id);

        // Get units data for dropdowns
        $units = Unit::select('city', 'property', 'unit_name')
            ->orderBy('city')
            ->orderBy('property')
            ->orderBy('unit_name')
            ->get();

        // Create separate arrays for each dropdown
        $cities = $units->pluck('city')->unique()->values();
        $properties = $units->groupBy('city')->map(function ($cityUnits) {
            return $cityUnits->pluck('property')->unique()->values();
        });
        $unitsByProperty = $units->groupBy(['city', 'property'])->map(function ($cityGroup) {
            return $cityGroup->map(function ($propertyGroup) {
                return $propertyGroup->pluck('unit_name')->unique()->values();
            });
        });

        return Inertia::render('Applications/Edit', [
            'application' => $application,
            'units' => $units,
            'cities' => $cities,
            'properties' => $properties,
            'unitsByProperty' => $unitsByProperty,
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

            // Delete attachment file if exists
            if ($application->attachment_path) {
                Storage::disk('public')->delete($application->attachment_path);
            }

            $this->applicationService->delete($application);

            return redirect()->route('applications.index')
                ->with('success', 'Application deleted successfully');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to delete application: ' . $e->getMessage());
        }
    }

    // Add download method
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

    // Add API endpoint for dynamic property/unit loading
    public function getPropertiesByCity(Request $request): Response
    {
        $city = $request->get('city');
        $properties = Unit::where('city', $city)
            ->select('property')
            ->distinct()
            ->orderBy('property')
            ->pluck('property');

        return response()->json($properties);
    }

    public function getUnitsByProperty(Request $request): Response
    {
        $city = $request->get('city');
        $property = $request->get('property');

        $units = Unit::where('city', $city)
            ->where('property', $property)
            ->select('unit_name')
            ->distinct()
            ->orderBy('unit_name')
            ->pluck('unit_name');

        return response()->json($units);
    }
}
