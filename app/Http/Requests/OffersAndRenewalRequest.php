<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

class OffersAndRenewalRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'tenant_id' => [
                'nullable', 'integer',
                Rule::exists('tenants', 'id')->where('is_archived', false),
            ],
            'property' => [
                'nullable', 'string',
                Rule::exists('property_info_without_insurance', 'property_name')->where('is_archived', false),
            ],
            'city_name' => [
                'nullable', 'string',
                Rule::exists('cities', 'city')->where('is_archived', false),
            ],
            'unit' => [
                'nullable', 'string',
                Rule::exists('units', 'unit_name')->where('is_archived', false),
            ],
            'tenant' => [
                'nullable', 'string', 
                function($attribute, $value, $fail) {
                    if (empty($value)) {
                        return; // Allow null/empty since it's nullable
                    }
                    
                    $nameParts = explode(' ', trim($value), 2);
                    if (count($nameParts) < 2) {
                        $fail('The ' . $attribute . ' must contain both first and last name separated by a space.');
                        return;
                    }
                    
                    [$firstName, $lastName] = $nameParts;
                    $tenant = DB::table('tenants')
                        ->where('first_name', trim($firstName))
                        ->where('last_name', trim($lastName))
                        ->where('is_archived', false)
                        ->first();
                        
                    if (!$tenant) {
                        $fail('The tenant "' . $value . '" does not exist in the tenants table or is archived.');
                        return;
                    }
                    
                    // Set the tenant_id for use in the controller if needed
                    $this->merge(['resolved_tenant_id' => $tenant->id]);
                }
            ],
            'date_sent_offer' => 'required|date|before_or_equal:today',
            'date_offer_expires' => 'nullable|date|after_or_equal:date_sent_offer',
            'status' => 'nullable|string|max:255',
            'date_of_acceptance' => [
                'nullable', 'date',
                function($attribute, $value, $fail) {
                    if ($value && $this->input('date_sent_offer')) {
                        if ($value < $this->input('date_sent_offer')) {
                            $fail('The date of acceptance must be on or after the date the offer was sent.');
                        }
                    }
                }
            ],
            'last_notice_sent' => 'nullable|date|before_or_equal:today',
            'notice_kind' => 'nullable|string|max:255',
            'lease_sent' => 'nullable|string|max:255',
            'date_sent_lease' => [
                'nullable', 'date', 'before_or_equal:today',
                function($attribute, $value, $fail) {
                    if ($value && $this->input('date_of_acceptance')) {
                        if ($value < $this->input('date_of_acceptance')) {
                            $fail('The lease sent date must be on or after the date of acceptance.');
                        }
                    }
                }
            ],
            'lease_expires' => 'nullable|date|after_or_equal:date_sent_lease',
            'lease_signed' => 'nullable|string|max:255',
            'date_signed' => [
                'nullable', 'date',
                function($attribute, $value, $fail) {
                    if ($value && $this->input('date_sent_lease')) {
                        if ($value < $this->input('date_sent_lease')) {
                            $fail('The date signed must be on or after the date the lease was sent.');
                        }
                    }
                }
            ],
            'last_notice_sent_2' => 'nullable|date|before_or_equal:today',
            'notice_kind_2' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:65535',
            'how_many_days_left' => 'nullable|integer|min:0|max:9999',
            'expired' => 'nullable|string|max:255',
        ];
    }

    /**
     * Get custom validation messages
     */
    public function messages()
    {
        return [
            'tenant_id.exists' => 'The selected tenant does not exist or is archived.',
            'property.exists' => 'The selected property does not exist or is archived.',
            'city_name.exists' => 'The selected city does not exist or is archived.',
            'unit.exists' => 'The selected unit does not exist or is archived.',
            'date_sent_offer.required' => 'The date sent offer field is required.',
            'date_sent_offer.before_or_equal' => 'The date sent offer cannot be in the future.',
            'date_offer_expires.after_or_equal' => 'The offer expiration date must be on or after the date sent.',
            'last_notice_sent.before_or_equal' => 'The last notice sent date cannot be in the future.',
            'date_sent_lease.before_or_equal' => 'The lease sent date cannot be in the future.',
            'lease_expires.after_or_equal' => 'The lease expiration date must be on or after the lease sent date.',
            'last_notice_sent_2.before_or_equal' => 'The second notice sent date cannot be in the future.',
            'how_many_days_left.min' => 'Days left cannot be negative.',
            'how_many_days_left.max' => 'Days left cannot exceed 9999.',
            'notes.max' => 'Notes cannot exceed 65535 characters.',
        ];
    }

    /**
     * Get custom attribute names for validation messages
     */
    public function attributes()
    {
        return [
            'tenant_id' => 'tenant',
            'city_name' => 'city',
            'date_sent_offer' => 'date sent offer',
            'date_offer_expires' => 'offer expiration date',
            'date_of_acceptance' => 'date of acceptance',
            'last_notice_sent' => 'last notice sent date',
            'notice_kind' => 'notice type',
            'lease_sent' => 'lease sent status',
            'date_sent_lease' => 'lease sent date',
            'lease_expires' => 'lease expiration date',
            'lease_signed' => 'lease signed status',
            'date_signed' => 'date signed',
            'last_notice_sent_2' => 'second notice sent date',
            'notice_kind_2' => 'second notice type',
            'how_many_days_left' => 'days left',
        ];
    }

    /**
     * Prepare data for validation
     */
    protected function prepareForValidation()
    {
        // Clean up tenant name input
        if ($this->has('tenant') && $this->input('tenant')) {
            $this->merge([
                'tenant' => trim($this->input('tenant'))
            ]);
        }

        // Clean up other string inputs
        $stringFields = ['property', 'city_name', 'unit', 'status', 'notice_kind', 'lease_sent', 'lease_signed', 'notice_kind_2', 'expired'];
        $cleanedData = [];
        
        foreach ($stringFields as $field) {
            if ($this->has($field) && $this->input($field)) {
                $cleanedData[$field] = trim($this->input($field));
            }
        }
        
        if (!empty($cleanedData)) {
            $this->merge($cleanedData);
        }
    }

    /**
     * Get the validated data with resolved tenant_id
     */
    public function validatedWithTenantId()
    {
        $validated = $this->validated();
        
        // If we resolved a tenant_id from the tenant name, use it
        if ($this->has('resolved_tenant_id')) {
            $validated['tenant_id'] = $this->input('resolved_tenant_id');
        }
        
        // Remove the tenant name field as we're using tenant_id in the database
        unset($validated['tenant'], $validated['resolved_tenant_id']);
        
        return $validated;
    }
}
