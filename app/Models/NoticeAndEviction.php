<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use App\Models\Notice;

class NoticeAndEviction extends Model
{
    use HasFactory;

    protected $table = 'notice_and_evictions';

    protected $fillable = [
        'unit_name',
        'city_name',
        'property_name',
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
        'writ_date',
        'is_archived'
    ];

    protected $casts = [
        'date' => 'date',
        'hearing_dates' => 'date',
        'writ_date' => 'date',
        'is_archived' => 'boolean',
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

    // Global scope to exclude archived records by default
    protected static function booted()
    {
        static::addGlobalScope('active', function (Builder $builder) {
            $builder->where('is_archived', false);
        });
    }

    // Scope to include archived records when needed
    public function scopeWithArchived(Builder $query)
    {
        return $query->withoutGlobalScope('active');
    }

    // Scope to get only archived records
    public function scopeOnlyArchived(Builder $query)
    {
        return $query->withoutGlobalScope('active')->where('is_archived', true);
    }

    // Soft delete method - sets is_archived to true instead of deleting
    public function archive()
    {
        $this->is_archived = true;
        return $this->save();
    }

    // Restore method - sets is_archived to false
    public function restore()
    {
        $this->is_archived = false;
        return $this->save();
    }
}
