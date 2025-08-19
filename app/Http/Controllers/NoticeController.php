<?php

namespace App\Http\Controllers;

use App\Http\Requests\NoticeRequest;
use App\Models\Notice;
use App\Services\NoticeService;
use Inertia\Inertia;

class NoticeController extends Controller
{
    protected $service;

    public function __construct(NoticeService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        $notices = $this->service->listAll();
        return Inertia::render('Notices/Index', ['notices' => $notices]);
    }

    public function create()
    {
        return Inertia::render('Notices/Create');
    }

    public function store(NoticeRequest $request)
    {
        $this->service->create($request->validated());
        return redirect()->route('notices.index')->with('success', 'Notice created successfully.');
    }



    public function edit(Notice $notice)
    {
        return Inertia::render('Notices/Edit', ['notice' => $notice]);
    }

    public function update(NoticeRequest $request, Notice $notice)
    {
        $this->service->update($notice, $request->validated());
        return redirect()->route('notices.index', $notice->id)->with('success', 'Notice updated successfully.');
    }

    public function destroy(Notice $notice)
    {
        $this->service->delete($notice);
        return redirect()->route('notices.index')->with('success', 'Notice deleted successfully.');
    }
}
