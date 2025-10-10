<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date' => ['required', 'date'],
            'unit_id' => [
                'nullable',
                'integer',
                Rule::exists('units', 'id')->where(function ($query) {
                    $query->where('is_archived', false);
                })
            ],
            'owes' => ['required', 'numeric', 'min:0', 'max:999999.99'],
            'paid' => ['nullable', 'numeric', 'min:0', 'max:999999.99'],
            'left_to_pay' => ['nullable', 'numeric'],
            'status' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'reversed_payments' => ['nullable', 'string', 'max:255'],
            'permanent' => ['required', 'string', Rule::in(['Yes', 'No'])],
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
}
