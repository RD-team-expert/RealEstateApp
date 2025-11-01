import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { City } from '@/types/City';
import { PropertyInfoWithoutInsurance } from '@/types/PropertyInfoWithoutInsurance';
import React from 'react';

interface LocationSectionProps {
    cities: City[];
    selectedCityId: string;
    onCityChange: (cityId: string) => void;
    availableProperties: PropertyInfoWithoutInsurance[];
    selectedPropertyName: string;
    onPropertyChange: (propertyName: string) => void;
    propertyNameRef: React.RefObject<HTMLButtonElement>;
    validationError: string;
    availableUnits: Array<{id: number; unit_name: string}>;
    unitId: string;
    onUnitChange: (unitId: string) => void;
    unitNumberRef: React.RefObject<HTMLButtonElement>;
    unitValidationError: string;
    errors: Record<string, string>;
}

export default function LocationSection({
    cities,
    selectedCityId,
    onCityChange,
    availableProperties,
    selectedPropertyName,
    onPropertyChange,
    propertyNameRef,
    validationError,
    availableUnits,
    unitId,
    onUnitChange,
    unitNumberRef,
    unitValidationError,
    errors,
}: LocationSectionProps) {
    return (
        <>
            {/* City Selection */}
            <div className="rounded-lg border-l-4 border-l-blue-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="city_id" className="text-base font-semibold">
                        City *
                    </Label>
                </div>
                <Select onValueChange={onCityChange} value={selectedCityId}>
                    <SelectTrigger>
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
            </div>

            {/* Property Information */}
            <div className="rounded-lg border-l-4 border-l-green-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="property_name" className="text-base font-semibold">
                        Property Name *
                    </Label>
                </div>
                <Select 
                    onValueChange={onPropertyChange} 
                    value={selectedPropertyName}
                    disabled={!selectedCityId}
                >
                    <SelectTrigger ref={propertyNameRef}>
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
                
                {validationError && <p className="mt-1 text-sm text-red-600">{validationError}</p>}
            </div>

            {/* Unit Selection */}
            <div className="rounded-lg border-l-4 border-l-purple-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="unit_id" className="text-base font-semibold">
                        Unit *
                    </Label>
                </div>
                <Select
                    onValueChange={onUnitChange}
                    value={unitId}
                    disabled={!selectedPropertyName}
                >
                    <SelectTrigger ref={unitNumberRef}>
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
                {errors.unit_id && <p className="mt-1 text-sm text-red-600">{errors.unit_id}</p>}
                {unitValidationError && <p className="mt-1 text-sm text-red-600">{unitValidationError}</p>}
            </div>
        </>
    );
}
