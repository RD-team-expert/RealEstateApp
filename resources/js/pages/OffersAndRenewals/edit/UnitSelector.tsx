import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import React from 'react';

interface Unit {
  id: number;
  name: string;
  property_id: number;
}

interface UnitSelectorProps {
  units: Unit[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  validationError?: string;
  unitRef?: React.RefObject<HTMLButtonElement | null>;
  propertySelected: boolean;
}

export default function UnitSelector({ 
  units, 
  value, 
  onChange, 
  disabled, 
  error, 
  validationError, 
  unitRef,
  propertySelected 
}: UnitSelectorProps) {
  return (
    <div className="rounded-lg border-l-4 border-l-green-500 p-4">
      <div className="mb-2">
        <Label htmlFor="unit" className="text-base font-semibold">
          Unit *
        </Label>
      </div>
      <Select 
        onValueChange={onChange} 
        value={value}
        disabled={disabled || !propertySelected || units.length === 0}
      >
        <SelectTrigger ref={unitRef}>
          <SelectValue placeholder={
            !propertySelected 
              ? "Select property first" 
              : units.length === 0 
                ? "No units available"
                : "Select unit"
          } />
        </SelectTrigger>
        <SelectContent>
          {units.map((unit) => (
            <SelectItem key={unit.id} value={unit.id.toString()}>
              {unit.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {validationError && <p className="mt-1 text-sm text-red-600">{validationError}</p>}
    </div>
  );
}
