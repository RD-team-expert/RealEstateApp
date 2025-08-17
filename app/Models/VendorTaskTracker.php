<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Models\Unit;
class VendorTaskTracker extends Model
{
    use HasFactory;

    protected $table = 'vendors_tasks_tracker';

    protected $fillable = [
        'city',
        'task_submission_date',
        'vendor_name',
        'unit_name',
        'assigned_tasks',
        'any_scheduled_visits',
        'notes',
        'task_ending_date',
        'status',
        'urgent',
    ];

    protected $casts = [
        'task_submission_date' => 'date',
        'any_scheduled_visits' => 'date',
        'task_ending_date' => 'date',
    ];

    // Relationships
    public function unit()
    {
        return $this->belongsTo(Unit::class, ['city', 'unit_name'], ['city', 'unit_name']);
    }

    public function vendorInfo()
    {
        return $this->belongsTo(VendorInfo::class, 'vendor_name', 'vendor_name');
    }
}
