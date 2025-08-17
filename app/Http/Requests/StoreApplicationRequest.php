<?php
// app/Http/Requests/StoreApplicationRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Unit;

class StoreApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'property' => [
                'required',
                'string',
                'max:255',
                function ($attribute, $value, $fail) {
                    // Check if the property exists in the Units table
                    if (!Unit::where('property', $value)->exists()) {
                        $fail('The selected property does not exist.');
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
                    // Check if the unit exists for the selected property
                    $property = $this->input('property');
                    if ($property && !Unit::where('property', $property)->where('unit_name', $value)->exists()) {
                        $fail('The selected unit does not exist for the selected property.');
                    }
                }
            ],
            'status' => 'nullable|string|max:255',
            'date' => 'nullable|date',
            'stage_in_progress' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:65535',
        ];
    }

    public function messages(): array
    {
        return [
            'property.required' => 'Property is required.',
            'name.required' => 'Name is required.',
            'co_signer.required' => 'Co-signer is required.',
            'unit.required' => 'Unit is required.',
        ];
    }
}
