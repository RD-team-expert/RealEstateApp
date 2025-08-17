<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MoveOut extends Model
{
    use HasFactory;

    protected $table = 'move_outs';

    protected $fillable = [
        'tenants_name',
        'units_name',
        'move_out_date',
        'lease_status',
        'date_lease_ending_on_buildium',
        'keys_location',
        'utilities_under_our_name',
        'date_utility_put_under_our_name',
        'walkthrough',
        'repairs',
        'send_back_security_deposit',
        'notes',
        'cleaning',
        'list_the_unit',
        'move_out_form',
    ];

    protected $casts = [
        'move_out_date' => 'date',
        'date_lease_ending_on_buildium' => 'date',
        'date_utility_put_under_our_name' => 'date',
    ];

    // Relationship with Tenant
    public function tenant()
    {
        return $this->belongsTo(Tenant::class, 'tenants_name', 'full_name');
    }
}
