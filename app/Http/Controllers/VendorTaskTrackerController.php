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
    ) {}

    public function index(Request $request): Response
    {
        $search = $request->get('search');

        $tasks = $search
            ? $this->vendorTaskTrackerService->searchTasks($search)
            : $this->vendorTaskTrackerService->getAllTasks();

        return Inertia::render('VendorTaskTracker/Index', [
            'tasks' => $tasks,
            'search' => $search,
        ]);
    }

    public function create(): Response
    {
        $dropdownData = $this->vendorTaskTrackerService->getDropdownData();

        return Inertia::render('VendorTaskTracker/Create', [
            'cities' => $dropdownData['cities'],
            'unitsByCity' => $dropdownData['unitsByCity'],
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
