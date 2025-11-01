import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CityFieldProps {
    cities: string[];
    selectedCity: string;
    handleCityChange: (city: string) => void;
    cityRef: React.RefObject<HTMLButtonElement>;
    errors: any;
    validationError: string;
}

export default function CityField({
    cities,
    selectedCity,
    handleCityChange,
    cityRef,
    errors,
    validationError,
}: CityFieldProps) {
    return (
        <div className="rounded-lg border-l-4 border-l-green-500 p-4">
            <div className="mb-2">
                <Label htmlFor="city" className="text-base font-semibold">
                    City *
                </Label>
            </div>
            <Select onValueChange={handleCityChange} value={selectedCity || undefined}>
                <SelectTrigger ref={cityRef}>
                    <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                    {cities?.map((city) => (
                        <SelectItem key={city} value={city}>
                            {city}
                        </SelectItem>
                    )) || []}
                </SelectContent>
            </Select>
            {errors.unit_id && <p className="mt-1 text-sm text-red-600">{errors.unit_id}</p>}
            {validationError && <p className="mt-1 text-sm text-red-600">{validationError}</p>}
        </div>
    );
}
