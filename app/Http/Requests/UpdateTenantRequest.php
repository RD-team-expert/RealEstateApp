<?php
// app/Http/Requests/UpdateTenantRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\Unit;

class UpdateTenantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        $tenantId = $this->route('tenant')->id;

        return [
            'property_name' => [
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
            'unit_number' => [
                'required',
                'string',
                'max:255',
                function ($attribute, $value, $fail) {
                    // Check if the unit exists for the selected property
                    $property = $this->input('property_name');
                    if ($property && !Unit::where('property', $property)->where('unit_name', $value)->exists()) {
                        $fail('The selected unit does not exist for the selected property.');
                    }
                }
            ],
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'street_address_line' => 'nullable|string|max:255',
            'login_email' => [
                'nullable',
                'email',
                'max:255',
                Rule::unique('tenants', 'login_email')->ignore($tenantId)
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
