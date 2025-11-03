// resources/js/Pages/Properties/PropertyCreateDrawer.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { PropertyWithoutInsurance, PropertyFilters as PropertyFiltersType } from '@/types/property';
import { City } from '@/types/City';
import CitySelectionSection from './create/CitySelectionSection';
import PropertySelectionSection from './create/PropertySelectionSection';
import InsuranceCompanySection from './create/InsuranceCompanySection';
import AmountPolicySection from './create/AmountPolicySection';
import DatesSection from './create/DatesSection';
import NotesSection from './create/NotesSection';

interface PropertyCreateDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    cities: City[];
    availableProperties: PropertyWithoutInsurance[];
    onSuccess?: () => void;
    // New props for preserving pagination and filters
    currentFilters: PropertyFiltersType;
    currentPage: number;
    currentPerPage: number;
}

export default function PropertyCreateDrawer({ 
    open, 
    onOpenChange, 
    cities = [],
    availableProperties = [],
    onSuccess,
    currentFilters,
    currentPage,
    currentPerPage
}: PropertyCreateDrawerProps) {
    const [selectedCityId, setSelectedCityId] = useState<string>('');
    const [filteredProperties, setFilteredProperties] = useState<PropertyWithoutInsurance[]>([]);
    
    // Only validation error for required field (property_id)
    const [propertyIdValidationError, setPropertyIdValidationError] = useState<string>('');

    // Define initial form values
    const initialFormValues = {
        property_id: 0,
        insurance_company_name: '',
        amount: '',
        policy_number: '',
        effective_date: '',
        expiration_date: '',
        notes: '',
    };

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm(initialFormValues);

    /**
     * Filter properties by selected city
     * When city changes, reset property selection
     */
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

    /**
     * Reset form when drawer opens
     */
    useEffect(() => {
        if (open) {
            resetForm();
        }
    }, [open]);

    /**
     * Function to reset all form state
     */
    const resetForm = () => {
        reset();
        setSelectedCityId('');
        setFilteredProperties([]);
        setPropertyIdValidationError('');
        clearErrors();
    };

    /**
     * Handle property ID change
     * Clear validation error when user interacts with field
     */
    const handlePropertyIdChange = (value: string) => {
        setData('property_id', parseInt(value));
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
     * Build the store URL with query parameters
     * Appends pagination and filter parameters to the route URL
     */
    const buildStoreUrl = (): string => {
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
        const baseUrl = route('properties-info.store');
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

        // Build store URL with query parameters
        // Inertia will send the form data in the request body
        // and the query parameters will be preserved in the URL
        post(buildStoreUrl(), {
            onSuccess: () => {
                resetForm();
                onOpenChange(false);
                if (onSuccess) {
                    onSuccess();
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
     * Resets form and closes drawer
     */
    const handleCancel = () => {
        resetForm();
        onOpenChange(false);
    };

    /**
     * Handle city change
     * Updates selected city and filters properties
     */
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
                            {/* City selection - required to filter properties */}
                            <CitySelectionSection
                                selectedCityId={selectedCityId}
                                cities={cities}
                                onCityChange={handleCityChange}
                            />

                            {/* Property selection - REQUIRED */}
                            <PropertySelectionSection
                                propertyId={data.property_id}
                                selectedCityId={selectedCityId}
                                filteredProperties={filteredProperties}
                                onPropertyChange={handlePropertyIdChange}
                                errors={errors}
                                validationError={propertyIdValidationError}
                            />

                            {/* Insurance company - optional (nullable) */}
                            <InsuranceCompanySection
                                value={data.insurance_company_name}
                                onChange={handleInsuranceCompanyChange}
                                errors={errors}
                            />

                            {/* Amount and policy number - optional (nullable) */}
                            <AmountPolicySection
                                amount={data.amount}
                                policyNumber={data.policy_number}
                                onAmountChange={handleAmountChange}
                                onPolicyNumberChange={handlePolicyNumberChange}
                                errors={errors}
                            />

                            {/* Dates - optional (nullable) */}
                            <DatesSection
                                effectiveDate={data.effective_date}
                                expirationDate={data.expiration_date}
                                onEffectiveDateChange={handleEffectiveDateChange}
                                onExpirationDateChange={handleExpirationDateChange}
                                errors={errors}
                            />

                            {/* Notes - optional */}
                            <NotesSection
                                value={data.notes}
                                onChange={handleNotesChange}
                                errors={errors}
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
