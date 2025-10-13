<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\Tenant;
use App\Models\Notice;

class NoticeAndEvictionRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'tenant_id' => [
                'nullable',
                'integer',
                Rule::exists('tenants', 'id')->where(function ($query) {
                    $query->where('is_archived', false);
                }),
            ],
            'status' => 'nullable|string|max:255',
            'date' => 'nullable|date',
            'type_of_notice' => [
                'nullable',
                'string',
                'max:255',
                Rule::exists('notices', 'notice_name')->where(function ($query) {
                    $query->where('is_archived', false);
                }),
            ],
            'have_an_exception' => ['nullable', 'string', Rule::in(['Yes', 'No'])],
            'note' => 'nullable|string',
            'evictions' => 'nullable|string|max:255',
            'sent_to_atorney' => ['nullable', 'string', Rule::in(['Yes', 'No'])],
            'hearing_dates' => 'nullable|date',
            'evected_or_payment_plan' => ['nullable', 'string', Rule::in(['Evected', 'Payment Plan'])],
            'if_left' => ['nullable', 'string', Rule::in(['Yes', 'No'])],
            'writ_date' => 'nullable|date|after_or_equal:date',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Validate that hearing_dates is after date if both are provided
            if ($this->date && $this->hearing_dates) {
                if ($this->hearing_dates < $this->date) {
                    $validator->errors()->add('hearing_dates', 'The hearing date must be after or equal to the notice date.');
                }
            }

            // Validate that writ_date is after hearing_dates if both are provided
            if ($this->hearing_dates && $this->writ_date) {
                if ($this->writ_date < $this->hearing_dates) {
                    $validator->errors()->add('writ_date', 'The writ date must be after or equal to the hearing date.');
                }
            }
        });
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages()
    {
        return [
            'tenant_id.exists' => 'The selected tenant does not exist or has been archived.',
            'tenant_id.integer' => 'The tenant ID must be a valid integer.',
            'type_of_notice.exists' => 'The selected notice type does not exist or has been archived.',
            'date.date' => 'The date must be a valid date.',
            'hearing_dates.date' => 'The hearing date must be a valid date.',
            'writ_date.date' => 'The writ date must be a valid date.',
            'writ_date.after_or_equal' => 'The writ date must be on or after the notice date.',
            'have_an_exception.in' => 'The exception field must be either Yes or No.',
            'sent_to_atorney.in' => 'The sent to attorney field must be either Yes or No.',
            'evected_or_payment_plan.in' => 'The evicted or payment plan field must be either Evected or Payment Plan.',
            'if_left.in' => 'The if left field must be either Yes or No.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes()
    {
        return [
            'tenant_id' => 'tenant',
            'type_of_notice' => 'notice type',
            'have_an_exception' => 'exception status',
            'sent_to_atorney' => 'sent to attorney',
            'hearing_dates' => 'hearing date',
            'evected_or_payment_plan' => 'evicted or payment plan',
            'if_left' => 'if left',
            'writ_date' => 'writ date',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation()
    {
        // If tenant_id is provided as string, convert to integer
        if ($this->has('tenant_id') && is_string($this->tenant_id)) {
            $this->merge([
                'tenant_id' => (int) $this->tenant_id,
            ]);
        }

        // Trim string fields
        $stringFields = ['status', 'type_of_notice', 'have_an_exception', 'note', 'evictions', 'sent_to_atorney', 'evected_or_payment_plan', 'if_left'];
        
        foreach ($stringFields as $field) {
            if ($this->has($field) && is_string($this->$field)) {
                $this->merge([
                    $field => trim($this->$field),
                ]);
            }
        }
    }
}
