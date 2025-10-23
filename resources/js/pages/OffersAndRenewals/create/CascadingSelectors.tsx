import  { useMemo, RefObject, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface HierarchicalData {
    id: number;
    name: string;
    properties: {
        id: number;
        name: string;
        city_id: number;
        units: {
            id: number;
            name: string;
            property_id: number;
            tenants: {
                id: number;
                name: string;
                first_name: string;
                last_name: string;
                unit_id: number;
            }[];
        }[];
    }[];
}

interface CascadingSelectorsProps {
    hierarchicalData: HierarchicalData[];
    cityId: string;
    propertyId: string;
    unitId: string;
    tenantId: string;
    otherTenants: string;
    onCityChange: (cityId: string) => void;
    onPropertyChange: (propertyId: string) => void;
    onUnitChange: (unitId: string) => void;
    onTenantChange: (tenantId: string) => void;
    onOtherTenantsChange: (value: string) => void;
    errors: {
        city_id?: string;
        property_id?: string;
        unit_id?: string;
        tenant_id?: string;
    };
    validationErrors: {
        city?: string;
        property?: string;
        unit?: string;
        tenant?: string;
    };
    cityRef: RefObject<HTMLButtonElement | null>;
    propertyRef: RefObject<HTMLButtonElement | null>;
    unitRef: RefObject<HTMLButtonElement | null>;
    tenantRef: RefObject<HTMLButtonElement | null>;
}

export default function CascadingSelectors({
    hierarchicalData,
    cityId,
    propertyId,
    unitId,
    tenantId,
    otherTenants,
    onCityChange,
    onPropertyChange,
    onUnitChange,
    onTenantChange,
    onOtherTenantsChange,
    errors,
    validationErrors,
    cityRef,
    propertyRef,
    unitRef,
    tenantRef,
}: CascadingSelectorsProps) {
    const availableProperties = useMemo(() => {
        if (!cityId) return [];
        const selectedCity = hierarchicalData.find(city => city.id.toString() === cityId);
        return selectedCity ? selectedCity.properties : [];
    }, [hierarchicalData, cityId]);

    const availableUnits = useMemo(() => {
        if (!propertyId) return [];
        const selectedProperty = availableProperties.find(property => property.id.toString() === propertyId);
        return selectedProperty ? selectedProperty.units : [];
    }, [availableProperties, propertyId]);

    const availableTenants = useMemo(() => {
        if (!unitId) return [];
        const selectedUnit = availableUnits.find(unit => unit.id.toString() === unitId);
        return selectedUnit ? selectedUnit.tenants : [];
    }, [availableUnits, unitId]);

    const [showOtherTenantsDropdown, setShowOtherTenantsDropdown] = useState(false);
    
    // Update filtered tenants when available tenants change
    const [filteredTenants, setFilteredTenants] = useState(availableTenants);
    
    // Update filtered tenants when availableTenants changes
    useMemo(() => {
        setFilteredTenants(availableTenants);
    }, [availableTenants]);

    const handleOtherTenantsInputChange = (value: string) => {
        onOtherTenantsChange(value);
        
        // Filter tenants based on input
        if (value.trim() === '') {
            setFilteredTenants(availableTenants);
        } else {
            const filtered = availableTenants.filter(tenant =>
                tenant.name.toLowerCase().includes(value.toLowerCase()) ||
                tenant.first_name.toLowerCase().includes(value.toLowerCase()) ||
                tenant.last_name.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredTenants(filtered);
        }
        setShowOtherTenantsDropdown(true);
    };

    const handleTenantSelect = (tenant: any) => {
        onOtherTenantsChange(tenant.name);
        setShowOtherTenantsDropdown(false);
    };

    return (
        <>
            {/* City Selection */}
            <div className="rounded-lg border-l-4 border-l-indigo-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="city" className="text-base font-semibold">
                        City *
                    </Label>
                </div>
                <Select onValueChange={onCityChange} value={cityId}>
                    <SelectTrigger ref={cityRef}>
                        <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                        {hierarchicalData.map((city) => (
                            <SelectItem key={city.id} value={city.id.toString()}>
                                {city.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.city_id && <p className="mt-1 text-sm text-red-600">{errors.city_id}</p>}
                {validationErrors.city && <p className="mt-1 text-sm text-red-600">{validationErrors.city}</p>}
            </div>

            {/* Property Selection */}
            <div className="rounded-lg border-l-4 border-l-blue-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="property" className="text-base font-semibold">
                        Property *
                    </Label>
                </div>
                <Select
                    onValueChange={onPropertyChange}
                    value={propertyId}
                    disabled={!cityId || availableProperties.length === 0}
                >
                    <SelectTrigger ref={propertyRef}>
                        <SelectValue
                            placeholder={
                                !cityId
                                    ? "Select city first"
                                    : availableProperties.length === 0
                                        ? "No properties available"
                                        : "Select property"
                            }
                        />
                    </SelectTrigger>
                    <SelectContent>
                        {availableProperties.map((property) => (
                            <SelectItem key={property.id} value={property.id.toString()}>
                                {property.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.property_id && <p className="mt-1 text-sm text-red-600">{errors.property_id}</p>}
                {validationErrors.property && <p className="mt-1 text-sm text-red-600">{validationErrors.property}</p>}
            </div>

            {/* Unit Selection */}
            <div className="rounded-lg border-l-4 border-l-green-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="unit" className="text-base font-semibold">
                        Unit *
                    </Label>
                </div>
                <Select
                    onValueChange={onUnitChange}
                    value={unitId}
                    disabled={!propertyId || availableUnits.length === 0}
                >
                    <SelectTrigger ref={unitRef}>
                        <SelectValue
                            placeholder={
                                !propertyId
                                    ? "Select property first"
                                    : availableUnits.length === 0
                                        ? "No units available"
                                        : "Select unit"
                            }
                        />
                    </SelectTrigger>
                    <SelectContent>
                        {availableUnits.map((unit) => (
                            <SelectItem key={unit.id} value={unit.id.toString()}>
                                {unit.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.unit_id && <p className="mt-1 text-sm text-red-600">{errors.unit_id}</p>}
                {validationErrors.unit && <p className="mt-1 text-sm text-red-600">{validationErrors.unit}</p>}
            </div>

            {/* Tenant Selection */}
            <div className="rounded-lg border-l-4 border-l-purple-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="tenant" className="text-base font-semibold">
                        Tenant *
                    </Label>
                </div>
                <Select
                    onValueChange={onTenantChange}
                    value={tenantId}
                    disabled={!unitId || availableTenants.length === 0}
                >
                    <SelectTrigger ref={tenantRef}>
                        <SelectValue
                            placeholder={
                                !unitId
                                    ? "Select unit first"
                                    : availableTenants.length === 0
                                        ? "No tenants available"
                                        : "Select tenant"
                            }
                        />
                    </SelectTrigger>
                    <SelectContent>
                        {availableTenants.map((tenant) => (
                            <SelectItem key={tenant.id} value={tenant.id.toString()}>
                                {tenant.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.tenant_id && <p className="mt-1 text-sm text-red-600">{errors.tenant_id}</p>}
                {validationErrors.tenant && <p className="mt-1 text-sm text-red-600">{validationErrors.tenant}</p>}
            </div>

            {/* Other Tenant Names Input */}
            <div className="rounded-lg border-l-4 border-l-pink-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="other_tenants" className="text-base font-semibold">
                        Other Tenant Names
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                        You can select from the dropdown or type custom names
                    </p>
                </div>
                <div className="relative">
                    <Input
                        id="other_tenants"
                        type="text"
                        placeholder="Type tenant names or select from dropdown"
                        value={otherTenants}
                        onChange={(e) => handleOtherTenantsInputChange(e.target.value)}
                        onFocus={() => {
                            setFilteredTenants(availableTenants);
                            setShowOtherTenantsDropdown(availableTenants.length > 0);
                        }}
                        onBlur={() => {
                            // Delay hiding dropdown to allow for clicks
                            setTimeout(() => setShowOtherTenantsDropdown(false), 200);
                        }}
                        disabled={!unitId || availableTenants.length === 0}
                        className="w-full"
                    />
                    
                    {showOtherTenantsDropdown && filteredTenants.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-input bg-popover shadow-lg">
                            {filteredTenants.map((tenant) => (
                                <div
                                    key={tenant.id}
                                    className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                    onClick={() => handleTenantSelect(tenant)}
                                >
                                    {tenant.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
