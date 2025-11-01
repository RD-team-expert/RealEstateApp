import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PropertyInfoWithoutInsurance } from '@/types/PropertyInfoWithoutInsurance';
import React from 'react';
import FormSection from './FormSection';

interface PropertySelectorProps {
    properties: PropertyInfoWithoutInsurance[];
    selectedPropertyId: string;
    onPropertyChange: (propertyId: string) => void;
    propertyRef: React.RefObject<HTMLButtonElement>;
    disabled: boolean;
    selectedCityId: string;
    error?: string;
}

export default function PropertySelector({ 
    properties, 
    selectedPropertyId, 
    onPropertyChange, 
    propertyRef,
    disabled,
    selectedCityId,
    error 
}: PropertySelectorProps) {
    return (
        <FormSection 
            label="Property" 
            borderColor="border-l-gray-500" 
            error={error}
            required
        >
            <Select 
                onValueChange={onPropertyChange} 
                value={selectedPropertyId} 
                disabled={disabled}
            >
                <SelectTrigger ref={propertyRef}>
                    <SelectValue placeholder={selectedCityId ? 'Select property' : 'Select city first'} />
                </SelectTrigger>
                <SelectContent>
                    {properties.map((property) => (
                        <SelectItem key={property.id} value={property.id.toString()}>
                            {property.property_name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </FormSection>
    );
}
