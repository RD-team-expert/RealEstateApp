<?php
// app/Http/Requests/StoreVendorInfoRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVendorInfoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'city' => 'required|string|max:255',
            'vendor_name' => 'required|string|max:255',
            'number' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'city.required' => 'City is required.',
            'city.max' => 'City cannot exceed 255 characters.',
            'vendor_name.required' => 'Vendor name is required.',
            'vendor_name.max' => 'Vendor name cannot exceed 255 characters.',
            'number.max' => 'Number cannot exceed 255 characters.',
            'email.email' => 'Please provide a valid email address.',
            'email.max' => 'Email cannot exceed 255 characters.',
        ];
    }
}
