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
            'date' => ['required', 'date'],
            'city' => [
                'required',
                'string',
                'max:255',
                Rule::exists('units', 'city')
            ],
            'property_name' => ['nullable', 'string', 'max:255'],
            'unit_name' => [
                'required',
                'string',
                'max:255',
                Rule::exists('units', 'unit_name')->where(function ($query) {
                    return $query->where('city', $this->city);
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
            'city.exists' => 'The selected city must exist in the units table.',
            'unit_name.exists' => 'The selected unit name must exist for the selected city in the units table.',
            'permanent.in' => 'The permanent field must be either Yes or No.',
        ];
    }
}
