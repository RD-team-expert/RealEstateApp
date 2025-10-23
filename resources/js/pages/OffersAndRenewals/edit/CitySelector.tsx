import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import React from 'react';

interface City {
  id: number;
  name: string;
}

interface CitySelectorProps {
  cities: City[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  validationError?: string;
  cityRef?: React.RefObject<HTMLButtonElement | null>;
}

export default function CitySelector({ 
  cities, 
  value, 
  onChange, 
  error, 
  validationError, 
  cityRef 
}: CitySelectorProps) {
  return (
    <div className="rounded-lg border-l-4 border-l-indigo-500 p-4">
      <div className="mb-2">
        <Label htmlFor="city" className="text-base font-semibold">
          City *
        </Label>
      </div>
      <Select onValueChange={onChange} value={value}>
        <SelectTrigger ref={cityRef}>
          <SelectValue placeholder="Select city" />
        </SelectTrigger>
        <SelectContent>
          {cities.map((city) => (
            <SelectItem key={city.id} value={city.id.toString()}>
              {city.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {validationError && <p className="mt-1 text-sm text-red-600">{validationError}</p>}
    </div>
  );
}
