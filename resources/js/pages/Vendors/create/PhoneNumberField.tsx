import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React from 'react';

interface PhoneNumberFieldProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
}

const PhoneNumberField: React.FC<PhoneNumberFieldProps> = ({ value, onChange, error }) => {
    return (
        <div className="rounded-lg border-l-4 border-l-purple-500 p-4">
            <div className="mb-2">
                <Label htmlFor="number" className="text-base font-semibold">
                    Phone Number
                </Label>
            </div>
            <Input
                id="number"
                value={value}
                onChange={onChange}
                placeholder="Enter phone number"
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
};

export default PhoneNumberField;
