import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import React from 'react';

interface Property {
  id: number;
  name: string;
  city_id: number;
}

interface PropertySelectorProps {
  properties: Property[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  validationError?: string;
  propertyRef?: React.RefObject<HTMLButtonElement | null>;
  citySelected: boolean;
}

export default function PropertySelector({ 
  properties, 
  value, 
  onChange, 
  disabled, 
  error, 
  validationError, 
  propertyRef,
  citySelected 
}: PropertySelectorProps) {
  return (
    <div className="rounded-lg border-l-4 border-l-blue-500 p-4">
      <div className="mb-2">
        <Label htmlFor="property" className="text-base font-semibold">
          Property *
        </Label>
      </div>
      <Select 
        onValueChange={onChange} 
        value={value}
        disabled={disabled || !citySelected || properties.length === 0}
      >
        <SelectTrigger ref={propertyRef}>
          <SelectValue placeholder={
            !citySelected 
              ? "Select city first" 
              : properties.length === 0 
                ? "No properties available"
                : "Select property"
          } />
        </SelectTrigger>
        <SelectContent>
          {properties.map((property) => (
            <SelectItem key={property.id} value={property.id.toString()}>
              {property.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {validationError && <p className="mt-1 text-sm text-red-600">{validationError}</p>}
    </div>
  );
}
