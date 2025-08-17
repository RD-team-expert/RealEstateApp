<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

class UpdateMoveOutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tenants_name' => [
                'required',
                'string',
                'max:255',
                function ($attribute, $value, $fail) {
                    $exists = DB::table('tenants')
                        ->whereRaw("CONCAT(first_name, ' ', last_name) = ?", [$value])
                        ->exists();

                    if (!$exists) {
                        $fail('The selected tenant name does not exist.');
                    }
                }
            ],
            'units_name' => [
                'required',
                'string',
                'max:255',
                function ($attribute, $value, $fail) {
                    $tenantName = $this->input('tenants_name');
                    if ($tenantName) {
                        $exists = DB::table('tenants')
                            ->whereRaw("CONCAT(first_name, ' ', last_name) = ?", [$tenantName])
                            ->where('unit_number', $value)
                            ->exists();

                        if (!$exists) {
                            $fail('The selected unit does not belong to the selected tenant.');
                        }
                    }
                }
            ],
            'move_out_date' => ['nullable', 'date'],
            'lease_status' => ['nullable', 'string', 'max:255'],
            'date_lease_ending_on_buildium' => ['nullable', 'date'],
            'keys_location' => ['nullable', 'string', 'max:255'],
            'utilities_under_our_name' => ['nullable', 'string', Rule::in(['Yes', 'No'])],
            'date_utility_put_under_our_name' => ['nullable', 'date'],
            'walkthrough' => ['nullable', 'string'],
            'repairs' => ['nullable', 'string'],
            'send_back_security_deposit' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'cleaning' => ['nullable', 'string', Rule::in(['cleaned', 'uncleaned'])],
            'list_the_unit' => ['nullable', 'string', 'max:255'],
            'move_out_form' => ['nullable', 'string', Rule::in(['filled', 'not filled'])],
        ];
    }

    public function messages(): array
    {
        return [
            'tenants_name.required' => 'The tenant name is required.',
            'units_name.required' => 'The unit name is required.',
            'utilities_under_our_name.in' => 'The utilities under our name field must be either Yes or No.',
            'cleaning.in' => 'The cleaning field must be either cleaned or uncleaned.',
            'move_out_form.in' => 'The move out form field must be either filled or not filled.',
        ];
    }
}
