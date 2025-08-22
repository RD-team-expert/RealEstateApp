<?php
// app/Http/Requests/UpdateVendorInfoRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
class UpdateVendorInfoRequest extends FormRequest
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
                Rule::exists('cities', 'city')],
            'vendor_name' => 'required|string|max:255',
            'number' => 'nullable|string|max:255',
            'service_type' => ['nullable', Rule::in(['Maintenance', 'Appliances', 'Pest control', 'HVAC Repairs',
                                                                'Plumping','Landscaping','Lock Smith','Garage door'])],
            'email' => 'nullable|email|max:255',

        ];
    }

    public function messages(): array
    {
        return [
            'city.exists' => 'The selected city is not valid. Please choose from available cities.',
            'city.max' => 'City cannot exceed 255 characters.',
            'vendor_name.required' => 'Vendor name is required.',
            'vendor_name.max' => 'Vendor name cannot exceed 255 characters.',
            'number.max' => 'Number cannot exceed 255 characters.',
            'email.email' => 'Please provide a valid email address.',
            'email.max' => 'Email cannot exceed 255 characters.',
        ];
    }
}
