import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React from 'react';

interface PhoneNumberFieldProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
}

export default function PhoneNumberField({ value, onChange, error }: PhoneNumberFieldProps) {
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
}
