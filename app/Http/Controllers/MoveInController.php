<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMoveInRequest;
use App\Http\Requests\UpdateMoveInRequest;
use App\Models\MoveIn;
use App\Services\MoveInService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MoveInController extends Controller
{
    public function __construct(
        protected MoveInService $moveInService
    ) {
        $this->middleware('permission:move-in.index')->only('index');
        $this->middleware('permission:move-in.store')->only('store');
        $this->middleware('permission:move-in.show')->only('show');
        $this->middleware('permission:move-in.update')->only('update');
        $this->middleware('permission:move-in.destroy')->only('destroy');
    }

    public function index(Request $request): Response
    {
        $search = $request->get('search');

        $moveIns = $search
            ? $this->moveInService->searchMoveIns($search)
            : $this->moveInService->getAllMoveIns();

        $dropdownData = $this->moveInService->getUnitsForDropdown();

        return Inertia::render('MoveIn/Index', [
            'moveIns' => $moveIns,
            'search' => $search,
            'units' => $dropdownData['units'],
        ]);
    }

    public function store(StoreMoveInRequest $request): RedirectResponse
    {
        $this->moveInService->createMoveIn($request->validated());

        return redirect()
            ->route('move-in.index')
            ->with('success', 'Move-in record created successfully.');
    }

    public function show(MoveIn $moveIn): Response
    {
        return Inertia::render('MoveIn/Show', [
            'moveIn' => $moveIn
        ]);
    }

    public function update(UpdateMoveInRequest $request, MoveIn $moveIn): RedirectResponse
    {
        $this->moveInService->updateMoveIn($moveIn, $request->validated());

        return redirect()
            ->route('move-in.index')
            ->with('success', 'Move-in record updated successfully.');
    }

    public function destroy(MoveIn $moveIn): RedirectResponse
    {
        $this->moveInService->deleteMoveIn($moveIn);

        return redirect()
            ->route('move-in.index')
            ->with('success', 'Move-in record deleted successfully.');
    }
}
