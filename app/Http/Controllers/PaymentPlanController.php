<?php

namespace App\Http\Controllers;

use App\Http\Requests\PaymentPlanStoreRequest;
use App\Http\Requests\PaymentPlanUpdateRequest;
use App\Services\PaymentPlanService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentPlanController extends Controller
{
    protected $paymentPlanService;

    public function __construct(PaymentPlanService $paymentPlanService)
    {
        $this->paymentPlanService = $paymentPlanService;

        $this->middleware('permission:payment-plans.index')->only('index');
        $this->middleware('permission:payment-plans.create')->only('create');
        $this->middleware('permission:payment-plans.store')->only('store');
        $this->middleware('permission:payment-plans.show')->only('show');
        $this->middleware('permission:payment-plans.edit')->only('edit');
        $this->middleware('permission:payment-plans.update')->only('update');
        $this->middleware('permission:payment-plans.destroy')->only('destroy');
    }

    public function index(Request $request)
    {
        $search = $request->get('search');
        
        $paymentPlans = $search 
            ? $this->paymentPlanService->searchPaymentPlans($search)
            : $this->paymentPlanService->getAllPaymentPlans();
            
        $dropdownData = $this->paymentPlanService->getDropdownData();

        return Inertia::render('PaymentPlans/Index', [
            'paymentPlans' => $paymentPlans,
            'search' => $search,
            'dropdownData' => $dropdownData
        ]);
    }

    public function create()
    {
        $dropdownData = $this->paymentPlanService->getDropdownData();

        return Inertia::render('PaymentPlans/Create', [
            'dropdownData' => $dropdownData
        ]);
    }

    public function store(PaymentPlanStoreRequest $request)
    {
        $this->paymentPlanService->createPaymentPlan($request->validated());

        return redirect()->route('payment-plans.index')
            ->with('success', 'Payment plan created successfully.');
    }

    public function show($id)
    {
        $paymentPlan = $this->paymentPlanService->getPaymentPlan($id);

        return Inertia::render('PaymentPlans/Show', [
            'paymentPlan' => $paymentPlan
        ]);
    }

    public function edit($id)
    {
        $paymentPlan = $this->paymentPlanService->getPaymentPlan($id);
        $dropdownData = $this->paymentPlanService->getDropdownData();

        return Inertia::render('PaymentPlans/Edit', [
            'paymentPlan' => $paymentPlan,
            'dropdownData' => $dropdownData
        ]);
    }

    public function update(PaymentPlanUpdateRequest $request, $id)
    {
        $this->paymentPlanService->updatePaymentPlan($id, $request->validated());

        return redirect()->route('payment-plans.index')
        ->with('success', 'Payment plan updated successfully.');
    }

    public function destroy($id)
    {
        $this->paymentPlanService->deletePaymentPlan($id);

        return redirect()->route('payment-plans.index')
    ->with('success', 'Payment plan deleted successfully.');
    }
}
