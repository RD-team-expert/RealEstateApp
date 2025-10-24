import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import React from 'react';

interface CityOption {
    id: number;
    city: string;
}

interface CitySectionProps {
    cities: CityOption[];
    selectedCity: string;
    onCityChange: (city: string) => void;
    cityRef: React.RefObject<HTMLButtonElement>;
   errors: Partial<Record<string, string>>; // Changed from Record<string, string>

    validationError: string;
}

export default function CitySection({
    cities,
    selectedCity,
    onCityChange,
    cityRef,
    errors,
    validationError
}: CitySectionProps) {
    return (
        <div className="rounded-lg border-l-4 border-l-blue-500 p-4">
            <div className="mb-2">
                <Label htmlFor="city" className="text-base font-semibold">
                    City *
                </Label>
            </div>
            <Select onValueChange={onCityChange} value={selectedCity}>
                <SelectTrigger ref={cityRef}>
                    <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                    {cities?.map((city) => (
                        <SelectItem key={city.id} value={city.city}>
                            {city.city}
                        </SelectItem>
                    )) || []}
                </SelectContent>
            </Select>
            {errors.vendor_id && <p className="mt-1 text-sm text-red-600">{errors.vendor_id}</p>}
            {validationError && <p className="mt-1 text-sm text-red-600">{validationError}</p>}
        </div>
    );
}
