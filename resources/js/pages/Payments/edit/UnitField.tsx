import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UnitFieldProps {
    selectedUnit: string;
    selectedCity: string;
    getAvailableUnits: () => string[];
    handleUnitChange: (unit: string) => void;
    unitNameRef: React.RefObject<HTMLButtonElement>;
    unitValidationError: string;
}

export default function UnitField({
    selectedUnit,
    selectedCity,
    getAvailableUnits,
    handleUnitChange,
    unitNameRef,
    unitValidationError,
}: UnitFieldProps) {
    return (
        <div className="rounded-lg border-l-4 border-l-purple-500 p-4">
            <div className="mb-2">
                <Label htmlFor="unit_name" className="text-base font-semibold">
                    Unit Name *
                </Label>
            </div>
            <Select 
                onValueChange={handleUnitChange} 
                value={selectedUnit || undefined} 
                disabled={!selectedCity}
            >
                <SelectTrigger ref={unitNameRef}>
                    <SelectValue placeholder={!selectedCity ? 'Select city first' : 'Select unit'} />
                </SelectTrigger>
                <SelectContent>
                    {getAvailableUnits().map((unit) => (
                        <SelectItem key={unit} value={unit}>
                            {unit}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {unitValidationError && <p className="mt-1 text-sm text-red-600">{unitValidationError}</p>}
        </div>
    );
}
