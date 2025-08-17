<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MoveIn extends Model
{
    use HasFactory;

    protected $table = 'move_ins';

    protected $fillable = [
        'unit_name',
        'signed_lease',
        'lease_signing_date',
        'move_in_date',
        'paid_security_deposit_first_month_rent',
        'scheduled_paid_time',
        'handled_keys',
        'move_in_form_sent_date',
        'filled_move_in_form',
        'date_of_move_in_form_filled',
        'submitted_insurance',
        'date_of_insurance_expiration',
    ];

    protected $casts = [
        'lease_signing_date' => 'date',
        'move_in_date' => 'date',
        'scheduled_paid_time' => 'date',
        'move_in_form_sent_date' => 'date',
        'date_of_move_in_form_filled' => 'date',
        'date_of_insurance_expiration' => 'date',
    ];

    // Relationship with Unit
    public function unit()
    {
        return $this->belongsTo(Unit::class, 'unit_name', 'unit_name');
    }
}
