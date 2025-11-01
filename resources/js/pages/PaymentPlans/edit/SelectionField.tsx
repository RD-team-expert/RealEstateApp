import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { forwardRef } from 'react';

interface Option {
    value: string;
    label: string;
}

interface Props {
    id: string;
    label: string;
    placeholder: string;
    value: string;
    options: Option[];
    onChange: (value: string) => void;
    error?: string;
    borderColor: 'blue' | 'green' | 'purple' | 'orange';
    disabled?: boolean;
}

const borderColorClasses = {
    blue: 'border-l-blue-500',
    green: 'border-l-green-500',
    purple: 'border-l-purple-500',
    orange: 'border-l-orange-500'
};

export const SelectionField = forwardRef<HTMLButtonElement, Props>(({
    id,
    label,
    placeholder,
    value,
    options,
    onChange,
    error,
    borderColor,
    disabled = false
}, ref) => {
    return (
        <div className={`rounded-lg border-l-4 ${borderColorClasses[borderColor]} p-4`}>
            <div className="mb-2">
                <Label htmlFor={id} className="text-base font-semibold">
                    {label} *
                </Label>
            </div>
            <Select
                onValueChange={onChange}
                value={value}
                disabled={disabled}
            >
                <SelectTrigger ref={ref}>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
});

SelectionField.displayName = 'SelectionField';
