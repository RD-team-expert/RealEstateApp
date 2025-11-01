// resources/js/pages/Properties/components/InsuranceCompanyField.tsx

import React, { forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';

interface InsuranceCompanyFieldProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    validationError?: string;
}

const InsuranceCompanyField = forwardRef<HTMLInputElement, InsuranceCompanyFieldProps>(
    ({ value, onChange, error, validationError }, ref) => {
        return (
            <div className="rounded-lg border-l-4 border-l-green-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="insurance_company_name" className="text-base font-semibold">
                        <Shield className="h-4 w-4 inline mr-1" />
                        Insurance Company *
                    </Label>
                </div>
                <Input
                    ref={ref}
                    id="insurance_company_name"
                    value={value}
                    onChange={onChange}
                    placeholder="Enter insurance company name"
                />
                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                {validationError && <p className="mt-1 text-sm text-red-600">{validationError}</p>}
            </div>
        );
    }
);

InsuranceCompanyField.displayName = 'InsuranceCompanyField';

export default InsuranceCompanyField;
