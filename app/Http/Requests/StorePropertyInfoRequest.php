<?php
// app/Http/Requests/StorePropertyInfoRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePropertyInfoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'property_id' => 'required|integer|exists:property_info_without_insurance,id',  // Changed from property_name
            'insurance_company_name' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0|max:999999999999.99',
            'policy_number' => 'required|string|max:255|unique:properties_info,policy_number',
            'effective_date' => 'required|date|before_or_equal:expiration_date',
            'expiration_date' => 'required|date|after:effective_date',
        ];
    }

    public function messages(): array
    {
        return [
            'property_id.required' => 'Property is required.',  // Updated message
            'property_id.integer' => 'Property must be a valid selection.',  // Added message
            'property_id.exists' => 'The selected property does not exist.',  // Added message
            'insurance_company_name.required' => 'Insurance company name is required.',
            'amount.required' => 'Amount is required.',
            'amount.numeric' => 'Amount must be a valid number.',
            'policy_number.required' => 'Policy number is required.',
            'policy_number.unique' => 'Policy number already exists.',
            'effective_date.required' => 'Effective date is required.',
            'effective_date.before_or_equal' => 'Effective date must be before or equal to expiration date.',
            'expiration_date.required' => 'Expiration date is required.',
            'expiration_date.after' => 'Expiration date must be after effective date.',
        ];
    }
}
