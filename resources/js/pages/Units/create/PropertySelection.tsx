import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PropertyInfoWithoutInsurance } from '@/types/PropertyInfoWithoutInsurance';
import { forwardRef } from 'react';

interface Props {
    availableProperties: PropertyInfoWithoutInsurance[];
    selectedCityId: string;
    propertyId: string;
    onPropertyChange: (propertyId: string) => void;
    error?: string;
    validationError?: string;
}

const PropertySelection = forwardRef<HTMLButtonElement, Props>(
    ({ availableProperties, selectedCityId, propertyId, onPropertyChange, error, validationError }, ref) => {
        return (
            <div className="rounded-lg border-l-4 border-l-green-500 p-4">
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
                    <SelectTrigger ref={ref}>
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
                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                {validationError && <p className="mt-1 text-sm text-red-600">{validationError}</p>}
            </div>
        );
    }
);

PropertySelection.displayName = 'PropertySelection';

export default PropertySelection;
