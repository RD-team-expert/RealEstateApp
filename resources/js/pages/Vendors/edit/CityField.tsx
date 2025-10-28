import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import React from 'react';

interface CityFieldProps {
    cityRef: React.RefObject<HTMLButtonElement>;
    value: string;
    cities: Array<{ id: number; city: string }>;
    onChange: (cityId: string) => void;
    error?: string;
    validationError?: string;
}

export default function CityField({ cityRef, value, cities, onChange, error, validationError }: CityFieldProps) {
    return (
        <div className="rounded-lg border-l-4 border-l-blue-500 p-4">
            <div className="mb-2">
                <Label htmlFor="city_id" className="text-base font-semibold">
                    City *
                </Label>
            </div>
            <Select onValueChange={onChange} value={value}>
                <SelectTrigger ref={cityRef}>
                    <SelectValue placeholder="Select a city" />
                </SelectTrigger>
                <SelectContent>
                    {cities?.map((city) => (
                        <SelectItem key={city.id} value={city.id.toString()}>
                            {city.city}
                        </SelectItem>
                    )) || []}
                </SelectContent>
            </Select>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            {validationError && <p className="mt-1 text-sm text-red-600">{validationError}</p>}
        </div>
    );
}
