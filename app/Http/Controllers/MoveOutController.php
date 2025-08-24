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
        $search = $request->get('search');

        $moveOuts = $search
            ? $this->moveOutService->searchMoveOuts($search)
            : $this->moveOutService->getAllMoveOuts();

        return Inertia::render('MoveOut/Index', [
            'moveOuts' => $moveOuts,
            'search' => $search,
        ]);
    }

    public function create(): Response
    {
        $dropdownData = $this->moveOutService->getDropdownData();

        return Inertia::render('MoveOut/Create', [
            'tenants' => $dropdownData['tenants'],
            'unitsByTenant' => $dropdownData['unitsByTenant'],
            'tenantsData' => $dropdownData['tenantsData'],
        ]);
    }

    public function store(StoreMoveOutRequest $request): RedirectResponse
    {
        $this->moveOutService->createMoveOut($request->validated());

        return redirect()
            ->route('move-out.index')
            ->with('success', 'Move-out record created successfully.');
    }

    public function show(MoveOut $moveOut): Response
    {
        return Inertia::render('MoveOut/Show', [
            'moveOut' => $moveOut
        ]);
    }

    public function edit(MoveOut $moveOut): Response
    {
        $dropdownData = $this->moveOutService->getDropdownData();

        return Inertia::render('MoveOut/Edit', [
            'moveOut' => $moveOut,
            'tenants' => $dropdownData['tenants'],
            'unitsByTenant' => $dropdownData['unitsByTenant'],
            'tenantsData' => $dropdownData['tenantsData'],
        ]);
    }

    public function update(UpdateMoveOutRequest $request, MoveOut $moveOut): RedirectResponse
    {
        $this->moveOutService->updateMoveOut($moveOut, $request->validated());

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
