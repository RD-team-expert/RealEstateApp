// resources/js/pages/Properties/PropertyEditDrawer.tsx

import React, { useState, useRef, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { 
    Building2, 
    DollarSign,
    FileText,
    Calendar,
    Shield
} from 'lucide-react';
import { Property, PropertyFormData } from '@/types/property';

interface PropertyEditDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    property: Property;
    onSuccess?: () => void;
}

export default function PropertyEditDrawer({ 
    open, 
    onOpenChange, 
    property,
    onSuccess 
}: PropertyEditDrawerProps) {
    // Validation error states
    const [propertyNameValidationError, setPropertyNameValidationError] = useState<string>('');
    const [insuranceCompanyValidationError, setInsuranceCompanyValidationError] = useState<string>('');
    const [amountValidationError, setAmountValidationError] = useState<string>('');
    const [policyNumberValidationError, setPolicyNumberValidationError] = useState<string>('');
    const [effectiveDateValidationError, setEffectiveDateValidationError] = useState<string>('');
    const [expirationDateValidationError, setExpirationDateValidationError] = useState<string>('');
    
    // Refs for form fields
    const propertyNameRef = useRef<HTMLInputElement>(null);
    const insuranceCompanyRef = useRef<HTMLInputElement>(null);
    const amountRef = useRef<HTMLInputElement>(null);
    const policyNumberRef = useRef<HTMLInputElement>(null);
    const effectiveDateRef = useRef<HTMLInputElement>(null);
    const expirationDateRef = useRef<HTMLInputElement>(null);

    const { data, setData, put, processing, errors, reset, clearErrors } = useForm({
        property_name: property.property_name,
        insurance_company_name: property.insurance_company_name,
        amount: property.amount.toString(),
        policy_number: property.policy_number,
        effective_date: property.effective_date,
        expiration_date: property.expiration_date,
    });

    // Reset form data when property changes
    useEffect(() => {
        if (property) {
            setData({
                property_name: property.property_name,
                insurance_company_name: property.insurance_company_name,
                amount: property.amount.toString(),
                policy_number: property.policy_number,
                effective_date: property.effective_date,
                expiration_date: property.expiration_date,
            });
        }
    }, [property]);

    // Clear validation errors when data changes
    const handlePropertyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('property_name', e.target.value);
        setPropertyNameValidationError('');
    };

    const handleInsuranceCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('insurance_company_name', e.target.value);
        setInsuranceCompanyValidationError('');
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('amount', e.target.value);
        setAmountValidationError('');
    };

    const handlePolicyNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('policy_number', e.target.value);
        setPolicyNumberValidationError('');
    };

    const handleEffectiveDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('effective_date', e.target.value);
        setEffectiveDateValidationError('');
    };

    const handleExpirationDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('expiration_date', e.target.value);
        setExpirationDateValidationError('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Clear any previous validation errors
        setPropertyNameValidationError('');
        setInsuranceCompanyValidationError('');
        setAmountValidationError('');
        setPolicyNumberValidationError('');
        setEffectiveDateValidationError('');
        setExpirationDateValidationError('');
        
        let hasValidationErrors = false;
        
        // Validate required fields
        if (!data.property_name || data.property_name.trim() === '') {
            setPropertyNameValidationError('Please enter a property name before submitting the form.');
            if (propertyNameRef.current) {
                propertyNameRef.current.focus();
                propertyNameRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        if (!data.insurance_company_name || data.insurance_company_name.trim() === '') {
            setInsuranceCompanyValidationError('Please enter an insurance company name before submitting the form.');
            if (insuranceCompanyRef.current && !hasValidationErrors) {
                insuranceCompanyRef.current.focus();
                insuranceCompanyRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        if (!data.amount || data.amount.trim() === '') {
            setAmountValidationError('Please enter an amount before submitting the form.');
            if (amountRef.current && !hasValidationErrors) {
                amountRef.current.focus();
                amountRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        if (!data.policy_number || data.policy_number.trim() === '') {
            setPolicyNumberValidationError('Please enter a policy number before submitting the form.');
            if (policyNumberRef.current && !hasValidationErrors) {
                policyNumberRef.current.focus();
                policyNumberRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        if (!data.effective_date || data.effective_date.trim() === '') {
            setEffectiveDateValidationError('Please select an effective date before submitting the form.');
            if (effectiveDateRef.current && !hasValidationErrors) {
                effectiveDateRef.current.focus();
                effectiveDateRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        if (!data.expiration_date || data.expiration_date.trim() === '') {
            setExpirationDateValidationError('Please select an expiration date before submitting the form.');
            if (expirationDateRef.current && !hasValidationErrors) {
                expirationDateRef.current.focus();
                expirationDateRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        if (hasValidationErrors) {
            return;
        }
        
        put(route('properties-info.update', property.id), {
            onSuccess: () => {
                setPropertyNameValidationError('');
                setInsuranceCompanyValidationError('');
                setAmountValidationError('');
                setPolicyNumberValidationError('');
                setEffectiveDateValidationError('');
                setExpirationDateValidationError('');
                onOpenChange(false);
                if (onSuccess) {
                    onSuccess();
                }
            },
            onError: () => {
                // Errors will be handled by the form's error state
            }
        });
    };

    const handleCancel = () => {
        // Reset to original property data
        setData({
            property_name: property.property_name,
            insurance_company_name: property.insurance_company_name,
            amount: property.amount.toString(),
            policy_number: property.policy_number,
            effective_date: property.effective_date,
            expiration_date: property.expiration_date,
        });
        clearErrors();
        setPropertyNameValidationError('');
        setInsuranceCompanyValidationError('');
        setAmountValidationError('');
        setPolicyNumberValidationError('');
        setEffectiveDateValidationError('');
        setExpirationDateValidationError('');
        onOpenChange(false);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
            <DrawerContent size="half" title={`Edit Property - ${property.property_name}`}>
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-auto p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Property Name */}
                            <div className="rounded-lg border-l-4 border-l-blue-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="property_name" className="text-base font-semibold">
                                        <Building2 className="h-4 w-4 inline mr-1" />
                                        Property Name *
                                    </Label>
                                </div>
                                <Input
                                    ref={propertyNameRef}
                                    id="property_name"
                                    value={data.property_name}
                                    onChange={handlePropertyNameChange}
                                    placeholder="Enter property name"
                                />
                                {errors.property_name && <p className="mt-1 text-sm text-red-600">{errors.property_name}</p>}
                                {propertyNameValidationError && <p className="mt-1 text-sm text-red-600">{propertyNameValidationError}</p>}
                            </div>

                            {/* Insurance Company */}
                            <div className="rounded-lg border-l-4 border-l-green-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="insurance_company_name" className="text-base font-semibold">
                                        <Shield className="h-4 w-4 inline mr-1" />
                                        Insurance Company *
                                    </Label>
                                </div>
                                <Input
                                    ref={insuranceCompanyRef}
                                    id="insurance_company_name"
                                    value={data.insurance_company_name}
                                    onChange={handleInsuranceCompanyChange}
                                    placeholder="Enter insurance company name"
                                />
                                {errors.insurance_company_name && <p className="mt-1 text-sm text-red-600">{errors.insurance_company_name}</p>}
                                {insuranceCompanyValidationError && <p className="mt-1 text-sm text-red-600">{insuranceCompanyValidationError}</p>}
                            </div>

                            {/* Amount and Policy Number */}
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
                                        value={data.amount}
                                        onChange={handleAmountChange}
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
                                        value={data.policy_number}
                                        onChange={handlePolicyNumberChange}
                                        placeholder="Enter policy number"
                                    />
                                    {errors.policy_number && <p className="mt-1 text-sm text-red-600">{errors.policy_number}</p>}
                                    {policyNumberValidationError && <p className="mt-1 text-sm text-red-600">{policyNumberValidationError}</p>}
                                </div>
                            </div>

                            {/* Dates */}
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
                                        value={data.effective_date}
                                        onChange={handleEffectiveDateChange}
                                    />
                                    {errors.effective_date && <p className="mt-1 text-sm text-red-600">{errors.effective_date}</p>}
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
                                        value={data.expiration_date}
                                        onChange={handleExpirationDateChange}
                                    />
                                    {errors.expiration_date && <p className="mt-1 text-sm text-red-600">{errors.expiration_date}</p>}
                                    {expirationDateValidationError && <p className="mt-1 text-sm text-red-600">{expirationDateValidationError}</p>}
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Footer with action buttons */}
                    <DrawerFooter>
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                disabled={processing}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                onClick={handleSubmit}
                                disabled={processing}
                            >
                                {processing ? 'Updating...' : 'Update Property'}
                            </Button>
                        </div>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}