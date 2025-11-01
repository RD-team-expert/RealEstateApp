import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Shield } from 'lucide-react';

interface InsuranceCompanySectionProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    inputRef: React.RefObject<HTMLInputElement>;
    errors: any;
    validationError: string;
}

export default function InsuranceCompanySection({
    value,
    onChange,
    inputRef,
    errors,
    validationError
}: InsuranceCompanySectionProps) {
    return (
        <div className="rounded-lg border-l-4 border-l-orange-500 p-4">
            <div className="mb-2">
                <Label htmlFor="insurance_company_name" className="text-base font-semibold">
                    <Shield className="h-4 w-4 inline mr-1" />
                    Insurance Company *
                </Label>
            </div>
            <Input
                ref={inputRef}
                id="insurance_company_name"
                value={value}
                onChange={onChange}
                placeholder="Enter insurance company name"
            />
            {errors.insurance_company_name && <p className="mt-1 text-sm text-red-600">{errors.insurance_company_name}</p>}
            {validationError && <p className="mt-1 text-sm text-red-600">{validationError}</p>}
        </div>
    );
}
