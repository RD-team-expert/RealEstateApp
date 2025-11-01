import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { City } from '@/types/City';
import { PropertyInfoWithoutInsurance } from '@/types/PropertyInfoWithoutInsurance';
import { RefObject } from 'react';

interface CityPropertyUnitSelectorProps {
    cities: City[];
    availableProperties: PropertyInfoWithoutInsurance[];
    availableUnits: Array<{id: number, unit_name: string}>;
    selectedCityId: string;
    selectedPropertyId: string;
    unitId: number | '';
    cityRef: RefObject<HTMLButtonElement>;
    propertyRef: RefObject<HTMLButtonElement>;
    unitRef: RefObject<HTMLButtonElement>;
    onCityChange: (cityId: string) => void;
    onPropertyChange: (propertyId: string) => void;
    onUnitChange: (unitId: string) => void;
    errors: any;
    cityValidationError: string;
    propertyValidationError: string;
    validationError: string;
}

export function CityPropertyUnitSelector({
    cities,
    availableProperties,
    availableUnits,
    selectedCityId,
    selectedPropertyId,
    unitId,
    cityRef,
    propertyRef,
    unitRef,
    onCityChange,
    onPropertyChange,
    onUnitChange,
    errors,
    cityValidationError,
    propertyValidationError,
    validationError,
}: CityPropertyUnitSelectorProps) {
    return (
        <>
            <div className="rounded-lg border-l-4 border-l-slate-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="city_id" className="text-base font-semibold">
                        City *
                    </Label>
                </div>
                <Select onValueChange={onCityChange} value={selectedCityId}>
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
                {errors.unit_id && <p className="mt-1 text-sm text-red-600">Please select a valid unit.</p>}
                {cityValidationError && <p className="mt-1 text-sm text-red-600">{cityValidationError}</p>}
            </div>

            <div className="rounded-lg border-l-4 border-l-gray-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="property_id" className="text-base font-semibold">
                        Property *
                    </Label>
                </div>
                <Select onValueChange={onPropertyChange} value={selectedPropertyId} disabled={!selectedCityId}>
                    <SelectTrigger ref={propertyRef}>
                        <SelectValue placeholder={selectedCityId ? 'Select property' : 'Select city first'} />
                    </SelectTrigger>
                    <SelectContent>
                        {availableProperties.map((property) => (
                            <SelectItem key={property.id} value={property.id.toString()}>
                                {property.property_name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {propertyValidationError && <p className="mt-1 text-sm text-red-600">{propertyValidationError}</p>}
            </div>

            <div className="rounded-lg border-l-4 border-l-blue-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="unit_id" className="text-base font-semibold">
                        Unit Name *
                    </Label>
                </div>
                <Select 
                    onValueChange={onUnitChange} 
                    value={unitId ? unitId.toString() : ''} 
                    disabled={!selectedPropertyId}
                >
                    <SelectTrigger ref={unitRef}>
                        <SelectValue placeholder={selectedPropertyId ? 'Select unit' : 'Select property first'} />
                    </SelectTrigger>
                    <SelectContent>
                        {availableUnits.map((unit) => (
                            <SelectItem key={unit.id} value={unit.id.toString()}>
                                {unit.unit_name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.unit_id && <p className="mt-1 text-sm text-red-600">{errors.unit_id}</p>}
                {validationError && <p className="mt-1 text-sm text-red-600">{validationError}</p>}
            </div>
        </>
    );
}
