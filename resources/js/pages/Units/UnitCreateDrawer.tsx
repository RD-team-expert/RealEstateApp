import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup } from '@/components/ui/radioGroup';
import { UnitFormData } from '@/types/unit';
import { PropertyInfoWithoutInsurance } from '@/types/PropertyInfoWithoutInsurance';
import { useForm } from '@inertiajs/react';
import { format, parse } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';

interface Props {
    cities: Array<{ id: number; city: string }>;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function UnitCreateDrawer({ cities, open, onOpenChange, onSuccess }: Props) {
    const cityRef = useRef<HTMLButtonElement>(null);
    const propertyRef = useRef<HTMLButtonElement>(null);
    const unitNameRef = useRef<HTMLInputElement>(null);
    const [validationError, setValidationError] = useState<string>('');
    const [propertyValidationError, setPropertyValidationError] = useState<string>('');
    const [unitNameValidationError, setUnitNameValidationError] = useState<string>('');
    const [availableProperties, setAvailableProperties] = useState<PropertyInfoWithoutInsurance[]>([]);
    const [loadingProperties, setLoadingProperties] = useState<boolean>(false);
    const [selectedCityId, setSelectedCityId] = useState<string>('');
    
    const [calendarStates, setCalendarStates] = useState({
        lease_start: false,
        lease_end: false,
        insurance_expiration_date: false,
    });

    const setCalendarOpen = (field: keyof typeof calendarStates, open: boolean) => {
        setCalendarStates((prev) => ({ ...prev, [field]: open }));
    };

    const { data, setData, post, processing, errors, reset } = useForm({
        city: '',
        property: '',
        unit_name: '',
        tenants: '',
        lease_start: '',
        lease_end: '',
        count_beds: '',
        count_baths: '',
        lease_status: '',
        monthly_rent: '',
        recurring_transaction: '',
        utility_status: '',
        account_number: '',
        insurance: '',
        insurance_expiration_date: '',
    });

    // Fetch properties when city is selected
    useEffect(() => {
        if (selectedCityId) {
            setLoadingProperties(true);
            fetch(`/api/all-properties/by-city/${selectedCityId}`)
                .then(response => response.json())
                .then((properties: PropertyInfoWithoutInsurance[]) => {
                    setAvailableProperties(properties);
                    setLoadingProperties(false);
                })
                .catch(error => {
                    console.error('Error fetching properties:', error);
                    setAvailableProperties([]);
                    setLoadingProperties(false);
                });
        } else {
            setAvailableProperties([]);
            setData('property', '');
        }
    }, [selectedCityId]);

    const handleCityChange = (cityName: string) => {
        setData('city', cityName);
        setData('property', '');
        setValidationError('');
        setPropertyValidationError('');

        // Find the city ID from the city name
        const selectedCity = cities.find(city => city.city === cityName);
        if (selectedCity) {
            setSelectedCityId(selectedCity.id.toString());
        } else {
            setSelectedCityId('');
            setAvailableProperties([]);
        }
    };

    const handlePropertyChange = (propertyName: string) => {
        setData('property', propertyName);
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
        
        // Validate city is not empty
        if (!data.city || data.city.trim() === '') {
            setValidationError('Please select a city before submitting the form.');
            if (cityRef.current) {
                cityRef.current.focus();
                cityRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        // Validate property is not empty
        if (!data.property || data.property.trim() === '') {
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
        
        post(route('units.store'), {
            onSuccess: () => {
                reset();
                setValidationError('');
                setPropertyValidationError('');
                setUnitNameValidationError('');
                setAvailableProperties([]);
                setSelectedCityId('');
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
        reset();
        setValidationError('');
        setPropertyValidationError('');
        setUnitNameValidationError('');
        setAvailableProperties([]);
        setSelectedCityId('');
        setCalendarStates({
            lease_start: false,
            lease_end: false,
            insurance_expiration_date: false,
        });
        onOpenChange(false);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
            <DrawerContent size="half" title="Create New Unit">
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-auto p-6">
                        <form onSubmit={submit} className="space-y-4">
                            {/* City and Property Information */}
                            <div className="rounded-lg border-l-4 border-l-blue-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="city" className="text-base font-semibold">
                                        City *
                                    </Label>
                                </div>
                                <Select onValueChange={handleCityChange} value={data.city}>
                                    <SelectTrigger ref={cityRef}>
                                        <SelectValue placeholder="Select a city" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {cities?.map((city) => (
                                            <SelectItem key={city.id} value={city.city}>
                                                {city.city}
                                            </SelectItem>
                                        )) || []}
                                    </SelectContent>
                                </Select>
                                {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                                {validationError && <p className="mt-1 text-sm text-red-600">{validationError}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-green-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="property" className="text-base font-semibold">
                                        Property *
                                    </Label>
                                </div>
                                <Select
                                    onValueChange={handlePropertyChange}
                                    value={data.property}
                                    disabled={!data.city || loadingProperties}
                                >
                                    <SelectTrigger ref={propertyRef}>
                                        <SelectValue placeholder={loadingProperties ? "Loading properties..." : "Select property"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableProperties?.map((property) => (
                                            <SelectItem key={property.id} value={property.property_name}>
                                                {property.property_name}
                                            </SelectItem>
                                        )) || []}
                                    </SelectContent>
                                </Select>
                                {errors.property && <p className="mt-1 text-sm text-red-600">{errors.property}</p>}
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
                                            {data.lease_start
                                                ? format(parse(data.lease_start, 'yyyy-MM-dd', new Date()), 'PPP')
                                                : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={data.lease_start ? parse(data.lease_start, 'yyyy-MM-dd', new Date()) : undefined}
                                            onSelect={(date) => {
                                                if (date) {
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
                                            {data.lease_end
                                                ? format(parse(data.lease_end, 'yyyy-MM-dd', new Date()), 'PPP')
                                                : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={data.lease_end ? parse(data.lease_end, 'yyyy-MM-dd', new Date()) : undefined}
                                            onSelect={(date) => {
                                                if (date) {
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
                                    placeholder="Enter monthly rent amount"
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
                                    placeholder="Enter recurring transaction details"
                                />
                                {errors.recurring_transaction && <p className="mt-1 text-sm text-red-600">{errors.recurring_transaction}</p>}
                            </div>

                            {/* Utility Information */}
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
                                    placeholder="Enter utility status"
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
                                    placeholder="Enter account number"
                                />
                                {errors.account_number && <p className="mt-1 text-sm text-red-600">{errors.account_number}</p>}
                            </div>

                            {/* Insurance with RadioGroup */}
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
                                            {data.insurance_expiration_date
                                                ? format(parse(data.insurance_expiration_date, 'yyyy-MM-dd', new Date()), 'PPP')
                                                : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={data.insurance_expiration_date ? parse(data.insurance_expiration_date, 'yyyy-MM-dd', new Date()) : undefined}
                                            onSelect={(date) => {
                                                if (date) {
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
                                {processing ? 'Creating...' : 'Create Unit'}
                            </Button>
                        </div>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}