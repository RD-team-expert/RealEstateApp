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
        $filters = $request->only(['search', 'city', 'property', 'unit_name', 'vendor_name']);

        // Check if any filters are applied
        $hasFilters = array_filter($filters, function($value) {
            return !empty($value);
        });

        $tasks = $hasFilters
            ? $this->vendorTaskTrackerService->filterTasks($filters)
            : $this->vendorTaskTrackerService->getAllTasks();

        // Transform tasks to include name fields for frontend display
        $tasks->transform(function ($task) {
            // Add computed attributes for frontend
            $task->city = $task->unit?->property?->city?->city ?? '';
            $task->property_name = $task->unit?->property?->property_name ?? '';
            $task->unit_name = $task->unit?->unit_name ?? '';
            $task->vendor_name = $task->vendor?->vendor_name ?? '';
            return $task;
        });

        // Get dropdown data for the create drawer
        $dropdownData = $this->vendorTaskTrackerService->getDropdownData();

        return Inertia::render('VendorTaskTracker/Index', [
            'tasks' => [
                'data' => $tasks,
                'links' => [],
                'meta' => [
                    'total' => $tasks->count(),
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => $tasks->count(),
                    'from' => $tasks->count() > 0 ? 1 : null,
                    'to' => $tasks->count(),
                ]
            ],
            'filters' => $filters,
            'cities' => $dropdownData['cities'],
            'properties' => $dropdownData['properties'],
            'units' => $dropdownData['units'],
            'vendors' => $dropdownData['vendors'],
            'unitsByCity' => $dropdownData['unitsByCity'],
            'propertiesByCity' => $dropdownData['propertiesByCity'],
            'unitsByProperty' => $dropdownData['unitsByProperty'],
            'vendorsByCity' => $dropdownData['vendorsByCity'],
        ]);
    }

    public function create(): Response
    {
        $dropdownData = $this->vendorTaskTrackerService->getDropdownData();

        return Inertia::render('VendorTaskTracker/Create', [
            'cities' => $dropdownData['cities'],
            'properties' => $dropdownData['properties'],
            'units' => $dropdownData['units'],
            'vendors' => $dropdownData['vendors'],
            'unitsByCity' => $dropdownData['unitsByCity'],
            'propertiesByCity' => $dropdownData['propertiesByCity'],
            'unitsByProperty' => $dropdownData['unitsByProperty'],
            'vendorsByCity' => $dropdownData['vendorsByCity'],
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
        // Load relationships for display
        $vendorTaskTracker->load(['vendor.city', 'unit.property.city']);
        
        // Add computed attributes for frontend
        $vendorTaskTracker->city = $vendorTaskTracker->unit?->property?->city?->city ?? '';
        $vendorTaskTracker->property_name = $vendorTaskTracker->unit?->property?->property_name ?? '';
        $vendorTaskTracker->unit_name = $vendorTaskTracker->unit?->unit_name ?? '';
        $vendorTaskTracker->vendor_name = $vendorTaskTracker->vendor?->vendor_name ?? '';

        return Inertia::render('VendorTaskTracker/Show', [
            'task' => $vendorTaskTracker
        ]);
    }

    public function edit(VendorTaskTracker $vendorTaskTracker): Response
    {
        // Load relationships for display
        $vendorTaskTracker->load(['vendor.city', 'unit.property.city']);
        
        // Add computed attributes for frontend
        $vendorTaskTracker->city = $vendorTaskTracker->unit?->property?->city?->city ?? '';
        $vendorTaskTracker->property_name = $vendorTaskTracker->unit?->property?->property_name ?? '';
        $vendorTaskTracker->unit_name = $vendorTaskTracker->unit?->unit_name ?? '';
        $vendorTaskTracker->vendor_name = $vendorTaskTracker->vendor?->vendor_name ?? '';

        $dropdownData = $this->vendorTaskTrackerService->getDropdownData();

        return Inertia::render('VendorTaskTracker/Edit', [
            'task' => $vendorTaskTracker,
            'cities' => $dropdownData['cities'],
            'properties' => $dropdownData['properties'],
            'units' => $dropdownData['units'],
            'vendors' => $dropdownData['vendors'],
            'unitsByCity' => $dropdownData['unitsByCity'],
            'propertiesByCity' => $dropdownData['propertiesByCity'],
            'unitsByProperty' => $dropdownData['unitsByProperty'],
            'vendorsByCity' => $dropdownData['vendorsByCity'],
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
            ->with('success', 'Task archived successfully.');
    }

    /**
     * Export tasks data
     */
    public function export()
    {
        $tasks = $this->vendorTaskTrackerService->getTasksForExport();
        
        return response()->json($tasks);
    }
}
