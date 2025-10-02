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

        // Update all payment statuses before displaying
        $this->paymentService->updateAllStatuses();

        $payments = $search
            ? $this->paymentService->searchPayments($search)
            : $this->paymentService->getAllPayments();

        // Get dropdown data for the create drawer
        $dropdownData = $this->paymentService->getUnitsForDropdowns();

        return Inertia::render('Payments/Index', [
            'payments' => $payments,
            'search' => $search,
            'cities' => $dropdownData['cities'],
            'unitsByCity' => $dropdownData['unitsByCity'],
            'units' => $dropdownData['units'],
        ]);
    }

    public function create(): Response
    {
        $dropdownData = $this->paymentService->getUnitsForDropdowns();

        return Inertia::render('Payments/Create', [
            'cities' => $dropdownData['cities'],
            'unitsByCity' => $dropdownData['unitsByCity'],
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
        return Inertia::render('Payments/Show', [
            'payment' => $payment
        ]);
    }

    public function edit(Payment $payment): Response
    {
        $dropdownData = $this->paymentService->getUnitsForDropdowns();

        return Inertia::render('Payments/Edit', [
            'payment' => $payment,
            'cities' => $dropdownData['cities'],
            'unitsByCity' => $dropdownData['unitsByCity'],
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
