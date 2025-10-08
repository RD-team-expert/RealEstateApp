<?php

namespace App\Http\Controllers;

use App\Http\Requests\OffersAndRenewalRequest;
use App\Models\OffersAndRenewal;
use App\Models\Tenant;
use App\Models\Cities;
use App\Services\OffersAndRenewalService;
use Inertia\Inertia;

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

    public function index()
    {
        // Calculate expiration for all non-archived records when index is refreshed
        OffersAndRenewal::notArchived()->get()->each(function ($offer) {
            $offer->calculateExpiry();
            $offer->save();
        });

        $offers = $this->service->listAll();
        $tenants = Tenant::all(['property_name','unit_number', 'first_name', 'last_name']);
        $cities = Cities::all();
        return Inertia::render('OffersAndRenewals/Index', [
            'offers' => $offers,
            'tenants' => $tenants,
            'cities' => $cities
        ]);
    }

    // ... rest of your methods remain the same
    public function create()
    {
        $tenants = Tenant::all(['property_name','unit_number', 'first_name', 'last_name']);
        $cities = Cities::all();
        return Inertia::render('OffersAndRenewals/Create', [
            'tenants' => $tenants,
            'cities' => $cities
        ]);
    }

    public function store(OffersAndRenewalRequest $request)
    {
        $offer = $this->service->create($request->validated());
        return redirect()->route('offers_and_renewals.index')->with('success', 'Offer created successfully.');
    }

    public function show(OffersAndRenewal $offers_and_renewal)
    {
        return Inertia::render('OffersAndRenewals/Show', ['offer' => $offers_and_renewal]);
    }

    public function edit(OffersAndRenewal $offers_and_renewal)
    {
        $tenants = Tenant::all(['property_name','unit_number', 'first_name', 'last_name']);
        $cities = Cities::all();
        return Inertia::render('OffersAndRenewals/Edit', [
            'offer' => $offers_and_renewal,
            'tenants' => $tenants,
            'cities' => $cities
        ]);
    }

    public function update(OffersAndRenewalRequest $request, OffersAndRenewal $offers_and_renewal)
    {
        $offer = $this->service->update($offers_and_renewal, $request->validated());
        return redirect()->route('offers_and_renewals.index')->with('success', 'Offer updated successfully.');
    }

    public function destroy(OffersAndRenewal $offers_and_renewal)
    {
        $this->service->delete($offers_and_renewal);
        return redirect()->route('offers_and_renewals.index')->with('success', 'Offer archived successfully.');
    }
}
