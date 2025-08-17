<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'city',
        'unit_name',
        'owes',
        'paid',
        'left_to_pay',
        'status',
        'notes',
        'reversed_payments',
        'permanent',
    ];

    protected $casts = [
        'date' => 'date',
        'owes' => 'decimal:2',
        'paid' => 'decimal:2',
        'left_to_pay' => 'decimal:2',
    ];

    // Automatically calculate left_to_pay when owes or paid changes
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($payment) {
            if ($payment->paid !== null) {
                $payment->left_to_pay = $payment->owes - $payment->paid;
            }
        });
    }
}
