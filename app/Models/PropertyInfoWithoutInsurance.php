<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PropertyInfoWithoutInsurance extends Model
{
    use HasFactory;

    protected $table = 'property_info_without_insurance';

    protected $fillable = [
        'city_id',
        'property_name',
    ];

    protected $casts = [
        'city_id' => 'integer',
    ];

    /**
     * Get the city that owns the property.
     */
    public function city(): BelongsTo
    {
        return $this->belongsTo(Cities::class, 'city_id');
    }

    /**
     * Validation rules for the model
     */
    public static function validationRules(): array
    {
        return [
            'city_id' => 'nullable|integer|exists:cities,id',
            'property_name' => 'required|string|max:255',
        ];
    }

    /**
     * Validation rules for updating the model
     */
    public static function updateValidationRules(): array
    {
        return [
            'city_id' => 'sometimes|nullable|integer|exists:cities,id',
            'property_name' => 'sometimes|required|string|max:255',
        ];
    }
}
