import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import React from 'react';
import FormSection from './FormSection';

interface UnitSelectorProps {
    units: Array<{id: number, unit_name: string}>;
    selectedUnitId: number | '';
    onUnitChange: (unitId: string) => void;
    unitRef: React.RefObject<HTMLButtonElement>;
    disabled: boolean;
    selectedPropertyId: string;
    validationError?: string;
    error?: string;
}

export default function UnitSelector({ 
    units, 
    selectedUnitId, 
    onUnitChange, 
    unitRef,
    disabled,
    selectedPropertyId,
    validationError,
    error 
}: UnitSelectorProps) {
    return (
        <FormSection 
            label="Unit Name" 
            borderColor="border-l-blue-500" 
            error={validationError || error}
            required
        >
            <Select 
                onValueChange={onUnitChange} 
                value={selectedUnitId ? selectedUnitId.toString() : ''} 
                disabled={disabled}
            >
                <SelectTrigger ref={unitRef}>
                    <SelectValue placeholder={selectedPropertyId ? 'Select unit' : 'Select property first'} />
                </SelectTrigger>
                <SelectContent>
                    {units.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id.toString()}>
                            {unit.unit_name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </FormSection>
    );
}
