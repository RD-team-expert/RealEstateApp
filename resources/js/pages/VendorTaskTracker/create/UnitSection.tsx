import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import React from 'react';

interface UnitOption {
    id: number;
    unit_name: string;
    property_name?: string;
    city?: string;
}

interface UnitSectionProps {
    availableUnits: UnitOption[];
    selectedProperty: string;
    unitId: string;
    onUnitChange: (unitId: string) => void;
    unitRef: React.RefObject<HTMLButtonElement>;
   errors: Partial<Record<string, string>>; // Changed from Record<string, string>

    validationError: string;
}

export default function UnitSection({
    availableUnits,
    selectedProperty,
    unitId,
    onUnitChange,
    unitRef,
    errors,
    validationError
}: UnitSectionProps) {
    return (
        <div className="rounded-lg border-l-4 border-l-green-500 p-4">
            <div className="mb-2">
                <Label htmlFor="unit_name" className="text-base font-semibold">
                    Unit Name *
                </Label>
            </div>
            <Select
                onValueChange={onUnitChange}
                value={unitId}
                disabled={!selectedProperty}
            >
                <SelectTrigger ref={unitRef}>
                    <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                    {availableUnits?.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id.toString()}>
                            {unit.unit_name}
                        </SelectItem>
                    )) || []}
                </SelectContent>
            </Select>
            {errors.unit_id && <p className="mt-1 text-sm text-red-600">{errors.unit_id}</p>}
            {validationError && <p className="mt-1 text-sm text-red-600">{validationError}</p>}
        </div>
    );
}
