<?php

namespace App\Http\Controllers;

use App\Http\Requests\CityRequest;
use App\Models\Cities;
use App\Services\CityService;
use Inertia\Inertia;

class CityController extends Controller
{
    protected $service;

    public function __construct(CityService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        $cities = $this->service->listAll();
        return Inertia::render('Cities/Index', ['cities' => $cities]);
    }

    public function store(CityRequest $request)
    {
        $this->service->create($request->validated());
        return redirect()->route('cities.index')->with('success', 'City created successfully.');
    }

    public function destroy(Cities $city)
    {
        $this->service->delete($city);
        return redirect()->route('cities.index')->with('success', 'City deleted successfully.');
    }
}
