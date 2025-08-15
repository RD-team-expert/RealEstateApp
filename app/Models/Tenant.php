<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tenant extends Model
{
    use HasFactory;

    protected $fillable = [
        'property_name',
        'unit_number',
        'first_name',
        'last_name',
        'street_address_line',
        'login_email',
        'alternate_email',
        'mobile',
        'emergency_phone',
        'cash_or_check',
        'has_insurance',
        'sensitive_communication',
        'has_assistance',
        'assistance_amount',
        'assistance_company',
    ];

    protected $casts = [
        'assistance_amount' => 'decimal:2',
    ];
}
