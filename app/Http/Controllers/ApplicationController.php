<?php
// app/Http/Controllers/ApplicationController.php

namespace App\Http\Controllers;

use App\Http\Requests\StoreApplicationRequest;
use App\Http\Requests\UpdateApplicationRequest;
use App\Models\Application;
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
        $filters = $request->only(['property', 'name', 'co_signer', 'unit', 'status', 'stage_in_progress', 'date_from', 'date_to']);

        $applications = $this->applicationService->getAllPaginated($perPage, $filters);
        $statistics = $this->applicationService->getStatistics();

        return Inertia::render('Applications/Index', [
            'applications' => $applications,
            'statistics' => $statistics,
            'filters' => $filters,
            // Remove the statuses and stages arrays
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Applications/Create');
        // Remove the statuses and stages arrays
    }

    public function store(StoreApplicationRequest $request): RedirectResponse
    {
        try {
            $this->applicationService->create($request->validated());

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

    return Inertia::render('Applications/Edit', [
        'application' => $application,
    ]);
}

public function update(UpdateApplicationRequest $request, string $id): RedirectResponse
{
    try {
        $application = $this->applicationService->findById((int) $id);
        $this->applicationService->update($application, $request->validated());

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
        $this->applicationService->delete($application);

        return redirect()->route('applications.index')
            ->with('success', 'Application deleted successfully');
    } catch (\Exception $e) {
        return redirect()->back()
            ->with('error', 'Failed to delete application: ' . $e->getMessage());
    }
}

    public function dashboard(): Response
    {
        $statistics = $this->applicationService->getStatistics();
        $recentApplications = $this->applicationService->getRecentApplications(10);
        $thisMonthApplications = $this->applicationService->getApplicationsThisMonth();

        return Inertia::render('Applications/Dashboard', [
            'statistics' => $statistics,
            'recentApplications' => $recentApplications,
            'thisMonthApplications' => $thisMonthApplications,
        ]);
    }

    public function byStatus(string $status): Response
    {
        $applications = $this->applicationService->getByStatus($status);

        return Inertia::render('Applications/ByStatus', [
            'applications' => $applications,
            'status' => $status,
            'statusName' => $status, // Use the status as-is since no predefined mapping
        ]);
    }

    public function byStage(string $stage): Response
    {
        $applications = $this->applicationService->getByStage($stage);

        return Inertia::render('Applications/ByStage', [
            'applications' => $applications,
            'stage' => $stage,
            'stageName' => $stage, // Use the stage as-is since no predefined mapping
        ]);
    }
}
