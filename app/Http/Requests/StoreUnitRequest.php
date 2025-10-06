<?php
// app/Http/Requests/StoreUnitRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUnitRequest extends FormRequest
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
                Rule::exists('cities', 'city')
            ],
            'property' => 'required|string|max:255',
            'unit_name' => 'required|string|max:255|unique:units,unit_name',
            'tenants' => 'nullable|string|max:255',
            'lease_start' => 'nullable|date',
            'lease_end' => 'nullable|date|after_or_equal:lease_start',
            'count_beds' => 'nullable|numeric|min:0|regex:/^\d+(\.\d{1})?$/',   // Changed from 'integer'
            'count_baths' => 'nullable|numeric|min:0|regex:/^\d+(\.\d{1})?$/',  // Changed from 'integer'
            'lease_status' => 'nullable|string|max:255',
            'monthly_rent' => 'nullable|numeric|min:0',
            'recurring_transaction' => 'nullable|string|max:255',
            'utility_status' => 'nullable|string|max:255',
            'account_number' => 'nullable|string|max:255',
            'insurance' => ['nullable', Rule::in(['Yes', 'No'])],
            'insurance_expiration_date' => 'nullable|date',
        ];
    }

    public function messages(): array
    {
        return [
            'city.exists' => 'The selected city is not valid. Please choose from available cities.',
            'property.required' => 'Property is required.',
            'unit_name.required' => 'Unit name is required.',
            'unit_name.unique' => 'Unit name already exists.',
            'lease_end.after_or_equal' => 'Lease end date must be after or equal to lease start date.',
            'count_beds.numeric' => 'Count beds must be a valid number.',
            'count_beds.regex' => 'Count beds must have at most 1 decimal place.',
            'count_baths.numeric' => 'Count baths must be a valid number.',
            'count_baths.regex' => 'Count baths must have at most 1 decimal place.',
            'monthly_rent.numeric' => 'Monthly rent must be a valid amount.',
        ];
    }
}
