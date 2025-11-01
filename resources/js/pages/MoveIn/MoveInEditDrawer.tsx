import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { City } from '@/types/City';
import { PropertyInfoWithoutInsurance } from '@/types/PropertyInfoWithoutInsurance';
import { useForm } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';
import CitySelector from './edit/CitySelector';
import PropertySelector from './edit/PropertySelector';
import UnitSelector from './edit/UnitSelector';
import LeaseSigningSection from './edit/LeaseSigningSection';
import MoveInDetailsSection from './edit/MoveInDetailsSection';
import PaymentSection from './edit/PaymentSection';
import KeysAndFormsSection from './edit/KeysAndFormsSection';
import InsuranceSection from './edit/InsuranceSection';

// Updated Unit interface
interface Unit {
    id: number;
    unit_name: string;
    property_name: string;
    city_name: string;
}

// Updated MoveIn interface to match the transformed data from controller
interface MoveIn {
    id: number;
    unit_id: number;
    unit_name: string;
    city_name: string;
    property_name: string;
    signed_lease: 'Yes' | 'No' | null;
    lease_signing_date: string | null;
    move_in_date: string | null;
    paid_security_deposit_first_month_rent: 'Yes' | 'No' | null;
    scheduled_paid_time: string | null;
    handled_keys: 'Yes' | 'No' | null;
    move_in_form_sent_date: string | null;
    filled_move_in_form: 'Yes' | 'No' | null;
    date_of_move_in_form_filled: string | null;
    submitted_insurance: 'Yes' | 'No' | null;
    date_of_insurance_expiration: string | null;
    is_archived: boolean;
    created_at: string;
    updated_at: string;
}

// Changed from interface to type to fix FormDataType constraint error
type MoveInFormData = {
    unit_id: number | '';
    signed_lease: 'Yes' | 'No' | '';
    lease_signing_date: string;
    move_in_date: string;
    paid_security_deposit_first_month_rent: 'Yes' | 'No' | '';
    scheduled_paid_time: string;
    handled_keys: 'Yes' | 'No' | '';
    move_in_form_sent_date: string;
    filled_move_in_form: 'Yes' | 'No' | '';
    date_of_move_in_form_filled: string;
    submitted_insurance: 'Yes' | 'No' | '';
    date_of_insurance_expiration: string;
};

interface Props {
    moveIn: MoveIn;
    units: Unit[];
    cities: City[];
    properties: PropertyInfoWithoutInsurance[];
    unitsByProperty: Record<string, Array<{id: number, unit_name: string}>>;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function MoveInEditDrawer({ 
    moveIn, 
    units, 
    cities, 
    properties, 
    unitsByProperty, 
    open, 
    onOpenChange, 
    onSuccess 
}: Props) {
    const unitRef = useRef<HTMLButtonElement>(null!);
    const cityRef = useRef<HTMLButtonElement>(null!);
    const propertyRef = useRef<HTMLButtonElement>(null!);
    const [validationError, setValidationError] = useState<string>('');
    const [cityValidationError, setCityValidationError] = useState<string>('');
    const [propertyValidationError, setPropertyValidationError] = useState<string>('');
    const [availableUnits, setAvailableUnits] = useState<Array<{id: number, unit_name: string}>>([]);
    const [availableProperties, setAvailableProperties] = useState<PropertyInfoWithoutInsurance[]>([]);
    const [selectedCityId, setSelectedCityId] = useState<string>('');
    const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');

    const [calendarStates, setCalendarStates] = useState({
        lease_signing_date: false,
        move_in_date: false,
        scheduled_paid_time: false,
        move_in_form_sent_date: false,
        date_of_move_in_form_filled: false,
        date_of_insurance_expiration: false,
    });

    const setCalendarOpen = (field: keyof typeof calendarStates, open: boolean) => {
        setCalendarStates((prev) => ({ ...prev, [field]: open }));
    };

    // Find the city and property for the current move-in using the new data structure
    const findCityAndProperty = () => {
        if (!moveIn.unit_id) return { cityId: '', propertyId: '' };

        const unit = units.find(u => u.id === moveIn.unit_id);
        if (!unit) return { cityId: '', propertyId: '' };

        const property = properties.find(p => p.property_name === unit.property_name);
        if (!property) return { cityId: '', propertyId: '' };

        return {
            cityId: property.city_id?.toString() || '',
            propertyId: property.id.toString(),
        };
    };

    const { cityId: initialCityId, propertyId: initialPropertyId } = findCityAndProperty();

    const { data, setData, put, processing, errors } = useForm<MoveInFormData>({
        unit_id: moveIn.unit_id ?? '',
        signed_lease: moveIn.signed_lease ?? 'No',
        lease_signing_date: moveIn.lease_signing_date ?? '',
        move_in_date: moveIn.move_in_date ?? '',
        paid_security_deposit_first_month_rent: moveIn.paid_security_deposit_first_month_rent ?? 'No',
        scheduled_paid_time: moveIn.scheduled_paid_time ?? '',
        handled_keys: moveIn.handled_keys ?? 'No',
        move_in_form_sent_date: moveIn.move_in_form_sent_date ?? '',
        filled_move_in_form: moveIn.filled_move_in_form ?? 'No',
        date_of_move_in_form_filled: moveIn.date_of_move_in_form_filled ?? '',
        submitted_insurance: moveIn.submitted_insurance ?? 'No',
        date_of_insurance_expiration: moveIn.date_of_insurance_expiration ?? '',
    });

    // Initialize state variables
    useEffect(() => {
        setSelectedCityId(initialCityId);
        setSelectedPropertyId(initialPropertyId);
    }, [initialCityId, initialPropertyId]);

    // Initialize available properties and units based on the current move-in data
    useEffect(() => {
        if (initialCityId) {
            const filteredProperties = properties.filter((property) => property.city_id?.toString() === initialCityId);
            setAvailableProperties(filteredProperties);
        }

        if (initialPropertyId && unitsByProperty[initialPropertyId]) {
            setAvailableUnits(unitsByProperty[initialPropertyId]);
        }
    }, [initialCityId, initialPropertyId, properties, unitsByProperty]);

    // Comprehensive reset function to clear all form state
    const resetFormState = () => {
        setValidationError('');
        setCityValidationError('');
        setPropertyValidationError('');
    };

    // Filter properties based on selected city
    const handleCityChange = (cityId: string) => {
        setSelectedCityId(cityId);
        setSelectedPropertyId('');
        setData('unit_id', '');
        setCityValidationError('');
        setPropertyValidationError('');
        setValidationError('');

        if (cityId) {
            const filteredProperties = properties.filter((property) => property.city_id?.toString() === cityId);
            setAvailableProperties(filteredProperties);
        } else {
            setAvailableProperties([]);
        }
        setAvailableUnits([]);
    };

    const handlePropertyChange = (propertyId: string) => {
        setSelectedPropertyId(propertyId);
        setData('unit_id', '');
        setPropertyValidationError('');
        setValidationError('');

        if (propertyId && unitsByProperty && unitsByProperty[propertyId]) {
            setAvailableUnits(unitsByProperty[propertyId]);
        } else {
            setAvailableUnits([]);
        }
    };

    const handleUnitChange = (unitId: string) => {
        setData('unit_id', parseInt(unitId));
        setValidationError('');
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        // Clear any previous validation errors
        setValidationError('');
        setCityValidationError('');
        setPropertyValidationError('');

        let hasValidationErrors = false;

        // Validate city is selected
        if (!selectedCityId || selectedCityId.trim() === '') {
            setCityValidationError('Please select a city before submitting the form.');
            if (cityRef.current) {
                cityRef.current.focus();
                cityRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }

        // Validate property is selected
        if (!selectedPropertyId || selectedPropertyId.trim() === '') {
            setPropertyValidationError('Please select a property before submitting the form.');
            if (propertyRef.current) {
                propertyRef.current.focus();
                propertyRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }

        // Validate unit_id is not empty
        if (!data.unit_id || typeof data.unit_id !== 'number' || data.unit_id <= 0) {
            setValidationError('Please select a unit before submitting the form.');
            if (unitRef.current) {
                unitRef.current.focus();
                unitRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }

        if (hasValidationErrors) {
            return;
        }

        put(route('move-in.update', moveIn.id), {
            onSuccess: () => {
                resetFormState();
                onOpenChange(false);
                onSuccess?.();
            },
        });
    };

    const handleCancel = () => {
        // Reset form to original values
        setData({
            unit_id: moveIn.unit_id ?? '',
            signed_lease: moveIn.signed_lease ?? 'No',
            lease_signing_date: moveIn.lease_signing_date ?? '',
            move_in_date: moveIn.move_in_date ?? '',
            paid_security_deposit_first_month_rent: moveIn.paid_security_deposit_first_month_rent ?? 'No',
            scheduled_paid_time: moveIn.scheduled_paid_time ?? '',
            handled_keys: moveIn.handled_keys ?? 'No',
            move_in_form_sent_date: moveIn.move_in_form_sent_date ?? '',
            filled_move_in_form: moveIn.filled_move_in_form ?? 'No',
            date_of_move_in_form_filled: moveIn.date_of_move_in_form_filled ?? '',
            submitted_insurance: moveIn.submitted_insurance ?? 'No',
            date_of_insurance_expiration: moveIn.date_of_insurance_expiration ?? '',
        });
        setSelectedCityId(initialCityId);
        setSelectedPropertyId(initialPropertyId);
        resetFormState();
        onOpenChange(false);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
            <DrawerContent size="half" title={`Edit Move-In Record #${moveIn.id}`}>
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-auto p-6">
                        <form onSubmit={submit} className="space-y-4">
                            <CitySelector
                                cities={cities}
                                selectedCityId={selectedCityId}
                                onCityChange={handleCityChange}
                                cityRef={cityRef}
                                error={cityValidationError || (errors.unit_id ? 'Please select a valid unit.' : undefined)}
                            />

                            <PropertySelector
                                properties={availableProperties}
                                selectedPropertyId={selectedPropertyId}
                                onPropertyChange={handlePropertyChange}
                                propertyRef={propertyRef}
                                disabled={!selectedCityId}
                                selectedCityId={selectedCityId}
                                error={propertyValidationError}
                            />

                            <UnitSelector
                                units={availableUnits}
                                selectedUnitId={data.unit_id}
                                onUnitChange={handleUnitChange}
                                unitRef={unitRef}
                                disabled={!selectedPropertyId}
                                selectedPropertyId={selectedPropertyId}
                                validationError={validationError}
                                error={errors.unit_id}
                            />

                            <LeaseSigningSection
                                signedLease={data.signed_lease}
                                onSignedLeaseChange={(value) => setData('signed_lease', value)}
                                leaseSigningDate={data.lease_signing_date}
                                onLeaseSigningDateChange={(date) => setData('lease_signing_date', date)}
                                isCalendarOpen={calendarStates.lease_signing_date}
                                onCalendarOpenChange={(open) => setCalendarOpen('lease_signing_date', open)}
                                signedLeaseError={errors.signed_lease}
                                dateError={errors.lease_signing_date}
                            />

                            <MoveInDetailsSection
                                moveInDate={data.move_in_date}
                                onMoveInDateChange={(date) => setData('move_in_date', date)}
                                isCalendarOpen={calendarStates.move_in_date}
                                onCalendarOpenChange={(open) => setCalendarOpen('move_in_date', open)}
                                error={errors.move_in_date}
                            />

                            <PaymentSection
                                paidSecurityDeposit={data.paid_security_deposit_first_month_rent}
                                onPaidSecurityDepositChange={(value) => setData('paid_security_deposit_first_month_rent', value)}
                                scheduledPaidTime={data.scheduled_paid_time}
                                onScheduledPaidTimeChange={(date) => setData('scheduled_paid_time', date)}
                                isCalendarOpen={calendarStates.scheduled_paid_time}
                                onCalendarOpenChange={(open) => setCalendarOpen('scheduled_paid_time', open)}
                                paidError={errors.paid_security_deposit_first_month_rent}
                                dateError={errors.scheduled_paid_time}
                            />

                            <KeysAndFormsSection
                                handledKeys={data.handled_keys}
                                onHandledKeysChange={(value) => setData('handled_keys', value)}
                                moveInFormSentDate={data.move_in_form_sent_date}
                                onMoveInFormSentDateChange={(date) => setData('move_in_form_sent_date', date)}
                                filledMoveInForm={data.filled_move_in_form}
                                onFilledMoveInFormChange={(value) => setData('filled_move_in_form', value)}
                                dateOfMoveInFormFilled={data.date_of_move_in_form_filled}
                                onDateOfMoveInFormFilledChange={(date) => setData('date_of_move_in_form_filled', date)}
                                formSentCalendarOpen={calendarStates.move_in_form_sent_date}
                                onFormSentCalendarOpenChange={(open) => setCalendarOpen('move_in_form_sent_date', open)}
                                formFilledCalendarOpen={calendarStates.date_of_move_in_form_filled}
                                onFormFilledCalendarOpenChange={(open) => setCalendarOpen('date_of_move_in_form_filled', open)}
                                handledKeysError={errors.handled_keys}
                                formSentDateError={errors.move_in_form_sent_date}
                                filledFormError={errors.filled_move_in_form}
                                formFilledDateError={errors.date_of_move_in_form_filled}
                            />

                            <InsuranceSection
                                submittedInsurance={data.submitted_insurance}
                                onSubmittedInsuranceChange={(value) => setData('submitted_insurance', value)}
                                dateOfInsuranceExpiration={data.date_of_insurance_expiration}
                                onDateOfInsuranceExpirationChange={(date) => setData('date_of_insurance_expiration', date)}
                                isCalendarOpen={calendarStates.date_of_insurance_expiration}
                                onCalendarOpenChange={(open) => setCalendarOpen('date_of_insurance_expiration', open)}
                                submittedError={errors.submitted_insurance}
                                dateError={errors.date_of_insurance_expiration}
                            />
                        </form>
                    </div>

                    <DrawerFooter>
                        <div className="flex w-full justify-end gap-2">
                            <Button type="button" variant="outline" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing} onClick={submit}>
                                {processing ? 'Updating...' : 'Update Move-In Record'}
                            </Button>
                        </div>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
