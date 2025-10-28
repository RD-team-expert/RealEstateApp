import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React from 'react';

interface EmailFieldProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
}

export default function EmailField({ value, onChange, error }: EmailFieldProps) {
    return (
        <div className="rounded-lg border-l-4 border-l-orange-500 p-4">
            <div className="mb-2">
                <Label htmlFor="email" className="text-base font-semibold">
                    Email Address
                </Label>
            </div>
            <Input
                id="email"
                type="email"
                value={value}
                onChange={onChange}
                placeholder="vendor@example.com"
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
}
