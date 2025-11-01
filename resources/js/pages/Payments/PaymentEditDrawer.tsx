import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Payment } from '@/types/payments';
import { useForm } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';
import PaymentForm from './edit/PaymentForm';
import { format } from 'date-fns';


interface UnitData {
    id: number;
    unit_name: string;
    property_name: string;
    city: string;
}

interface Props {
    payment: Payment;
    units: UnitData[];
    cities: string[];
    properties: string[];
    unitsByCity: Record<string, string[]>;
    unitsByProperty: Record<string, string[]>;
    propertiesByCity: Record<string, string[]>;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function PaymentEditDrawer({ 
    payment, 
    units, 
    cities, 
    unitsByCity, 
    propertiesByCity,
    open, 
    onOpenChange, 
    onSuccess 
}: Props) {
    const cityRef = useRef<HTMLButtonElement>(null!);
    const propertyRef = useRef<HTMLButtonElement>(null!);
    const unitNameRef = useRef<HTMLButtonElement>(null!);
    const dateRef = useRef<HTMLButtonElement>(null!);
    const owesRef = useRef<HTMLInputElement>(null!);
    
    const [validationError, setValidationError] = useState<string>('');
    const [propertyValidationError, setPropertyValidationError] = useState<string>('');
    const [unitValidationError, setUnitValidationError] = useState<string>('');
    const [dateValidationError, setDateValidationError] = useState<string>('');
    const [owesValidationError, setOwesValidationError] = useState<string>('');

    const [calendarOpen, setCalendarOpen] = useState(false);
    const [selectedCity, setSelectedCity] = useState<string>('');
    const [selectedProperty, setSelectedProperty] = useState<string>('');
    const [selectedUnit, setSelectedUnit] = useState<string>('');

    const { data, setData, put, processing, errors } = useForm({
        date: '',
        unit_id: '',
        owes: '',
        paid: '',
        status: '',
        notes: '',
        reversed_payments: '',
        permanent: 'No',
    });

    useEffect(() => {
        if (payment && open) {
            setData({
                date: payment.date ?? '',
                unit_id: payment.unit_id?.toString() ?? '',
                owes: payment.owes?.toString() ?? '',
                paid: payment.paid?.toString() ?? '',
                status: payment.status ?? '',
                notes: payment.notes ?? '',
                reversed_payments: payment.reversed_payments ?? '',
                permanent: payment.permanent ?? 'No',
            });

            setSelectedCity(payment.city ?? '');
            setSelectedProperty(payment.property_name ?? '');
            setSelectedUnit(payment.unit_name ?? '');

            clearValidationErrors();
        }
    }, [payment, open]);

    const clearValidationErrors = () => {
        setValidationError('');
        setPropertyValidationError('');
        setUnitValidationError('');
        setDateValidationError('');
        setOwesValidationError('');
    };

    const getAvailableProperties = (): string[] => {
        if (!selectedCity) return [];
        return propertiesByCity[selectedCity] || [];
    };

    const getAvailableUnits = (): string[] => {
        if (!selectedCity) return [];
        if (!selectedProperty) {
            return unitsByCity[selectedCity] || [];
        }
        
        return units
            .filter(unit => unit.city === selectedCity && unit.property_name === selectedProperty)
            .map(unit => unit.unit_name);
    };

    const findUnitId = (cityName: string, propertyName: string, unitName: string): number | null => {
        const unit = units.find(u => 
            u.city === cityName && 
            u.property_name === propertyName && 
            u.unit_name === unitName
        );
        return unit ? unit.id : null;
    };

    useEffect(() => {
        if (selectedCity && selectedProperty) {
            const availableProperties = getAvailableProperties();
            if (!availableProperties.includes(selectedProperty)) {
                setSelectedProperty('');
                setSelectedUnit('');
                setData(prev => ({ ...prev, unit_id: '' }));
            }
        }
    }, [selectedCity]);

    useEffect(() => {
        if (selectedProperty && selectedUnit) {
            const availableUnits = getAvailableUnits();
            if (!availableUnits.includes(selectedUnit)) {
                setSelectedUnit('');
                setData(prev => ({ ...prev, unit_id: '' }));
            }
        }
    }, [selectedCity, selectedProperty]);

    const handleCityChange = (city: string) => {
        setSelectedCity(city);
        setSelectedProperty('');
        setSelectedUnit('');
        setData(prev => ({ ...prev, unit_id: '' }));
        clearValidationErrors();
    };

    const handlePropertyChange = (propertyName: string) => {
        setSelectedProperty(propertyName);
        setSelectedUnit('');
        setData(prev => ({ ...prev, unit_id: '' }));
        setPropertyValidationError('');
        setUnitValidationError('');
    };

    const handleUnitChange = (unitName: string) => {
        setSelectedUnit(unitName);
        setUnitValidationError('');
        
        if (selectedCity && selectedProperty && unitName) {
            const unitId = findUnitId(selectedCity, selectedProperty, unitName);
            if (unitId) {
                setData(prev => ({ ...prev, unit_id: unitId.toString() }));
            }
        }
    };

    const handleDateChange = (date: Date | undefined) => {
        if (date) {
            setData(prev => ({ ...prev, date: format(date, 'yyyy-MM-dd') }));
            setDateValidationError('');
            setCalendarOpen(false);
        }
    };

    const handleOwesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData(prev => ({ ...prev, owes: e.target.value }));
        setOwesValidationError('');
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        clearValidationErrors();
        let hasValidationErrors = false;

        if (!data.date || data.date.trim() === '') {
            setDateValidationError('Please select a date before submitting the form.');
            if (dateRef.current) {
                dateRef.current.focus();
                dateRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }

        if (!selectedCity || selectedCity.trim() === '') {
            setValidationError('Please select a city before submitting the form.');
            if (cityRef.current) {
                cityRef.current.focus();
                cityRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }

        if (!selectedProperty || selectedProperty.trim() === '') {
            setPropertyValidationError('Please select a property before submitting the form.');
            if (propertyRef.current) {
                propertyRef.current.focus();
                propertyRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }

        if (!selectedUnit || selectedUnit.trim() === '') {
            setUnitValidationError('Please select a unit before submitting the form.');
            if (unitNameRef.current) {
                unitNameRef.current.focus();
                unitNameRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }

        if (!data.owes || data.owes.trim() === '') {
            setOwesValidationError('Please enter the amount owed before submitting the form.');
            if (owesRef.current) {
                owesRef.current.focus();
                owesRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }

        if (!data.unit_id || data.unit_id.trim() === '') {
            setUnitValidationError('Unable to identify the selected unit. Please try selecting again.');
            hasValidationErrors = true;
        }

        if (hasValidationErrors) {
            return;
        }

        put(route('payments.update', payment.id), {
            onSuccess: () => {
                clearValidationErrors();
                onOpenChange(false);
                onSuccess?.();
            },
            onError: (errors) => {
                console.error('Form submission errors:', errors);
            }
        });
    };

    const handleCancel = () => {
        if (payment) {
            setData({
                date: payment.date ?? '',
                unit_id: payment.unit_id?.toString() ?? '',
                owes: payment.owes?.toString() ?? '',
                paid: payment.paid?.toString() ?? '',
                status: payment.status ?? '',
                notes: payment.notes ?? '',
                reversed_payments: payment.reversed_payments ?? '',
                permanent: payment.permanent ?? 'No',
            });

            setSelectedCity(payment.city ?? '');
            setSelectedProperty(payment.property_name ?? '');
            setSelectedUnit(payment.unit_name ?? '');
        }
        
        clearValidationErrors();
        setCalendarOpen(false);
        onOpenChange(false);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
            <DrawerContent size="half" title={`Edit Payment #${payment.id}`}>
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-auto p-6">
                        <PaymentForm
                            data={data}
                            setData={setData}
                            errors={errors}
                            cities={cities}
                            selectedCity={selectedCity}
                            selectedProperty={selectedProperty}
                            selectedUnit={selectedUnit}
                            getAvailableProperties={getAvailableProperties}
                            getAvailableUnits={getAvailableUnits}
                            handleCityChange={handleCityChange}
                            handlePropertyChange={handlePropertyChange}
                            handleUnitChange={handleUnitChange}
                            handleDateChange={handleDateChange}
                            handleOwesChange={handleOwesChange}
                            calendarOpen={calendarOpen}
                            setCalendarOpen={setCalendarOpen}
                            cityRef={cityRef}
                            propertyRef={propertyRef}
                            unitNameRef={unitNameRef}
                            dateRef={dateRef}
                            owesRef={owesRef}
                            validationError={validationError}
                            propertyValidationError={propertyValidationError}
                            unitValidationError={unitValidationError}
                            dateValidationError={dateValidationError}
                            owesValidationError={owesValidationError}
                            payment={payment}
                            onSubmit={submit}
                        />
                    </div>

                    <DrawerFooter className="border-t bg-muted/50 p-4">
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={handleCancel} disabled={processing}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                onClick={submit}
                                disabled={processing}
                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                {processing ? 'Updating...' : 'Update Payment'}
                            </Button>
                        </div>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
