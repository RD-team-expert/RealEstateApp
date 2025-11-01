import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PropertyFieldProps {
    selectedProperty: string;
    selectedCity: string;
    getAvailableProperties: () => string[];
    handlePropertyChange: (property: string) => void;
    propertyRef: React.RefObject<HTMLButtonElement>;
    propertyValidationError: string;
}

export default function PropertyField({
    selectedProperty,
    selectedCity,
    getAvailableProperties,
    handlePropertyChange,
    propertyRef,
    propertyValidationError,
}: PropertyFieldProps) {
    return (
        <div className="rounded-lg border-l-4 border-l-orange-500 p-4">
            <div className="mb-2">
                <Label htmlFor="property_name" className="text-base font-semibold">
                    Property *
                </Label>
            </div>
            <Select 
                onValueChange={handlePropertyChange} 
                value={selectedProperty || undefined} 
                disabled={!selectedCity}
            >
                <SelectTrigger ref={propertyRef}>
                    <SelectValue placeholder={!selectedCity ? 'Select city first' : 'Select property'} />
                </SelectTrigger>
                <SelectContent>
                    {getAvailableProperties().map((property) => (
                        <SelectItem key={property} value={property}>
                            {property}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {propertyValidationError && <p className="mt-1 text-sm text-red-600">{propertyValidationError}</p>}
        </div>
    );
}
