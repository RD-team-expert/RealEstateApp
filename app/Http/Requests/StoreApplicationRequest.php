<?php
// app/Http/Requests/UpdateApplicationRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Unit;
class StoreApplicationRequest extends FormRequest{
public function rules(): array
{
    return [
        'city' => [
            'required',
            'string',
            'max:255',
            function ($attribute, $value, $fail) {
                // Check if the city exists in the Units table
                if (!Unit::where('city', $value)->exists()) {
                    $fail('The selected city does not exist.');
                }
            }
        ],
        'property' => [
            'required',
            'string',
            'max:255',
            function ($attribute, $value, $fail) {
                // Check if the property exists for the selected city
                $city = $this->input('city');
                if ($city && !Unit::where('city', $city)->where('property', $value)->exists()) {
                    $fail('The selected property does not exist for the selected city.');
                }
            }
        ],
        'name' => 'required|string|max:255',
        'co_signer' => 'required|string|max:255',
        'unit' => [
            'required',
            'string',
            'max:255',
            function ($attribute, $value, $fail) {
                // Check if the unit exists for the selected city and property
                $city = $this->input('city');
                $property = $this->input('property');
                if ($city && $property && !Unit::where('city', $city)->where('property', $property)->where('unit_name', $value)->exists()) {
                    $fail('The selected unit does not exist for the selected city and property.');
                }
            }
        ],
        'status' => 'nullable|string|max:255',
        'date' => 'nullable|date',
        'stage_in_progress' => 'nullable|string|max:255',
        'notes' => 'nullable|string|max:65535',
    ];
}
}
