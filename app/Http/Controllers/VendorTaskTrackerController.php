<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreVendorTaskTrackerRequest;
use App\Http\Requests\UpdateVendorTaskTrackerRequest;
use App\Models\VendorTaskTracker;
use App\Services\VendorTaskTrackerService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VendorTaskTrackerController extends Controller
{
    public function __construct(
        protected VendorTaskTrackerService $vendorTaskTrackerService
    ) {
        $this->middleware('permission:vendor-task-tracker.index')->only('index');
        $this->middleware('permission:vendor-task-tracker.create')->only('create');
        $this->middleware('permission:vendor-task-tracker.store')->only('store');
        $this->middleware('permission:vendor-task-tracker.show')->only('show');
        $this->middleware('permission:vendor-task-tracker.edit')->only('edit');
        $this->middleware('permission:vendor-task-tracker.update')->only('update');
        $this->middleware('permission:vendor-task-tracker.destroy')->only('destroy');
    }

    public function index(Request $request): Response
    {
        $perPage = $request->get('per_page', 15);
        $filters = $request->only(['search', 'city', 'property', 'unit_name']);

        // Check if any filters are applied
        $hasFilters = array_filter($filters, function($value) {
            return !empty($value);
        });

        $tasks = $hasFilters
            ? $this->vendorTaskTrackerService->filterTasks($filters, $perPage)
            : $this->vendorTaskTrackerService->getAllTasks($perPage);

        // Get dropdown data for the create drawer
        $dropdownData = $this->vendorTaskTrackerService->getDropdownData();

        // Get cities data for filter dropdown
        $cities = \App\Models\Cities::all();

        // Get properties data for filter dropdown
        $properties = \App\Models\PropertyInfoWithoutInsurance::with('city')->get();

        return Inertia::render('VendorTaskTracker/Index', [
            'tasks' => $tasks,
            'filters' => $filters,
            'units' => $dropdownData['units']->pluck('unit_name')->unique()->values()->toArray(),
            'cities' => $cities,
            'properties' => $properties,
            'unitsByCity' => $dropdownData['unitsByCity'],
            'propertiesByCity' => $dropdownData['propertiesByCity'],
            'unitsByProperty' => $dropdownData['unitsByProperty'],
            'vendorsByCity' => $dropdownData['vendorsByCity'],
            'vendors' => $dropdownData['vendors'],
        ]);
    }

    public function create(): Response
    {
        $dropdownData = $this->vendorTaskTrackerService->getDropdownData();

        return Inertia::render('VendorTaskTracker/Create', [
            'cities' => $dropdownData['cities'],
            'unitsByCity' => $dropdownData['unitsByCity'],
            'propertiesByCity' => $dropdownData['propertiesByCity'],
            'unitsByProperty' => $dropdownData['unitsByProperty'],
            'vendorsByCity' => $dropdownData['vendorsByCity'],
            'vendors' => $dropdownData['vendors'],
            'units' => $dropdownData['units'],
        ]);
    }

    public function store(StoreVendorTaskTrackerRequest $request): RedirectResponse
    {
        $this->vendorTaskTrackerService->createTask($request->validated());

        return redirect()
            ->route('vendor-task-tracker.index')
            ->with('success', 'Task created successfully.');
    }

    public function show(VendorTaskTracker $vendorTaskTracker): Response
    {
        return Inertia::render('VendorTaskTracker/Show', [
            'task' => $vendorTaskTracker
        ]);
    }

    public function edit(VendorTaskTracker $vendorTaskTracker): Response
    {
        $dropdownData = $this->vendorTaskTrackerService->getDropdownData();

        return Inertia::render('VendorTaskTracker/Edit', [
            'task' => $vendorTaskTracker,
            'cities' => $dropdownData['cities'],
            'unitsByCity' => $dropdownData['unitsByCity'],
            'propertiesByCity' => $dropdownData['propertiesByCity'],
            'unitsByProperty' => $dropdownData['unitsByProperty'],
            'vendorsByCity' => $dropdownData['vendorsByCity'],
            'vendors' => $dropdownData['vendors'],
            'units' => $dropdownData['units'],
        ]);
    }

    public function update(UpdateVendorTaskTrackerRequest $request, VendorTaskTracker $vendorTaskTracker): RedirectResponse
    {
        $this->vendorTaskTrackerService->updateTask($vendorTaskTracker, $request->validated());

        return redirect()
            ->route('vendor-task-tracker.index')
            ->with('success', 'Task updated successfully.');
    }

    public function destroy(VendorTaskTracker $vendorTaskTracker): RedirectResponse
    {
        $this->vendorTaskTrackerService->deleteTask($vendorTaskTracker);

        return redirect()
            ->route('vendor-task-tracker.index')
            ->with('success', 'Task deleted successfully.');
    }
}
