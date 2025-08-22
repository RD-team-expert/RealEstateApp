<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

class PaymentPlanUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'property' => [
                'required',
                'string',
                Rule::exists('tenants', 'property_name')
            ],
            'unit' => [
                'required',
                'string',
                Rule::exists('tenants', 'unit_number')
            ],
            'tenant' => [
                'required',
                'string',
                function ($attribute, $value, $fail) {
                    $exists = DB::table('tenants')
                        ->whereRaw("CONCAT(first_name, ' ', last_name) = ?", [$value])
                        ->exists();

                    if (!$exists) {
                        $fail('The selected tenant is invalid.');
                    }
                }
            ],
            'amount' => 'required|numeric|min:0',
            'dates' => 'required|date',
            'paid' => 'required|numeric|min:0|lte:amount',
            'notes' => 'nullable|string|max:1000'
        ];
    }
}
