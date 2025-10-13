import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup } from '@/components/ui/radioGroup';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Payment } from '@/types/payments';
import { useForm } from '@inertiajs/react';
import { format, isValid, parse } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

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
    // properties,
    unitsByCity, 
    // unitsByProperty,
    propertiesByCity,
    open, 
    onOpenChange, 
    onSuccess 
}: Props) {
    const cityRef = useRef<HTMLButtonElement>(null);
    const propertyRef = useRef<HTMLButtonElement>(null);
    const unitNameRef = useRef<HTMLButtonElement>(null);
    const dateRef = useRef<HTMLButtonElement>(null);
    const owesRef = useRef<HTMLInputElement>(null);
    
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

    // Initialize form data when payment prop changes
    useEffect(() => {
        if (payment && open) {
            // Initialize form with payment data
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

            // Initialize UI state from payment relationship data
            setSelectedCity(payment.city ?? '');
            setSelectedProperty(payment.property_name ?? '');
            setSelectedUnit(payment.unit_name ?? '');

            // Clear validation errors
            clearValidationErrors();
        }
    }, [payment, open]);

    // Clear validation errors helper
    const clearValidationErrors = () => {
        setValidationError('');
        setPropertyValidationError('');
        setUnitValidationError('');
        setDateValidationError('');
        setOwesValidationError('');
    };

    // Get available properties based on selected city
    const getAvailableProperties = (): string[] => {
        if (!selectedCity) return [];
        return propertiesByCity[selectedCity] || [];
    };

    // Get available units based on selected city and property
    const getAvailableUnits = (): string[] => {
        if (!selectedCity) return [];
        if (!selectedProperty) {
            return unitsByCity[selectedCity] || [];
        }
        
        // Filter units by both city and property
        return units
            .filter(unit => unit.city === selectedCity && unit.property_name === selectedProperty)
            .map(unit => unit.unit_name);
    };

    // Find unit ID by city, property, and unit name
    const findUnitId = (cityName: string, propertyName: string, unitName: string): number | null => {
        const unit = units.find(u => 
            u.city === cityName && 
            u.property_name === propertyName && 
            u.unit_name === unitName
        );
        return unit ? unit.id : null;
    };

    // Reset dependent dropdowns when parent changes
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
        
        // Find and set the unit_id
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

        // Validate date is not empty
        if (!data.date || data.date.trim() === '') {
            setDateValidationError('Please select a date before submitting the form.');
            if (dateRef.current) {
                dateRef.current.focus();
                dateRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }

        // Validate city is not empty
        if (!selectedCity || selectedCity.trim() === '') {
            setValidationError('Please select a city before submitting the form.');
            if (cityRef.current) {
                cityRef.current.focus();
                cityRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }

        // Validate property is not empty
        if (!selectedProperty || selectedProperty.trim() === '') {
            setPropertyValidationError('Please select a property before submitting the form.');
            if (propertyRef.current) {
                propertyRef.current.focus();
                propertyRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }

        // Validate unit is not empty
        if (!selectedUnit || selectedUnit.trim() === '') {
            setUnitValidationError('Please select a unit before submitting the form.');
            if (unitNameRef.current) {
                unitNameRef.current.focus();
                unitNameRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }

        // Validate owes is not empty
        if (!data.owes || data.owes.trim() === '') {
            setOwesValidationError('Please enter the amount owed before submitting the form.');
            if (owesRef.current) {
                owesRef.current.focus();
                owesRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }

        // Validate unit_id is set
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
        // Reset form to original payment data
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

            // Reset UI state
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
                        <form onSubmit={submit} className="space-y-4">
                            {/* City Selection */}
                            <div className="rounded-lg border-l-4 border-l-green-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="city" className="text-base font-semibold">
                                        City *
                                    </Label>
                                </div>
                                <Select onValueChange={handleCityChange} value={selectedCity || undefined}>
                                    <SelectTrigger ref={cityRef}>
                                        <SelectValue placeholder="Select city" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {cities?.map((city) => (
                                            <SelectItem key={city} value={city}>
                                                {city}
                                            </SelectItem>
                                        )) || []}
                                    </SelectContent>
                                </Select>
                                {errors.unit_id && <p className="mt-1 text-sm text-red-600">{errors.unit_id}</p>}
                                {validationError && <p className="mt-1 text-sm text-red-600">{validationError}</p>}
                            </div>

                            {/* Property Selection */}
                            <div className="rounded-lg border-l-4 border-l-orange-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="property_name" className="text-base font-semibold">
                                        Property *
                                    </Label>
                                </div>
                                <Select 
                                    onValueChange={handlePropertyChange} 
                                    value={selectedProperty || undefined} 
                                    disabled={!selectedCity}
                                >
                                    <SelectTrigger ref={propertyRef}>
                                        <SelectValue placeholder={!selectedCity ? 'Select city first' : 'Select property'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {getAvailableProperties().map((property) => (
                                            <SelectItem key={property} value={property}>
                                                {property}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {propertyValidationError && <p className="mt-1 text-sm text-red-600">{propertyValidationError}</p>}
                            </div>

                            {/* Unit Selection */}
                            <div className="rounded-lg border-l-4 border-l-purple-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="unit_name" className="text-base font-semibold">
                                        Unit Name *
                                    </Label>
                                </div>
                                <Select 
                                    onValueChange={handleUnitChange} 
                                    value={selectedUnit || undefined} 
                                    disabled={!selectedCity}
                                >
                                    <SelectTrigger ref={unitNameRef}>
                                        <SelectValue placeholder={!selectedCity ? 'Select city first' : 'Select unit'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {getAvailableUnits().map((unit) => (
                                            <SelectItem key={unit} value={unit}>
                                                {unit}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {unitValidationError && <p className="mt-1 text-sm text-red-600">{unitValidationError}</p>}
                            </div>

                            {/* Date Field */}
                            <div className="rounded-lg border-l-4 border-l-blue-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="date" className="text-base font-semibold">
                                        Date *
                                    </Label>
                                </div>
                                <Popover open={calendarOpen} onOpenChange={setCalendarOpen} modal={false}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            ref={dateRef}
                                            variant="outline"
                                            className={`w-full justify-start text-left font-normal ${!data.date && 'text-muted-foreground'}`}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {data.date
                                                ? (() => {
                                                      try {
                                                          const parsedDate = parse(data.date, 'yyyy-MM-dd', new Date());
                                                          return isValid(parsedDate) ? format(parsedDate, 'PPP') : 'Invalid date';
                                                      } catch (error) {
                                                          return 'Invalid date';
                                                      }
                                                  })()
                                                : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={(() => {
                                                try {
                                                    if (!data.date) return undefined;
                                                    const parsedDate = parse(data.date, 'yyyy-MM-dd', new Date());
                                                    return isValid(parsedDate) ? parsedDate : undefined;
                                                } catch (error) {
                                                    return undefined;
                                                }
                                            })()}
                                            onSelect={handleDateChange}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
                                {dateValidationError && <p className="mt-1 text-sm text-red-600">{dateValidationError}</p>}
                            </div>

                            {/* Financial Information */}
                            <div className="rounded-lg border-l-4 border-l-teal-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="owes" className="text-base font-semibold">
                                        Owes *
                                    </Label>
                                </div>
                                <Input
                                    ref={owesRef}
                                    id="owes"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.owes}
                                    onChange={handleOwesChange}
                                    placeholder="Enter amount owed"
                                />
                                {errors.owes && <p className="mt-1 text-sm text-red-600">{errors.owes}</p>}
                                {owesValidationError && <p className="mt-1 text-sm text-red-600">{owesValidationError}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-emerald-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="paid" className="text-base font-semibold">
                                        Paid
                                    </Label>
                                </div>
                                <Input
                                    id="paid"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.paid}
                                    onChange={(e) => setData(prev => ({ ...prev, paid: e.target.value }))}
                                    placeholder="Enter amount paid"
                                />
                                {errors.paid && <p className="mt-1 text-sm text-red-600">{errors.paid}</p>}
                            </div>

                            {/* Status and Permanent */}
                            <div className="rounded-lg border-l-4 border-l-cyan-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="permanent" className="text-base font-semibold">
                                        Permanent *
                                    </Label>
                                </div>
                                <RadioGroup
                                    value={data.permanent}
                                    onValueChange={(value) => setData(prev => ({ ...prev, permanent: value as 'Yes' | 'No' }))}
                                    name="permanent"
                                    options={[
                                        { value: 'Yes', label: 'Yes' },
                                        { value: 'No', label: 'No' },
                                    ]}
                                />
                                {errors.permanent && <p className="mt-1 text-sm text-red-600">{errors.permanent}</p>}
                            </div>

                            {/* Additional Information */}
                            <div className="rounded-lg border-l-4 border-l-indigo-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="reversed_payments" className="text-base font-semibold">
                                        Reversed Payments?
                                    </Label>
                                </div>
                                <Input
                                    id="reversed_payments"
                                    value={data.reversed_payments}
                                    onChange={(e) => setData(prev => ({ ...prev, reversed_payments: e.target.value }))}
                                    placeholder="Enter reversed payments information"
                                />
                                {errors.reversed_payments && <p className="mt-1 text-sm text-red-600">{errors.reversed_payments}</p>}
                            </div>

                            {/* Notes */}
                            <div className="rounded-lg border-l-4 border-l-pink-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="notes" className="text-base font-semibold">
                                        Notes
                                    </Label>
                                </div>
                                <textarea
                                    id="notes"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={data.notes}
                                    onChange={(e) => setData(prev => ({ ...prev, notes: e.target.value }))}
                                    rows={3}
                                    placeholder="Enter any additional notes..."
                                />
                                {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
                            </div>

                            {/* Debug info - remove in production */}
                            {process.env.NODE_ENV === 'development' && (
                                <div className="mt-4 p-2 bg-gray-100 rounded text-sm">
                                    <p>Original Payment Unit ID: {payment.unit_id}</p>
                                    <p>Form Unit ID: {data.unit_id}</p>
                                    <p>City: {selectedCity}</p>
                                    <p>Property: {selectedProperty}</p>
                                    <p>Unit: {selectedUnit}</p>
                                </div>
                            )}
                        </form>
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
