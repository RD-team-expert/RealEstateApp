import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup } from '@/components/ui/radioGroup';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { City } from '@/types/City';
import { PropertyInfoWithoutInsurance } from '@/types/PropertyInfoWithoutInsurance';
import { useForm } from '@inertiajs/react';
import { format, isValid, parse } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

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

export default function MoveInEditDrawer({ moveIn, units, cities, properties, unitsByProperty, open, onOpenChange, onSuccess }: Props) {
    const unitRef = useRef<HTMLButtonElement>(null);
    const cityRef = useRef<HTMLButtonElement>(null);
    const propertyRef = useRef<HTMLButtonElement>(null);
    const [validationError, setValidationError] = useState<string>('');
    const [cityValidationError, setCityValidationError] = useState<string>('');
    const [propertyValidationError, setPropertyValidationError] = useState<string>('');
    const [availableUnits, setAvailableUnits] = useState<Array<{id: number, unit_name: string}>>([]);
    const [availableProperties, setAvailableProperties] = useState<PropertyInfoWithoutInsurance[]>([]);
    const [selectedCityId, setSelectedCityId] = useState<string>('');
    const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');

    // Helper function to safely parse dates
    const safeParseDateString = (dateString: string | null | undefined): Date | undefined => {
        if (!dateString || dateString.trim() === '') {
            return undefined;
        }

        try {
            const parsedDate = parse(dateString, 'yyyy-MM-dd', new Date());
            return isValid(parsedDate) ? parsedDate : undefined;
        } catch (error) {
            console.warn('Failed to parse date:', dateString, error);
            return undefined;
        }
    };

    // Helper function to safely format dates for display
    const safeFormatDate = (dateString: string | null | undefined): string => {
        const parsedDate = safeParseDateString(dateString);
        if (!parsedDate) {
            return 'Pick a date';
        }

        try {
            return format(parsedDate, 'PPP');
        } catch (error) {
            console.warn('Failed to format date:', dateString, error);
            return 'Pick a date';
        }
    };

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

        // Find the unit in the units array
        const unit = units.find(u => u.id === moveIn.unit_id);
        if (!unit) return { cityId: '', propertyId: '' };

        // Find the property that matches this unit
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
                            {/* City Selection */}
                            <div className="rounded-lg border-l-4 border-l-slate-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="city_id" className="text-base font-semibold">
                                        City *
                                    </Label>
                                </div>
                                <Select onValueChange={handleCityChange} value={selectedCityId}>
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
                                {errors.unit_id && <p className="mt-1 text-sm text-red-600">Please select a valid unit.</p>}
                                {cityValidationError && <p className="mt-1 text-sm text-red-600">{cityValidationError}</p>}
                            </div>

                            {/* Property Selection */}
                            <div className="rounded-lg border-l-4 border-l-gray-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="property_id" className="text-base font-semibold">
                                        Property *
                                    </Label>
                                </div>
                                <Select onValueChange={handlePropertyChange} value={selectedPropertyId} disabled={!selectedCityId}>
                                    <SelectTrigger ref={propertyRef}>
                                        <SelectValue placeholder={selectedCityId ? 'Select property' : 'Select city first'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableProperties.map((property) => (
                                            <SelectItem key={property.id} value={property.id.toString()}>
                                                {property.property_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {propertyValidationError && <p className="mt-1 text-sm text-red-600">{propertyValidationError}</p>}
                            </div>

                            {/* Unit Selection */}
                            <div className="rounded-lg border-l-4 border-l-blue-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="unit_id" className="text-base font-semibold">
                                        Unit Name *
                                    </Label>
                                </div>
                                <Select 
                                    onValueChange={handleUnitChange} 
                                    value={data.unit_id ? data.unit_id.toString() : ''} 
                                    disabled={!selectedPropertyId}
                                >
                                    <SelectTrigger ref={unitRef}>
                                        <SelectValue placeholder={selectedPropertyId ? 'Select unit' : 'Select property first'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableUnits.map((unit) => (
                                            <SelectItem key={unit.id} value={unit.id.toString()}>
                                                {unit.unit_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.unit_id && <p className="mt-1 text-sm text-red-600">{errors.unit_id}</p>}
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
                                            {safeFormatDate(data.lease_signing_date)}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={safeParseDateString(data.lease_signing_date)}
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
                                            {safeFormatDate(data.move_in_date)}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={safeParseDateString(data.move_in_date)}
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
                                            {safeFormatDate(data.scheduled_paid_time)}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={safeParseDateString(data.scheduled_paid_time)}
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
                                            {safeFormatDate(data.move_in_form_sent_date)}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={safeParseDateString(data.move_in_form_sent_date)}
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
                                            {safeFormatDate(data.date_of_move_in_form_filled)}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={safeParseDateString(data.date_of_move_in_form_filled)}
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
                                            {safeFormatDate(data.date_of_insurance_expiration)}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={safeParseDateString(data.date_of_insurance_expiration)}
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
                                {processing ? 'Updating...' : 'Update Move-In Record'}
                            </Button>
                        </div>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
