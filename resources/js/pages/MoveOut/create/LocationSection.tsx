import React from 'react';
import FormField from './FormField';
import SelectField from './SelectField';
import { City } from '@/types/City';
import { PropertyInfoWithoutInsurance } from '@/types/PropertyInfoWithoutInsurance';

interface Props {
    cities: City[];
    availableProperties: PropertyInfoWithoutInsurance[];
    availableUnits: Array<{ id: number; unit_name: string }>;
    selectedCity: number | null;
    selectedProperty: number | null;
    selectedUnit: number | null;
    validationErrors: {
        city: string;
        property: string;
        unit: string;
    };
    cityRef: React.RefObject<HTMLButtonElement | null>;
    propertyRef: React.RefObject<HTMLButtonElement | null>;
    unitRef: React.RefObject<HTMLButtonElement | null>;
    onCityChange: (value: string) => void;
    onPropertyChange: (value: string) => void;
    onUnitChange: (value: string) => void;
}

export default function LocationSection({
    cities,
    availableProperties,
    availableUnits,
    selectedCity,
    selectedProperty,
    selectedUnit,
    validationErrors,
    cityRef,
    propertyRef,
    unitRef,
    onCityChange,
    onPropertyChange,
    onUnitChange,
}: Props) {
    return (
        <>
            <FormField
                label="City"
                borderColor="blue"
                error={validationErrors.city}
                required
            >
                <SelectField
                    ref={cityRef}
                    placeholder="Select city"
                    value={selectedCity?.toString() || ''}
                    onValueChange={onCityChange}
                    options={cities.map(city => ({
                        value: city.id.toString(),
                        label: city.city
                    }))}
                />
            </FormField>

            <FormField
                label="Property Name"
                borderColor="green"
                error={validationErrors.property}
                required
            >
                <SelectField
                    ref={propertyRef}
                    placeholder="Select property"
                    value={selectedProperty?.toString() || ''}
                    onValueChange={onPropertyChange}
                    disabled={!selectedCity}
                    options={availableProperties.map(property => ({
                        value: property.id.toString(),
                        label: property.property_name
                    }))}
                />
            </FormField>

            <FormField
                label="Unit Name"
                borderColor="purple"
                error={validationErrors.unit}
                required
            >
                <SelectField
                    ref={unitRef}
                    placeholder="Select unit"
                    value={selectedUnit?.toString() || ''}
                    onValueChange={onUnitChange}
                    disabled={!selectedProperty}
                    options={availableUnits.map(unit => ({
                        value: unit.id.toString(),
                        label: unit.unit_name
                    }))}
                />
            </FormField>
        </>
    );
}
