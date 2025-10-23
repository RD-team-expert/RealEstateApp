import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { City } from '@/types/City';
import { PropertyInfoWithoutInsurance } from '@/types/PropertyInfoWithoutInsurance';
import React from 'react';

interface LocationSelectionFieldsProps {
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
    cityRef: React.RefObject<HTMLButtonElement>;
    propertyRef: React.RefObject<HTMLButtonElement>;
    unitRef: React.RefObject<HTMLButtonElement>;
    onCityChange: (cityId: string) => void;
    onPropertyChange: (propertyId: string) => void;
    onUnitChange: (unitId: string) => void;
    tenants: string;
    tenantsError?: string;
    onTenantsChange: (value: string) => void;
}

export function LocationSelectionFields({
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
    tenants,
    tenantsError,
    onTenantsChange
}: LocationSelectionFieldsProps) {
    return (
        <>
            {/* City Selection */}
            <div className="rounded-lg border-l-4 border-l-blue-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="city_name" className="text-base font-semibold">
                        City *
                    </Label>
                </div>
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
                {validationErrors.city && <p className="mt-1 text-sm text-red-600">{validationErrors.city}</p>}
            </div>

            {/* Property Selection */}
            <div className="rounded-lg border-l-4 border-l-green-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="property_name" className="text-base font-semibold">
                        Property Name *
                    </Label>
                </div>
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
                {validationErrors.property && <p className="mt-1 text-sm text-red-600">{validationErrors.property}</p>}
            </div>

            {/* Unit Selection */}
            <div className="rounded-lg border-l-4 border-l-purple-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="units_name" className="text-base font-semibold">
                        Unit Name *
                    </Label>
                </div>
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
                {validationErrors.unit && <p className="mt-1 text-sm text-red-600">{validationErrors.unit}</p>}
            </div>

            {/* Tenants */}
            <div className="rounded-lg border-l-4 border-l-orange-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="tenants" className="text-base font-semibold">
                        Tenants
                    </Label>
                </div>
                <Input
                    id="tenants"
                    value={tenants}
                    onChange={(e) => onTenantsChange(e.target.value)}
                    placeholder="Enter tenant names"
                />
                {tenantsError && <p className="mt-1 text-sm text-red-600">{tenantsError}</p>}
            </div>
        </>
    );
}
