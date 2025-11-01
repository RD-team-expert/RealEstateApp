import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DollarSign, FileText } from 'lucide-react';

interface AmountPolicySectionProps {
    amount: string;
    policyNumber: string;
    onAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onPolicyNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    amountRef: React.RefObject<HTMLInputElement>;
    policyNumberRef: React.RefObject<HTMLInputElement>;
    errors: any;
    amountValidationError: string;
    policyNumberValidationError: string;
}

export default function AmountPolicySection({
    amount,
    policyNumber,
    onAmountChange,
    onPolicyNumberChange,
    amountRef,
    policyNumberRef,
    errors,
    amountValidationError,
    policyNumberValidationError
}: AmountPolicySectionProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border-l-4 border-l-emerald-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="amount" className="text-base font-semibold">
                        <DollarSign className="h-4 w-4 inline mr-1" />
                        Amount *
                    </Label>
                </div>
                <Input
                    ref={amountRef}
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={onAmountChange}
                    placeholder="0.00"
                />
                {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
                {amountValidationError && <p className="mt-1 text-sm text-red-600">{amountValidationError}</p>}
            </div>

            <div className="rounded-lg border-l-4 border-l-pink-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="policy_number" className="text-base font-semibold">
                        <FileText className="h-4 w-4 inline mr-1" />
                        Policy Number *
                    </Label>
                </div>
                <Input
                    ref={policyNumberRef}
                    id="policy_number"
                    value={policyNumber}
                    onChange={onPolicyNumberChange}
                    placeholder="Enter policy number"
                />
                {errors.policy_number && <p className="mt-1 text-sm text-red-600">{errors.policy_number}</p>}
                {policyNumberValidationError && <p className="mt-1 text-sm text-red-600">{policyNumberValidationError}</p>}
            </div>
        </div>
    );
}
