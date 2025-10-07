import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup } from '@/components/ui/radioGroup';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { City } from '@/types/City';
import { MoveInFormData } from '@/types/move-in';
import { PropertyInfoWithoutInsurance } from '@/types/PropertyInfoWithoutInsurance';
import { useForm } from '@inertiajs/react';
import { format, parse } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import React, { useRef, useState } from 'react';

interface Props {
    units: string[];
    cities: City[];
    properties: PropertyInfoWithoutInsurance[];
    unitsByProperty: Record<string, string[]>;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function MoveInCreateDrawer({ units, cities, properties, unitsByProperty, open, onOpenChange, onSuccess }: Props) {
    const unitNameRef = useRef<HTMLButtonElement>(null);
    const cityRef = useRef<HTMLButtonElement>(null);
    const propertyRef = useRef<HTMLButtonElement>(null);
    const [validationError, setValidationError] = useState<string>('');
    const [cityValidationError, setCityValidationError] = useState<string>('');
    const [propertyValidationError, setPropertyValidationError] = useState<string>('');
    const [availableUnits, setAvailableUnits] = useState<string[]>([]);
    const [availableProperties, setAvailableProperties] = useState<PropertyInfoWithoutInsurance[]>([]);

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

    const { data, setData, post, processing, errors, reset } = useForm<MoveInFormData>({
        unit_name: '',
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
        city_id: '',
        property_name: '',
    });

    // Comprehensive reset function to clear all form state
    const resetFormState = () => {
        reset();
        setValidationError('');
        setCityValidationError('');
        setPropertyValidationError('');
        setAvailableUnits([]);
        setAvailableProperties([]);
    };

    // Filter properties based on selected city
    const handleCityChange = (cityId: string) => {
        setData('city_id', cityId);
        setData('property_name', '');
        setData('unit_name', '');
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

    const handlePropertyChange = (propertyName: string) => {
        setData('property_name', propertyName);
        setData('unit_name', '');
        setPropertyValidationError('');
        setValidationError('');

        if (propertyName && unitsByProperty && unitsByProperty[propertyName]) {
            setAvailableUnits(unitsByProperty[propertyName]);
        } else {
            setAvailableUnits([]);
        }
    };

    const handleUnitChange = (unitName: string) => {
        setData('unit_name', unitName);
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
        if (!data.city_id || data.city_id.trim() === '') {
            setCityValidationError('Please select a city before submitting the form.');
            if (cityRef.current) {
                cityRef.current.focus();
                cityRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }

        // Validate property is selected
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
            setValidationError('Please select a unit before submitting the form.');
            if (unitNameRef.current) {
                unitNameRef.current.focus();
                unitNameRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
                            {/* City Selection */}
                            <div className="rounded-lg border-l-4 border-l-slate-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="city_id" className="text-base font-semibold">
                                        City *
                                    </Label>
                                </div>
                                <Select onValueChange={handleCityChange} value={data.city_id}>
                                    <SelectTrigger ref={cityRef}>
                                        <SelectValue placeholder="Select city" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {cities.map((city) => (
                                            <SelectItem key={city.id} value={city.id.toString()}>
                                                {city.city}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.city_id && <p className="mt-1 text-sm text-red-600">{errors.city_id}</p>}
                                {cityValidationError && <p className="mt-1 text-sm text-red-600">{cityValidationError}</p>}
                            </div>

                            {/* Property Selection */}
                            <div className="rounded-lg border-l-4 border-l-gray-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="property_name" className="text-base font-semibold">
                                        Property *
                                    </Label>
                                </div>
                                <Select onValueChange={handlePropertyChange} value={data.property_name} disabled={!data.city_id}>
                                    <SelectTrigger ref={propertyRef}>
                                        <SelectValue placeholder={data.city_id ? 'Select property' : 'Select city first'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableProperties.map((property) => (
                                            <SelectItem key={property.property_name} value={property.property_name}>
                                                {property.property_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.property_name && <p className="mt-1 text-sm text-red-600">{errors.property_name}</p>}
                                {propertyValidationError && <p className="mt-1 text-sm text-red-600">{propertyValidationError}</p>}
                            </div>

                            {/* Unit and Lease Information */}
                            <div className="rounded-lg border-l-4 border-l-blue-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="unit_name" className="text-base font-semibold">
                                        Unit Name *
                                    </Label>
                                </div>
                                <Select onValueChange={handleUnitChange} value={data.unit_name} disabled={!data.property_name}>
                                    <SelectTrigger ref={unitNameRef}>
                                        <SelectValue placeholder={data.property_name ? 'Select unit' : 'Select property first'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableUnits.map((unit) => (
                                            <SelectItem key={unit} value={unit}>
                                                {unit}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.unit_name && <p className="mt-1 text-sm text-red-600">{errors.unit_name}</p>}
                                {validationError && <p className="mt-1 text-sm text-red-600">{validationError}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-green-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="signed_lease" className="text-base font-semibold">
                                        Signed Lease *
                                    </Label>
                                </div>
                                <RadioGroup
                                    value={data.signed_lease}
                                    onValueChange={(value) => setData('signed_lease', value as 'Yes' | 'No' | '')}
                                    name="signed_lease"
                                    options={[
                                        { value: 'No', label: 'No' },
                                        { value: 'Yes', label: 'Yes' },
                                    ]}
                                />
                                {errors.signed_lease && <p className="mt-1 text-sm text-red-600">{errors.signed_lease}</p>}
                            </div>

                            {/* Date Fields */}
                            <div className="rounded-lg border-l-4 border-l-purple-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="lease_signing_date" className="text-base font-semibold">
                                        Lease Signing Date
                                    </Label>
                                </div>

                                {/* Popover is non-modal; bump z-index so it's above the drawer/overlay */}
                                <Popover
                                    open={calendarStates.lease_signing_date}
                                    onOpenChange={(open) => setCalendarOpen('lease_signing_date', open)}
                                    modal={false}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`w-full justify-start text-left font-normal ${!data.lease_signing_date && 'text-muted-foreground'}`}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {data.lease_signing_date
                                                ? format(parse(data.lease_signing_date, 'yyyy-MM-dd', new Date()), 'PPP')
                                                : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={data.lease_signing_date ? parse(data.lease_signing_date, 'yyyy-MM-dd', new Date()) : undefined}
                                            onSelect={(date) => {
                                                if (date) {
                                                    setData('lease_signing_date', format(date, 'yyyy-MM-dd'));
                                                    setCalendarOpen('lease_signing_date', false);
                                                }
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>

                                {errors.lease_signing_date && <p className="mt-1 text-sm text-red-600">{errors.lease_signing_date}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-orange-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="move_in_date" className="text-base font-semibold">
                                        Move-In Date
                                    </Label>
                                </div>
                                <Popover
                                    open={calendarStates.move_in_date}
                                    onOpenChange={(open) => setCalendarOpen('move_in_date', open)}
                                    modal={false}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`w-full justify-start text-left font-normal ${!data.move_in_date && 'text-muted-foreground'}`}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {data.move_in_date ? format(parse(data.move_in_date, 'yyyy-MM-dd', new Date()), 'PPP') : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={data.move_in_date ? parse(data.move_in_date, 'yyyy-MM-dd', new Date()) : undefined}
                                            onSelect={(date) => {
                                                if (date) {
                                                    setData('move_in_date', format(date, 'yyyy-MM-dd'));
                                                    setCalendarOpen('move_in_date', false);
                                                }
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.move_in_date && <p className="mt-1 text-sm text-red-600">{errors.move_in_date}</p>}
                            </div>

                            {/* Payment Information */}
                            <div className="rounded-lg border-l-4 border-l-emerald-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="paid_security_deposit_first_month_rent" className="text-base font-semibold">
                                        Paid Security Deposit & First Month Rent
                                    </Label>
                                </div>
                                <RadioGroup
                                    value={data.paid_security_deposit_first_month_rent}
                                    onValueChange={(value) => setData('paid_security_deposit_first_month_rent', value as 'Yes' | 'No' | '')}
                                    name="paid_security_deposit_first_month_rent"
                                    options={[
                                        { value: 'No', label: 'No' },
                                        { value: 'Yes', label: 'Yes' },
                                    ]}
                                />
                                {errors.paid_security_deposit_first_month_rent && (
                                    <p className="mt-1 text-sm text-red-600">{errors.paid_security_deposit_first_month_rent}</p>
                                )}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-teal-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="scheduled_paid_time" className="text-base font-semibold">
                                        Scheduled Paid Time
                                    </Label>
                                </div>
                                <Popover
                                    open={calendarStates.scheduled_paid_time}
                                    onOpenChange={(open) => setCalendarOpen('scheduled_paid_time', open)}
                                    modal={false}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`w-full justify-start text-left font-normal ${!data.scheduled_paid_time && 'text-muted-foreground'}`}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {data.scheduled_paid_time
                                                ? format(parse(data.scheduled_paid_time, 'yyyy-MM-dd', new Date()), 'PPP')
                                                : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={
                                                data.scheduled_paid_time ? parse(data.scheduled_paid_time, 'yyyy-MM-dd', new Date()) : undefined
                                            }
                                            onSelect={(date) => {
                                                if (date) {
                                                    setData('scheduled_paid_time', format(date, 'yyyy-MM-dd'));
                                                    setCalendarOpen('scheduled_paid_time', false);
                                                }
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.scheduled_paid_time && <p className="mt-1 text-sm text-red-600">{errors.scheduled_paid_time}</p>}
                            </div>

                            {/* Keys and Forms */}
                            <div className="rounded-lg border-l-4 border-l-indigo-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="handled_keys" className="text-base font-semibold">
                                        Handled Keys
                                    </Label>
                                </div>
                                <RadioGroup
                                    value={data.handled_keys}
                                    onValueChange={(value) => setData('handled_keys', value as 'Yes' | 'No' | '')}
                                    name="handled_keys"
                                    options={[
                                        { value: 'No', label: 'No' },
                                        { value: 'Yes', label: 'Yes' },
                                    ]}
                                />
                                {errors.handled_keys && <p className="mt-1 text-sm text-red-600">{errors.handled_keys}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-pink-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="move_in_form_sent_date" className="text-base font-semibold">
                                        Move-In Form Sent Date
                                    </Label>
                                </div>
                                <Popover
                                    open={calendarStates.move_in_form_sent_date}
                                    onOpenChange={(open) => setCalendarOpen('move_in_form_sent_date', open)}
                                    modal={false}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`w-full justify-start text-left font-normal ${!data.move_in_form_sent_date && 'text-muted-foreground'}`}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {data.move_in_form_sent_date
                                                ? format(parse(data.move_in_form_sent_date, 'yyyy-MM-dd', new Date()), 'PPP')
                                                : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={
                                                data.move_in_form_sent_date ? parse(data.move_in_form_sent_date, 'yyyy-MM-dd', new Date()) : undefined
                                            }
                                            onSelect={(date) => {
                                                if (date) {
                                                    setData('move_in_form_sent_date', format(date, 'yyyy-MM-dd'));
                                                    setCalendarOpen('move_in_form_sent_date', false);
                                                }
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.move_in_form_sent_date && <p className="mt-1 text-sm text-red-600">{errors.move_in_form_sent_date}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-red-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="filled_move_in_form" className="text-base font-semibold">
                                        Filled Move-In Form
                                    </Label>
                                </div>
                                <RadioGroup
                                    value={data.filled_move_in_form}
                                    onValueChange={(value) => setData('filled_move_in_form', value as 'Yes' | 'No' | '')}
                                    name="filled_move_in_form"
                                    options={[
                                        { value: 'No', label: 'No' },
                                        { value: 'Yes', label: 'Yes' },
                                    ]}
                                />
                                {errors.filled_move_in_form && <p className="mt-1 text-sm text-red-600">{errors.filled_move_in_form}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-yellow-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="date_of_move_in_form_filled" className="text-base font-semibold">
                                        Date of Move-In Form Filled
                                    </Label>
                                </div>
                                <Popover
                                    open={calendarStates.date_of_move_in_form_filled}
                                    onOpenChange={(open) => setCalendarOpen('date_of_move_in_form_filled', open)}
                                    modal={false}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`w-full justify-start text-left font-normal ${!data.date_of_move_in_form_filled && 'text-muted-foreground'}`}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {data.date_of_move_in_form_filled
                                                ? format(parse(data.date_of_move_in_form_filled, 'yyyy-MM-dd', new Date()), 'PPP')
                                                : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={
                                                data.date_of_move_in_form_filled
                                                    ? parse(data.date_of_move_in_form_filled, 'yyyy-MM-dd', new Date())
                                                    : undefined
                                            }
                                            onSelect={(date) => {
                                                if (date) {
                                                    setData('date_of_move_in_form_filled', format(date, 'yyyy-MM-dd'));
                                                    setCalendarOpen('date_of_move_in_form_filled', false);
                                                }
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.date_of_move_in_form_filled && (
                                    <p className="mt-1 text-sm text-red-600">{errors.date_of_move_in_form_filled}</p>
                                )}
                            </div>

                            {/* Insurance Information */}
                            <div className="rounded-lg border-l-4 border-l-cyan-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="submitted_insurance" className="text-base font-semibold">
                                        Submitted Insurance
                                    </Label>
                                </div>
                                <RadioGroup
                                    value={data.submitted_insurance}
                                    onValueChange={(value) => setData('submitted_insurance', value as 'Yes' | 'No' | '')}
                                    name="submitted_insurance"
                                    options={[
                                        { value: 'No', label: 'No' },
                                        { value: 'Yes', label: 'Yes' },
                                    ]}
                                />
                                {errors.submitted_insurance && <p className="mt-1 text-sm text-red-600">{errors.submitted_insurance}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-violet-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="date_of_insurance_expiration" className="text-base font-semibold">
                                        Date of Insurance Expiration
                                    </Label>
                                </div>
                                <Popover
                                    open={calendarStates.date_of_insurance_expiration}
                                    onOpenChange={(open) => setCalendarOpen('date_of_insurance_expiration', open)}
                                    modal={false}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`w-full justify-start text-left font-normal ${!data.date_of_insurance_expiration && 'text-muted-foreground'}`}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {data.date_of_insurance_expiration
                                                ? format(parse(data.date_of_insurance_expiration, 'yyyy-MM-dd', new Date()), 'PPP')
                                                : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={
                                                data.date_of_insurance_expiration
                                                    ? parse(data.date_of_insurance_expiration, 'yyyy-MM-dd', new Date())
                                                    : undefined
                                            }
                                            onSelect={(date) => {
                                                if (date) {
                                                    setData('date_of_insurance_expiration', format(date, 'yyyy-MM-dd'));
                                                    setCalendarOpen('date_of_insurance_expiration', false);
                                                }
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.date_of_insurance_expiration && (
                                    <p className="mt-1 text-sm text-red-600">{errors.date_of_insurance_expiration}</p>
                                )}
                            </div>
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
