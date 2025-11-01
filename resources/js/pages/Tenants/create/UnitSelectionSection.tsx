import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { forwardRef } from 'react';

interface UnitSelectionSectionProps {
    units: Array<{id: number; unit_name: string}>;
    value: string;
    onChange: (value: string) => void;
    disabled: boolean;
    error?: string;
    validationError?: string;
}

export const UnitSelectionSection = forwardRef<HTMLButtonElement, UnitSelectionSectionProps>(
    ({ units, value, onChange, disabled, error, validationError }, ref) => {
        return (
            <div className="rounded-lg border-l-4 border-l-purple-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="unit_id" className="text-base font-semibold">
                        Unit *
                    </Label>
                </div>
                <Select
                    onValueChange={onChange}
                    value={value}
                    disabled={disabled}
                >
                    <SelectTrigger ref={ref}>
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
                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                {validationError && <p className="mt-1 text-sm text-red-600">{validationError}</p>}
            </div>
        );
    }
);

UnitSelectionSection.displayName = 'UnitSelectionSection';
