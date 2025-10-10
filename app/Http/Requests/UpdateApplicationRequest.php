<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Unit;
use App\Models\PropertyInfoWithoutInsurance;
use App\Models\Cities;

class UpdateApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'city_id' => [
                'required',
                'integer',
                'exists:cities,id',
                function ($attribute, $value, $fail) {
                    $city = Cities::find($value);
                    if (!$city || $city->is_archived) {
                        $fail('The selected city does not exist or is archived.');
                    }
                }
            ],
            'property_id' => [
                'required',
                'integer',
                'exists:property_info_without_insurance,id',
                function ($attribute, $value, $fail) {
                    $cityId = $this->input('city_id');
                    if ($cityId) {
                        $property = PropertyInfoWithoutInsurance::find($value);
                        if (!$property || $property->is_archived || $property->city_id != $cityId) {
                            $fail('The selected property does not exist for the selected city or is archived.');
                        }
                    }
                }
            ],
            'unit_id' => [
                'required',
                'integer',
                'exists:units,id',
                function ($attribute, $value, $fail) {
                    $propertyId = $this->input('property_id');
                    if ($propertyId) {
                        $unit = Unit::find($value);
                        if (!$unit || $unit->is_archived || $unit->property_id != $propertyId) {
                            $fail('The selected unit does not exist for the selected property or is archived.');
                        }
                    }
                }
            ],
            'name' => 'required|string|max:255',
            'co_signer' => 'required|string|max:255',
            'status' => 'nullable|string|max:255',
            'date' => 'nullable|date',
            'stage_in_progress' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:65535',
            'attachment' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240', // 10MB max
        ];
    }

    public function messages(): array
    {
        return [
            'city_id.required' => 'City is required.',
            'city_id.integer' => 'City must be a valid selection.',
            'city_id.exists' => 'The selected city does not exist.',
            'property_id.required' => 'Property is required.',
            'property_id.integer' => 'Property must be a valid selection.',
            'property_id.exists' => 'The selected property does not exist.',
            'unit_id.required' => 'Unit is required.',
            'unit_id.integer' => 'Unit must be a valid selection.',
            'unit_id.exists' => 'The selected unit does not exist.',
            'name.required' => 'Name is required.',
            'name.max' => 'Name must not exceed 255 characters.',
            'co_signer.required' => 'Co-signer is required.',
            'co_signer.max' => 'Co-signer must not exceed 255 characters.',
            'status.max' => 'Status must not exceed 255 characters.',
            'date.date' => 'Date must be a valid date.',
            'stage_in_progress.max' => 'Stage in progress must not exceed 255 characters.',
            'notes.max' => 'Notes must not exceed 65,535 characters.',
            'attachment.file' => 'Attachment must be a valid file.',
            'attachment.mimes' => 'The attachment must be a PDF, Word document, or image file.',
            'attachment.max' => 'The attachment must not be larger than 10MB.',
        ];
    }

    /**
     * Get the validated data with proper field mapping
     */
    public function validated($key = null, $default = null)
    {
        $validated = parent::validated($key, $default);
        
        // Remove helper fields that aren't part of the model
        unset($validated['city_id'], $validated['property_id']);
        
        return $validated;
    }

    /**
     * Prepare the data for validation
     */
    protected function prepareForValidation()
    {
        // If unit_id is provided, we can derive city_id and property_id for validation
        if ($this->has('unit_id') && !$this->has('city_id')) {
            $unit = Unit::with('property.city')->find($this->input('unit_id'));
            if ($unit && $unit->property && $unit->property->city) {
                $this->merge([
                    'city_id' => $unit->property->city->id,
                    'property_id' => $unit->property->id,
                ]);
            }
        }
    }
}
