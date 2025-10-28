import { Label } from '@/components/ui/label';
import { RadioGroup } from '@/components/ui/radioGroup';
import React from 'react';

interface ServiceTypeFieldProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

const ServiceTypeField: React.FC<ServiceTypeFieldProps> = ({ value, onChange, error }) => {
    return (
        <div className="rounded-lg border-l-4 border-l-emerald-500 p-4">
            <div className="mb-2">
                <Label htmlFor="service_type" className="text-base font-semibold">
                    Service Type
                </Label>
            </div>
            <RadioGroup
                value={value}
                onValueChange={onChange}
                name="service_type"
                className="grid grid-cols-2 gap-4"
                options={[
                    { value: 'Maintenance', label: 'Maintenance' },
                    { value: 'Appliances', label: 'Appliances' },
                    { value: 'Pest control', label: 'Pest control' },
                    { value: 'HVAC Repairs', label: 'HVAC Repairs' },
                    { value: 'Plumbing', label: 'Plumbing' },
                    { value: 'Landscaping', label: 'Landscaping' },
                    { value: 'Lock Smith', label: 'Lock Smith' },
                    { value: 'Garage Door', label: 'Garage Door' }
                ]}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
};

export default ServiceTypeField;
