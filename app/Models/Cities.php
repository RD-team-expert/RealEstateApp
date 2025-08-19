<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class Cities extends Model
{
     use HasFactory;
     protected $table = 'cities';

    protected $fillable = [
        'city',
    ];
}
