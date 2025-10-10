<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date' => ['sometimes', 'required', 'date'],
            'unit_id' => [
                'sometimes',
                'nullable',
                'integer',
                Rule::exists('units', 'id')->where(function ($query) {
                    $query->where('is_archived', false);
                })
            ],
            'owes' => ['sometimes', 'required', 'numeric', 'min:0', 'max:999999.99'],
            'paid' => ['sometimes', 'nullable', 'numeric', 'min:0', 'max:999999.99'],
            'left_to_pay' => ['sometimes', 'nullable', 'numeric'],
            'status' => ['sometimes', 'nullable', 'string', 'max:255'],
            'notes' => ['sometimes', 'nullable', 'string'],
            'reversed_payments' => ['sometimes', 'nullable', 'string', 'max:255'],
            'permanent' => ['sometimes', 'required', 'string', Rule::in(['Yes', 'No'])],
        ];
    }

    public function messages(): array
    {
        return [
            'unit_id.exists' => 'The selected unit must exist and not be archived.',
            'unit_id.integer' => 'The unit ID must be a valid integer.',
            'date.required' => 'The payment date is required.',
            'date.date' => 'The payment date must be a valid date.',
            'owes.required' => 'The amount owed is required.',
            'owes.numeric' => 'The amount owed must be a valid number.',
            'owes.min' => 'The amount owed must be at least 0.',
            'owes.max' => 'The amount owed cannot exceed $999,999.99.',
            'paid.numeric' => 'The paid amount must be a valid number.',
            'paid.min' => 'The paid amount must be at least 0.',
            'paid.max' => 'The paid amount cannot exceed $999,999.99.',
            'permanent.required' => 'The permanent status is required.',
            'permanent.in' => 'The permanent field must be either Yes or No.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // If unit_id is provided as empty string, convert to null
        if ($this->unit_id === '') {
            $this->merge(['unit_id' => null]);
        }
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Custom validation logic can be added here if needed
            // For example, business rule validations that depend on multiple fields
            if ($this->paid && $this->owes && $this->paid > $this->owes) {
                $validator->errors()->add('paid', 'The paid amount cannot exceed the amount owed.');
            }
        });
    }
}
