import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UnitFieldProps {
    selectedUnit: string;
    availableUnits: string[];
    onUnitChange: (unit: string) => void;
    disabled: boolean;
    validationError?: string;
}

export function UnitField({ 
    selectedUnit, 
    availableUnits, 
    onUnitChange, 
    disabled, 
    validationError 
}: UnitFieldProps) {
    return (
        <div className="rounded-lg border-l-4 border-l-purple-500 p-4">
            <div className="mb-2">
                <Label htmlFor="unit_name" className="text-base font-semibold">
                    Unit Name *
                </Label>
            </div>
            <Select 
                onValueChange={onUnitChange} 
                value={selectedUnit} 
                disabled={disabled}
            >
                <SelectTrigger>
                    <SelectValue placeholder={!disabled ? 'Select unit' : 'Select city first'} />
                </SelectTrigger>
                <SelectContent>
                    {availableUnits.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                            {unit}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {validationError && <p className="mt-1 text-sm text-red-600">{validationError}</p>}
        </div>
    );
}
