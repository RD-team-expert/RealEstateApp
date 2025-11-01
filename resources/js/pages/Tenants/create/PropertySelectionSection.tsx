import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PropertyInfoWithoutInsurance } from '@/types/PropertyInfoWithoutInsurance';
import { forwardRef } from 'react';

interface PropertySelectionSectionProps {
    properties: PropertyInfoWithoutInsurance[];
    value: string;
    onChange: (value: string) => void;
    disabled: boolean;
    validationError?: string;
}

export const PropertySelectionSection = forwardRef<HTMLButtonElement, PropertySelectionSectionProps>(
    ({ properties, value, onChange, disabled, validationError }, ref) => {
        return (
            <div className="rounded-lg border-l-4 border-l-green-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="property_name" className="text-base font-semibold">
                        Property Name *
                    </Label>
                </div>
                <Select 
                    onValueChange={onChange} 
                    value={value}
                    disabled={disabled}
                >
                    <SelectTrigger ref={ref}>
                        <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                    <SelectContent>
                        {properties?.map((property) => (
                            <SelectItem key={property.id} value={property.property_name}>
                                {property.property_name}
                            </SelectItem>
                        )) || []}
                    </SelectContent>
                </Select>
                {validationError && <p className="mt-1 text-sm text-red-600">{validationError}</p>}
            </div>
        );
    }
);

PropertySelectionSection.displayName = 'PropertySelectionSection';
