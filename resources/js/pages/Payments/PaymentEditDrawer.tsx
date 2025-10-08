import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup } from '@/components/ui/radioGroup';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Payment, UnitData } from '@/types/payments';
import { useForm } from '@inertiajs/react';
import { format, isValid, parse } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface PropertyInfo {
    id: number;
    property_name: string;
    city_id: number;
}

interface Props {
    payment: Payment;
    units: UnitData[];
    cities: string[];
    unitsByCity: Record<string, string[]>;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function PaymentEditDrawer({ payment, units, cities, unitsByCity, open, onOpenChange, onSuccess }: Props) {
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
    const [availableProperties, setAvailableProperties] = useState<PropertyInfo[]>([]);
    const [availableUnits, setAvailableUnits] = useState<string[]>([]);
    const [loadingProperties, setLoadingProperties] = useState<boolean>(false);
    const [selectedCityId, setSelectedCityId] = useState<string>('');

    const { data, setData, put, processing, errors, reset } = useForm({
        date: '',
        city: '',
        property_name: '',
        unit_name: '',
        owes: '',
        paid: '',
        status: '',
        notes: '',
        reversed_payments: '',
        permanent: 'No',
    });

    // Reset form data and state when payment changes
    useEffect(() => {
        if (payment) {
            // Reset form data with new payment data
            setData({
                date: payment.date ?? '',
                city: payment.city ?? '',
                property_name: payment.property_name ?? '',
                unit_name: payment.unit_name ?? '',
                owes: payment.owes.toString() ?? '',
                paid: payment.paid?.toString() ?? '',
                status: payment.status ?? '',
                notes: payment.notes ?? '',
                reversed_payments: payment.reversed_payments ?? '',
                permanent: payment.permanent ?? 'No',
            });

            // Clear all validation errors
            setValidationError('');
            setPropertyValidationError('');
            setUnitValidationError('');
            setDateValidationError('');
            setOwesValidationError('');

            // Reset state variables
            setCalendarOpen(false);
            setLoadingProperties(false);
            setSelectedCityId(payment.city ?? '');

            // Reset available options
            setAvailableProperties([]);
            setAvailableUnits([]);

            // Initialize dependent data if payment has city
            if (payment.city) {
                // If payment has a property, fetch properties for that city
                if (payment.property_name) {
                    fetchPropertiesForCity(payment.city);
                }

                // Set available units based on city and property
                if (payment.property_name) {
                    const cityUnits = units.filter((unit) => unit.city === payment.city && unit.property === payment.property_name);
                    setAvailableUnits(cityUnits.map((unit) => unit.unit_name));
                }
            }
        }
    }, [payment, units]);

    const fetchPropertiesForCity = async (cityName: string) => {
        setLoadingProperties(true);
        try {
            // Since we don't have city IDs in the current structure, we'll need to modify this
            // For now, let's get properties from the units data
            const cityProperties = units
                .filter((unit) => unit.city === cityName)
                .map((unit) => unit.property)
                .filter((property, index, self) => self.indexOf(property) === index) // unique properties
                .map((property, index) => ({ id: index, property_name: property, city_id: 0 }));

            setAvailableProperties(cityProperties);
        } catch (error) {
            console.error('Error fetching properties:', error);
            setAvailableProperties([]);
        } finally {
            setLoadingProperties(false);
        }
    };

    const handleCityChange = (city: string) => {
        setData('city', city);
        setData('property_name', '');
        setData('unit_name', '');
        setValidationError('');
        setPropertyValidationError('');
        setUnitValidationError('');

        setSelectedCityId(city);
        setAvailableUnits([]);

        if (city) {
            fetchPropertiesForCity(city);
        } else {
            setAvailableProperties([]);
        }
    };

    const handlePropertyChange = (propertyName: string) => {
        setData('property_name', propertyName);
        setData('unit_name', '');
        setPropertyValidationError('');
        setUnitValidationError('');

        if (propertyName && data.city) {
            // Get units for this city and property
            const propertyUnits = units.filter((unit) => unit.city === data.city && unit.property === propertyName).map((unit) => unit.unit_name);
            setAvailableUnits(propertyUnits);
        } else {
            setAvailableUnits([]);
        }
    };

    const handleUnitChange = (unitName: string) => {
        setData('unit_name', unitName);
        setUnitValidationError('');
    };

    const handleDateChange = (date: Date | undefined) => {
        if (date) {
            setData('date', format(date, 'yyyy-MM-dd'));
            setDateValidationError('');
            setCalendarOpen(false);
        }
    };

    const handleOwesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('owes', e.target.value);
        setOwesValidationError('');
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        // Clear any previous validation errors
        setValidationError('');
        setPropertyValidationError('');
        setUnitValidationError('');
        setDateValidationError('');
        setOwesValidationError('');

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
        if (!data.city || data.city.trim() === '') {
            setValidationError('Please select a city before submitting the form.');
            if (cityRef.current) {
                cityRef.current.focus();
                cityRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }

        // Validate property_name is not empty
        if (!data.property_name || data.property_name.trim() === '') {
            setPropertyValidationError('Please select a property before submitting the form.');
            if (propertyRef.current) {
                propertyRef.current.focus();
                propertyRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }

        // Validate unit_name is not empty
        if (!data.unit_name || data.unit_name.trim() === '') {
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

        if (hasValidationErrors) {
            return;
        }

        put(route('payments.update', payment.id), {
            onSuccess: () => {
                setValidationError('');
                setPropertyValidationError('');
                setUnitValidationError('');
                setDateValidationError('');
                setOwesValidationError('');
                onOpenChange(false);
                onSuccess?.();
            },
        });
    };

    const handleCancel = () => {
        // Reset form to original payment data
        setData({
            date: payment.date ?? '',
            city: payment.city ?? '',
            property_name: payment.property_name ?? '',
            unit_name: payment.unit_name ?? '',
            owes: payment.owes.toString() ?? '',
            paid: payment.paid?.toString() ?? '',
            status: payment.status ?? '',
            notes: payment.notes ?? '',
            reversed_payments: payment.reversed_payments ?? '',
            permanent: payment.permanent ?? 'No',
        });
        
        // Clear all validation errors
        setValidationError('');
        setPropertyValidationError('');
        setUnitValidationError('');
        setDateValidationError('');
        setOwesValidationError('');

        // Reset state variables
        setCalendarOpen(false);
        setLoadingProperties(false);
        setSelectedCityId(payment.city ?? '');

        // Reset available options
        setAvailableProperties([]);
        setAvailableUnits([]);

        // Reinitialize dependent data if payment has city
        if (payment.city) {
            fetchPropertiesForCity(payment.city);
            if (payment.property_name) {
                const cityUnits = units.filter((unit) => unit.city === payment.city && unit.property === payment.property_name);
                setAvailableUnits(cityUnits.map((unit) => unit.unit_name));
            }
        }

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
                                <Select onValueChange={handleCityChange} value={data.city || undefined}>
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
                                {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
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
                                    value={data.property_name || undefined}
                                    disabled={!data.city || loadingProperties}
                                >
                                    <SelectTrigger ref={propertyRef}>
                                        <SelectValue placeholder={loadingProperties ? 'Loading properties...' : 'Select property'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableProperties?.map((property) => (
                                            <SelectItem key={property.property_name} value={property.property_name}>
                                                {property.property_name}
                                            </SelectItem>
                                        )) || []}
                                    </SelectContent>
                                </Select>
                                {errors.property_name && <p className="mt-1 text-sm text-red-600">{errors.property_name}</p>}
                                {propertyValidationError && <p className="mt-1 text-sm text-red-600">{propertyValidationError}</p>}
                            </div>

                            {/* Unit Selection */}
                            <div className="rounded-lg border-l-4 border-l-purple-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="unit_name" className="text-base font-semibold">
                                        Unit Name *
                                    </Label>
                                </div>
                                <Select onValueChange={handleUnitChange} value={data.unit_name || undefined} disabled={!data.property_name}>
                                    <SelectTrigger ref={unitNameRef}>
                                        <SelectValue placeholder="Select unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableUnits?.map((unit) => (
                                            <SelectItem key={unit} value={unit}>
                                                {unit}
                                            </SelectItem>
                                        )) || []}
                                    </SelectContent>
                                </Select>
                                {errors.unit_name && <p className="mt-1 text-sm text-red-600">{errors.unit_name}</p>}
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
                                    onChange={(e) => setData('paid', e.target.value)}
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
                                    onValueChange={(value) => setData('permanent', value as 'Yes' | 'No')}
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
                                    onChange={(e) => setData('reversed_payments', e.target.value)}
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
                                    onChange={(e) => setData('notes', e.target.value)}
                                    rows={3}
                                    placeholder="Enter any additional notes..."
                                />
                                {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
                            </div>
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
