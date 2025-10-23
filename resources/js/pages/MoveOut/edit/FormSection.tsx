import  { ReactNode } from 'react';
import { Label } from '@/components/ui/label';

interface FormSectionProps {
    borderColor: string;
    label: string;
    children: ReactNode;
    htmlFor?: string;
    required?: boolean;
    error?: string;
}

export default function FormSection({
    borderColor,
    label,
    children,
    htmlFor,
    required = false,
    error
}: FormSectionProps) {
    return (
        <div className={`rounded-lg border-l-4 ${borderColor} p-4`}>
            <div className="mb-2">
                <Label htmlFor={htmlFor} className="text-base font-semibold">
                    {label} {required && '*'}
                </Label>
            </div>
            {children}
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
}
