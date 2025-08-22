<?php
// app/Http/Requests/UpdateApplicationRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Unit;

class UpdateApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'city' => [
                'required',
                'string',
                'max:255',
                function ($attribute, $value, $fail) {
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
            'attachment' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240', // 10MB max
        ];
    }

    public function messages(): array
    {
        return [
            'city.required' => 'City is required.',
            'property.required' => 'Property is required.',
            'name.required' => 'Name is required.',
            'co_signer.required' => 'Co-signer is required.',
            'unit.required' => 'Unit is required.',
            'attachment.mimes' => 'The attachment must be a PDF, Word document, or image file.',
            'attachment.max' => 'The attachment must not be larger than 10MB.',
        ];
    }
}
