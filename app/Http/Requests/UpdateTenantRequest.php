<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTenantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'property_name' => 'required|string|max:255',
            'unit_number' => 'required|string|max:255',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'street_address_line' => 'nullable|string|max:255',
            'login_email' => [
                'nullable',
                'email',
                'max:255',
                Rule::unique('tenants', 'login_email')->ignore($this->tenant->id),
            ],
            'alternate_email' => 'nullable|email|max:255',
            'mobile' => 'nullable|string|max:20',
            'emergency_phone' => 'nullable|string|max:20',
            'cash_or_check' => 'nullable|in:Cash,Check',
            'has_insurance' => 'nullable|in:Yes,No',
            'sensitive_communication' => 'nullable|in:Yes,No',
            'has_assistance' => 'nullable|in:Yes,No',
            'assistance_amount' => 'nullable|numeric|min:0',
            'assistance_company' => 'nullable|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'property_name.required' => 'Property name is required.',
            'unit_number.required' => 'Unit number is required.',
            'first_name.required' => 'First name is required.',
            'last_name.required' => 'Last name is required.',
            'login_email.email' => 'Login email must be a valid email address.',
            'login_email.unique' => 'This login email is already taken.',
            'alternate_email.email' => 'Alternate email must be a valid email address.',
        ];
    }
}
