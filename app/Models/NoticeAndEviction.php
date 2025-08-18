<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Notice;

class NoticeAndEviction extends Model
{
    use HasFactory;

    protected $table = 'notice_and_evictions';

    protected $fillable = [
        'unit_name',
        'tenants_name',
        'status',
        'date',
        'type_of_notice',
        'have_an_exception',
        'note',
        'evictions',
        'sent_to_atorney',
        'hearing_dates',
        'evected_or_payment_plan',
        'if_left',
        'writ_date'
    ];

    protected $casts = [
        'date' => 'date',
        'hearing_dates' => 'date',
        'writ_date' => 'date',
    ];

    // Calculated column for 'evictions'
    public function calculateEvictions()
    {
        if ($this->have_an_exception === 'Yes') {
            $this->evictions = 'Have An Exception';
            return;
        }
        if ($this->type_of_notice && $this->date) {
            $notice = Notice::where('notice_name', $this->type_of_notice)->first();
            if ($notice) {
                $days = $notice->days;
                $evictionDay = $this->date->copy()->addDays($days);
                if ($evictionDay->lessThanOrEqualTo(now())) {
                    $this->evictions = 'Alert';
                } else {
                    $this->evictions = '';
                }
            }
        }
    }
}
