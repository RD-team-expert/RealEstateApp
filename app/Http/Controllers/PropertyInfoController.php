<?php
// app/Http/Controllers/PropertyInfoController.php

namespace App\Http\Controllers;

use App\Http\Requests\StorePropertyInfoRequest;
use App\Http\Requests\UpdatePropertyInfoRequest;
use App\Models\PropertyInfo;
use App\Services\PropertyInfoService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class PropertyInfoController extends Controller
{
    public function __construct(
        private PropertyInfoService $propertyInfoService
    ) {}

    public function index(Request $request): Response
    {
        $perPage = $request->get('per_page', 15);
        $filters = $request->only(['property_name', 'insurance_company_name', 'policy_number', 'status']);

        $properties = $this->propertyInfoService->getAllPaginated($perPage, $filters);
        $statistics = $this->propertyInfoService->getStatistics();

        return Inertia::render('Properties/Index', [
            'properties' => $properties,
            'statistics' => $statistics,
            'filters' => $filters,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Properties/Create');
    }

    public function store(StorePropertyInfoRequest $request): RedirectResponse
    {
        try {
            $this->propertyInfoService->create($request->validated());

            return redirect()->route('properties-info.index')
                ->with('success', 'Property created successfully');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to create property: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function show(int $id): Response
    {
        $property = $this->propertyInfoService->findById($id);

        return Inertia::render('Properties/Show', [
            'property' => $property,
        ]);
    }

    public function edit(int $id): Response
    {
        $property = $this->propertyInfoService->findById($id);

        return Inertia::render('Properties/Edit', [
            'property' => $property,
        ]);
    }

    public function update(UpdatePropertyInfoRequest $request, int $id): RedirectResponse
    {
        try {
            $property = $this->propertyInfoService->findById($id);
            $this->propertyInfoService->update($property, $request->validated());

            return redirect()->route('properties-info.index')
                ->with('success', 'Property updated successfully');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to update property: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function destroy(int $id): RedirectResponse
    {
        try {
            $property = $this->propertyInfoService->findById($id);
            $this->propertyInfoService->delete($property);

            return redirect()->route('properties-info.index')
                ->with('success', 'Property deleted successfully');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to delete property: ' . $e->getMessage());
        }
    }

    public function dashboard(): Response
    {
        $statistics = $this->propertyInfoService->getStatistics();
        $expiringSoon = $this->propertyInfoService->getExpiringSoon(30);
        $expired = $this->propertyInfoService->getExpired();

        return Inertia::render('Properties/Dashboard', [
            'statistics' => $statistics,
            'expiringSoon' => $expiringSoon,
            'expired' => $expired,
        ]);
    }

    public function expiringSoon(): Response
    {
        $properties = $this->propertyInfoService->getExpiringSoon();

        return Inertia::render('Properties/ExpiringSoon', [
            'properties' => $properties,
        ]);
    }

    public function expired(): Response
    {
        $properties = $this->propertyInfoService->getExpired();

        return Inertia::render('Properties/Expired', [
            'properties' => $properties,
        ]);
    }
}
