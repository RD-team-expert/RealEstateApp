// resources/js/pages/Properties/PropertyEditDrawer.tsx

import React, { useState, useRef, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Property, PropertyWithoutInsurance } from '@/types/property';
import PropertySelectField from './edit/PropertySelectField';
import InsuranceCompanyField from './edit/InsuranceCompanyField';
import AmountPolicyFields from './edit/AmountPolicyFields';
import DateFields from './edit/DateFields';

interface PropertyEditDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    property: Property;
    availableProperties: PropertyWithoutInsurance[];
    onSuccess?: () => void;
}

export default function PropertyEditDrawer({ 
    open, 
    onOpenChange, 
    property,
    availableProperties = [],
    onSuccess 
}: PropertyEditDrawerProps) {
    // Validation error states
    const [propertyIdValidationError, setPropertyIdValidationError] = useState<string>('');
    const [insuranceCompanyValidationError, setInsuranceCompanyValidationError] = useState<string>('');
    const [amountValidationError, setAmountValidationError] = useState<string>('');
    const [policyNumberValidationError, setPolicyNumberValidationError] = useState<string>('');
    const [effectiveDateValidationError, setEffectiveDateValidationError] = useState<string>('');
    const [expirationDateValidationError, setExpirationDateValidationError] = useState<string>('');
    
    // Refs for form fields
    const propertyIdRef = useRef<HTMLSelectElement>(null!);
    const insuranceCompanyRef = useRef<HTMLInputElement>(null!);
    const amountRef = useRef<HTMLInputElement>(null!);
    const policyNumberRef = useRef<HTMLInputElement>(null!);
    const effectiveDateRef = useRef<HTMLInputElement>(null!);
    const expirationDateRef = useRef<HTMLInputElement>(null!);

    const { data, setData, put, processing, errors, clearErrors } = useForm({
        property_id: property.property_id,
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
                property_id: property.property_id,
                insurance_company_name: property.insurance_company_name,
                amount: property.amount.toString(),
                policy_number: property.policy_number,
                effective_date: property.effective_date,
                expiration_date: property.expiration_date,
            });
        }
    }, [property]);

    // Clear validation errors when data changes
    const handlePropertyIdChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setData('property_id', parseInt(e.target.value));
        setPropertyIdValidationError('');
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
        setPropertyIdValidationError('');
        setInsuranceCompanyValidationError('');
        setAmountValidationError('');
        setPolicyNumberValidationError('');
        setEffectiveDateValidationError('');
        setExpirationDateValidationError('');
        
        let hasValidationErrors = false;
        
        // Validate required fields
        if (!data.property_id || data.property_id === 0) {
            setPropertyIdValidationError('Please select a property before submitting the form.');
            if (propertyIdRef.current) {
                propertyIdRef.current.focus();
                propertyIdRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
                setPropertyIdValidationError('');
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
            property_id: property.property_id,
            insurance_company_name: property.insurance_company_name,
            amount: property.amount.toString(),
            policy_number: property.policy_number,
            effective_date: property.effective_date,
            expiration_date: property.expiration_date,
        });
        clearErrors();
        setPropertyIdValidationError('');
        setInsuranceCompanyValidationError('');
        setAmountValidationError('');
        setPolicyNumberValidationError('');
        setEffectiveDateValidationError('');
        setExpirationDateValidationError('');
        onOpenChange(false);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
            <DrawerContent size="half" title={`Edit Property - ${property.property?.property_name || 'Unknown'}`}>
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-auto p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <PropertySelectField
                                ref={propertyIdRef}
                                value={data.property_id}
                                onChange={handlePropertyIdChange}
                                availableProperties={availableProperties}
                                error={errors.property_id}
                                validationError={propertyIdValidationError}
                            />

                            <InsuranceCompanyField
                                ref={insuranceCompanyRef}
                                value={data.insurance_company_name}
                                onChange={handleInsuranceCompanyChange}
                                error={errors.insurance_company_name}
                                validationError={insuranceCompanyValidationError}
                            />

                            <AmountPolicyFields
                                amountRef={amountRef}
                                policyNumberRef={policyNumberRef}
                                amountValue={data.amount}
                                policyNumberValue={data.policy_number}
                                onAmountChange={handleAmountChange}
                                onPolicyNumberChange={handlePolicyNumberChange}
                                amountError={errors.amount}
                                policyNumberError={errors.policy_number}
                                amountValidationError={amountValidationError}
                                policyNumberValidationError={policyNumberValidationError}
                            />

                            <DateFields
                                effectiveDateRef={effectiveDateRef}
                                expirationDateRef={expirationDateRef}
                                effectiveDateValue={data.effective_date}
                                expirationDateValue={data.expiration_date}
                                onEffectiveDateChange={handleEffectiveDateChange}
                                onExpirationDateChange={handleExpirationDateChange}
                                effectiveDateError={errors.effective_date}
                                expirationDateError={errors.expiration_date}
                                effectiveDateValidationError={effectiveDateValidationError}
                                expirationDateValidationError={expirationDateValidationError}
                            />
                        </form>
                    </div>

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
