<?php
// app/Http/Requests/StoreApplicationRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'property' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'co_signer' => 'required|string|max:255',
            'unit' => 'required|string|max:255',
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
            'property.max' => 'Property name cannot exceed 255 characters.',
            'name.required' => 'Name is required.',
            'name.max' => 'Name cannot exceed 255 characters.',
            'co_signer.required' => 'Co-signer is required.',
            'co_signer.max' => 'Co-signer name cannot exceed 255 characters.',
            'unit.required' => 'Unit is required.',
            'unit.max' => 'Unit cannot exceed 255 characters.',
            'status.max' => 'Status cannot exceed 255 characters.',
            'date.date' => 'Please provide a valid date.',
            'stage_in_progress.max' => 'Stage in progress cannot exceed 255 characters.',
            'notes.max' => 'Notes cannot exceed 65535 characters.',
        ];
    }
}
