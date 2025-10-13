<?php

namespace App\Http\Controllers;

use App\Models\Cities;
use App\Models\PropertyInfoWithoutInsurance;
use App\Models\Unit;
use App\Services\DashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private DashboardService $dashboardService
    ) {}

    /**
     * Display the dashboard page
     */
    public function index(Request $request): Response
    {
        $cities = $this->dashboardService->getAllCities();
        $properties = [];
        $units = [];
        $unitInfo = null;

        // Load properties if city is selected
        if ($request->has('city_id') && $request->city_id) {
            $properties = $this->dashboardService->getPropertiesByCity($request->city_id);
        }

        // Load units if property is selected
        if ($request->has('property_id') && $request->property_id) {
            $units = $this->dashboardService->getUnitsByProperty($request->property_id);
        }

        // Load unit info if unit is selected
        if ($request->has('unit_id') && $request->unit_id) {
            $unitInfo = $this->dashboardService->getUnitInfo($request->unit_id);
        }

        return Inertia::render('Dashboard', [
            'cities' => $cities,
            'properties' => $properties,
            'units' => $units,
            'unitInfo' => $unitInfo,
            'selectedCityId' => $request->city_id ? (int)$request->city_id : null,
            'selectedPropertyId' => $request->property_id ? (int)$request->property_id : null,
            'selectedUnitId' => $request->unit_id ? (int)$request->unit_id : null,
        ]);
    }

    /**
     * Get properties for a specific city (fallback route)
     */
    public function getProperties(Request $request): Response
    {
        $request->validate([
            'city_id' => 'required|integer|exists:cities,id'
        ]);

        return $this->index($request);
    }

    /**
     * Get units for a specific property (fallback route)
     */
    public function getUnits(Request $request): Response
    {
        $request->validate([
            'property_id' => 'required|integer|exists:property_info_without_insurance,id',
            'city_id' => 'required|integer|exists:cities,id'
        ]);

        return $this->index($request);
    }

    /**
     * Get unit information (fallback route)
     */
    public function getUnitInfo(Request $request): Response
    {
        $request->validate([
            'unit_id' => 'required|integer|exists:units,id',
            'property_id' => 'required|integer|exists:property_info_without_insurance,id',
            'city_id' => 'required|integer|exists:cities,id'
        ]);

        return $this->index($request);
    }
}
