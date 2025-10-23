import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FormSection from './FormSection';
import { City } from '@/types/City';
import { PropertyInfoWithoutInsurance } from '@/types/PropertyInfoWithoutInsurance';

interface CityPropertyUnitSelectorProps {
    cities: City[];
    propertiesByCityId: Record<number, PropertyInfoWithoutInsurance[]>;
    unitsByPropertyId: Record<number, Array<{ id: number; unit_name: string }>>;
    selectedCity: number | null;
    selectedProperty: number | null;
    selectedUnit: number | null;
    onCityChange: (cityId: string) => void;
    onPropertyChange: (propertyId: string) => void;
    onUnitChange: (unitId: string) => void;
    validationErrors: {
        city: string;
        property: string;
        unit: string;
    };
    cityRef: React.RefObject<HTMLButtonElement>;
    propertyRef: React.RefObject<HTMLButtonElement>;
    unitRef: React.RefObject<HTMLButtonElement>;
}

export default function CityPropertyUnitSelector({
    cities,
    propertiesByCityId,
    unitsByPropertyId,
    selectedCity,
    selectedProperty,
    selectedUnit,
    onCityChange,
    onPropertyChange,
    onUnitChange,
    validationErrors,
    cityRef,
    propertyRef,
    unitRef
}: CityPropertyUnitSelectorProps) {
    const [availableProperties, setAvailableProperties] = useState<PropertyInfoWithoutInsurance[]>([]);
    const [availableUnits, setAvailableUnits] = useState<Array<{ id: number; unit_name: string }>>([]);

    useEffect(() => {
        if (selectedCity && propertiesByCityId[selectedCity]) {
            setAvailableProperties(propertiesByCityId[selectedCity]);
        } else {
            setAvailableProperties([]);
        }
    }, [selectedCity, propertiesByCityId]);

    useEffect(() => {
        if (selectedProperty && unitsByPropertyId[selectedProperty]) {
            setAvailableUnits(unitsByPropertyId[selectedProperty]);
        } else {
            setAvailableUnits([]);
        }
    }, [selectedProperty, unitsByPropertyId]);

    return (
        <>
            {/* City Selection */}
            <FormSection
                borderColor="border-l-blue-500"
                label="City"
                htmlFor="city_name"
                required
                error={validationErrors.city}
            >
                <Select onValueChange={onCityChange} value={selectedCity?.toString() || ''}>
                    <SelectTrigger ref={cityRef}>
                        <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                        {cities?.map((city) => (
                            <SelectItem key={city.id} value={city.id.toString()}>
                                {city.city}
                            </SelectItem>
                        )) || []}
                    </SelectContent>
                </Select>
            </FormSection>

            {/* Property Selection */}
            <FormSection
                borderColor="border-l-green-500"
                label="Property Name"
                htmlFor="property_name"
                required
                error={validationErrors.property}
            >
                <Select
                    onValueChange={onPropertyChange}
                    value={selectedProperty?.toString() || ''}
                    disabled={!selectedCity}
                >
                    <SelectTrigger ref={propertyRef}>
                        <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableProperties?.map((property) => (
                            <SelectItem key={property.id} value={property.id.toString()}>
                                {property.property_name}
                            </SelectItem>
                        )) || []}
                    </SelectContent>
                </Select>
            </FormSection>

            {/* Unit Selection */}
            <FormSection
                borderColor="border-l-purple-500"
                label="Unit Name"
                htmlFor="units_name"
                required
                error={validationErrors.unit}
            >
                <Select
                    onValueChange={onUnitChange}
                    value={selectedUnit?.toString() || ''}
                    disabled={!selectedProperty}
                >
                    <SelectTrigger ref={unitRef}>
                        <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableUnits?.map((unit) => (
                            <SelectItem key={unit.id} value={unit.id.toString()}>
                                {unit.unit_name}
                            </SelectItem>
                        )) || []}
                    </SelectContent>
                </Select>
            </FormSection>
        </>
    );
}
