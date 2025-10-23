import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { MoveOut, MoveOutFormData } from '@/types/move-out';
import { City } from '@/types/City';
import { PropertyInfoWithoutInsurance } from '@/types/PropertyInfoWithoutInsurance';
import { useForm } from '@inertiajs/react';
import React, { useState, useRef, useEffect } from 'react';
import CityPropertyUnitSelector from './edit/CityPropertyUnitSelector';
import MoveOutDateFields from './edit/MoveOutDateFields';
import MoveOutTextFields from './edit/MoveOutTextFields';
import MoveOutRadioFields from './edit/MoveOutRadioFields';

interface Props {
    cities: City[];
    propertiesByCityId: Record<number, PropertyInfoWithoutInsurance[]>;
    unitsByPropertyId: Record<number, Array<{ id: number; unit_name: string }>>;
    allUnits: Array<{ id: number; unit_name: string; city_name: string; property_name: string }>;
    moveOut: MoveOut;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function MoveOutEditDrawer({
    cities,
    propertiesByCityId,
    unitsByPropertyId,
    allUnits,
    moveOut,
    open,
    onOpenChange,
    onSuccess
}: Props) {
    const cityRef = useRef<HTMLButtonElement>(null!);
    const propertyRef = useRef<HTMLButtonElement>(null!);
    const unitRef = useRef<HTMLButtonElement>(null!);

    const [validationErrors, setValidationErrors] = useState({
        city: '',
        property: '',
        unit: ''
    });

    const [selectedCity, setSelectedCity] = useState<number | null>(null);
    const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
    const [selectedUnit, setSelectedUnit] = useState<number | null>(null);

    const [calendarStates, setCalendarStates] = useState({
        move_out_date: false,
        date_lease_ending_on_buildium: false,
        date_utility_put_under_our_name: false,
    });

    const { data, setData, put, processing, errors } = useForm<MoveOutFormData>({
        unit_id: moveOut.unit_id || null,
        move_out_date: moveOut.move_out_date || '',
        lease_status: moveOut.lease_status || '',
        date_lease_ending_on_buildium: moveOut.date_lease_ending_on_buildium || '',
        keys_location: moveOut.keys_location || '',
        utilities_under_our_name: moveOut.utilities_under_our_name || '',
        date_utility_put_under_our_name: moveOut.date_utility_put_under_our_name || '',
        walkthrough: moveOut.walkthrough || '',
        repairs: moveOut.repairs || '',
        send_back_security_deposit: moveOut.send_back_security_deposit || '',
        notes: moveOut.notes || '',
        cleaning: moveOut.cleaning || '',
        list_the_unit: moveOut.list_the_unit || '',
        move_out_form: moveOut.move_out_form || '',
    });

    // Initialize form data based on existing moveOut data
    useEffect(() => {
        if (moveOut && allUnits) {
            const unitInfo = allUnits.find(unit => unit.unit_name === moveOut.unit_name);

            if (unitInfo) {
                const selectedCityObj = cities.find(c => c.city === moveOut.city_name);
                
                // Find property by matching the city and property name
                let selectedPropertyObj = null;
                if (selectedCityObj && propertiesByCityId[selectedCityObj.id]) {
                    selectedPropertyObj = propertiesByCityId[selectedCityObj.id].find(
                        p => p.property_name === moveOut.property_name
                    );
                }

                if (selectedCityObj) {
                    setSelectedCity(selectedCityObj.id);
                }

                if (selectedPropertyObj) {
                    setSelectedProperty(selectedPropertyObj.id);
                }

                setSelectedUnit(unitInfo.id);
                setData('unit_id', unitInfo.id);
            }
        }
    }, [moveOut, allUnits, cities, propertiesByCityId]);

    const handleCityChange = (cityId: string) => {
        const cityIdNum = parseInt(cityId);
        setSelectedCity(cityIdNum);
        setSelectedProperty(null);
        setSelectedUnit(null);
        setData('unit_id', null);
        setValidationErrors(prev => ({ ...prev, city: '', property: '', unit: '' }));
    };

    const handlePropertyChange = (propertyId: string) => {
        const propertyIdNum = parseInt(propertyId);
        setSelectedProperty(propertyIdNum);
        setSelectedUnit(null);
        setData('unit_id', null);
        setValidationErrors(prev => ({ ...prev, property: '', unit: '' }));
    };

    const handleUnitChange = (unitId: string) => {
        const unitIdNum = parseInt(unitId);
        setSelectedUnit(unitIdNum);
        setData('unit_id', unitIdNum);
        setValidationErrors(prev => ({ ...prev, unit: '' }));
    };

    const handleCalendarToggle = (field: keyof typeof calendarStates) => {
        setCalendarStates(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleDateChange = (field: keyof MoveOutFormData, value: string) => {
        setData(field, value);
    };

    const handleFieldChange = (field: keyof MoveOutFormData, value: string) => {
        setData(field, value);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        setValidationErrors({
            city: '',
            property: '',
            unit: ''
        });

        let hasValidationErrors = false;

        if (!selectedCity) {
            setValidationErrors(prev => ({ ...prev, city: 'Please select a city before submitting the form.' }));
            if (cityRef.current) {
                cityRef.current.focus();
                cityRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }

        if (!selectedProperty) {
            setValidationErrors(prev => ({ ...prev, property: 'Please select a property before submitting the form.' }));
            if (propertyRef.current) {
                propertyRef.current.focus();
                propertyRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }

        if (!selectedUnit || !data.unit_id) {
            setValidationErrors(prev => ({ ...prev, unit: 'Please select a unit before submitting the form.' }));
            if (unitRef.current) {
                unitRef.current.focus();
                unitRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }

        if (hasValidationErrors) {
            return;
        }

        put(route('move-out.update', moveOut.id), {
            onSuccess: () => {
                handleCancel();
                onSuccess?.();
            },
        });
    };

    const handleCancel = () => {
        setData({
            unit_id: moveOut.unit_id || null,
            move_out_date: moveOut.move_out_date || '',
            lease_status: moveOut.lease_status || '',
            date_lease_ending_on_buildium: moveOut.date_lease_ending_on_buildium || '',
            keys_location: moveOut.keys_location || '',
            utilities_under_our_name: moveOut.utilities_under_our_name || '',
            date_utility_put_under_our_name: moveOut.date_utility_put_under_our_name || '',
            walkthrough: moveOut.walkthrough || '',
            repairs: moveOut.repairs || '',
            send_back_security_deposit: moveOut.send_back_security_deposit || '',
            notes: moveOut.notes || '',
            cleaning: moveOut.cleaning || '',
            list_the_unit: moveOut.list_the_unit || '',
            move_out_form: moveOut.move_out_form || '',
        });

        setValidationErrors({
            city: '',
            property: '',
            unit: ''
        });

        onOpenChange(false);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
            <DrawerContent size="half" title="Edit Move-Out Record">
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-auto p-6">
                        <form onSubmit={submit} className="space-y-4">
                            <CityPropertyUnitSelector
                                cities={cities}
                                propertiesByCityId={propertiesByCityId}
                                unitsByPropertyId={unitsByPropertyId}
                                selectedCity={selectedCity}
                                selectedProperty={selectedProperty}
                                selectedUnit={selectedUnit}
                                onCityChange={handleCityChange}
                                onPropertyChange={handlePropertyChange}
                                onUnitChange={handleUnitChange}
                                validationErrors={validationErrors}
                                cityRef={cityRef}
                                propertyRef={propertyRef}
                                unitRef={unitRef}
                            />

                            <MoveOutDateFields
                                data={data}
                                errors={errors}
                                calendarStates={calendarStates}
                                onCalendarToggle={handleCalendarToggle}
                                onDateChange={handleDateChange}
                            />

                            <MoveOutTextFields
                                data={data}
                                errors={errors}
                                onFieldChange={handleFieldChange}
                            />

                            <MoveOutRadioFields
                                data={data}
                                errors={errors}
                                onFieldChange={handleFieldChange}
                            />
                        </form>
                    </div>

                    <DrawerFooter>
                        <div className="flex gap-2 w-full">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                onClick={submit}
                                disabled={processing}
                                className="flex-1"
                            >
                                {processing ? 'Updating...' : 'Update Move-Out Record'}
                            </Button>
                        </div>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
