<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

class NoticeAndEvictionRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'unit_name' => [
                'required', 'string',
                Rule::exists('tenants', 'unit_number'),
            ],
            'city_name' => ['nullable', 'string', 'max:255'],
            'property_name' => ['nullable', 'string', 'max:255'],
            'tenants_name' => [
                'required', 'string', function($attribute, $value, $fail) {
                    $nameParts = explode(' ', $value, 2);
                    if(count($nameParts) < 2) {
                        $fail('The ' . $attribute . ' must contain first and last name');
                        return;
                    }
                    [$firstName, $lastName] = $nameParts;
                    $exists = DB::table('tenants')
                        ->where('first_name', $firstName)
                        ->where('last_name', $lastName)
                        ->exists();
                    if(!$exists) {
                        $fail('The tenant does not exist in the tenants table');
                    }
                }
            ],
            'status' => 'nullable|string',
            'date' => 'nullable|date',
            'type_of_notice' => [
                'nullable',
                'string',
                Rule::exists('notices', 'notice_name')
            ],
            'have_an_exception' => ['nullable', Rule::in(['Yes', 'No'])],
            'note' => 'nullable|string',
            'evictions' => 'nullable|string',
            'sent_to_atorney' => ['nullable', Rule::in(['Yes', 'No'])],
            'hearing_dates' => 'nullable|date',
            'evected_or_payment_plan' => ['nullable', Rule::in(['Evected', 'Payment Plan'])],
            'if_left' => ['nullable', Rule::in(['Yes', 'No'])],
            'writ_date' => 'nullable|date'
        ];
    }
}
