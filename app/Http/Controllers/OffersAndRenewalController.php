<?php

namespace App\Http\Controllers;

use App\Http\Requests\OffersAndRenewalRequest;
use App\Models\OffersAndRenewal;
use App\Models\Tenant;
use App\Models\Unit;
use App\Models\PropertyInfoWithoutInsurance;
use App\Models\Cities;
use App\Services\OffersAndRenewalService;
use Inertia\Inertia;
use Illuminate\Http\Request;

class OffersAndRenewalController extends Controller
{
    protected $service;

    public function __construct(OffersAndRenewalService $service)
    {
        $this->service = $service;

        $this->middleware('permission:offers-and-renewals.index')->only('index');
        $this->middleware('permission:offers-and-renewals.create')->only('create');
        $this->middleware('permission:offers-and-renewals.store')->only('store');
        $this->middleware('permission:offers-and-renewals.show')->only('show');
        $this->middleware('permission:offers-and-renewals.edit')->only('edit');
        $this->middleware('permission:offers-and-renewals.update')->only('update');
        $this->middleware('permission:offers-and-renewals.destroy')->only('destroy');
    }

    public function index(Request $request)
    {
        // Calculate expiration for all non-archived records when index is refreshed
        OffersAndRenewal::query()->get()->each(function ($offer) {
            $offer->calculateExpiry();
            $offer->saveQuietly(); // Use saveQuietly to avoid triggering boot again
        });

        // Get filters from request - now supporting both ID-based and name-based filtering
        $filters = [
            'unit_id' => $request->get('unit_id'),
            'tenant_id' => $request->get('tenant_id'),
            'city_id' => $request->get('city_id'),
            'property_id' => $request->get('property_id'),
        ];

        // Get name-based filters
        $nameFilters = [
            'city_name' => $request->get('city_name'),
            'property_name' => $request->get('property_name'),
            'unit_name' => $request->get('unit_name'),
            'tenant_name' => $request->get('tenant_name'),
        ];

        // Use filtered search if any filters are provided
        $hasIdFilters = array_filter($filters);
        $hasNameFilters = array_filter($nameFilters);
        
        if ($hasNameFilters) {
            // Use name-based filtering
            $offers = $this->service->searchOffersWithNameFilters($nameFilters);
        } elseif ($hasIdFilters) {
            // Use ID-based filtering (legacy support)
            $offers = $this->service->searchOffersWithFilters($filters);
        } else {
            // No filters, get all offers
            $offers = $this->service->getAllOffers();
        }

        // Transform offers data to include relationship data as direct properties
        $offers->getCollection()->transform(function ($offer) {
            return [
                'id' => $offer->id,
                'tenant_id' => $offer->tenant_id,
                'city_name' => $offer->tenant && $offer->tenant->unit && $offer->tenant->unit->property && $offer->tenant->unit->property->city 
                    ? $offer->tenant->unit->property->city->city : null,
                'property' => $offer->tenant && $offer->tenant->unit && $offer->tenant->unit->property 
                    ? $offer->tenant->unit->property->property_name : null,
                'unit' => $offer->tenant && $offer->tenant->unit ? $offer->tenant->unit->unit_name : null,
                'tenant' => $offer->tenant ? $offer->tenant->full_name : null,
                'date_sent_offer' => $offer->date_sent_offer,
                'date_offer_expires' => $offer->date_offer_expires,
                'status' => $offer->status,
                'date_of_acceptance' => $offer->date_of_acceptance,
                'last_notice_sent' => $offer->last_notice_sent,
                'notice_kind' => $offer->notice_kind,
                'lease_sent' => $offer->lease_sent,
                'date_sent_lease' => $offer->date_sent_lease,
                'lease_expires' => $offer->lease_expires,
                'lease_signed' => $offer->lease_signed,
                'date_signed' => $offer->date_signed,
                'last_notice_sent_2' => $offer->last_notice_sent_2,
                'notice_kind_2' => $offer->notice_kind_2,
                'notes' => $offer->notes,
                'how_many_days_left' => $offer->how_many_days_left,
                'expired' => $offer->expired,
                'is_archived' => $offer->is_archived,
                'created_at' => $offer->created_at,
                'updated_at' => $offer->updated_at,
            ];
        });

        // Get dropdown data for the create/edit drawers
        $dropdownData = $this->service->getDropdownData();

        return Inertia::render('OffersAndRenewals/Index', [
            'offers' => $offers,
            'unit_id' => $filters['unit_id'],
            'tenant_id' => $filters['tenant_id'],
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
        $dropdownData = $this->service->getDropdownData();
        
        return Inertia::render('OffersAndRenewals/Create', [
            'hierarchicalData' => $dropdownData['hierarchicalData'],
            'cities' => $dropdownData['cities'],
            'properties' => $dropdownData['properties'],
            'propertiesByCityId' => $dropdownData['propertiesByCityId'],
            'unitsByPropertyId' => $dropdownData['unitsByPropertyId'],
            'tenantsByUnitId' => $dropdownData['tenantsByUnitId'],
            'allUnits' => $dropdownData['allUnits'],
            'tenantsData' => $dropdownData['tenantsData'],
        ]);
    }

    public function store(OffersAndRenewalRequest $request)
    {
        $offer = $this->service->createOffer($request->validatedWithTenantId());
        return redirect()->route('offers_and_renewals.index')->with('success', 'Offer created successfully.');
    }

    public function show(OffersAndRenewal $offers_and_renewal)
    {
        // Load the offer with relationships
        $offerWithRelations = $this->service->getOfferWithRelations($offers_and_renewal->id);

        // Transform the data to include relationship properties
        $transformedOffer = [
            'id' => $offerWithRelations->id,
            'tenant_id' => $offerWithRelations->tenant_id,
            'city_name' => $offerWithRelations->tenant && $offerWithRelations->tenant->unit && $offerWithRelations->tenant->unit->property && $offerWithRelations->tenant->unit->property->city 
                ? $offerWithRelations->tenant->unit->property->city->city : null,
            'property' => $offerWithRelations->tenant && $offerWithRelations->tenant->unit && $offerWithRelations->tenant->unit->property 
                ? $offerWithRelations->tenant->unit->property->property_name : null,
            'unit' => $offerWithRelations->tenant && $offerWithRelations->tenant->unit ? $offerWithRelations->tenant->unit->unit_name : null,
            'tenant' => $offerWithRelations->tenant ? $offerWithRelations->tenant->full_name : null,
            'date_sent_offer' => $offerWithRelations->date_sent_offer,
            'date_offer_expires' => $offerWithRelations->date_offer_expires,
            'status' => $offerWithRelations->status,
            'date_of_acceptance' => $offerWithRelations->date_of_acceptance,
            'last_notice_sent' => $offerWithRelations->last_notice_sent,
            'notice_kind' => $offerWithRelations->notice_kind,
            'lease_sent' => $offerWithRelations->lease_sent,
            'date_sent_lease' => $offerWithRelations->date_sent_lease,
            'lease_expires' => $offerWithRelations->lease_expires,
            'lease_signed' => $offerWithRelations->lease_signed,
            'date_signed' => $offerWithRelations->date_signed,
            'last_notice_sent_2' => $offerWithRelations->last_notice_sent_2,
            'notice_kind_2' => $offerWithRelations->notice_kind_2,
            'notes' => $offerWithRelations->notes,
            'how_many_days_left' => $offerWithRelations->how_many_days_left,
            'expired' => $offerWithRelations->expired,
            'is_archived' => $offerWithRelations->is_archived,
            'created_at' => $offerWithRelations->created_at,
            'updated_at' => $offerWithRelations->updated_at,
        ];

        return Inertia::render('OffersAndRenewals/Show', [
            'offer' => $transformedOffer
        ]);
    }

    public function edit(OffersAndRenewal $offers_and_renewal)
    {
        $dropdownData = $this->service->getDropdownData();

        // Load the offer with relationships
        $offerWithRelations = $this->service->getOfferWithRelations($offers_and_renewal->id);

        // Transform the data for editing
        $transformedOffer = [
            'id' => $offerWithRelations->id,
            'tenant_id' => $offerWithRelations->tenant_id,
            'city_name' => $offerWithRelations->tenant && $offerWithRelations->tenant->unit && $offerWithRelations->tenant->unit->property && $offerWithRelations->tenant->unit->property->city 
                ? $offerWithRelations->tenant->unit->property->city->city : null,
            'property' => $offerWithRelations->tenant && $offerWithRelations->tenant->unit && $offerWithRelations->tenant->unit->property 
                ? $offerWithRelations->tenant->unit->property->property_name : null,
            'unit' => $offerWithRelations->tenant && $offerWithRelations->tenant->unit ? $offerWithRelations->tenant->unit->unit_name : null,
            'tenant' => $offerWithRelations->tenant ? $offerWithRelations->tenant->full_name : null,
            'date_sent_offer' => $offerWithRelations->date_sent_offer,
            'date_offer_expires' => $offerWithRelations->date_offer_expires,
            'status' => $offerWithRelations->status,
            'date_of_acceptance' => $offerWithRelations->date_of_acceptance,
            'last_notice_sent' => $offerWithRelations->last_notice_sent,
            'notice_kind' => $offerWithRelations->notice_kind,
            'lease_sent' => $offerWithRelations->lease_sent,
            'date_sent_lease' => $offerWithRelations->date_sent_lease,
            'lease_expires' => $offerWithRelations->lease_expires,
            'lease_signed' => $offerWithRelations->lease_signed,
            'date_signed' => $offerWithRelations->date_signed,
            'last_notice_sent_2' => $offerWithRelations->last_notice_sent_2,
            'notice_kind_2' => $offerWithRelations->notice_kind_2,
            'notes' => $offerWithRelations->notes,
            'how_many_days_left' => $offerWithRelations->how_many_days_left,
            'expired' => $offerWithRelations->expired,
        ];
        
        return Inertia::render('OffersAndRenewals/Edit', [
            'offer' => $transformedOffer,
            'hierarchicalData' => $dropdownData['hierarchicalData'],
            'cities' => $dropdownData['cities'],
            'properties' => $dropdownData['properties'],
            'propertiesByCityId' => $dropdownData['propertiesByCityId'],
            'unitsByPropertyId' => $dropdownData['unitsByPropertyId'],
            'tenantsByUnitId' => $dropdownData['tenantsByUnitId'],
            'allUnits' => $dropdownData['allUnits'],
            'tenantsData' => $dropdownData['tenantsData'],
        ]);
    }

    public function update(OffersAndRenewalRequest $request, OffersAndRenewal $offers_and_renewal)
    {
        $offer = $this->service->updateOffer($offers_and_renewal, $request->validatedWithTenantId());
        return redirect()->route('offers_and_renewals.index')->with('success', 'Offer updated successfully.');
    }

    public function destroy(OffersAndRenewal $offers_and_renewal)
    {
        $this->service->deleteOffer($offers_and_renewal);
        return redirect()->route('offers_and_renewals.index')->with('success', 'Offer archived successfully.');
    }

    /**
     * API endpoint to get properties by city
     */
    public function getPropertiesByCity(Cities $city)
    {
        $properties = $city->propertiesWithoutInsurance()
            ->select('id', 'property_name')
            ->get()
            ->map(function ($property) {
                return [
                    'id' => $property->id,
                    'name' => $property->property_name
                ];
            });

        return response()->json($properties);
    }

    /**
     * API endpoint to get units by property
     */
    public function getUnitsByProperty(PropertyInfoWithoutInsurance $property)
    {
        $units = $property->units()
            ->select('id', 'unit_name')
            ->get()
            ->map(function ($unit) {
                return [
                    'id' => $unit->id,
                    'name' => $unit->unit_name
                ];
            });

        return response()->json($units);
    }

    /**
     * API endpoint to get tenants by unit
     */
    public function getTenantsByUnit(Unit $unit)
    {
        $tenants = Tenant::where('unit_id', $unit->id)
            ->select('id', 'first_name', 'last_name')
            ->get()
            ->map(function ($tenant) {
                return [
                    'id' => $tenant->id,
                    'name' => $tenant->first_name . ' ' . $tenant->last_name,
                    'first_name' => $tenant->first_name,
                    'last_name' => $tenant->last_name
                ];
            });

        return response()->json($tenants);
    }
}
