<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMoveOutRequest;
use App\Http\Requests\UpdateMoveOutRequest;
use App\Models\MoveOut;
use App\Services\MoveOutService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MoveOutController extends Controller
{
    public function __construct(
        protected MoveOutService $moveOutService
    ) {
        $this->middleware('permission:move-out.index')->only('index');
        $this->middleware('permission:move-out.create')->only('create');
        $this->middleware('permission:move-out.store')->only('store');
        $this->middleware('permission:move-out.show')->only('show');
        $this->middleware('permission:move-out.edit')->only('edit');
        $this->middleware('permission:move-out.update')->only('update');
        $this->middleware('permission:move-out.destroy')->only('destroy');
    }

    public function index(Request $request): Response
    {
        // Get filters from request using ID-based filtering
        $filters = [
            'unit_id' => $request->get('unit_id'),
            'tenant_id' => $request->get('tenant_id'),
            'city_id' => $request->get('city_id'),
            'property_id' => $request->get('property_id'),
        ];

        // Use filtered search if any filters are provided
        $moveOuts = array_filter($filters) 
            ? $this->moveOutService->searchMoveOutsWithFilters($filters)
            : $this->moveOutService->getAllMoveOuts();

        // Transform move-outs data to include relationship data as direct properties
        $moveOuts->getCollection()->transform(function ($moveOut) {
            return [
                'id' => $moveOut->id,
                'tenant_id' => $moveOut->tenant_id,
                'tenants_name' => $moveOut->tenant ? $moveOut->tenant->full_name : null,
                'units_name' => $moveOut->tenant && $moveOut->tenant->unit ? $moveOut->tenant->unit->unit_name : null,
                'property_name' => $moveOut->tenant && $moveOut->tenant->unit && $moveOut->tenant->unit->property 
                    ? $moveOut->tenant->unit->property->property_name : null,
                'city_name' => $moveOut->tenant && $moveOut->tenant->unit && $moveOut->tenant->unit->property && $moveOut->tenant->unit->property->city 
                    ? $moveOut->tenant->unit->property->city->city : null,
                'move_out_date' => $moveOut->move_out_date?->format('Y-m-d'),
                'lease_status' => $moveOut->lease_status,
                'date_lease_ending_on_buildium' => $moveOut->date_lease_ending_on_buildium?->format('Y-m-d'),
                'keys_location' => $moveOut->keys_location,
                'utilities_under_our_name' => $moveOut->utilities_under_our_name,
                'date_utility_put_under_our_name' => $moveOut->date_utility_put_under_our_name?->format('Y-m-d'),
                'walkthrough' => $moveOut->walkthrough,
                'repairs' => $moveOut->repairs,
                'send_back_security_deposit' => $moveOut->send_back_security_deposit,
                'notes' => $moveOut->notes,
                'cleaning' => $moveOut->cleaning,
                'list_the_unit' => $moveOut->list_the_unit,
                'move_out_form' => $moveOut->move_out_form,
                'created_at' => $moveOut->created_at,
                'updated_at' => $moveOut->updated_at,
            ];
        });

        // Get dropdown data for the create/edit drawers
        $dropdownData = $this->moveOutService->getDropdownData();

        return Inertia::render('MoveOut/Index', [
            'moveOuts' => $moveOuts,
            'unit_id' => $filters['unit_id'],
            'tenant_id' => $filters['tenant_id'],
            'cities' => $dropdownData['cities'],
            'properties' => $dropdownData['properties'],
            'propertiesByCityId' => $dropdownData['propertiesByCityId'],
            'unitsByPropertyId' => $dropdownData['unitsByPropertyId'],
            'tenantsByUnitId' => $dropdownData['tenantsByUnitId'],
            'allUnits' => $dropdownData['allUnits'],
            'tenantsData' => $dropdownData['tenantsData'],
        ]);
    }

    public function create(): Response
    {
        $dropdownData = $this->moveOutService->getDropdownData();

        return Inertia::render('MoveOut/Create', [
            'cities' => $dropdownData['cities'],
            'properties' => $dropdownData['properties'],
            'propertiesByCityId' => $dropdownData['propertiesByCityId'],
            'unitsByPropertyId' => $dropdownData['unitsByPropertyId'],
            'tenantsByUnitId' => $dropdownData['tenantsByUnitId'],
            'allUnits' => $dropdownData['allUnits'],
            'tenantsData' => $dropdownData['tenantsData'],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        // Validate the request using tenant_id instead of tenants_name
        $validatedData = $request->validate([
            'tenant_id' => 'required|integer|exists:tenants,id',
            'move_out_date' => 'nullable|date',
            'lease_status' => 'nullable|string|max:255',
            'date_lease_ending_on_buildium' => 'nullable|date',
            'keys_location' => 'nullable|string|max:255',
            'utilities_under_our_name' => 'nullable|in:Yes,No',
            'date_utility_put_under_our_name' => 'nullable|date',
            'walkthrough' => 'nullable|string',
            'repairs' => 'nullable|string',
            'send_back_security_deposit' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'cleaning' => 'nullable|in:cleaned,uncleaned',
            'list_the_unit' => 'nullable|string|max:255',
            'move_out_form' => 'nullable|in:filled,not filled',
        ]);

        // Create the move-out record
        $this->moveOutService->createMoveOut($validatedData);

        return redirect()
            ->route('move-out.index')
            ->with('success', 'Move-out record created successfully.');
    }

    public function show(MoveOut $moveOut): Response
    {
        // Load the move-out with relationships
        $moveOutWithRelations = $this->moveOutService->getMoveOutWithRelations($moveOut->id);

        // Transform the data to include relationship properties
        $transformedMoveOut = [
            'id' => $moveOutWithRelations->id,
            'tenant_id' => $moveOutWithRelations->tenant_id,
            'tenants_name' => $moveOutWithRelations->tenant ? $moveOutWithRelations->tenant->full_name : null,
            'units_name' => $moveOutWithRelations->tenant && $moveOutWithRelations->tenant->unit 
                ? $moveOutWithRelations->tenant->unit->unit_name : null,
            'property_name' => $moveOutWithRelations->tenant && $moveOutWithRelations->tenant->unit && $moveOutWithRelations->tenant->unit->property 
                ? $moveOutWithRelations->tenant->unit->property->property_name : null,
            'city_name' => $moveOutWithRelations->tenant && $moveOutWithRelations->tenant->unit && $moveOutWithRelations->tenant->unit->property && $moveOutWithRelations->tenant->unit->property->city 
                ? $moveOutWithRelations->tenant->unit->property->city->city : null,
            'move_out_date' => $moveOutWithRelations->move_out_date?->format('Y-m-d'),
            'lease_status' => $moveOutWithRelations->lease_status,
            'date_lease_ending_on_buildium' => $moveOutWithRelations->date_lease_ending_on_buildium?->format('Y-m-d'),
            'keys_location' => $moveOutWithRelations->keys_location,
            'utilities_under_our_name' => $moveOutWithRelations->utilities_under_our_name,
            'date_utility_put_under_our_name' => $moveOutWithRelations->date_utility_put_under_our_name?->format('Y-m-d'),
            'walkthrough' => $moveOutWithRelations->walkthrough,
            'repairs' => $moveOutWithRelations->repairs,
            'send_back_security_deposit' => $moveOutWithRelations->send_back_security_deposit,
            'notes' => $moveOutWithRelations->notes,
            'cleaning' => $moveOutWithRelations->cleaning,
            'list_the_unit' => $moveOutWithRelations->list_the_unit,
            'move_out_form' => $moveOutWithRelations->move_out_form,
            'created_at' => $moveOutWithRelations->created_at,
            'updated_at' => $moveOutWithRelations->updated_at,
        ];

        return Inertia::render('MoveOut/Show', [
            'moveOut' => $transformedMoveOut
        ]);
    }

    public function edit(MoveOut $moveOut): Response
    {
        $dropdownData = $this->moveOutService->getDropdownData();

        // Load the move-out with relationships
        $moveOutWithRelations = $this->moveOutService->getMoveOutWithRelations($moveOut->id);

        // Transform the data for editing
        $transformedMoveOut = [
            'id' => $moveOutWithRelations->id,
            'tenant_id' => $moveOutWithRelations->tenant_id,
            'tenants_name' => $moveOutWithRelations->tenant ? $moveOutWithRelations->tenant->full_name : null,
            'units_name' => $moveOutWithRelations->tenant && $moveOutWithRelations->tenant->unit 
                ? $moveOutWithRelations->tenant->unit->unit_name : null,
            'property_name' => $moveOutWithRelations->tenant && $moveOutWithRelations->tenant->unit && $moveOutWithRelations->tenant->unit->property 
                ? $moveOutWithRelations->tenant->unit->property->property_name : null,
            'city_name' => $moveOutWithRelations->tenant && $moveOutWithRelations->tenant->unit && $moveOutWithRelations->tenant->unit->property && $moveOutWithRelations->tenant->unit->property->city 
                ? $moveOutWithRelations->tenant->unit->property->city->city : null,
            'move_out_date' => $moveOutWithRelations->move_out_date?->format('Y-m-d'),
            'lease_status' => $moveOutWithRelations->lease_status,
            'date_lease_ending_on_buildium' => $moveOutWithRelations->date_lease_ending_on_buildium?->format('Y-m-d'),
            'keys_location' => $moveOutWithRelations->keys_location,
            'utilities_under_our_name' => $moveOutWithRelations->utilities_under_our_name,
            'date_utility_put_under_our_name' => $moveOutWithRelations->date_utility_put_under_our_name?->format('Y-m-d'),
            'walkthrough' => $moveOutWithRelations->walkthrough,
            'repairs' => $moveOutWithRelations->repairs,
            'send_back_security_deposit' => $moveOutWithRelations->send_back_security_deposit,
            'notes' => $moveOutWithRelations->notes,
            'cleaning' => $moveOutWithRelations->cleaning,
            'list_the_unit' => $moveOutWithRelations->list_the_unit,
            'move_out_form' => $moveOutWithRelations->move_out_form,
        ];

        return Inertia::render('MoveOut/Edit', [
            'moveOut' => $transformedMoveOut,
            'cities' => $dropdownData['cities'],
            'properties' => $dropdownData['properties'],
            'propertiesByCityId' => $dropdownData['propertiesByCityId'],
            'unitsByPropertyId' => $dropdownData['unitsByPropertyId'],
            'tenantsByUnitId' => $dropdownData['tenantsByUnitId'],
            'allUnits' => $dropdownData['allUnits'],
            'tenantsData' => $dropdownData['tenantsData'],
        ]);
    }

    public function update(Request $request, MoveOut $moveOut): RedirectResponse
    {
        // Validate the request using tenant_id instead of tenants_name
        $validatedData = $request->validate([
            'tenant_id' => 'sometimes|required|integer|exists:tenants,id',
            'move_out_date' => 'nullable|date',
            'lease_status' => 'nullable|string|max:255',
            'date_lease_ending_on_buildium' => 'nullable|date',
            'keys_location' => 'nullable|string|max:255',
            'utilities_under_our_name' => 'nullable|in:Yes,No',
            'date_utility_put_under_our_name' => 'nullable|date',
            'walkthrough' => 'nullable|string',
            'repairs' => 'nullable|string',
            'send_back_security_deposit' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'cleaning' => 'nullable|in:cleaned,uncleaned',
            'list_the_unit' => 'nullable|string|max:255',
            'move_out_form' => 'nullable|in:filled,not filled',
        ]);

        // Update the move-out record
        $this->moveOutService->updateMoveOut($moveOut, $validatedData);

        return redirect()
            ->route('move-out.index')
            ->with('success', 'Move-out record updated successfully.');
    }

    public function destroy(MoveOut $moveOut): RedirectResponse
    {
        $this->moveOutService->deleteMoveOut($moveOut);

        return redirect()
            ->route('move-out.index')
            ->with('success', 'Move-out record deleted successfully.');
    }
}
