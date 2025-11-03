// resources/js/Pages/Properties/create/DatesSection.tsx
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';

interface DatesSectionProps {
    effectiveDate: string;
    expirationDate: string;
    onEffectiveDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onExpirationDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    errors: any;
}

/**
 * Dates section for effective and expiration dates
 * Both fields are OPTIONAL - only date format validation from backend
 * No client-side validation for date comparisons needed
 */
export default function DatesSection({
    effectiveDate,
    expirationDate,
    onEffectiveDateChange,
    onExpirationDateChange,
    errors
}: DatesSectionProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Effective date field - optional */}
            <div className="rounded-lg border-l-4 border-l-indigo-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="effective_date" className="text-base font-semibold">
                        <Calendar className="h-4 w-4 inline mr-1" />
                        Effective Date (Optional)
                    </Label>
                </div>
                <Input
                    id="effective_date"
                    type="date"
                    value={effectiveDate}
                    onChange={onEffectiveDateChange}
                />
                {/* Only show backend validation errors if any */}
                {errors.effective_date && (
                    <p className="mt-1 text-sm text-red-600">{errors.effective_date}</p>
                )}
            </div>

            {/* Expiration date field - optional */}
            <div className="rounded-lg border-l-4 border-l-teal-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="expiration_date" className="text-base font-semibold">
                        <Calendar className="h-4 w-4 inline mr-1" />
                        Expiration Date (Optional)
                    </Label>
                </div>
                <Input
                    id="expiration_date"
                    type="date"
                    value={expirationDate}
                    onChange={onExpirationDateChange}
                />
                {/* Only show backend validation errors if any */}
                {errors.expiration_date && (
                    <p className="mt-1 text-sm text-red-600">{errors.expiration_date}</p>
                )}
            </div>
        </div>
    );
}
