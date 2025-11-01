import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { City } from '@/types/City';
import { PropertyInfoWithoutInsurance } from '@/types/PropertyInfoWithoutInsurance';
import { useForm } from '@inertiajs/react';
import React, { useRef, useState } from 'react';
import { CityPropertyUnitSelector } from './create/CityPropertyUnitSelector';
import { LeaseInformationFields } from './create/LeaseInformationFields';
import { PaymentInformationFields } from './create/PaymentInformationFields';
import { KeysAndFormsFields } from './create/KeysAndFormsFields';
import { InsuranceInformationFields } from './create/InsuranceInformationFields';

interface Unit {
    id: number;
    unit_name: string;
    property_name: string;
    city_name: string;
}

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
    units: Unit[];
    cities: City[];
    properties: PropertyInfoWithoutInsurance[];
    unitsByProperty: Record<string, Array<{id: number, unit_name: string}>>;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function MoveInCreateDrawer({ cities, properties, unitsByProperty, open, onOpenChange, onSuccess }: Props) {
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

    const { data, setData, post, processing, errors, reset } = useForm<MoveInFormData>({
        unit_id: '',
        signed_lease: 'No',
        lease_signing_date: '',
        move_in_date: '',
        paid_security_deposit_first_month_rent: 'No',
        scheduled_paid_time: '',
        handled_keys: 'No',
        move_in_form_sent_date: '',
        filled_move_in_form: 'No',
        date_of_move_in_form_filled: '',
        submitted_insurance: 'No',
        date_of_insurance_expiration: '',
    });

    const resetFormState = () => {
        reset();
        setValidationError('');
        setCityValidationError('');
        setPropertyValidationError('');
        setAvailableUnits([]);
        setAvailableProperties([]);
        setSelectedCityId('');
        setSelectedPropertyId('');
    };

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

        setValidationError('');
        setCityValidationError('');
        setPropertyValidationError('');

        let hasValidationErrors = false;

        if (!selectedCityId || selectedCityId.trim() === '') {
            setCityValidationError('Please select a city before submitting the form.');
            if (cityRef.current) {
                cityRef.current.focus();
                cityRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }

        if (!selectedPropertyId || selectedPropertyId.trim() === '') {
            setPropertyValidationError('Please select a property before submitting the form.');
            if (propertyRef.current) {
                propertyRef.current.focus();
                propertyRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }

        if (!data.unit_id || (typeof data.unit_id === 'number' && data.unit_id <= 0)) {
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

        post(route('move-in.store'), {
            onSuccess: () => {
                resetFormState();
                onOpenChange(false);
                onSuccess?.();
            },
        });
    };

    const handleCancel = () => {
        resetFormState();
        onOpenChange(false);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
            <DrawerContent size="half" title="Create New Move-In Record">
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-auto p-6">
                        <form onSubmit={submit} className="space-y-4">
                            <CityPropertyUnitSelector
                                cities={cities}
                                availableProperties={availableProperties}
                                availableUnits={availableUnits}
                                selectedCityId={selectedCityId}
                                selectedPropertyId={selectedPropertyId}
                                unitId={data.unit_id}
                                cityRef={cityRef}
                                propertyRef={propertyRef}
                                unitRef={unitRef}
                                onCityChange={handleCityChange}
                                onPropertyChange={handlePropertyChange}
                                onUnitChange={handleUnitChange}
                                errors={errors}
                                cityValidationError={cityValidationError}
                                propertyValidationError={propertyValidationError}
                                validationError={validationError}
                            />

                            <LeaseInformationFields
                                signedLease={data.signed_lease}
                                leaseSigningDate={data.lease_signing_date}
                                moveInDate={data.move_in_date}
                                onSignedLeaseChange={(value) => setData('signed_lease', value)}
                                onLeaseSigningDateChange={(value) => setData('lease_signing_date', value)}
                                onMoveInDateChange={(value) => setData('move_in_date', value)}
                                errors={errors}
                            />

                            <PaymentInformationFields
                                paidSecurityDeposit={data.paid_security_deposit_first_month_rent}
                                scheduledPaidTime={data.scheduled_paid_time}
                                onPaidSecurityDepositChange={(value) => setData('paid_security_deposit_first_month_rent', value)}
                                onScheduledPaidTimeChange={(value) => setData('scheduled_paid_time', value)}
                                errors={errors}
                            />

                            <KeysAndFormsFields
                                handledKeys={data.handled_keys}
                                moveInFormSentDate={data.move_in_form_sent_date}
                                filledMoveInForm={data.filled_move_in_form}
                                dateOfMoveInFormFilled={data.date_of_move_in_form_filled}
                                onHandledKeysChange={(value) => setData('handled_keys', value)}
                                onMoveInFormSentDateChange={(value) => setData('move_in_form_sent_date', value)}
                                onFilledMoveInFormChange={(value) => setData('filled_move_in_form', value)}
                                onDateOfMoveInFormFilledChange={(value) => setData('date_of_move_in_form_filled', value)}
                                errors={errors}
                            />

                            <InsuranceInformationFields
                                submittedInsurance={data.submitted_insurance}
                                dateOfInsuranceExpiration={data.date_of_insurance_expiration}
                                onSubmittedInsuranceChange={(value) => setData('submitted_insurance', value)}
                                onDateOfInsuranceExpirationChange={(value) => setData('date_of_insurance_expiration', value)}
                                errors={errors}
                            />
                        </form>
                    </div>

                    <DrawerFooter>
                        <div className="flex w-full justify-end gap-2">
                            <Button type="button" variant="outline" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing} onClick={submit}>
                                {processing ? 'Creating...' : 'Create Move-In Record'}
                            </Button>
                        </div>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
