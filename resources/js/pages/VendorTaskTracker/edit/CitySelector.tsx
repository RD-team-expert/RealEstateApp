import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import React from 'react';
import FormSection from './FormSection';

interface CityOption {
    id: number;
    city: string;
}

interface CitySelectorProps {
    cities: CityOption[];
    selectedCity: string;
    onCityChange: (city: string) => void;
    cityRef: React.RefObject<HTMLButtonElement>;
    error?: string;
    validationError?: string;
}

export default function CitySelector({
    cities,
    selectedCity,
    onCityChange,
    cityRef,
    error,
    validationError,
}: CitySelectorProps) {
    return (
        <FormSection
            label="City"
            required
            borderColor="border-l-blue-500"
            error={error}
            validationError={validationError}
        >
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
        </FormSection>
    );
}
