<?php
// app/Http/Controllers/PropertyInfoController.php

namespace App\Http\Controllers;

use App\Http\Requests\StorePropertyInfoRequest;
use App\Http\Requests\UpdatePropertyInfoRequest;
use App\Services\PropertyInfoService;
use App\Services\PropertyInfoWithoutInsuranceService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class PropertyInfoController extends Controller
{
    public function __construct(
        private PropertyInfoService $propertyInfoService,
        private PropertyInfoWithoutInsuranceService $propertyInfoWithoutInsuranceService
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
        $filters = $request->only(['property_name', 'insurance_company_name', 'policy_number', 'status']);

        // Update all property statuses before displaying
        $this->propertyInfoService->updateAllStatuses();

        $properties = $this->propertyInfoService->getAllPaginated($perPage, $filters);
        $statistics = $this->propertyInfoService->getStatistics();
        $cities = $this->propertyInfoWithoutInsuranceService->getAllCities();
        $availableProperties = $this->propertyInfoWithoutInsuranceService->getAvailableProperties(); // Add this method

        return Inertia::render('Properties/Index', [
            'properties' => $properties,
            'statistics' => $statistics,
            'filters' => $filters,
            'cities' => $cities,
            'availableProperties' => $availableProperties, // Pass available properties
        ]);
    }

    public function create(): Response
    {
        $availableProperties = $this->propertyInfoWithoutInsuranceService->getAvailableProperties();
        
        return Inertia::render('Properties/Create', [
            'availableProperties' => $availableProperties,
        ]);
    }

    public function store(StorePropertyInfoRequest $request): RedirectResponse
    {
        try {
            $this->propertyInfoService->create($request->validated());

            return redirect()->route('properties-info.index')
                ->with('success', 'Property created successfully');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to create property: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function show(int $id): Response
    {
        $property = $this->propertyInfoService->findById($id);

        return Inertia::render('Properties/Show', [
            'property' => $property,
        ]);
    }

    public function edit(int $id): Response
    {
        $property = $this->propertyInfoService->findById($id);
        $availableProperties = $this->propertyInfoWithoutInsuranceService->getAvailableProperties();

        return Inertia::render('Properties/Edit', [
            'property' => $property,
            'availableProperties' => $availableProperties,
        ]);
    }

    public function update(UpdatePropertyInfoRequest $request, int $id): RedirectResponse
    {
        try {
            $property = $this->propertyInfoService->findById($id);
            $this->propertyInfoService->update($property, $request->validated());

            return redirect()->route('properties-info.index')
                ->with('success', 'Property updated successfully');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to update property: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function destroy(int $id): RedirectResponse
    {
        try {
            $property = $this->propertyInfoService->findById($id);
            $this->propertyInfoService->delete($property);

            return redirect()->route('properties-info.index')
                ->with('success', 'Property deleted successfully');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to delete property: ' . $e->getMessage());
        }
    }

    public function dashboard(): Response
    {
        // Update all statuses before showing dashboard
        $this->propertyInfoService->updateAllStatuses();

        $statistics = $this->propertyInfoService->getStatistics();
        $expired = $this->propertyInfoService->getExpired();

        return Inertia::render('Properties/Dashboard', [
            'statistics' => $statistics,
            'expired' => $expired,
        ]);
    }

    public function expired(): Response
    {
        // Update all statuses before showing expired properties
        $this->propertyInfoService->updateAllStatuses();

        $properties = $this->propertyInfoService->getExpired();

        return Inertia::render('Properties/Expired', [
            'properties' => $properties,
        ]);
    }
}
