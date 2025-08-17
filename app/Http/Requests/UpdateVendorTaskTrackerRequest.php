<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVendorTaskTrackerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'city' => [
                'required',
                'string',
                'max:255',
                Rule::exists('units', 'city')
            ],
            'task_submission_date' => ['required', 'date'],
            'vendor_name' => [
                'required',
                'string',
                'max:255',
                Rule::exists('vendors_info', 'vendor_name')
            ],
            'unit_name' => [
                'required',
                'string',
                'max:255',
                Rule::exists('units', 'unit_name')->where(function ($query) {
                    return $query->where('city', $this->input('city'));
                })
            ],
            'assigned_tasks' => ['required', 'string'],
            'any_scheduled_visits' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
            'task_ending_date' => ['nullable', 'date'],
            'status' => ['nullable', 'string', 'max:255'],
            'urgent' => ['required', 'string', Rule::in(['Yes', 'No'])],
        ];
    }

    public function messages(): array
    {
        return [
            'city.exists' => 'The selected city must exist in the units table.',
            'vendor_name.exists' => 'The selected vendor name must exist in the vendors info table.',
            'unit_name.exists' => 'The selected unit name must exist for the selected city.',
            'urgent.in' => 'The urgent field must be either Yes or No.',
            'task_submission_date.required' => 'The task submission date is required.',
            'assigned_tasks.required' => 'The assigned tasks field is required.',
        ];
    }
}
