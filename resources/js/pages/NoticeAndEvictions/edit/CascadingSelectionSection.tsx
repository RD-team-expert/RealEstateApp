import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { City, PropertyInfoWithoutInsurance, Tenant } from '@/types/NoticeAndEviction';

interface Unit {
    id: number;
    property_id: number;
    unit_name: string;
    property_name: string;
    city_name: string;
}

interface ExtendedTenant extends Tenant {
    unit_id: number;
    full_name: string;
    unit_name: string;
    property_name: string;
    city_name: string;
}

interface ExtendedProperty extends PropertyInfoWithoutInsurance {
    city_id: number;
    city_name: string;
}

interface Props {
    cities: City[];
    filteredProperties: ExtendedProperty[];
    filteredUnits: Unit[];
    filteredTenants: ExtendedTenant[];
    selectedCityId: number | null;
    selectedPropertyId: number | null;
    selectedUnitId: number | null;
    tenantId: number | null;
    onCityChange: (cityId: string) => void;
    onPropertyChange: (propertyId: string) => void;
    onUnitChange: (unitId: string) => void;
    onTenantChange: (tenantId: string) => void;
    validationErrors: { [key: string]: string };
    errors: any;
}

export function CascadingSelectionSection({
    cities,
    filteredProperties,
    filteredUnits,
    filteredTenants,
    selectedCityId,
    selectedPropertyId,
    selectedUnitId,
    tenantId,
    onCityChange,
    onPropertyChange,
    onUnitChange,
    onTenantChange,
    validationErrors,
    errors,
}: Props) {
    return (
        <>
            <div className="rounded-lg border-l-4 border-l-blue-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="city" className="text-base font-semibold">
                        City *
                    </Label>
                </div>
                <Select onValueChange={onCityChange} value={selectedCityId?.toString() || ''}>
                    <SelectTrigger>
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
                {validationErrors.city && <p className="mt-1 text-sm text-red-600">{validationErrors.city}</p>}
            </div>

            <div className="rounded-lg border-l-4 border-l-indigo-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="property" className="text-base font-semibold">
                        Property *
                    </Label>
                </div>
                <Select onValueChange={onPropertyChange} value={selectedPropertyId?.toString() || ''} disabled={!selectedCityId}>
                    <SelectTrigger className={!selectedCityId ? 'opacity-50' : ''}>
                        <SelectValue placeholder={selectedCityId ? 'Select property' : 'Select city first'} />
                    </SelectTrigger>
                    <SelectContent>
                        {filteredProperties.map((property) => (
                            <SelectItem key={property.id} value={property.id.toString()}>
                                {property.property_name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {validationErrors.property && <p className="mt-1 text-sm text-red-600">{validationErrors.property}</p>}
            </div>

            <div className="rounded-lg border-l-4 border-l-green-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="unit" className="text-base font-semibold">
                        Unit *
                    </Label>
                </div>
                <Select onValueChange={onUnitChange} value={selectedUnitId?.toString() || ''} disabled={!selectedPropertyId}>
                    <SelectTrigger className={!selectedPropertyId ? 'opacity-50' : ''}>
                        <SelectValue placeholder={selectedPropertyId ? 'Select unit' : 'Select property first'} />
                    </SelectTrigger>
                    <SelectContent>
                        {filteredUnits.map((unit) => (
                            <SelectItem key={unit.id} value={unit.id.toString()}>
                                {unit.unit_name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {validationErrors.unit && <p className="mt-1 text-sm text-red-600">{validationErrors.unit}</p>}
            </div>

            <div className="rounded-lg border-l-4 border-l-teal-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="tenant" className="text-base font-semibold">
                        Tenant *
                    </Label>
                </div>
                <Select onValueChange={onTenantChange} value={tenantId?.toString() || ''} disabled={!selectedUnitId}>
                    <SelectTrigger className={!selectedUnitId ? 'opacity-50' : ''}>
                        <SelectValue placeholder={selectedUnitId ? 'Select tenant' : 'Select unit first'} />
                    </SelectTrigger>
                    <SelectContent>
                        {filteredTenants.map((tenant) => (
                            <SelectItem key={tenant.id} value={tenant.id.toString()}>
                                {tenant.first_name} {tenant.last_name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.tenant_id && <p className="mt-1 text-sm text-red-600">{errors.tenant_id}</p>}
                {validationErrors.tenant && <p className="mt-1 text-sm text-red-600">{validationErrors.tenant}</p>}
            </div>
        </>
    );
}
