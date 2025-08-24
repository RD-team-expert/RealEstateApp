<?php
// app/Http/Controllers/UnitController.php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUnitRequest;
use App\Http\Requests\UpdateUnitRequest;
use App\Models\Cities;
use App\Services\UnitService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class UnitController extends Controller
{
    public function __construct(
        private UnitService $unitService
    ) {
        $this->middleware('permission:units.index')->only('index');
        $this->middleware('permission:units.create')->only('create');
        $this->middleware('permission:units.store')->only('store');
        $this->middleware('permission:units.show')->only('show');
        $this->middleware('permission:units.edit')->only('edit');
        $this->middleware('permission:units.update')->only('update');
        $this->middleware('permission:units.destroy')->only('destroy');
    }

    public function index(Request $request): Response
    {
        $perPage = $request->get('per_page', 15);
        $filters = $request->only(['city', 'property', 'unit_name', 'vacant', 'listed', 'insurance']);

        $units = $this->unitService->getAllPaginated($perPage, $filters);
        $statistics = $this->unitService->getStatistics();

        return Inertia::render('Units/Index', [
            'units' => $units,
            'statistics' => $statistics,
            'filters' => $filters,
        ]);
    }

    public function create(): Response
    {
        $cities = Cities::all();
        return Inertia::render('Units/Create',[
        'cities' => $cities
    ]);
    }

    public function store(StoreUnitRequest $request): RedirectResponse
    {
        try {
            $this->unitService->create($request->validated());

            return redirect()->route('units.index')
                ->with('success', 'Unit created successfully');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to create unit: ' . $e->getMessage())
                ->withInput();
        }
    }
    // public function create(): Response
    // {
    //     $cities = \App\Models\Cities::all(); // or use a service method

    //     return Inertia::render('Units/Create', [
    //         'cities' => $cities
    //     ]);
    // }

    // public function edit(string $id): Response
    // {
    //     $unit = $this->unitService->findById((int) $id);
    //     $cities = \App\Models\Cities::all(); // or use a service method

    //     return Inertia::render('Units/Edit', [
    //         'unit' => $unit,
    //         'cities' => $cities
    //     ]);
    // }

    public function show(string $id): Response
    {
        $unit = $this->unitService->findById((int) $id);

        return Inertia::render('Units/Show', [
            'unit' => $unit,
        ]);
    }

    public function edit(string $id): Response
    {
        $unit = $this->unitService->findById((int) $id);
        $cities = Cities::all();
        return Inertia::render('Units/Edit', [
            'unit' => $unit,
            'cities' => $cities
        ]);
    }

    public function update(UpdateUnitRequest $request, string $id): RedirectResponse
    {
        try {
            $unit = $this->unitService->findById((int) $id);
            $this->unitService->update($unit, $request->validated());

            return redirect()->route('units.index')
                ->with('success', 'Unit updated successfully');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to update unit: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function destroy(string $id): RedirectResponse
    {
        try {
            $unit = $this->unitService->findById((int) $id);
            $this->unitService->delete($unit);

            return redirect()->route('units.index')
                ->with('success', 'Unit deleted successfully');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to delete unit: ' . $e->getMessage());
        }
    }

    public function dashboard(): Response
    {
        $statistics = $this->unitService->getStatistics();
        $vacantUnits = $this->unitService->getVacantUnits();
        $listedUnits = $this->unitService->getListedUnits();

        return Inertia::render('Units/Dashboard', [
            'statistics' => $statistics,
            'vacantUnits' => $vacantUnits,
            'listedUnits' => $listedUnits,
        ]);
    }
}
