// resources/js/Pages/Properties/create/PropertySelectionSection.tsx
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, AlertCircle } from 'lucide-react';
import { PropertyWithoutInsurance } from '@/types/property';

interface PropertySelectionSectionProps {
    propertyId: number;
    selectedCityId: string;
    filteredProperties: PropertyWithoutInsurance[];
    onPropertyChange: (value: string) => void;
    errors: any;
    validationError: string;
}

/**
 * Property selection component
 * Displays available properties for selected city
 * This is the ONLY required field
 */
export default function PropertySelectionSection({
    propertyId,
    selectedCityId,
    filteredProperties,
    onPropertyChange,
    errors,
    validationError
}: PropertySelectionSectionProps) {
    return (
        <div className="rounded-lg border-l-4 border-l-green-500 p-4">
            <div className="mb-2">
                <Label htmlFor="property_select" className="text-base font-semibold">
                    <Building2 className="h-4 w-4 inline mr-1" />
                    Select Property *
                </Label>
            </div>
            <Select 
                value={propertyId && propertyId !== 0 ? propertyId.toString() : ''} 
                onValueChange={onPropertyChange}
                disabled={!selectedCityId}
            >
                <SelectTrigger className="w-full">
                    <SelectValue 
                        placeholder={
                            !selectedCityId 
                                ? "Select a city first..." 
                                : "Choose a property..."
                        } 
                    />
                </SelectTrigger>
                <SelectContent>
                    {filteredProperties.map((property) => (
                        <SelectItem key={property.id} value={property.id.toString()}>
                            {property.property_name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            
            {/* Show backend validation errors if any */}
            {errors.property_id && <p className="mt-1 text-sm text-red-600">{errors.property_id}</p>}
            
            {/* Show frontend validation error if user tries to submit without selecting */}
            {validationError && <p className="mt-1 text-sm text-red-600">{validationError}</p>}
            
            {/* Show alert if city is selected but no properties available */}
            {selectedCityId && filteredProperties.length === 0 && (
                <Alert className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        No properties found for the selected city.
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}
