import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { City } from '@/types/City';
import { PropertyInfoWithoutInsurance } from '@/types/PropertyInfoWithoutInsurance';
import React from 'react';

interface LocationTenantSelectionProps {
    cities: City[];
    availableProperties: PropertyInfoWithoutInsurance[];
    availableUnits: Array<{ id: number; unit_name: string }>;
    availableTenants: Array<{ id: number; full_name: string; tenant_id: number }>;
    selectedCity: number | null;
    selectedProperty: number | null;
    selectedUnit: number | null;
    selectedTenant: number | null;
    validationErrors: {
        city: string;
        property: string;
        unit: string;
        tenant: string;
    };
    errors: {
        tenant_id?: string;
    };
    onCityChange: (cityId: string) => void;
    onPropertyChange: (propertyId: string) => void;
    onUnitChange: (unitId: string) => void;
    onTenantChange: (tenantId: string) => void;
    cityRef: React.RefObject<HTMLButtonElement>;
    propertyRef: React.RefObject<HTMLButtonElement>;
    unitRef: React.RefObject<HTMLButtonElement>;
    tenantRef: React.RefObject<HTMLButtonElement>;
}

export default function LocationTenantSelection({
    cities,
    availableProperties,
    availableUnits,
    availableTenants,
    selectedCity,
    selectedProperty,
    selectedUnit,
    selectedTenant,
    validationErrors,
    errors,
    onCityChange,
    onPropertyChange,
    onUnitChange,
    onTenantChange,
    cityRef,
    propertyRef,
    unitRef,
    tenantRef,
}: LocationTenantSelectionProps) {
    return (
        <div className="rounded-lg border-l-4 border-l-purple-500 p-4">
            <div className="mb-4 flex items-center gap-2">
                <Label className="text-base font-semibold">
                    Location & Tenant Selection *
                </Label>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
                <CitySelect
                    cities={cities}
                    selectedCity={selectedCity}
                    validationError={validationErrors.city}
                    onCityChange={onCityChange}
                    cityRef={cityRef}
                />

                <PropertySelect
                    availableProperties={availableProperties}
                    selectedProperty={selectedProperty}
                    selectedCity={selectedCity}
                    validationError={validationErrors.property}
                    onPropertyChange={onPropertyChange}
                    propertyRef={propertyRef}
                />

                <UnitSelect
                    availableUnits={availableUnits}
                    selectedUnit={selectedUnit}
                    selectedProperty={selectedProperty}
                    validationError={validationErrors.unit}
                    onUnitChange={onUnitChange}
                    unitRef={unitRef}
                />

                <TenantSelect
                    availableTenants={availableTenants}
                    selectedTenant={selectedTenant}
                    selectedUnit={selectedUnit}
                    validationError={validationErrors.tenant}
                    error={errors.tenant_id}
                    onTenantChange={onTenantChange}
                    tenantRef={tenantRef}
                />
            </div>
        </div>
    );
}

interface CitySelectProps {
    cities: City[];
    selectedCity: number | null;
    validationError: string;
    onCityChange: (cityId: string) => void;
    cityRef: React.RefObject<HTMLButtonElement>;
}

function CitySelect({ cities, selectedCity, validationError, onCityChange, cityRef }: CitySelectProps) {
    return (
        <div>
            <Label htmlFor="city" className="text-sm font-medium mb-2 block">
                City *
            </Label>
            <Select
                onValueChange={onCityChange}
                value={selectedCity?.toString() || ''}
            >
                <SelectTrigger ref={cityRef}>
                    <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                    {cities.map((city) => (
                        <SelectItem key={city.id} value={city.id.toString()}>
                            {city.city}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {validationError && <p className="mt-1 text-sm text-red-600">{validationError}</p>}
        </div>
    );
}

interface PropertySelectProps {
    availableProperties: PropertyInfoWithoutInsurance[];
    selectedProperty: number | null;
    selectedCity: number | null;
    validationError: string;
    onPropertyChange: (propertyId: string) => void;
    propertyRef: React.RefObject<HTMLButtonElement>;
}

function PropertySelect({ 
    availableProperties, 
    selectedProperty, 
    selectedCity, 
    validationError, 
    onPropertyChange, 
    propertyRef 
}: PropertySelectProps) {
    return (
        <div>
            <Label htmlFor="property" className="text-sm font-medium mb-2 block">
                Property *
            </Label>
            <Select
                onValueChange={onPropertyChange}
                value={selectedProperty?.toString() || ''}
                disabled={!selectedCity}
            >
                <SelectTrigger ref={propertyRef}>
                    <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                    {availableProperties.map((property) => (
                        <SelectItem key={property.id} value={property.id.toString()}>
                            {property.property_name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {validationError && <p className="mt-1 text-sm text-red-600">{validationError}</p>}
        </div>
    );
}

interface UnitSelectProps {
    availableUnits: Array<{ id: number; unit_name: string }>;
    selectedUnit: number | null;
    selectedProperty: number | null;
    validationError: string;
    onUnitChange: (unitId: string) => void;
    unitRef: React.RefObject<HTMLButtonElement>;
}

function UnitSelect({ 
    availableUnits, 
    selectedUnit, 
    selectedProperty, 
    validationError, 
    onUnitChange, 
    unitRef 
}: UnitSelectProps) {
    return (
        <div>
            <Label htmlFor="unit" className="text-sm font-medium mb-2 block">
                Unit *
            </Label>
            <Select
                onValueChange={onUnitChange}
                value={selectedUnit?.toString() || ''}
                disabled={!selectedProperty}
            >
                <SelectTrigger ref={unitRef}>
                    <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                    {availableUnits.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id.toString()}>
                            {unit.unit_name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {validationError && <p className="mt-1 text-sm text-red-600">{validationError}</p>}
        </div>
    );
}

interface TenantSelectProps {
    availableTenants: Array<{ id: number; full_name: string; tenant_id: number }>;
    selectedTenant: number | null;
    selectedUnit: number | null;
    validationError: string;
    error?: string;
    onTenantChange: (tenantId: string) => void;
    tenantRef: React.RefObject<HTMLButtonElement>;
}

function TenantSelect({ 
    availableTenants, 
    selectedTenant, 
    selectedUnit, 
    validationError, 
    error,
    onTenantChange, 
    tenantRef 
}: TenantSelectProps) {
    return (
        <div>
            <Label htmlFor="tenant" className="text-sm font-medium mb-2 block">
                Tenant *
            </Label>
            <Select
                onValueChange={onTenantChange}
                value={selectedTenant?.toString() || ''}
                disabled={!selectedUnit}
            >
                <SelectTrigger ref={tenantRef}>
                    <SelectValue placeholder="Select tenant" />
                </SelectTrigger>
                <SelectContent>
                    {availableTenants.map((tenant) => (
                        <SelectItem key={tenant.id} value={tenant.id.toString()}>
                            {tenant.full_name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            {validationError && <p className="mt-1 text-sm text-red-600">{validationError}</p>}
        </div>
    );
}
