import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup } from '@/components/ui/radioGroup';
import { Unit } from '@/types/unit';
import { PropertyInfoWithoutInsurance } from '@/types/PropertyInfoWithoutInsurance';
import { useForm } from '@inertiajs/react';
import { format, parse, isValid } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';

interface Props {
    unit: Unit;
    cities: Array<{ id: number; city: string }>;
    properties: PropertyInfoWithoutInsurance[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function UnitEditDrawer({ unit, cities, properties, open, onOpenChange, onSuccess }: Props) {
    const propertyRef = useRef<HTMLButtonElement>(null);
    const unitNameRef = useRef<HTMLInputElement>(null);
    const [validationError, setValidationError] = useState<string>('');
    const [propertyValidationError, setPropertyValidationError] = useState<string>('');
    const [unitNameValidationError, setUnitNameValidationError] = useState<string>('');
    const [availableProperties, setAvailableProperties] = useState<PropertyInfoWithoutInsurance[]>([]);
    const [selectedCityId, setSelectedCityId] = useState<string>('');
    
    const [calendarStates, setCalendarStates] = useState({
        lease_start: false,
        lease_end: false,
        insurance_expiration_date: false,
    });

    const setCalendarOpen = (field: keyof typeof calendarStates, open: boolean) => {
        setCalendarStates((prev) => ({ ...prev, [field]: open }));
    };

    // Safe date parsing function to prevent RangeError
    const parseDate = (dateString: string | null | undefined): Date | undefined => {
        if (!dateString || dateString.trim() === '') {
            return undefined;
        }
        
        try {
            // Try parsing as YYYY-MM-DD format first
            const parsedDate = parse(dateString, 'yyyy-MM-dd', new Date());
            if (isValid(parsedDate)) {
                return parsedDate;
            }
            
            // Try parsing as a regular Date
            const directDate = new Date(dateString);
            if (isValid(directDate)) {
                return directDate;
            }
            
            return undefined;
        } catch (error) {
            console.warn('Date parsing error:', error);
            return undefined;
        }
    };

    // Safe date formatting function
    const formatDateForInput = (dateString: string | null | undefined): string => {
        if (!dateString || dateString.trim() === '') {
            return '';
        }
        
        const parsedDate = parseDate(dateString);
        if (parsedDate && isValid(parsedDate)) {
            return format(parsedDate, 'yyyy-MM-dd');
        }
        
        return '';
    };

    const { data, setData, put, processing, errors } = useForm({
        property_id: unit.property_id?.toString() || '',
        unit_name: unit.unit_name || '',
        tenants: unit.tenants || '',
        lease_start: formatDateForInput(unit.lease_start),
        lease_end: formatDateForInput(unit.lease_end),
        count_beds: unit.count_beds?.toString() || '',
        count_baths: unit.count_baths?.toString() || '',
        lease_status: unit.lease_status || '',
        monthly_rent: unit.monthly_rent?.toString() || '',
        recurring_transaction: unit.recurring_transaction || '',
        utility_status: unit.utility_status || '',
        account_number: unit.account_number || '',
        insurance: unit.insurance || '',
        insurance_expiration_date: formatDateForInput(unit.insurance_expiration_date),
    });

    // Initialize selected city ID based on unit's property
    useEffect(() => {
        if (open && unit.property_id && properties) {
            const unitProperty = properties.find(p => p.id === unit.property_id);
            if (unitProperty && unitProperty.city_id) {
                setSelectedCityId(unitProperty.city_id.toString());
            }
        }
    }, [open, unit.property_id, properties]);

    // Filter properties when city is selected
    useEffect(() => {
        if (selectedCityId && properties) {
            const filteredProperties = properties.filter(
                property => property.city_id?.toString() === selectedCityId
            );
            setAvailableProperties(filteredProperties);
            
            // Reset property selection if current property is not in the filtered list
            if (data.property_id && !filteredProperties.find(p => p.id.toString() === data.property_id)) {
                setData('property_id', '');
            }
        } else {
            setAvailableProperties([]);
        }
    }, [selectedCityId, properties]);

    // Reset form data when unit changes
    useEffect(() => {
        if (unit) {
            setData({
                property_id: unit.property_id?.toString() || '',
                unit_name: unit.unit_name || '',
                tenants: unit.tenants || '',
                lease_start: formatDateForInput(unit.lease_start),
                lease_end: formatDateForInput(unit.lease_end),
                count_beds: unit.count_beds?.toString() || '',
                count_baths: unit.count_baths?.toString() || '',
                lease_status: unit.lease_status || '',
                monthly_rent: unit.monthly_rent?.toString() || '',
                recurring_transaction: unit.recurring_transaction || '',
                utility_status: unit.utility_status || '',
                account_number: unit.account_number || '',
                insurance: unit.insurance || '',
                insurance_expiration_date: formatDateForInput(unit.insurance_expiration_date),
            });
        }
    }, [unit]);

    const handleCityChange = (cityId: string) => {
        setSelectedCityId(cityId);
        setValidationError('');
        setPropertyValidationError('');
        // Don't automatically clear property_id here since user might want to keep it
    };

    const handlePropertyChange = (propertyId: string) => {
        setData('property_id', propertyId);
        setPropertyValidationError('');
    };

    const handleUnitNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('unit_name', e.target.value);
        setUnitNameValidationError('');
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Clear any previous validation errors
        setValidationError('');
        setPropertyValidationError('');
        setUnitNameValidationError('');
        
        let hasValidationErrors = false;
        
        // Validate property_id is not empty
        if (!data.property_id || data.property_id.trim() === '') {
            setPropertyValidationError('Please select a property before submitting the form.');
            if (propertyRef.current) {
                propertyRef.current.focus();
                propertyRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        // Validate unit name is not empty
        if (!data.unit_name || data.unit_name.trim() === '') {
            setUnitNameValidationError('Please enter a unit name before submitting the form.');
            if (unitNameRef.current) {
                unitNameRef.current.focus();
                unitNameRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        if (hasValidationErrors) {
            return;
        }
        
        put(route('units.update', unit.id), {
            onSuccess: () => {
                setValidationError('');
                setPropertyValidationError('');
                setUnitNameValidationError('');
                setCalendarStates({
                    lease_start: false,
                    lease_end: false,
                    insurance_expiration_date: false,
                });
                onOpenChange(false);
                onSuccess?.();
            },
        });
    };

    const handleCancel = () => {
        // Reset to original unit data
        setData({
            property_id: unit.property_id?.toString() || '',
            unit_name: unit.unit_name || '',
            tenants: unit.tenants || '',
            lease_start: formatDateForInput(unit.lease_start),
            lease_end: formatDateForInput(unit.lease_end),
            count_beds: unit.count_beds?.toString() || '',
            count_baths: unit.count_baths?.toString() || '',
            lease_status: unit.lease_status || '',
            monthly_rent: unit.monthly_rent?.toString() || '',
            recurring_transaction: unit.recurring_transaction || '',
            utility_status: unit.utility_status || '',
            account_number: unit.account_number || '',
            insurance: unit.insurance || '',
            insurance_expiration_date: formatDateForInput(unit.insurance_expiration_date),
        });
        setValidationError('');
        setPropertyValidationError('');
        setUnitNameValidationError('');
        setCalendarStates({
            lease_start: false,
            lease_end: false,
            insurance_expiration_date: false,
        });
        onOpenChange(false);
    };

    // Get current city name for display
    // const getCurrentCityName = () => {
    //     if (unit.property_id && properties) {
    //         const unitProperty = properties.find(p => p.id === unit.property_id);
    //         if (unitProperty && unitProperty.city) {
    //             return unitProperty.city.city;
    //         }
    //     }
    //     return unit.city || 'Unknown';
    // };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
            <DrawerContent size="half" title={`Edit Unit - ${unit.unit_name}`}>
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-auto p-6">
                        <form onSubmit={submit} className="space-y-4">
                            {/* Note about calculated fields */}
                            <div className="mb-6 p-4 bg-secondary border border-border rounded-lg">
                                <p className="text-sm text-secondary-foreground">
                                    <strong>Note:</strong> Vacant, Listed, and Total Applications are automatically calculated based on your inputs.
                                </p>
                            </div>

                            {/* City Selection */}
                            <div className="rounded-lg border-l-4 border-l-blue-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="city" className="text-base font-semibold">
                                        City *
                                    </Label>
                                </div>
                                <Select onValueChange={handleCityChange} value={selectedCityId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a city" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {cities?.map((city) => (
                                            <SelectItem key={city.id} value={city.id.toString()}>
                                                {city.city}
                                            </SelectItem>
                                        )) || []}
                                    </SelectContent>
                                </Select>
                                {validationError && <p className="mt-1 text-sm text-red-600">{validationError}</p>}
                            </div>

                            {/* Property Selection */}
                            <div className="rounded-lg border-l-4 border-l-green-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="property_id" className="text-base font-semibold">
                                        Property *
                                    </Label>
                                </div>
                                <Select
                                    onValueChange={handlePropertyChange}
                                    value={data.property_id}
                                    disabled={!selectedCityId || availableProperties.length === 0}
                                >
                                    <SelectTrigger ref={propertyRef}>
                                        <SelectValue placeholder={!selectedCityId ? "Select city first" : "Select property"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableProperties?.map((property) => (
                                            <SelectItem key={property.id} value={property.id.toString()}>
                                                {property.property_name}
                                            </SelectItem>
                                        )) || []}
                                    </SelectContent>
                                </Select>
                                {errors.property_id && <p className="mt-1 text-sm text-red-600">{errors.property_id}</p>}
                                {propertyValidationError && <p className="mt-1 text-sm text-red-600">{propertyValidationError}</p>}
                            </div>

                            {/* Unit Details */}
                            <div className="rounded-lg border-l-4 border-l-purple-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="unit_name" className="text-base font-semibold">
                                        Unit Name *
                                    </Label>
                                </div>
                                <Input
                                    id="unit_name"
                                    ref={unitNameRef}
                                    value={data.unit_name}
                                    onChange={handleUnitNameChange}
                                    placeholder="Enter unit name"
                                />
                                {errors.unit_name && <p className="mt-1 text-sm text-red-600">{errors.unit_name}</p>}
                                {unitNameValidationError && <p className="mt-1 text-sm text-red-600">{unitNameValidationError}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-orange-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="tenants" className="text-base font-semibold">
                                        Tenants
                                    </Label>
                                </div>
                                <Input
                                    id="tenants"
                                    value={data.tenants}
                                    onChange={(e) => setData('tenants', e.target.value)}
                                    placeholder="Enter tenant names"
                                />
                                {errors.tenants && <p className="mt-1 text-sm text-red-600">{errors.tenants}</p>}
                            </div>

                            {/* Lease Dates */}
                            <div className="rounded-lg border-l-4 border-l-emerald-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="lease_start" className="text-base font-semibold">
                                        Lease Start
                                    </Label>
                                </div>
                                <Popover
                                    open={calendarStates.lease_start}
                                    onOpenChange={(open) => setCalendarOpen('lease_start', open)}
                                    modal={false}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`w-full justify-start text-left font-normal ${!data.lease_start && 'text-muted-foreground'}`}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {data.lease_start && data.lease_start.trim() !== ''
                                                ? (() => {
                                                    const parsedDate = parseDate(data.lease_start);
                                                    return parsedDate ? format(parsedDate, 'PPP') : 'Pick a date';
                                                })()
                                                : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={parseDate(data.lease_start)}
                                            onSelect={(date) => {
                                                if (date && isValid(date)) {
                                                    setData('lease_start', format(date, 'yyyy-MM-dd'));
                                                    setCalendarOpen('lease_start', false);
                                                }
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.lease_start && <p className="mt-1 text-sm text-red-600">{errors.lease_start}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-teal-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="lease_end" className="text-base font-semibold">
                                        Lease End
                                    </Label>
                                </div>
                                <Popover
                                    open={calendarStates.lease_end}
                                    onOpenChange={(open) => setCalendarOpen('lease_end', open)}
                                    modal={false}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`w-full justify-start text-left font-normal ${!data.lease_end && 'text-muted-foreground'}`}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {data.lease_end && data.lease_end.trim() !== ''
                                                ? (() => {
                                                    const parsedDate = parseDate(data.lease_end);
                                                    return parsedDate ? format(parsedDate, 'PPP') : 'Pick a date';
                                                })()
                                                : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={parseDate(data.lease_end)}
                                            onSelect={(date) => {
                                                if (date && isValid(date)) {
                                                    setData('lease_end', format(date, 'yyyy-MM-dd'));
                                                    setCalendarOpen('lease_end', false);
                                                }
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.lease_end && <p className="mt-1 text-sm text-red-600">{errors.lease_end}</p>}
                            </div>

                            {/* Unit Specifications */}
                            <div className="rounded-lg border-l-4 border-l-indigo-500 p-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="count_beds" className="text-base font-semibold">
                                            Count Beds
                                        </Label>
                                        <Input
                                            id="count_beds"
                                            type="number"
                                            step="0.5"
                                            min="0"
                                            value={data.count_beds}
                                            onChange={(e) => setData('count_beds', e.target.value)}
                                            placeholder="Number of beds"
                                        />
                                        {errors.count_beds && <p className="mt-1 text-sm text-red-600">{errors.count_beds}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="count_baths" className="text-base font-semibold">
                                            Count Baths
                                        </Label>
                                        <Input
                                            id="count_baths"
                                            type="number"
                                            step="0.5"
                                            min="0"
                                            value={data.count_baths}
                                            onChange={(e) => setData('count_baths', e.target.value)}
                                            placeholder="Number of baths"
                                        />
                                        {errors.count_baths && <p className="mt-1 text-sm text-red-600">{errors.count_baths}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Lease Status with RadioGroup */}
                            <div className="rounded-lg border-l-4 border-l-pink-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="lease_status" className="text-base font-semibold">
                                        Lease Status
                                    </Label>
                                </div>
                                <RadioGroup
                                    value={data.lease_status}
                                    onValueChange={(value) => setData('lease_status', value)}
                                    name="lease_status"
                                    options={[
                                        { value: 'Fixed', label: 'Fixed' },
                                        { value: 'Fixed with roll over', label: 'Fixed with roll over' },
                                        { value: 'At will', label: 'At will' }
                                    ]}
                                />
                                {errors.lease_status && <p className="mt-1 text-sm text-red-600">{errors.lease_status}</p>}
                            </div>

                            {/* Financial Information */}
                            <div className="rounded-lg border-l-4 border-l-red-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="monthly_rent" className="text-base font-semibold">
                                        Monthly Rent
                                    </Label>
                                </div>
                                <Input
                                    id="monthly_rent"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.monthly_rent}
                                    onChange={(e) => setData('monthly_rent', e.target.value)}
                                    placeholder="0.00"
                                />
                                {errors.monthly_rent && <p className="mt-1 text-sm text-red-600">{errors.monthly_rent}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-yellow-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="recurring_transaction" className="text-base font-semibold">
                                        Recurring Transaction
                                    </Label>
                                </div>
                                <Input
                                    id="recurring_transaction"
                                    value={data.recurring_transaction}
                                    onChange={(e) => setData('recurring_transaction', e.target.value)}
                                    placeholder="Transaction details"
                                />
                                {errors.recurring_transaction && <p className="mt-1 text-sm text-red-600">{errors.recurring_transaction}</p>}
                            </div>

                            {/* Utilities and Services */}
                            <div className="rounded-lg border-l-4 border-l-cyan-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="utility_status" className="text-base font-semibold">
                                        Utility Status
                                    </Label>
                                </div>
                                <Input
                                    id="utility_status"
                                    value={data.utility_status}
                                    onChange={(e) => setData('utility_status', e.target.value)}
                                    placeholder="e.g., Included, Tenant Responsible"
                                />
                                {errors.utility_status && <p className="mt-1 text-sm text-red-600">{errors.utility_status}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-gray-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="account_number" className="text-base font-semibold">
                                        Account Number
                                    </Label>
                                </div>
                                <Input
                                    id="account_number"
                                    value={data.account_number}
                                    onChange={(e) => setData('account_number', e.target.value)}
                                    placeholder="Account or reference number"
                                />
                                {errors.account_number && <p className="mt-1 text-sm text-red-600">{errors.account_number}</p>}
                            </div>

                            {/* Insurance Information */}
                            <div className="rounded-lg border-l-4 border-l-violet-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="insurance" className="text-base font-semibold">
                                        Insurance
                                    </Label>
                                </div>
                                <RadioGroup
                                    value={data.insurance}
                                    onValueChange={(value) => setData('insurance', value)}
                                    name="insurance"
                                    options={[
                                        { value: 'Yes', label: 'Yes' },
                                        { value: 'No', label: 'No' }
                                    ]}
                                />
                                {errors.insurance && <p className="mt-1 text-sm text-red-600">{errors.insurance}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-rose-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="insurance_expiration_date" className="text-base font-semibold">
                                        Insurance Expiration Date
                                    </Label>
                                </div>
                                <Popover
                                    open={calendarStates.insurance_expiration_date}
                                    onOpenChange={(open) => setCalendarOpen('insurance_expiration_date', open)}
                                    modal={false}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`w-full justify-start text-left font-normal ${!data.insurance_expiration_date && 'text-muted-foreground'}`}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {data.insurance_expiration_date && data.insurance_expiration_date.trim() !== ''
                                                ? (() => {
                                                    const parsedDate = parseDate(data.insurance_expiration_date);
                                                    return parsedDate ? format(parsedDate, 'PPP') : 'Pick a date';
                                                })()
                                                : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={parseDate(data.insurance_expiration_date)}
                                            onSelect={(date) => {
                                                if (date && isValid(date)) {
                                                    setData('insurance_expiration_date', format(date, 'yyyy-MM-dd'));
                                                    setCalendarOpen('insurance_expiration_date', false);
                                                }
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.insurance_expiration_date && <p className="mt-1 text-sm text-red-600">{errors.insurance_expiration_date}</p>}
                            </div>

                            {/* Current calculated values display */}
                            <div className="p-4 bg-muted border border-border rounded-lg">
                                <h4 className="text-sm font-medium text-foreground mb-3">Current Calculated Values:</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-muted-foreground">Vacant:</span>
                                        <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                                            unit.vacant === 'Yes' ? 'bg-destructive text-destructive-foreground' : 'bg-chart-1 text-primary-foreground'
                                        }`}>
                                            {unit.vacant}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-muted-foreground">Listed:</span>
                                        <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                                            unit.listed === 'Yes' ? 'bg-chart-1 text-primary-foreground' : 'bg-muted text-muted-foreground'
                                        }`}>
                                            {unit.listed}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-muted-foreground">Applications:</span>
                                        <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-chart-2 text-primary-foreground">
                                            {unit.total_applications || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    <DrawerFooter className="border-t bg-background">
                        <div className="flex gap-2">
                            <Button
                                type="submit"
                                onClick={submit}
                                disabled={processing}
                                className="flex-1"
                            >
                                {processing ? 'Updating...' : 'Update Unit'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                disabled={processing}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                        </div>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
