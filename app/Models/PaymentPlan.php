<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PaymentPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'property',
        'unit',
        'tenant',
        'amount',
        'dates',
        'paid',
        'notes'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paid' => 'decimal:2',
        'dates' => 'date'
    ];

    protected $appends = ['left_to_pay', 'status'];

    public function getLeftToPayAttribute()
    {
        return $this->amount - $this->paid;
    }

    public function getStatusAttribute()
    {
        $leftToPay = $this->left_to_pay;

        if ($leftToPay == 0) {
            return 'Paid';
        } elseif ($leftToPay == $this->amount) {
            return "Didn't Pay";
        } elseif ($leftToPay > 0 && $leftToPay < $this->amount) {
            return "Paid Partly";
        }else{
            return "N/A";
        }
    }
}
