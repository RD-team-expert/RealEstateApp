import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import React from 'react';
import FormSection from './FormSection';

interface UnitOption {
    id: number;
    unit_name: string;
    property_name?: string;
    city?: string;
}

interface UnitSelectorProps {
    units: UnitOption[];
    selectedUnitId: string;
    onUnitChange: (unitId: string) => void;
    unitRef: React.RefObject<HTMLButtonElement>;
    disabled: boolean;
    error?: string;
    validationError?: string;
}

export default function UnitSelector({
    units,
    selectedUnitId,
    onUnitChange,
    unitRef,
    disabled,
    error,
    validationError,
}: UnitSelectorProps) {
    return (
        <FormSection
            label="Unit Name"
            required
            borderColor="border-l-green-500"
            error={error}
            validationError={validationError}
        >
            <Select
                onValueChange={onUnitChange}
                value={selectedUnitId}
                disabled={disabled}
            >
                <SelectTrigger ref={unitRef}>
                    <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                    {units?.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id.toString()}>
                            {unit.unit_name}
                        </SelectItem>
                    )) || []}
                </SelectContent>
            </Select>
        </FormSection>
    );
}
