import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PropertyFieldProps {
    selectedProperty: string;
    availableProperties: string[];
    onPropertyChange: (property: string) => void;
    disabled: boolean;
    validationError?: string;
}

export function PropertyField({ 
    selectedProperty, 
    availableProperties, 
    onPropertyChange, 
    disabled, 
    validationError 
}: PropertyFieldProps) {
    return (
        <div className="rounded-lg border-l-4 border-l-orange-500 p-4">
            <div className="mb-2">
                <Label htmlFor="property_name" className="text-base font-semibold">
                    Property *
                </Label>
            </div>
            <Select 
                onValueChange={onPropertyChange} 
                value={selectedProperty} 
                disabled={disabled}
            >
                <SelectTrigger>
                    <SelectValue placeholder={!disabled ? 'Select property' : 'Select city first'} />
                </SelectTrigger>
                <SelectContent>
                    {availableProperties.map((property) => (
                        <SelectItem key={property} value={property}>
                            {property}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {validationError && <p className="mt-1 text-sm text-red-600">{validationError}</p>}
        </div>
    );
}
