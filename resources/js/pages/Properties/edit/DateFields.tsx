// resources/js/pages/Properties/components/DateFields.tsx

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from 'lucide-react';

interface DateFieldsProps {
    effectiveDateRef: React.RefObject<HTMLInputElement>;
    expirationDateRef: React.RefObject<HTMLInputElement>;
    effectiveDateValue: string;
    expirationDateValue: string;
    onEffectiveDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onExpirationDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    effectiveDateError?: string;
    expirationDateError?: string;
    effectiveDateValidationError?: string;
    expirationDateValidationError?: string;
}

export default function DateFields({
    effectiveDateRef,
    expirationDateRef,
    effectiveDateValue,
    expirationDateValue,
    onEffectiveDateChange,
    onExpirationDateChange,
    effectiveDateError,
    expirationDateError,
    effectiveDateValidationError,
    expirationDateValidationError
}: DateFieldsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border-l-4 border-l-indigo-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="effective_date" className="text-base font-semibold">
                        <Calendar className="h-4 w-4 inline mr-1" />
                        Effective Date *
                    </Label>
                </div>
                <Input
                    ref={effectiveDateRef}
                    id="effective_date"
                    type="date"
                    value={effectiveDateValue}
                    onChange={onEffectiveDateChange}
                />
                {effectiveDateError && <p className="mt-1 text-sm text-red-600">{effectiveDateError}</p>}
                {effectiveDateValidationError && <p className="mt-1 text-sm text-red-600">{effectiveDateValidationError}</p>}
            </div>

            <div className="rounded-lg border-l-4 border-l-teal-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="expiration_date" className="text-base font-semibold">
                        <Calendar className="h-4 w-4 inline mr-1" />
                        Expiration Date *
                    </Label>
                </div>
                <Input
                    ref={expirationDateRef}
                    id="expiration_date"
                    type="date"
                    value={expirationDateValue}
                    onChange={onExpirationDateChange}
                />
                {expirationDateError && <p className="mt-1 text-sm text-red-600">{expirationDateError}</p>}
                {expirationDateValidationError && <p className="mt-1 text-sm text-red-600">{expirationDateValidationError}</p>}
            </div>
        </div>
    );
}
