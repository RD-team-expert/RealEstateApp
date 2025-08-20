<?php

namespace App\Http\Controllers;

use App\Http\Requests\OffersAndRenewalRequest;
use App\Models\OffersAndRenewal;
use App\Models\Tenant;
use App\Services\OffersAndRenewalService;
use Inertia\Inertia;

class OffersAndRenewalController extends Controller
{
    protected $service;

    public function __construct(OffersAndRenewalService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
          OffersAndRenewal::whereNotNull('how_many_days_left')->get()->each(function ($offer) {
        if ($offer->how_many_days_left > 0) {
            $offer->how_many_days_left -= 1;
            $offer->expired = $offer->how_many_days_left <= 0 ? 'expired' : null;
            $offer->save();
        } elseif ($offer->how_many_days_left <= 0 && $offer->expired !== 'expired') {
            $offer->expired = 'expired';
            $offer->save();
        }
        });
        OffersAndRenewal::whereNull('how_many_days_left')->whereNotNull('date_sent_lease')->get()->each(function ($offer) {
            $offer->calculateExpiry();
            $offer->save();
        });
        $offers = $this->service->listAll();
        return Inertia::render('OffersAndRenewals/Index', ['offers' => $offers]);


    }

    public function create()
    {
        $tenants = Tenant::all(['unit_number', 'first_name', 'last_name']);
        return Inertia::render('OffersAndRenewals/Create', [
            'tenants' => $tenants
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
        $tenants = Tenant::all(['unit_number', 'first_name', 'last_name']);
        return Inertia::render('OffersAndRenewals/Edit', [
            'offer' => $offers_and_renewal,
            'tenants' => $tenants
        ]);
    }

    public function update(OffersAndRenewalRequest $request, OffersAndRenewal $offers_and_renewal)
    {
        $offer = $this->service->update($offers_and_renewal, $request->validated());
        return redirect()->route('offers_and_renewals.show', $offer->id)->with('success', 'Offer updated successfully.');
    }

    public function destroy(OffersAndRenewal $offers_and_renewal)
    {
        $this->service->delete($offers_and_renewal);
        return redirect()->route('offers_and_renewals.index')->with('success', 'Offer deleted successfully.');
    }
}
