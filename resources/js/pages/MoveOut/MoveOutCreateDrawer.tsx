import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { City } from '@/types/City';
import { PropertyInfoWithoutInsurance } from '@/types/PropertyInfoWithoutInsurance';
import { MoveOutFormData } from '@/types/move-out';
import { useForm } from '@inertiajs/react';
import React, { useState, useRef } from 'react';
import LocationSection from './create/LocationSection';
import DateFieldsSection from './create/DateFieldsSection';
import PropertyDetailsSection from './create/PropertyDetailsSection';
import StatusFieldsSection from './create/StatusFieldsSection';

interface Props {
    cities: City[];
    properties: PropertyInfoWithoutInsurance[];
    propertiesByCityId: Record<number, PropertyInfoWithoutInsurance[]>;
    unitsByPropertyId: Record<number, Array<{ id: number; unit_name: string }>>;
    allUnits: Array<{ id: number; unit_name: string; city_name: string; property_name: string }>;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function MoveOutCreateDrawer({ 
    cities,
    propertiesByCityId,
    unitsByPropertyId,
    open, 
    onOpenChange, 
    onSuccess 
}: Props) {
    const cityRef = useRef<HTMLButtonElement>(null);
    const propertyRef = useRef<HTMLButtonElement>(null);
    const unitRef = useRef<HTMLButtonElement>(null);
    
    const [validationErrors, setValidationErrors] = useState({
        city: '',
        property: '',
        unit: ''
    });
    
    const [selectedCity, setSelectedCity] = useState<number | null>(null);
    const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
    const [selectedUnit, setSelectedUnit] = useState<number | null>(null);
    
    const [availableProperties, setAvailableProperties] = useState<PropertyInfoWithoutInsurance[]>([]);
    const [availableUnits, setAvailableUnits] = useState<Array<{ id: number; unit_name: string }>>([]);
    
    const [calendarStates, setCalendarStates] = useState({
        move_out_date: false,
        date_lease_ending_on_buildium: false,
        date_utility_put_under_our_name: false,
    });

    const { data, setData, post, processing, errors, reset } = useForm<MoveOutFormData>({
        unit_id: null,
        move_out_date: '',
        lease_status: '',
        date_lease_ending_on_buildium: '',
        keys_location: '',
        utilities_under_our_name: '',
        date_utility_put_under_our_name: '',
        walkthrough: '',
        repairs: '',
        send_back_security_deposit: '',
        notes: '',
        cleaning: '',
        list_the_unit: '',
        move_out_form: '',
    });

    const handleCityChange = (cityId: string) => {
        const cityIdNum = parseInt(cityId);
        setSelectedCity(cityIdNum);
        setSelectedProperty(null);
        setSelectedUnit(null);
        setData('unit_id', null);
        
        setValidationErrors(prev => ({ ...prev, city: '', property: '', unit: '' }));

        if (cityIdNum && propertiesByCityId[cityIdNum]) {
            setAvailableProperties(propertiesByCityId[cityIdNum]);
        } else {
            setAvailableProperties([]);
        }
        setAvailableUnits([]);
    };

    const handlePropertyChange = (propertyId: string) => {
        const propertyIdNum = parseInt(propertyId);
        setSelectedProperty(propertyIdNum);
        setSelectedUnit(null);
        setData('unit_id', null);
        
        setValidationErrors(prev => ({ ...prev, property: '', unit: '' }));

        if (propertyIdNum && unitsByPropertyId[propertyIdNum]) {
            setAvailableUnits(unitsByPropertyId[propertyIdNum]);
        } else {
            setAvailableUnits([]);
        }
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

        post(route('move-out.store'), {
            onSuccess: () => {
                handleCancel();
                onSuccess?.();
            },
        });
    };

    const handleCancel = () => {
        reset();
        setSelectedCity(null);
        setSelectedProperty(null);
        setSelectedUnit(null);
        setValidationErrors({
            city: '',
            property: '',
            unit: ''
        });
        setAvailableProperties([]);
        setAvailableUnits([]);
        onOpenChange(false);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
            <DrawerContent size="half" title="Create New Move-Out Record">
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-auto p-6">
                        <form onSubmit={submit} className="space-y-4">
                            <LocationSection
                                cities={cities}
                                availableProperties={availableProperties}
                                availableUnits={availableUnits}
                                selectedCity={selectedCity}
                                selectedProperty={selectedProperty}
                                selectedUnit={selectedUnit}
                                validationErrors={validationErrors}
                                cityRef={cityRef}
                                propertyRef={propertyRef}
                                unitRef={unitRef}
                                onCityChange={handleCityChange}
                                onPropertyChange={handlePropertyChange}
                                onUnitChange={handleUnitChange}
                            />

                            <DateFieldsSection
                                data={data}
                                errors={errors}
                                calendarStates={calendarStates}
                                onCalendarToggle={handleCalendarToggle}
                                onDataChange={setData}
                            />

                            <PropertyDetailsSection
                                data={data}
                                errors={errors}
                                onDataChange={setData}
                            />

                            <StatusFieldsSection
                                data={data}
                                errors={errors}
                                onDataChange={setData}
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
                                {processing ? 'Creating...' : 'Create Move-Out Record'}
                            </Button>
                        </div>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
