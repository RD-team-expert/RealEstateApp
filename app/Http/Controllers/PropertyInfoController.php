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
        $this->middleware('permission:properties.store')->only('store');
        $this->middleware('permission:properties.show')->only('show');
        $this->middleware('permission:properties.update')->only('update');
        $this->middleware('permission:properties.destroy')->only('destroy');
    }

    /**
     * Display the index page with paginated and filtered property info records.
     * This page supports dynamic pagination and filtering from the frontend.
     *
     * @param Request $request HTTP request containing pagination and filter parameters
     * @return Response Inertia response rendering the index page
     */
    public function index(Request $request): Response
    {
        // Get per_page value from request (defaults to 15 if not provided by frontend)
        $perPage = $request->get('per_page', 15);

        // If per_page is very large (999999) or 'all', get all records without pagination
        if ($perPage == 'all') {
            $perPage = PHP_INT_MAX; // Maximum integer value
        } else {
            $perPage = (int) $perPage;
        }


        // Extract filter parameters from request
        $filters = $request->only(['property_name', 'insurance_company_name', 'policy_number', 'status']);

        // Update all property statuses before displaying
        $this->propertyInfoService->updateAllStatuses();

        // Get paginated properties with filters applied
        $properties = $this->propertyInfoService->getAllPaginated($perPage, $filters);

        // Get statistics for dashboard display
        $statistics = $this->propertyInfoService->getStatistics();

        // Get cities for filter dropdown
        $cities = $this->propertyInfoWithoutInsuranceService->getAllCities();

        // Get available properties (those without insurance) for selection
        $availableProperties = $this->propertyInfoWithoutInsuranceService->getAvailableProperties();

        return Inertia::render('Properties/Index', [
            'properties' => $properties,
            'statistics' => $statistics,
            'filters' => $filters,
            'cities' => $cities,
            'availableProperties' => $availableProperties,
        ]);
    }

    /**
     * Store a newly created property info record.
     * After successful creation, redirects back to index with preserved pagination and filters.
     *
     * @param StorePropertyInfoRequest $request Validated request data
     * @return RedirectResponse Redirect to index page with query parameters preserved
     */
    public function store(StorePropertyInfoRequest $request): RedirectResponse
    {
        try {
            $this->propertyInfoService->create($request->validated());

            // Redirect to index route with all query parameters preserved
            // This maintains pagination (page number) and filters (property_name, insurance_company_name, etc.)
            // The query parameters are automatically included from the current request
            return redirect()->route('properties-info.index', $request->query())
                ->with('success', 'Property created successfully');
        } catch (\Exception $e) {
            // On error, redirect back to the same page with input preserved
            return redirect()->back()
                ->with('error', 'Failed to create property: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Display the specified property info record.
     * Also provides next and previous record IDs for navigation based on applied filters.
     *
     * @param int $id Property info ID
     * @param Request $request HTTP request containing filter parameters
     * @return Response Inertia response rendering the show page
     */
    public function show(int $id, Request $request): Response
    {
        // Find the property by ID
        $property = $this->propertyInfoService->findById($id);

        // Get filters from the request (same filters used in the index page)
        $filters = $request->only(['property_name', 'insurance_company_name', 'policy_number', 'status']);

        // Get next and previous IDs based on the current ID and applied filters
        // This allows the user to navigate through filtered results in the show page
        $navigation = $this->propertyInfoService->getNextPreviousIds($id, $filters);

        return Inertia::render('Properties/Show', [
            'property' => $property,
            'next_id' => $navigation['next_id'],      // ID of the next record (null if at end)
            'previous_id' => $navigation['previous_id'], // ID of the previous record (null if at start)
            'filters' => $filters,  // Pass filters so they can be included in navigation links
        ]);
    }

    /**
     * Update the specified property info record.
     * After successful update, redirects back to index with preserved pagination and filters.
     *
     * @param UpdatePropertyInfoRequest $request Validated request data
     * @param int $id Property info ID
     * @return RedirectResponse Redirect to index page with query parameters preserved
     */
    public function update(UpdatePropertyInfoRequest $request, int $id): RedirectResponse
    {
        try {
            $property = $this->propertyInfoService->findById($id);
            $this->propertyInfoService->update($property, $request->validated());

            // Redirect to index route with all query parameters preserved
            // The $request->query() method gets all query string parameters (page, per_page, filters)
            // and passes them to the redirect URL, maintaining the user's context
            return redirect()->route('properties-info.index', $request->query())
                ->with('success', 'Property updated successfully');
        } catch (\Exception $e) {
            // On error, redirect back with input and query parameters preserved
            return redirect()->back()
                ->with('error', 'Failed to update property: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Delete (archive) the specified property info record.
     * After successful deletion, redirects back to index with preserved pagination and filters.
     *
     * @param int $id Property info ID
     * @param Request $request HTTP request containing query parameters
     * @return RedirectResponse Redirect to index page with query parameters preserved
     */
    public function destroy(int $id, Request $request): RedirectResponse
    {
        try {
            $property = $this->propertyInfoService->findById($id);
            $this->propertyInfoService->delete($property);

            // Redirect to index route with all query parameters preserved
            // This ensures the user returns to the same page and filter state they were viewing
            return redirect()->route('properties-info.index', $request->query())
                ->with('success', 'Property deleted successfully');
        } catch (\Exception $e) {
            // On error, redirect back with query parameters preserved
            return redirect()->back()
                ->with('error', 'Failed to delete property: ' . $e->getMessage());
        }
    }
}
