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
            'property' => [
                'required', 'string',
                Rule::exists('tenants', 'property_name'),
            ],
            'city_name' => [
                'nullable', 'string',
                Rule::exists('cities', 'city_name'),
            ],
            'unit' => [
                'required', 'string',
                Rule::exists('tenants', 'unit_number'),
            ],
            'tenant' => [
                'required', 'string', function($attribute, $value, $fail) {
                    $nameParts = explode(' ', $value, 2);  // Only split into 2 parts: first and the rest
                    if (count($nameParts) < 2) {
                        $fail('The ' . $attribute . ' must contain first and last name');
                        return;
                    }
                    [$firstName, $lastName] = $nameParts;
                    $exists = DB::table('tenants')
                        ->where('first_name', $firstName)
                        ->where('last_name', $lastName)
                        ->exists();
                    if (!$exists) {
                        $fail('The tenant does not exist in the tenants table');
                    }
    }
],
            'date_sent_offer' => 'required|date',
            'status' => 'nullable|string',
            'date_of_acceptance' => 'nullable|date',
            'last_notice_sent' => 'nullable|date',
            'notice_kind' => 'nullable|string',
            'lease_sent' => 'nullable|string',
            'date_sent_lease' => 'nullable|date',
            'lease_signed' => 'nullable|string',
            'date_signed' => 'nullable|date',
            'last_notice_sent_2' => 'nullable|date',
            'notice_kind_2' => 'nullable|string',
            'notes' => 'nullable|string',
            'how_many_days_left' => 'nullable|integer',
            'expired' => 'nullable|string',
        ];
    }
}
