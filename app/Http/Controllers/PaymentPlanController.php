<?php

namespace App\Http\Controllers;

use App\Http\Requests\PaymentPlanStoreRequest;
use App\Http\Requests\PaymentPlanUpdateRequest;
use App\Models\PaymentPlan;
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
        // ID-based filters from request
        $cityId = $request->get('city_id');
        $propertyId = $request->get('property_id');
        $unitId = $request->get('unit_id');
        $tenantId = $request->get('tenant_id');

        // Decide which dataset to retrieve based on filters/search
        if ($cityId || $propertyId || $unitId || $tenantId) {
            $paymentPlans = $this->paymentPlanService->filterPaymentPlansByIds($cityId, $propertyId, $unitId, $tenantId);
        } elseif ($search) {
            $paymentPlans = $this->paymentPlanService->searchPaymentPlans($search);
        } else {
            $paymentPlans = $this->paymentPlanService->getAllPaymentPlans();
        }

        // Transform the data to include the user-friendly names
        $paymentPlans->getCollection()->transform(function ($plan) {
            return [
                'id' => $plan->id,
                'tenant_id' => $plan->tenant_id,
                'tenant' => $plan->tenant ? $plan->tenant->full_name : 'N/A',
                'unit' => $plan->tenant && $plan->tenant->unit ? $plan->tenant->unit->unit_name : 'N/A',
                'property' => $plan->tenant && $plan->tenant->unit && $plan->tenant->unit->property ? $plan->tenant->unit->property->property_name : 'N/A',
                'city_name' => $plan->tenant && $plan->tenant->unit && $plan->tenant->unit->property && $plan->tenant->unit->property->city ? $plan->tenant->unit->property->city->city : 'N/A',
                'amount' => $plan->amount,
                'paid' => $plan->paid,
                'left_to_pay' => $plan->left_to_pay,
                'status' => $plan->status,
                'dates' => $plan->dates,
                'notes' => $plan->notes,
                'created_at' => $plan->created_at,
                'updated_at' => $plan->updated_at,
            ];
        });
            
        $dropdownData = $this->paymentPlanService->getDropdownData();

        return Inertia::render('PaymentPlans/Index', [
            'paymentPlans' => $paymentPlans,
            'search' => $search,
            'filters' => [
                'city_id' => $cityId,
                'property_id' => $propertyId,
                'unit_id' => $unitId,
                'tenant_id' => $tenantId,
            ],
            'cities' => $dropdownData['cities'],
            'properties' => $dropdownData['properties'],
            'propertiesByCityId' => $dropdownData['propertiesByCityId'],
            'unitsByPropertyId' => $dropdownData['unitsByPropertyId'],
            'tenantsByUnitId' => $dropdownData['tenantsByUnitId'],
            'allUnits' => $dropdownData['allUnits'],
            'tenantsData' => $dropdownData['tenantsData'],
        ]);
    }

    public function create()
    {
        $dropdownData = $this->paymentPlanService->getDropdownData();

        return Inertia::render('PaymentPlans/Create', [
            'cities' => $dropdownData['cities'],
            'properties' => $dropdownData['properties'],
            'propertiesByCityId' => $dropdownData['propertiesByCityId'],
            'unitsByPropertyId' => $dropdownData['unitsByPropertyId'],
            'tenantsByUnitId' => $dropdownData['tenantsByUnitId'],
            'allUnits' => $dropdownData['allUnits'],
            'tenantsData' => $dropdownData['tenantsData'],
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

        // Transform the data to include user-friendly names
        $transformedPlan = [
            'id' => $paymentPlan->id,
            'tenant_id' => $paymentPlan->tenant_id,
            'tenant' => $paymentPlan->tenant ? $paymentPlan->tenant->full_name : 'N/A',
            'unit' => $paymentPlan->tenant && $paymentPlan->tenant->unit ? $paymentPlan->tenant->unit->unit_name : 'N/A',
            'property' => $paymentPlan->tenant && $paymentPlan->tenant->unit && $paymentPlan->tenant->unit->property ? $paymentPlan->tenant->unit->property->property_name : 'N/A',
            'city_name' => $paymentPlan->tenant && $paymentPlan->tenant->unit && $paymentPlan->tenant->unit->property && $paymentPlan->tenant->unit->property->city ? $paymentPlan->tenant->unit->property->city->city : 'N/A',
            'amount' => $paymentPlan->amount,
            'paid' => $paymentPlan->paid,
            'left_to_pay' => $paymentPlan->left_to_pay,
            'status' => $paymentPlan->status,
            'dates' => $paymentPlan->dates,
            'notes' => $paymentPlan->notes,
            'created_at' => $paymentPlan->created_at,
            'updated_at' => $paymentPlan->updated_at,
        ];

        return Inertia::render('PaymentPlans/Show', [
            'paymentPlan' => $transformedPlan
        ]);
    }

    public function edit($id)
    {
        $paymentPlan = $this->paymentPlanService->getPaymentPlan($id);
        $dropdownData = $this->paymentPlanService->getDropdownData();

        // Transform the data to include user-friendly names
        $transformedPlan = [
            'id' => $paymentPlan->id,
            'tenant_id' => $paymentPlan->tenant_id,
            'tenant' => $paymentPlan->tenant ? $paymentPlan->tenant->full_name : 'N/A',
            'unit' => $paymentPlan->tenant && $paymentPlan->tenant->unit ? $paymentPlan->tenant->unit->unit_name : 'N/A',
            'property' => $paymentPlan->tenant && $paymentPlan->tenant->unit && $paymentPlan->tenant->unit->property ? $paymentPlan->tenant->unit->property->property_name : 'N/A',
            'city_name' => $paymentPlan->tenant && $paymentPlan->tenant->unit && $paymentPlan->tenant->unit->property && $paymentPlan->tenant->unit->property->city ? $paymentPlan->tenant->unit->property->city->city : 'N/A',
            'amount' => $paymentPlan->amount,
            'paid' => $paymentPlan->paid,
            'left_to_pay' => $paymentPlan->left_to_pay,
            'status' => $paymentPlan->status,
            'dates' => $paymentPlan->dates,
            'notes' => $paymentPlan->notes,
            'created_at' => $paymentPlan->created_at,
            'updated_at' => $paymentPlan->updated_at,
        ];

        return Inertia::render('PaymentPlans/Edit', [
            'paymentPlan' => $transformedPlan,
            'cities' => $dropdownData['cities'],
            'properties' => $dropdownData['properties'],
            'propertiesByCityId' => $dropdownData['propertiesByCityId'],
            'unitsByPropertyId' => $dropdownData['unitsByPropertyId'],
            'tenantsByUnitId' => $dropdownData['tenantsByUnitId'],
            'allUnits' => $dropdownData['allUnits'],
            'tenantsData' => $dropdownData['tenantsData'],
        ]);
    }

    public function update(PaymentPlanUpdateRequest $request, PaymentPlan $payment_plan)
    {
        $this->paymentPlanService->updatePaymentPlan($payment_plan->id, $request->validated());

        return redirect()->route('payment-plans.index')
            ->with('success', 'Payment plan updated successfully.');
    }

    public function destroy($id)
    {
        $this->paymentPlanService->deletePaymentPlan($id);

        return redirect()->route('payment-plans.index')
            ->with('success', 'Payment plan deleted successfully.');
    }

    public function getTenants()
    {
        $tenants = $this->paymentPlanService->getTenantsForDropdown();
        
        return response()->json($tenants);
    }
}
