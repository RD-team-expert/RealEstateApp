// resources/js/pages/Properties/components/PropertySelectField.tsx

import React, { forwardRef } from 'react';
import { Label } from '@/components/ui/label';
import { Building2 } from 'lucide-react';
import { PropertyWithoutInsurance } from '@/types/property';

interface PropertySelectFieldProps {
    value: number;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    availableProperties: PropertyWithoutInsurance[];
    error?: string;
    validationError?: string;
}

const PropertySelectField = forwardRef<HTMLSelectElement, PropertySelectFieldProps>(
    ({ value, onChange, availableProperties, error, validationError }, ref) => {
        return (
            <div className="rounded-lg border-l-4 border-l-blue-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="property_id" className="text-base font-semibold">
                        <Building2 className="h-4 w-4 inline mr-1" />
                        Property *
                    </Label>
                </div>
                <select
                    ref={ref}
                    id="property_id"
                    value={value || ''}
                    onChange={onChange}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <option value="">Select a property...</option>
                    {availableProperties.map((availableProperty) => (
                        <option key={availableProperty.id} value={availableProperty.id}>
                            {availableProperty.property_name}
                            {availableProperty.city_id && ` (${availableProperty.city_id})`}
                        </option>
                    ))}
                </select>
                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                {validationError && <p className="mt-1 text-sm text-red-600">{validationError}</p>}
            </div>
        );
    }
);

PropertySelectField.displayName = 'PropertySelectField';

export default PropertySelectField;
