<?php
// app/Http/Controllers/VendorInfoController.php

namespace App\Http\Controllers;

use App\Http\Requests\StoreVendorInfoRequest;
use App\Http\Requests\UpdateVendorInfoRequest;
use App\Models\VendorInfo;
use App\Services\VendorInfoService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class VendorInfoController extends Controller
{
    public function __construct(
        private VendorInfoService $vendorInfoService
    ) {}

    public function index(Request $request): Response
    {
        $perPage = $request->get('per_page', 15);
        $filters = $request->only(['city', 'vendor_name', 'number', 'email']);

        $vendors = $this->vendorInfoService->getAllPaginated($perPage, $filters);
        $statistics = $this->vendorInfoService->getStatistics();
        $cities = $this->vendorInfoService->getCities();

        return Inertia::render('Vendors/Index', [
            'vendors' => $vendors,
            'statistics' => $statistics,
            'filters' => $filters,
            'cities' => $cities,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Vendors/Create');
    }

    public function store(StoreVendorInfoRequest $request): RedirectResponse
    {
        try {
            $this->vendorInfoService->create($request->validated());

            return redirect()->route('vendors.index')
                ->with('success', 'Vendor created successfully');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to create vendor: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function show(string $id): Response
    {
        $vendor = $this->vendorInfoService->findById((int) $id);

        return Inertia::render('Vendors/Show', [
            'vendor' => $vendor,
        ]);
    }

    public function edit(string $id): Response
    {
        $vendor = $this->vendorInfoService->findById((int) $id);

        return Inertia::render('Vendors/Edit', [
            'vendor' => $vendor,
        ]);
    }

    public function update(UpdateVendorInfoRequest $request, string $id): RedirectResponse
    {
        try {
            $vendor = $this->vendorInfoService->findById((int) $id);
            $this->vendorInfoService->update($vendor, $request->validated());

            return redirect()->route('vendors.index')
                ->with('success', 'Vendor updated successfully');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to update vendor: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function destroy(string $id): RedirectResponse
    {
        try {
            $vendor = $this->vendorInfoService->findById((int) $id);
            $this->vendorInfoService->delete($vendor);

            return redirect()->route('vendors.index')
                ->with('success', 'Vendor deleted successfully');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to delete vendor: ' . $e->getMessage());
        }
    }

    public function dashboard(): Response
    {
        $statistics = $this->vendorInfoService->getStatistics();
        $recentVendors = $this->vendorInfoService->getRecentVendors(10);

        return Inertia::render('Vendors/Dashboard', [
            'statistics' => $statistics,
            'recentVendors' => $recentVendors,
        ]);
    }

    public function byCity(string $city): Response
    {
        $vendors = $this->vendorInfoService->getByCity($city);

        return Inertia::render('Vendors/ByCity', [
            'vendors' => $vendors,
            'city' => $city,
        ]);
    }
}
