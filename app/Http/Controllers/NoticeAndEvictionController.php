<?php

namespace App\Http\Controllers;

use App\Http\Requests\NoticeAndEvictionRequest;
use App\Models\NoticeAndEviction;
use App\Services\NoticeAndEvictionService;
use App\Models\Tenant;
use App\Models\Notice;
use App\Models\Cities;
use App\Models\PropertyInfoWithoutInsurance;
use App\Models\Unit;
use Inertia\Inertia;
use Illuminate\Http\Request;

class NoticeAndEvictionController extends Controller
{
    protected $service;

    public function __construct(NoticeAndEvictionService $service)
    {
        $this->service = $service;

        $this->middleware('permission:notice-and-evictions.index')->only('index');
        $this->middleware('permission:notice-and-evictions.create')->only('create');
        $this->middleware('permission:notice-and-evictions.store')->only('store');
        $this->middleware('permission:notice-and-evictions.show')->only('show');
        $this->middleware('permission:notice-and-evictions.edit')->only('edit');
        $this->middleware('permission:notice-and-evictions.update')->only('update');
        $this->middleware('permission:notice-and-evictions.destroy')->only('destroy');
    }

    public function index(Request $request)
    {
        // Get all non-archived records and update their evictions status
        $records = NoticeAndEviction::with(['tenant.unit.property.city'])->get();
        foreach ($records as $record) {
            if ($record->have_an_exception === 'Yes') {
                $record->evictions = 'Have An Exception';
            } elseif ($record->type_of_notice && $record->date) {
                $notice = Notice::where('notice_name', $record->type_of_notice)->first();
                if ($notice) {
                    $days = $notice->days;
                    $alertDate = \Carbon\Carbon::parse($record->date)->addDays($days);
                    if ($alertDate->lessThanOrEqualTo(now())) {
                        $record->evictions = 'Alert';
                    } else {
                        $record->evictions = '';
                    }
                }
            }
            $record->save();
        }

        // Get the updated records through the service with search functionality
        $query = NoticeAndEviction::with(['tenant.unit.property.city']);

        // Handle individual filter parameters (ID-based filtering)
        if ($request->has('city_id') && $request->city_id) {
            $query->whereHas('tenant.unit.property.city', function ($q) use ($request) {
                $q->where('id', $request->city_id);
            });
        }

        if ($request->has('property_id') && $request->property_id) {
            $query->whereHas('tenant.unit.property', function ($q) use ($request) {
                $q->where('id', $request->property_id);
            });
        }

        if ($request->has('unit_id') && $request->unit_id) {
            $query->whereHas('tenant.unit', function ($q) use ($request) {
                $q->where('id', $request->unit_id);
            });
        }

        if ($request->has('tenant_id') && $request->tenant_id) {
            $query->where('tenant_id', $request->tenant_id);
        }

        // Handle name-based filter parameters (for partial name searches)
        if ($request->has('city_name') && $request->city_name) {
            $query->whereHas('tenant.unit.property.city', function ($q) use ($request) {
                $q->where('city', 'like', '%' . $request->city_name . '%');
            });
        }

        if ($request->has('property_name') && $request->property_name) {
            $query->whereHas('tenant.unit.property', function ($q) use ($request) {
                $q->where('property_name', 'like', '%' . $request->property_name . '%');
            });
        }

        if ($request->has('unit_name') && $request->unit_name) {
            $query->whereHas('tenant.unit', function ($q) use ($request) {
                $q->where('unit_name', 'like', '%' . $request->unit_name . '%');
            });
        }

        if ($request->has('tenant_name') && $request->tenant_name) {
            $tenantName = $request->tenant_name;
            $query->whereHas('tenant', function ($q) use ($tenantName) {
                $q->where('first_name', 'like', "%{$tenantName}%")
                    ->orWhere('last_name', 'like', "%{$tenantName}%")
                    ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$tenantName}%"]);
            });
        }

        // Handle general search functionality (legacy support)
        if ($request->has('search') && $request->search) {
            $searchTerm = $request->search;
            $query->whereHas('tenant', function ($q) use ($searchTerm) {
                $q->where('first_name', 'like', "%{$searchTerm}%")
                    ->orWhere('last_name', 'like', "%{$searchTerm}%")
                    ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$searchTerm}%"]);
            })
                ->orWhereHas('tenant.unit', function ($q) use ($searchTerm) {
                    $q->where('unit_name', 'like', "%{$searchTerm}%");
                })
                ->orWhereHas('tenant.unit.property', function ($q) use ($searchTerm) {
                    $q->where('property_name', 'like', "%{$searchTerm}%");
                })
                ->orWhereHas('tenant.unit.property.city', function ($q) use ($searchTerm) {
                    $q->where('city', 'like', "%{$searchTerm}%");
                })
                ->orWhere('status', 'like', "%{$searchTerm}%")
                ->orWhere('type_of_notice', 'like', "%{$searchTerm}%");
        }

        $records = $query->get()->map(function ($record) {
            return [
                'id' => $record->id,
                'tenant_id' => $record->tenant_id,
                'unit_name' => $record->tenant?->unit?->unit_name ?? 'N/A',
                'city_name' => $record->tenant?->unit?->property?->city?->city ?? 'N/A',
                'property_name' => $record->tenant?->unit?->property?->property_name ?? 'N/A',
                'tenants_name' => $record->tenant ? $record->tenant->first_name . ' ' . $record->tenant->last_name : 'N/A',
                'status' => $record->status,
                'date' => $record->date,
                'type_of_notice' => $record->type_of_notice,
                'have_an_exception' => $record->have_an_exception,
                'note' => $record->note,
                'evictions' => $record->evictions,
                'sent_to_atorney' => $record->sent_to_atorney,
                'hearing_dates' => $record->hearing_dates,
                'evected_or_payment_plan' => $record->evected_or_payment_plan,
                'if_left' => $record->if_left,
                'writ_date' => $record->writ_date,
                'created_at' => $record->created_at,
                'updated_at' => $record->updated_at,
            ];
        });

        // Get data for dropdowns
        $cities = Cities::select('id', 'city')->get();
        $properties = PropertyInfoWithoutInsurance::with('city:id,city')
            ->select('id', 'city_id', 'property_name')
            ->get()
            ->map(function ($property) {
                return [
                    'id' => $property->id,
                    'city_id' => $property->city_id,
                    'property_name' => $property->property_name,
                    'city_name' => $property->city?->city ?? 'N/A',
                ];
            });

        $units = Unit::with(['property.city:id,city'])
            ->select('id', 'property_id', 'unit_name')
            ->get()
            ->map(function ($unit) {
                return [
                    'id' => $unit->id,
                    'property_id' => $unit->property_id,
                    'unit_name' => $unit->unit_name,
                    'property_name' => $unit->property?->property_name ?? 'N/A',
                    'city_name' => $unit->property?->city?->city ?? 'N/A',
                ];
            });

        $tenants = Tenant::with(['unit.property.city'])
            ->select('id', 'unit_id', 'first_name', 'last_name')
            ->get()
            ->map(function ($tenant) {
                return [
                    'id' => $tenant->id,
                    'unit_id' => $tenant->unit_id,
                    'first_name' => $tenant->first_name,
                    'last_name' => $tenant->last_name,
                    'full_name' => $tenant->first_name . ' ' . $tenant->last_name,
                    'unit_name' => $tenant->unit?->unit_name ?? 'N/A',
                    'property_name' => $tenant->unit?->property?->property_name ?? 'N/A',
                    'city_name' => $tenant->unit?->property?->city?->city ?? 'N/A',
                ];
            });

        $notices = Notice::select('id', 'notice_name', 'days')->get();

        return Inertia::render('NoticeAndEvictions/Index', [
            'records' => $records,
            'cities' => $cities,
            'properties' => $properties,
            'units' => $units,
            'tenants' => $tenants,
            'notices' => $notices,
            'search' => $request->search,
        ]);
    }

    public function create()
    {
        // Get data for cascading dropdowns
        $cities = Cities::select('id', 'city')->get();
        $properties = PropertyInfoWithoutInsurance::with('city:id,city')
            ->select('id', 'city_id', 'property_name')
            ->get()
            ->map(function ($property) {
                return [
                    'id' => $property->id,
                    'city_id' => $property->city_id,
                    'property_name' => $property->property_name,
                    'city_name' => $property->city?->city ?? 'N/A',
                ];
            });

        $units = Unit::with(['property.city:id,city'])
            ->select('id', 'property_id', 'unit_name')
            ->get()
            ->map(function ($unit) {
                return [
                    'id' => $unit->id,
                    'property_id' => $unit->property_id,
                    'unit_name' => $unit->unit_name,
                    'property_name' => $unit->property?->property_name ?? 'N/A',
                    'city_name' => $unit->property?->city?->city ?? 'N/A',
                ];
            });

        $tenants = Tenant::with(['unit.property.city'])
            ->select('id', 'unit_id', 'first_name', 'last_name')
            ->get()
            ->map(function ($tenant) {
                return [
                    'id' => $tenant->id,
                    'unit_id' => $tenant->unit_id,
                    'first_name' => $tenant->first_name,
                    'last_name' => $tenant->last_name,
                    'full_name' => $tenant->first_name . ' ' . $tenant->last_name,
                    'unit_name' => $tenant->unit?->unit_name ?? 'N/A',
                    'property_name' => $tenant->unit?->property?->property_name ?? 'N/A',
                    'city_name' => $tenant->unit?->property?->city?->city ?? 'N/A',
                ];
            });

        $notices = Notice::select('id', 'notice_name', 'days')->get();

        return Inertia::render('NoticeAndEvictions/Create', [
            'cities' => $cities,
            'properties' => $properties,
            'units' => $units,
            'tenants' => $tenants,
            'notices' => $notices,
        ]);
    }

    public function store(NoticeAndEvictionRequest $request)
    {
        $nev = $this->service->create($request->validated());
        return redirect()->route('notice_and_evictions.index')->with('success', 'Created successfully.');
    }

    public function show(NoticeAndEviction $notice_and_eviction)
    {
        $notice_and_eviction->load(['tenant.unit.property.city']);

        $recordData = [
            'id' => $notice_and_eviction->id,
            'tenant_id' => $notice_and_eviction->tenant_id,
            'unit_name' => $notice_and_eviction->tenant?->unit?->unit_name ?? 'N/A',
            'city_name' => $notice_and_eviction->tenant?->unit?->property?->city?->city ?? 'N/A',
            'property_name' => $notice_and_eviction->tenant?->unit?->property?->property_name ?? 'N/A',
            'tenants_name' => $notice_and_eviction->tenant ? $notice_and_eviction->tenant->first_name . ' ' . $notice_and_eviction->tenant->last_name : 'N/A',
            'status' => $notice_and_eviction->status,
            'date' => $notice_and_eviction->date,
            'type_of_notice' => $notice_and_eviction->type_of_notice,
            'have_an_exception' => $notice_and_eviction->have_an_exception,
            'note' => $notice_and_eviction->note,
            'evictions' => $notice_and_eviction->evictions,
            'sent_to_atorney' => $notice_and_eviction->sent_to_atorney,
            'hearing_dates' => $notice_and_eviction->hearing_dates,
            'evected_or_payment_plan' => $notice_and_eviction->evected_or_payment_plan,
            'if_left' => $notice_and_eviction->if_left,
            'writ_date' => $notice_and_eviction->writ_date,
        ];

        return Inertia::render('NoticeAndEvictions/Show', ['record' => $recordData]);
    }

    public function edit(NoticeAndEviction $notice_and_eviction)
    {
        $notice_and_eviction->load(['tenant.unit.property.city']);

        $recordData = [
            'id' => $notice_and_eviction->id,
            'tenant_id' => $notice_and_eviction->tenant_id,
            'unit_name' => $notice_and_eviction->tenant?->unit?->unit_name ?? 'N/A',
            'city_name' => $notice_and_eviction->tenant?->unit?->property?->city?->city ?? 'N/A',
            'property_name' => $notice_and_eviction->tenant?->unit?->property?->property_name ?? 'N/A',
            'tenants_name' => $notice_and_eviction->tenant ? $notice_and_eviction->tenant->first_name . ' ' . $notice_and_eviction->tenant->last_name : 'N/A',
            'status' => $notice_and_eviction->status,
            'date' => $notice_and_eviction->date,
            'type_of_notice' => $notice_and_eviction->type_of_notice,
            'have_an_exception' => $notice_and_eviction->have_an_exception,
            'note' => $notice_and_eviction->note,
            'evictions' => $notice_and_eviction->evictions,
            'sent_to_atorney' => $notice_and_eviction->sent_to_atorney,
            'hearing_dates' => $notice_and_eviction->hearing_dates,
            'evected_or_payment_plan' => $notice_and_eviction->evected_or_payment_plan,
            'if_left' => $notice_and_eviction->if_left,
            'writ_date' => $notice_and_eviction->writ_date,
        ];

        // Get data for cascading dropdowns
        $cities = Cities::select('id', 'city')->get();
        $properties = PropertyInfoWithoutInsurance::with('city:id,city')
            ->select('id', 'city_id', 'property_name')
            ->get()
            ->map(function ($property) {
                return [
                    'id' => $property->id,
                    'city_id' => $property->city_id,
                    'property_name' => $property->property_name,
                    'city_name' => $property->city?->city ?? 'N/A',
                ];
            });

        $units = Unit::with(['property.city:id,city'])
            ->select('id', 'property_id', 'unit_name')
            ->get()
            ->map(function ($unit) {
                return [
                    'id' => $unit->id,
                    'property_id' => $unit->property_id,
                    'unit_name' => $unit->unit_name,
                    'property_name' => $unit->property?->property_name ?? 'N/A',
                    'city_name' => $unit->property?->city?->city ?? 'N/A',
                ];
            });

        $tenants = Tenant::with(['unit.property.city'])
            ->select('id', 'unit_id', 'first_name', 'last_name')
            ->get()
            ->map(function ($tenant) {
                return [
                    'id' => $tenant->id,
                    'unit_id' => $tenant->unit_id,
                    'first_name' => $tenant->first_name,
                    'last_name' => $tenant->last_name,
                    'full_name' => $tenant->first_name . ' ' . $tenant->last_name,
                    'unit_name' => $tenant->unit?->unit_name ?? 'N/A',
                    'property_name' => $tenant->unit?->property?->property_name ?? 'N/A',
                    'city_name' => $tenant->unit?->property?->city?->city ?? 'N/A',
                ];
            });

        $notices = Notice::select('id', 'notice_name', 'days')->get();

        return Inertia::render('NoticeAndEvictions/Edit', [
            'record' => $recordData,
            'cities' => $cities,
            'properties' => $properties,
            'units' => $units,
            'tenants' => $tenants,
            'notices' => $notices,
        ]);
    }

    public function update(NoticeAndEvictionRequest $request, NoticeAndEviction $notice_and_eviction)
    {
        $this->service->update($notice_and_eviction, $request->validated());
        return redirect()->route('notice_and_evictions.index')->with('success', 'Updated successfully.');
    }

    public function destroy(NoticeAndEviction $notice_and_eviction)
    {
        $this->service->delete($notice_and_eviction);
        return redirect()->route('notice_and_evictions.index')->with('success', 'Deleted successfully.');
    }
}
