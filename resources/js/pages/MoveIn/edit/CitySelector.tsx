import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { City } from '@/types/City';
import React from 'react';
import FormSection from './FormSection';

interface CitySelectorProps {
    cities: City[];
    selectedCityId: string;
    onCityChange: (cityId: string) => void;
    cityRef: React.RefObject<HTMLButtonElement>;
    error?: string;
}

export default function CitySelector({ 
    cities, 
    selectedCityId, 
    onCityChange, 
    cityRef,
    error 
}: CitySelectorProps) {
    return (
        <FormSection 
            label="City" 
            borderColor="border-l-slate-500" 
            error={error}
            required
        >
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
        </FormSection>
    );
}
