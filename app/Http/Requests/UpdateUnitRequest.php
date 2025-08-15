<?php
// app/Http/Requests/UpdateUnitRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUnitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'city' => 'required|string|max:255',
            'property' => 'required|string|max:255',
            'unit_name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('units', 'unit_name')->ignore($this->route('unit'))
            ],
            'tenants' => 'nullable|string|max:255',
            'lease_start' => 'nullable|date',
            'lease_end' => 'nullable|date|after_or_equal:lease_start',
            'count_beds' => 'nullable|integer|min:0',
            'count_baths' => 'nullable|integer|min:0',
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
            'city.required' => 'City is required.',
            'property.required' => 'Property is required.',
            'unit_name.required' => 'Unit name is required.',
            'unit_name.unique' => 'Unit name already exists.',
            'lease_end.after_or_equal' => 'Lease end date must be after or equal to lease start date.',
            'count_beds.integer' => 'Count beds must be a number.',
            'count_baths.integer' => 'Count baths must be a number.',
            'monthly_rent.numeric' => 'Monthly rent must be a valid amount.',
        ];
    }
}
