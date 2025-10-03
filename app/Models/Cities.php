<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cities extends Model
{
    use HasFactory;
    
    protected $table = 'cities';

    protected $fillable = [
        'city',
    ];

    /**
     * Get the properties without insurance for this city.
     */
    public function propertiesWithoutInsurance(): HasMany
    {
        return $this->hasMany(PropertyInfoWithoutInsurance::class, 'city_id');
    }
}
