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

    /**
     * Validation rules for the model
     */
    public static function validationRules(): array
    {
        return [
            'city' => 'required|string|max:255|unique:cities,city',
        ];
    }

    /**
     * Validation rules for updating the model
     */
    public static function updateValidationRules($id = null): array
    {
        return [
            'city' => 'sometimes|required|string|max:255|unique:cities,city,' . $id,
        ];
    }
}
