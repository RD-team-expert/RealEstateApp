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
        $filters = $request->only(['search', 'city', 'property']);

        // Clean empty filters
        $filters = array_filter($filters, function($value) {
            return !empty(trim($value));
        });

        $moveIns = !empty($filters)
            ? $this->moveInService->searchMoveIns($filters)
            : $this->moveInService->getAllMoveIns();

        $dropdownData = $this->moveInService->getDropdownData();

        // Transform move-ins data to include unit information
        $transformedMoveIns = $moveIns->through(function ($moveIn) {
            return [
                'id' => $moveIn->id,
                'unit_id' => $moveIn->unit_id,
                'unit_name' => $moveIn->unit?->unit_name ?? 'N/A',
                'city_name' => $moveIn->unit?->property?->city?->city ?? 'N/A',
                'property_name' => $moveIn->unit?->property?->property_name ?? 'N/A',
                'signed_lease' => $moveIn->signed_lease,
                'lease_signing_date' => $moveIn->lease_signing_date,
                'move_in_date' => $moveIn->move_in_date,
                'paid_security_deposit_first_month_rent' => $moveIn->paid_security_deposit_first_month_rent,
                'scheduled_paid_time' => $moveIn->scheduled_paid_time,
                'handled_keys' => $moveIn->handled_keys,
                'move_in_form_sent_date' => $moveIn->move_in_form_sent_date,
                'filled_move_in_form' => $moveIn->filled_move_in_form,
                'date_of_move_in_form_filled' => $moveIn->date_of_move_in_form_filled,
                'submitted_insurance' => $moveIn->submitted_insurance,
                'date_of_insurance_expiration' => $moveIn->date_of_insurance_expiration,
                'is_archived' => $moveIn->is_archived,
                'created_at' => $moveIn->created_at,
                'updated_at' => $moveIn->updated_at,
            ];
        });

        return Inertia::render('MoveIn/Index', [
            'moveIns' => $transformedMoveIns,
            'search' => $search,
            'filters' => $filters,
            'units' => $dropdownData['units'],
            'cities' => $dropdownData['cities'],
            'properties' => $dropdownData['properties'],
            'unitsByProperty' => $dropdownData['unitsByProperty'],
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
        $moveIn->load(['unit.property.city']);
        
        return Inertia::render('MoveIn/Show', [
            'moveIn' => [
                'id' => $moveIn->id,
                'unit_id' => $moveIn->unit_id,
                'unit_name' => $moveIn->unit?->unit_name ?? 'N/A',
                'city_name' => $moveIn->unit?->property?->city?->city ?? 'N/A',
                'property_name' => $moveIn->unit?->property?->property_name ?? 'N/A',
                'signed_lease' => $moveIn->signed_lease,
                'lease_signing_date' => $moveIn->lease_signing_date,
                'move_in_date' => $moveIn->move_in_date,
                'paid_security_deposit_first_month_rent' => $moveIn->paid_security_deposit_first_month_rent,
                'scheduled_paid_time' => $moveIn->scheduled_paid_time,
                'handled_keys' => $moveIn->handled_keys,
                'move_in_form_sent_date' => $moveIn->move_in_form_sent_date,
                'filled_move_in_form' => $moveIn->filled_move_in_form,
                'date_of_move_in_form_filled' => $moveIn->date_of_move_in_form_filled,
                'submitted_insurance' => $moveIn->submitted_insurance,
                'date_of_insurance_expiration' => $moveIn->date_of_insurance_expiration,
                'is_archived' => $moveIn->is_archived,
                'created_at' => $moveIn->created_at,
                'updated_at' => $moveIn->updated_at,
            ]
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
