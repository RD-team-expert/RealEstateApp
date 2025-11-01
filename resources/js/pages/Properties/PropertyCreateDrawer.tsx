import React, { useState, useEffect, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { PropertyWithoutInsurance } from '@/types/property';
import { City } from '@/types/City';
import CitySelectionSection from './create/CitySelectionSection';
import PropertySelectionSection from './create/PropertySelectionSection';
import InsuranceCompanySection from './create/InsuranceCompanySection';
import AmountPolicySection from './create/AmountPolicySection';
import DatesSection from './create/DatesSection';

interface PropertyCreateDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    cities: City[];
    availableProperties: PropertyWithoutInsurance[];
    onSuccess?: () => void;
}

export default function PropertyCreateDrawer({ 
    open, 
    onOpenChange, 
    cities = [],
    availableProperties = [],
    onSuccess 
}: PropertyCreateDrawerProps) {
    const [selectedCityId, setSelectedCityId] = useState<string>('');
    const [filteredProperties, setFilteredProperties] = useState<PropertyWithoutInsurance[]>([]);
    
    // Validation error states
    const [propertyIdValidationError, setPropertyIdValidationError] = useState<string>('');
    const [insuranceCompanyValidationError, setInsuranceCompanyValidationError] = useState<string>('');
    const [amountValidationError, setAmountValidationError] = useState<string>('');
    const [policyNumberValidationError, setPolicyNumberValidationError] = useState<string>('');
    const [effectiveDateValidationError, setEffectiveDateValidationError] = useState<string>('');
    const [expirationDateValidationError, setExpirationDateValidationError] = useState<string>('');
    
    // Refs for form fields
    const propertyIdRef = useRef<HTMLButtonElement>(null!);
    const insuranceCompanyRef = useRef<HTMLInputElement>(null!);
    const amountRef = useRef<HTMLInputElement>(null!);
    const policyNumberRef = useRef<HTMLInputElement>(null!);
    const effectiveDateRef = useRef<HTMLInputElement>(null!);
    const expirationDateRef = useRef<HTMLInputElement>(null!);

    // Define initial form values
    const initialFormValues = {
        property_id: 0,
        insurance_company_name: '',
        amount: '',
        policy_number: '',
        effective_date: '',
        expiration_date: '',
    };

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm(initialFormValues);

    // Filter properties by selected city
    useEffect(() => {
        if (selectedCityId) {
            const filtered = availableProperties.filter(
                property => property.city_id === parseInt(selectedCityId)
            );
            setFilteredProperties(filtered);
        } else {
            setFilteredProperties([]);
        }
        // Reset property selection when city changes
        setData('property_id', 0);
    }, [selectedCityId, availableProperties]);

    // Reset form when drawer opens
    useEffect(() => {
        if (open) {
            resetForm();
        }
    }, [open]);

    // Function to reset all form state
    const resetForm = () => {
        reset();
        setSelectedCityId('');
        setFilteredProperties([]);
        clearAllValidationErrors();
        clearErrors();
    };

    // Function to clear all validation errors
    const clearAllValidationErrors = () => {
        setPropertyIdValidationError('');
        setInsuranceCompanyValidationError('');
        setAmountValidationError('');
        setPolicyNumberValidationError('');
        setEffectiveDateValidationError('');
        setExpirationDateValidationError('');
    };

    // Clear validation errors when data changes
    const handlePropertyIdChange = (value: string) => {
        setData('property_id', parseInt(value));
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
        clearAllValidationErrors();
        
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
        
        post(route('properties-info.store'), {
            onSuccess: () => {
                resetForm();
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
        resetForm();
        onOpenChange(false);
    };

    const handleCityChange = (value: string) => {
        setSelectedCityId(value);
        setData('property_id', 0);
        clearErrors();
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
            <DrawerContent size="half" title="Create New Property Insurance">
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-auto p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <CitySelectionSection
                                selectedCityId={selectedCityId}
                                cities={cities}
                                onCityChange={handleCityChange}
                            />

                            <PropertySelectionSection
                                propertyId={data.property_id}
                                selectedCityId={selectedCityId}
                                filteredProperties={filteredProperties}
                                onPropertyChange={handlePropertyIdChange}
                                propertyIdRef={propertyIdRef}
                                errors={errors}
                                validationError={propertyIdValidationError}
                            />

                            <InsuranceCompanySection
                                value={data.insurance_company_name}
                                onChange={handleInsuranceCompanyChange}
                                inputRef={insuranceCompanyRef}
                                errors={errors}
                                validationError={insuranceCompanyValidationError}
                            />

                            <AmountPolicySection
                                amount={data.amount}
                                policyNumber={data.policy_number}
                                onAmountChange={handleAmountChange}
                                onPolicyNumberChange={handlePolicyNumberChange}
                                amountRef={amountRef}
                                policyNumberRef={policyNumberRef}
                                errors={errors}
                                amountValidationError={amountValidationError}
                                policyNumberValidationError={policyNumberValidationError}
                            />

                            <DatesSection
                                effectiveDate={data.effective_date}
                                expirationDate={data.expiration_date}
                                onEffectiveDateChange={handleEffectiveDateChange}
                                onExpirationDateChange={handleExpirationDateChange}
                                effectiveDateRef={effectiveDateRef}
                                expirationDateRef={expirationDateRef}
                                errors={errors}
                                effectiveDateValidationError={effectiveDateValidationError}
                                expirationDateValidationError={expirationDateValidationError}
                            />
                        </form>
                    </div>

                    <DrawerFooter className="flex-row justify-end gap-2 border-t bg-muted/50 p-4">
                        <Button type="button" variant="outline" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button type="submit" onClick={handleSubmit} disabled={processing}>
                            {processing ? 'Creating...' : 'Create Property'}
                        </Button>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
