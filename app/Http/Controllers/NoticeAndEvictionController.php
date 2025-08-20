<?php

namespace App\Http\Controllers;

use App\Http\Requests\NoticeAndEvictionRequest;
use App\Models\NoticeAndEviction;
use App\Services\NoticeAndEvictionService;
use App\Models\Tenant; // For dropdowns in create/edit
use App\Models\Notice; // For dropdowns in create/edit
use Inertia\Inertia;

class NoticeAndEvictionController extends Controller
{
    protected $service;

    public function __construct(NoticeAndEvictionService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        $records = NoticeAndEviction::all();
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
        $records = $this->service->listAll();
        return Inertia::render('NoticeAndEvictions/Index', ['records' => $records]);
    }

    public function create()
    {
        $tenants = Tenant::all(['unit_number', 'first_name', 'last_name']);
        $notices = Notice::all(['notice_name']);
        return Inertia::render('NoticeAndEvictions/Create', [
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
        return Inertia::render('NoticeAndEvictions/Show', ['record' => $notice_and_eviction]);
    }

    public function edit(NoticeAndEviction $notice_and_eviction)
    {
        $tenants = Tenant::all(['unit_number', 'first_name', 'last_name']);
        $notices = Notice::all(['notice_name']);
        return Inertia::render('NoticeAndEvictions/Edit', [
            'record' => $notice_and_eviction,
            'tenants' => $tenants,
            'notices' => $notices,
        ]);
    }

    public function update(NoticeAndEvictionRequest $request, NoticeAndEviction $notice_and_eviction)
    {
        $this->service->update($notice_and_eviction, $request->validated());
        return redirect()->route('notice_and_evictions.show', $notice_and_eviction->id)->with('success', 'Updated successfully.');
    }

    public function destroy(NoticeAndEviction $notice_and_eviction)
    {
        $this->service->delete($notice_and_eviction);
        return redirect()->route('notice_and_evictions.index')->with('success', 'Deleted successfully.');
    }
}
