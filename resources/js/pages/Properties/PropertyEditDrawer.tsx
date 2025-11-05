// resources/js/pages/Properties/PropertyEditDrawer.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Property, PropertyWithoutInsurance, PropertyFilters as PropertyFiltersType } from '@/types/property';
import PropertySelectField from './edit/PropertySelectField';
import InsuranceCompanyField from './edit/InsuranceCompanyField';
import AmountPolicyFields from './edit/AmountPolicyFields';
import DateFields from './edit/DateFields';
import NotesField from './edit/NotesField';

interface PropertyEditDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    property: Property;
    availableProperties: PropertyWithoutInsurance[];
    onSuccess?: () => void;
    // New props for preserving pagination and filters
    currentFilters: PropertyFiltersType;
    currentPage: number;
    currentPerPage: number;
}

export default function PropertyEditDrawer({ 
    open, 
    onOpenChange, 
    property,
    availableProperties = [],
    onSuccess,
    currentFilters,
    currentPage,
    currentPerPage
}: PropertyEditDrawerProps) {
    // Only validation error for required field (property_id)
    const [propertyIdValidationError, setPropertyIdValidationError] = useState<string>('');

    const { data, setData, put, processing, errors, clearErrors } = useForm({
        property_id: property.property_id || 0,
        insurance_company_name: property.insurance_company_name || '',
        amount: property.amount ? property.amount.toString() : '',
        policy_number: property.policy_number || '',
        effective_date: property.effective_date || '',
        expiration_date: property.expiration_date || '',
        notes: property.notes || '',
    });

    /**
     * Reset form data when property changes
     */
    useEffect(() => {
        if (property) {
            setData({
                property_id: property.property_id || 0,
                insurance_company_name: property.insurance_company_name || '',
                amount: property.amount ? property.amount.toString() : '',
                policy_number: property.policy_number || '',
                effective_date: property.effective_date || '',
                expiration_date: property.expiration_date || '',
                notes: property.notes || '',
            });
            setPropertyIdValidationError('');
        }
    }, [property]);

    /**
     * Handle property ID change
     * Clear validation error when user interacts with field
     */
    const handlePropertyIdChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setData('property_id', parseInt(e.target.value));
        setPropertyIdValidationError('');
    };

    /**
     * Handle insurance company name change
     * No validation needed - field is nullable
     */
    const handleInsuranceCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('insurance_company_name', e.target.value);
    };

    /**
     * Handle amount change
     * No validation needed - field is nullable
     */
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('amount', e.target.value);
    };

    /**
     * Handle policy number change
     * No validation needed - field is nullable
     */
    const handlePolicyNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('policy_number', e.target.value);
    };

    /**
     * Handle effective date change
     * No validation needed - field is nullable
     */
    const handleEffectiveDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('effective_date', e.target.value);
    };

    /**
     * Handle expiration date change
     * No validation needed - field is nullable
     */
    const handleExpirationDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('expiration_date', e.target.value);
    };

    /**
     * Handle notes change
     * No validation needed - field is optional
     */
    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setData('notes', e.target.value);
    };

    /**
     * Build the update URL with query parameters
     * Appends pagination and filter parameters to the route URL
     */
    const buildUpdateUrl = (): string => {
        const params: string[] = [];
        
        // Add pagination info
        if (currentPage && currentPage > 1) {
            params.push(`page=${currentPage}`);
        }
        
        if (currentPerPage) {
            params.push(`per_page=${currentPerPage}`);
        }
        
        // Add filters
        Object.entries(currentFilters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                params.push(`${key}=${encodeURIComponent(String(value))}`);
            }
        });
        
        // Build the complete URL with query parameters
        const baseUrl = route('properties-info.update', property.id);
        return params.length > 0 ? `${baseUrl}?${params.join('&')}` : baseUrl;
    };

    /**
     * Handle form submission
     * Only validates that property_id is selected (required field)
     * All other fields are optional/nullable
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Only validate required field: property_id
        if (!data.property_id || data.property_id === 0) {
            setPropertyIdValidationError('Please select a property before submitting the form.');
            return;
        }

        // Build update URL with query parameters
        const updateUrl = buildUpdateUrl();
        
        put(updateUrl, {
            onSuccess: () => {
                setPropertyIdValidationError('');
                onOpenChange(false);
                if (onSuccess) {
                    // onSuccess();
                }
            },
            onError: () => {
                // Errors from backend will be automatically handled
                // They will appear in the errors state and shown in the form
            }
        });
    };

    /**
     * Handle cancel button
     * Resets to original property data and closes drawer
     */
    const handleCancel = () => {
        // Reset to original property data
        setData({
            property_id: property.property_id || 0,
            insurance_company_name: property.insurance_company_name || '',
            amount: property.amount ? property.amount.toString() : '',
            policy_number: property.policy_number || '',
            effective_date: property.effective_date || '',
            expiration_date: property.expiration_date || '',
            notes: property.notes || '',
        });
        clearErrors();
        setPropertyIdValidationError('');
        onOpenChange(false);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
            <DrawerContent size="half" title={`Edit Property - ${property.property?.property_name || 'Unknown'}`}>
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-auto p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Property selection - REQUIRED */}
                            <PropertySelectField
                                value={data.property_id}
                                onChange={handlePropertyIdChange}
                                availableProperties={availableProperties}
                                error={errors.property_id}
                                validationError={propertyIdValidationError}
                            />

                            {/* Insurance company - optional (nullable) */}
                            <InsuranceCompanyField
                                value={data.insurance_company_name}
                                onChange={handleInsuranceCompanyChange}
                                error={errors.insurance_company_name}
                            />

                            {/* Amount and policy number - optional (nullable) */}
                            <AmountPolicyFields
                                amountValue={data.amount}
                                policyNumberValue={data.policy_number}
                                onAmountChange={handleAmountChange}
                                onPolicyNumberChange={handlePolicyNumberChange}
                                amountError={errors.amount}
                                policyNumberError={errors.policy_number}
                            />

                            {/* Dates - optional (nullable) */}
                            <DateFields
                                effectiveDateValue={data.effective_date}
                                expirationDateValue={data.expiration_date}
                                onEffectiveDateChange={handleEffectiveDateChange}
                                onExpirationDateChange={handleExpirationDateChange}
                                effectiveDateError={errors.effective_date}
                                expirationDateError={errors.expiration_date}
                            />

                            {/* Notes - optional */}
                            <NotesField
                                value={data.notes}
                                onChange={handleNotesChange}
                                error={errors.notes}
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
