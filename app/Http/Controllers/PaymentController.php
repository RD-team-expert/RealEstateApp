<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePaymentRequest;
use App\Http\Requests\UpdatePaymentRequest;
use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function __construct(
        protected PaymentService $paymentService
    ) {
        $this->middleware('permission:payments.index')->only('index');
        $this->middleware('permission:payments.create')->only('create');
        $this->middleware('permission:payments.store')->only('store');
        $this->middleware('permission:payments.show')->only('show');
        $this->middleware('permission:payments.edit')->only('edit');
        $this->middleware('permission:payments.update')->only('update');
        $this->middleware('permission:payments.destroy')->only('destroy');
    }

    public function index(Request $request): Response
    {
        $search = $request->get('search');
        $cityFilter = $request->get('city');
        $propertyFilter = $request->get('property');
        $unitFilter = $request->get('unit');

        // Update all payment statuses before displaying
        $this->paymentService->updateAllStatuses();

        // Handle filtering
        if ($cityFilter || $propertyFilter || $unitFilter) {
            $payments = $this->paymentService->filterPayments($cityFilter, $propertyFilter, $unitFilter);
        } elseif ($search) {
            $payments = $this->paymentService->searchPayments($search);
        } else {
            $payments = $this->paymentService->getAllPayments();
        }

        // Transform payments to include relationship data for the frontend
        $payments->getCollection()->transform(function ($payment) {
            return [
                'id' => $payment->id,
                'date' => $payment->date,
                'unit_id' => $payment->unit_id,
                'owes' => $payment->owes,
                'paid' => $payment->paid ?? 0,
                'left_to_pay' => $payment->left_to_pay,
                'status' => $payment->status,
                'notes' => $payment->notes,
                'reversed_payments' => $payment->reversed_payments,
                'permanent' => $payment->permanent,
                'is_archived' => $payment->is_archived,
                'created_at' => $payment->created_at,
                'updated_at' => $payment->updated_at,
                // Add relationship data for display
                'city' => $payment->unit && $payment->unit->property && $payment->unit->property->city 
                    ? $payment->unit->property->city->city : 'N/A',
                'property_name' => $payment->unit && $payment->unit->property 
                    ? $payment->unit->property->property_name : 'N/A',
                'unit_name' => $payment->unit ? $payment->unit->unit_name : 'N/A',
            ];
        });

        // Get dropdown data for the create drawer
        $dropdownData = $this->paymentService->getUnitsForDropdowns();

        // Get all cities and properties from database
        $allCities = $this->paymentService->getAllCities();
        $allProperties = $this->paymentService->getAllProperties();

        return Inertia::render('Payments/Index', [
            'payments' => $payments,
            'search' => $search,
            'filters' => [
                'city' => $cityFilter,
                'property' => $propertyFilter,
                'unit' => $unitFilter,
            ],
            'cities' => $dropdownData['cities'],
            'properties' => $dropdownData['properties'],
            'unitsByCity' => $dropdownData['unitsByCity'],
            'unitsByProperty' => $dropdownData['unitsByProperty'],
            'propertiesByCity' => $dropdownData['propertiesByCity'],
            'units' => $dropdownData['units'],
            'allCities' => $allCities,
            'allProperties' => $allProperties,
        ]);
    }

    public function create(): Response
    {
        $dropdownData = $this->paymentService->getUnitsForDropdowns();

        return Inertia::render('Payments/Create', [
            'cities' => $dropdownData['cities'],
            'properties' => $dropdownData['properties'],
            'unitsByCity' => $dropdownData['unitsByCity'],
            'unitsByProperty' => $dropdownData['unitsByProperty'],
            'propertiesByCity' => $dropdownData['propertiesByCity'],
            'units' => $dropdownData['units'],
        ]);
    }

    public function store(StorePaymentRequest $request): RedirectResponse
    {
        $this->paymentService->createPayment($request->validated());

        return redirect()
            ->route('payments.index')
            ->with('success', 'Payment created successfully.');
    }

    public function show(Payment $payment): Response
    {
        // Load relationships for display
        $payment->load(['unit.property.city']);

        // Transform for consistent display
        $paymentData = [
            'id' => $payment->id,
            'date' => $payment->date,
            'unit_id' => $payment->unit_id,
            'owes' => $payment->owes,
            'paid' => $payment->paid ?? 0,
            'left_to_pay' => $payment->left_to_pay,
            'status' => $payment->status,
            'notes' => $payment->notes,
            'reversed_payments' => $payment->reversed_payments,
            'permanent' => $payment->permanent,
            'is_archived' => $payment->is_archived,
            'created_at' => $payment->created_at,
            'updated_at' => $payment->updated_at,
            // Add relationship data for display
            'city' => $payment->unit && $payment->unit->property && $payment->unit->property->city 
                ? $payment->unit->property->city->city : 'N/A',
            'property_name' => $payment->unit && $payment->unit->property 
                ? $payment->unit->property->property_name : 'N/A',
            'unit_name' => $payment->unit ? $payment->unit->unit_name : 'N/A',
        ];

        return Inertia::render('Payments/Show', [
            'payment' => $paymentData
        ]);
    }

    public function edit(Payment $payment): Response
    {
        // Load relationships for display
        $payment->load(['unit.property.city']);

        $dropdownData = $this->paymentService->getUnitsForDropdowns();

        // Transform for consistent display
        $paymentData = [
            'id' => $payment->id,
            'date' => $payment->date,
            'unit_id' => $payment->unit_id,
            'owes' => $payment->owes,
            'paid' => $payment->paid ?? 0,
            'left_to_pay' => $payment->left_to_pay,
            'status' => $payment->status,
            'notes' => $payment->notes,
            'reversed_payments' => $payment->reversed_payments,
            'permanent' => $payment->permanent,
            'is_archived' => $payment->is_archived,
            'created_at' => $payment->created_at,
            'updated_at' => $payment->updated_at,
            // Add relationship data for display
            'city' => $payment->unit && $payment->unit->property && $payment->unit->property->city 
                ? $payment->unit->property->city->city : 'N/A',
            'property_name' => $payment->unit && $payment->unit->property 
                ? $payment->unit->property->property_name : 'N/A',
            'unit_name' => $payment->unit ? $payment->unit->unit_name : 'N/A',
        ];

        return Inertia::render('Payments/Edit', [
            'payment' => $paymentData,
            'cities' => $dropdownData['cities'],
            'properties' => $dropdownData['properties'],
            'unitsByCity' => $dropdownData['unitsByCity'],
            'unitsByProperty' => $dropdownData['unitsByProperty'],
            'propertiesByCity' => $dropdownData['propertiesByCity'],
            'units' => $dropdownData['units'],
        ]);
    }

    public function update(UpdatePaymentRequest $request, Payment $payment): RedirectResponse
    {
        $this->paymentService->updatePayment($payment, $request->validated());

        return redirect()
            ->route('payments.index')
            ->with('success', 'Payment updated successfully.');
    }

    public function destroy(Payment $payment): RedirectResponse
    {
        $this->paymentService->deletePayment($payment);

        return redirect()
            ->route('payments.index')
            ->with('success', 'Payment deleted successfully.');
    }
}
