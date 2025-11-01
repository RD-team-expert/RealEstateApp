import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { PropertyInfoWithoutInsurance } from '@/types/PropertyInfoWithoutInsurance';
import { City } from '@/types/City';
import { useForm } from '@inertiajs/react';
import React, { useState, useRef } from 'react';
import { OriginalPaymentInfo } from './edit/OriginalPaymentInfo';
import { CascadingSelectionFields } from './edit/CascadingSelectionFields';
import { PaymentDetailsFields } from './edit/PaymentDetailsFields';
import { NotesField } from './edit/NotesField';
import { useCascadingDropdowns } from './edit/useCascadingDropdowns';

interface TenantData {
    id: number;
    full_name: string;
    tenant_id: number;
}

interface PaymentPlan {
    id: number;
    tenant_id: number | null;
    tenant: string;
    unit: string;
    property: string;
    city_name: string | null;
    amount: number;
    paid: number;
    left_to_pay: number;
    status: string;
    dates: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

type PaymentPlanFormData = {
    tenant_id: number | null;
    amount: number;
    dates: string;
    paid: number;
    notes: string;
}

interface Props {
    cities: City[];
    properties: PropertyInfoWithoutInsurance[];
    propertiesByCityId: Record<number, PropertyInfoWithoutInsurance[]>;
    unitsByPropertyId: Record<number, Array<{ id: number; unit_name: string }>>;
    tenantsByUnitId: Record<number, Array<{ id: number; full_name: string; tenant_id: number }>>;
    allUnits: Array<{ id: number; unit_name: string; city_name: string; property_name: string }>;
    tenantsData: TenantData[];
    paymentPlan: PaymentPlan;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function PaymentPlanEditDrawer({ 
    cities,
    properties,
    propertiesByCityId,
    unitsByPropertyId,
    tenantsByUnitId,
    allUnits,
    tenantsData,
    paymentPlan, 
    open, 
    onOpenChange, 
    onSuccess 
}: Props) {
    const [originalPaidAmount] = useState(paymentPlan.paid);
    
    // Refs for focusing on validation errors
    const cityRef = useRef<HTMLButtonElement>(null!);
    const propertyRef = useRef<HTMLButtonElement>(null!);
    const unitRef = useRef<HTMLButtonElement>(null!);
    const tenantRef = useRef<HTMLButtonElement>(null!);

    const { data, setData, put, processing, errors } = useForm<PaymentPlanFormData>({
        tenant_id: paymentPlan.tenant_id,
        amount: paymentPlan.amount,
        dates: paymentPlan.dates,
        paid: paymentPlan.paid,
        notes: paymentPlan.notes || ''
    });

    const {
        selectedCity,
        selectedProperty,
        selectedUnit,
        selectedTenant,
        availableProperties,
        availableUnits,
        availableTenants,
        validationErrors,
        handleCityChange,
        handlePropertyChange,
        handleUnitChange,
        handleTenantChange,
        resetSelections,
        setValidationErrors
    } = useCascadingDropdowns({
        cities,
        properties,
        propertiesByCityId,
        unitsByPropertyId,
        tenantsByUnitId,
        allUnits,
        tenantsData,
        paymentPlan,
        setData
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Clear previous validation errors
        setValidationErrors({
            city: '',
            property: '',
            unit: '',
            tenant: ''
        });
        
        let hasValidationErrors = false;
        
        // Validate city selection
        if (!selectedCity) {
            setValidationErrors(prev => ({ ...prev, city: 'Please select a city before submitting the form.' }));
            if (cityRef.current) {
                cityRef.current.focus();
                cityRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        // Validate property selection
        if (!selectedProperty) {
            setValidationErrors(prev => ({ ...prev, property: 'Please select a property before submitting the form.' }));
            if (propertyRef.current) {
                propertyRef.current.focus();
                propertyRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        // Validate unit selection
        if (!selectedUnit) {
            setValidationErrors(prev => ({ ...prev, unit: 'Please select a unit before submitting the form.' }));
            if (unitRef.current) {
                unitRef.current.focus();
                unitRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        // Validate tenant selection
        if (!selectedTenant || !data.tenant_id) {
            setValidationErrors(prev => ({ ...prev, tenant: 'Please select a tenant before submitting the form.' }));
            if (tenantRef.current) {
                tenantRef.current.focus();
                tenantRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        if (hasValidationErrors) {
            return;
        }

        put(route('payment-plans.update', paymentPlan.id), {
            onSuccess: () => {
                handleCancel();
                onSuccess?.();
            },
        });
    };

    const handleCancel = () => {
        // Reset to original values
        setData({
            tenant_id: paymentPlan.tenant_id,
            amount: paymentPlan.amount,
            dates: paymentPlan.dates,
            paid: paymentPlan.paid,
            notes: paymentPlan.notes || ''
        });
        
        resetSelections();
        onOpenChange(false);
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value) || 0;
        setData('amount', value);
        
        // Auto-adjust paid amount if it exceeds the new total
        if (data.paid > value) {
            setData('paid', value);
        }
    };

    const handlePaidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value) || 0;
        // Ensure paid amount doesn't exceed total amount
        const maxPaid = Math.min(value, data.amount || 0);
        setData('paid', maxPaid);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
            <DrawerContent size="half" title="Edit Payment Plan">
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-auto p-6">
                        <form onSubmit={submit} className="space-y-4">
                            <OriginalPaymentInfo paymentPlan={paymentPlan} />

                            <CascadingSelectionFields
                                cities={cities}
                                selectedCity={selectedCity}
                                selectedProperty={selectedProperty}
                                selectedUnit={selectedUnit}
                                selectedTenant={selectedTenant}
                                availableProperties={availableProperties}
                                availableUnits={availableUnits}
                                availableTenants={availableTenants}
                                validationErrors={validationErrors}
                                formErrors={errors}
                                onCityChange={handleCityChange}
                                onPropertyChange={handlePropertyChange}
                                onUnitChange={handleUnitChange}
                                onTenantChange={handleTenantChange}
                                cityRef={cityRef}
                                propertyRef={propertyRef}
                                unitRef={unitRef}
                                tenantRef={tenantRef}
                            />

                            <PaymentDetailsFields
                                dates={data.dates}
                                amount={data.amount}
                                paid={data.paid}
                                originalPaidAmount={originalPaidAmount}
                                errors={errors}
                                onDateChange={(date) => setData('dates', date)}
                                onAmountChange={handleAmountChange}
                                onPaidChange={handlePaidChange}
                            />

                            <NotesField
                                notes={data.notes}
                                error={errors.notes}
                                onChange={(value) => setData('notes', value)}
                            />
                        </form>
                    </div>

                    <DrawerFooter>
                        <div className="flex gap-2 w-full">
                            <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
                                Cancel
                            </Button>
                            <Button type="submit" onClick={submit} disabled={processing} className="flex-1">
                                {processing ? 'Updating...' : 'Update Payment Plan'}
                            </Button>
                        </div>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
