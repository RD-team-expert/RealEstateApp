<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePropertyInfoWithoutInsuranceRequest;
use App\Http\Requests\UpdatePropertyInfoWithoutInsuranceRequest;
use App\Services\PropertyInfoWithoutInsuranceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PropertyInfoWithoutInsuranceController extends Controller
{
    protected PropertyInfoWithoutInsuranceService $service;

    public function __construct(PropertyInfoWithoutInsuranceService $service)
    {
        $this->service = $service;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $filters = [
            'search' => $request->search,
            'city_filter' => $request->city_filter,
        ];

        $properties = $this->service->getAllPaginated(100, $filters);
        $cities = $this->service->getAllCities();

        return Inertia::render('PropertyInfoWithoutInsurance/Index', [
            'properties' => $properties,
            'cities' => $cities,
            'filters' => $filters,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $cities = $this->service->getAllCities();
        
        return Inertia::render('PropertyInfoWithoutInsurance/Index', [
            'cities' => $cities,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePropertyInfoWithoutInsuranceRequest $request): RedirectResponse
    {
        try {
            $this->service->create($request->validated());

            return redirect()->route('property-info-without-insurance.index')
                ->with('success', 'Property created successfully');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to create property: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): Response
    {
        $property = $this->service->findById($id);

        return Inertia::render('PropertyInfoWithoutInsurance/Index', [
            'property' => $property,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id): Response
    {
        $property = $this->service->findById($id);
        $cities = $this->service->getAllCities();

        return Inertia::render('PropertyInfoWithoutInsurance/Index', [
            'property' => $property,
            'cities' => $cities,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePropertyInfoWithoutInsuranceRequest $request, string $id): RedirectResponse
    {
        try {
            $property = $this->service->findById($id);
            $this->service->update($property, $request->validated());

            return redirect()->route('property-info-without-insurance.index')
                ->with('success', 'Property updated successfully');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to update property: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): RedirectResponse
    {
        try {
            $property = $this->service->findById($id);
            $this->service->delete($property);

            return redirect()->route('property-info-without-insurance.index')
                ->with('success', 'Property deleted successfully');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to delete property: ' . $e->getMessage());
        }
    }

    /**
     * Get properties by city (API endpoint for frontend)
     */
    public function getByCity(string $cityId)
    {
        $properties = $this->service->getByCity($cityId);
        return response()->json($properties);
    }
}
