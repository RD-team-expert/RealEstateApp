import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRef } from 'react';

interface CityData {
    id: number;
    name: string;
}

interface PropertyData {
    id: number;
    name: string;
    city_id: number;
}

interface UnitData {
    id: number;
    name: string;
    property_id: number;
}

interface Props {
    cities: CityData[];
    selectedCityId: number | null;
    selectedPropertyId: number | null;
    selectedUnitId: number | null;
    availableProperties: PropertyData[];
    availableUnits: UnitData[];
    onCityChange: (cityId: string) => void;
    onPropertyChange: (propertyId: string) => void;
    onUnitChange: (unitId: string) => void;
    errors: Record<string, string>;
    validationErrors: {
        city?: string;
        property?: string;
        unit?: string;
    };
}

export function CityPropertyUnitSelector({
    cities,
    selectedCityId,
    selectedPropertyId,
    selectedUnitId,
    availableProperties,
    availableUnits,
    onCityChange,
    onPropertyChange,
    onUnitChange,
    errors,
    validationErrors,
}: Props) {
    const cityRef = useRef<HTMLButtonElement>(null);
    const propertyRef = useRef<HTMLButtonElement>(null);
    const unitRef = useRef<HTMLButtonElement>(null);

    return (
        <>
            {/* City Selection */}
            <div className="rounded-lg border-l-4 border-l-blue-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="city" className="text-base font-semibold">
                        City *
                    </Label>
                </div>
                <Select onValueChange={onCityChange} value={selectedCityId?.toString() || ''}>
                    <SelectTrigger ref={cityRef}>
                        <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                        {cities?.map((city) => (
                            <SelectItem key={city.id} value={city.id.toString()}>
                                {city.name}
                            </SelectItem>
                        )) || []}
                    </SelectContent>
                </Select>
                {errors.unit_id && <p className="mt-1 text-sm text-red-600">{errors.unit_id}</p>}
                {validationErrors.city && <p className="mt-1 text-sm text-red-600">{validationErrors.city}</p>}
            </div>

            {/* Property Selection */}
            <div className="rounded-lg border-l-4 border-l-green-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="property" className="text-base font-semibold">
                        Property *
                    </Label>
                </div>
                <Select onValueChange={onPropertyChange} value={selectedPropertyId?.toString() || ''} disabled={!selectedCityId}>
                    <SelectTrigger ref={propertyRef}>
                        <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableProperties?.map((property) => (
                            <SelectItem key={property.id} value={property.id.toString()}>
                                {property.name}
                            </SelectItem>
                        )) || []}
                    </SelectContent>
                </Select>
                {errors.unit_id && <p className="mt-1 text-sm text-red-600">{errors.unit_id}</p>}
                {validationErrors.property && <p className="mt-1 text-sm text-red-600">{validationErrors.property}</p>}
            </div>

            {/* Unit Selection */}
            <div className="rounded-lg border-l-4 border-l-purple-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="unit" className="text-base font-semibold">
                        Unit *
                    </Label>
                </div>
                <Select onValueChange={onUnitChange} value={selectedUnitId?.toString() || ''} disabled={!selectedPropertyId}>
                    <SelectTrigger ref={unitRef}>
                        <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableUnits?.map((unit) => (
                            <SelectItem key={unit.id} value={unit.id.toString()}>
                                {unit.name}
                            </SelectItem>
                        )) || []}
                    </SelectContent>
                </Select>
                {errors.unit_id && <p className="mt-1 text-sm text-red-600">{errors.unit_id}</p>}
                {validationErrors.unit && <p className="mt-1 text-sm text-red-600">{validationErrors.unit}</p>}
            </div>
        </>
    );
}
