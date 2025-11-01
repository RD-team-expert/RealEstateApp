import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PropertyInfoWithoutInsurance } from '@/types/PropertyInfoWithoutInsurance';
import FormSection from './FormSection';

interface CityPropertySelectorProps {
    cities: Array<{ id: number; city: string }>;
    selectedCityId: string;
    onCityChange: (cityId: string) => void;
    availableProperties: PropertyInfoWithoutInsurance[];
    propertyId: string;
    onPropertyChange: (propertyId: string) => void;
    propertyRef: React.RefObject<HTMLButtonElement>;
    validationError: string;
    propertyValidationError: string;
    propertyError?: string;
}

export default function CityPropertySelector({
    cities,
    selectedCityId,
    onCityChange,
    availableProperties,
    propertyId,
    onPropertyChange,
    propertyRef,
    validationError,
    propertyValidationError,
    propertyError,
}: CityPropertySelectorProps) {
    return (
        <>
            {/* City Selection */}
            <FormSection borderColor="border-l-blue-500">
                <div className="mb-2">
                    <Label htmlFor="city" className="text-base font-semibold">
                        City *
                    </Label>
                </div>
                <Select onValueChange={onCityChange} value={selectedCityId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a city" />
                    </SelectTrigger>
                    <SelectContent>
                        {cities?.map((city) => (
                            <SelectItem key={city.id} value={city.id.toString()}>
                                {city.city}
                            </SelectItem>
                        )) || []}
                    </SelectContent>
                </Select>
                {validationError && <p className="mt-1 text-sm text-red-600">{validationError}</p>}
            </FormSection>

            {/* Property Selection */}
            <FormSection borderColor="border-l-green-500">
                <div className="mb-2">
                    <Label htmlFor="property_id" className="text-base font-semibold">
                        Property *
                    </Label>
                </div>
                <Select
                    onValueChange={onPropertyChange}
                    value={propertyId}
                    disabled={!selectedCityId || availableProperties.length === 0}
                >
                    <SelectTrigger ref={propertyRef}>
                        <SelectValue placeholder={!selectedCityId ? "Select city first" : "Select property"} />
                    </SelectTrigger>
                    <SelectContent>
                        {availableProperties?.map((property) => (
                            <SelectItem key={property.id} value={property.id.toString()}>
                                {property.property_name}
                            </SelectItem>
                        )) || []}
                    </SelectContent>
                </Select>
                {propertyError && <p className="mt-1 text-sm text-red-600">{propertyError}</p>}
                {propertyValidationError && <p className="mt-1 text-sm text-red-600">{propertyValidationError}</p>}
            </FormSection>
        </>
    );
}
