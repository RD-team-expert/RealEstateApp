import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import React from 'react';

interface PropertyOption {
    id: number;
    property_name: string;
    city?: string;
}

interface PropertySectionProps {
    availableProperties: PropertyOption[];
    selectedProperty: string;
    selectedCity: string;
    onPropertyChange: (property: string) => void;
}

export default function PropertySection({
    availableProperties,
    selectedProperty,
    selectedCity,
    onPropertyChange
}: PropertySectionProps) {
    return (
        <div className="rounded-lg border-l-4 border-l-indigo-500 p-4">
            <div className="mb-2">
                <Label htmlFor="property" className="text-base font-semibold">
                    Property *
                </Label>
            </div>
            <Select
                onValueChange={onPropertyChange}
                value={selectedProperty}
                disabled={!selectedCity}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                    {availableProperties?.map((property) => (
                        <SelectItem key={property.id} value={property.property_name}>
                            {property.property_name}
                        </SelectItem>
                    )) || []}
                </SelectContent>
            </Select>
        </div>
    );
}
