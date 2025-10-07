import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup } from '@/components/ui/radioGroup';
import { MoveOutFormData, TenantData } from '@/types/move-out';
import { City } from '@/types/City';
import { PropertyInfoWithoutInsurance } from '@/types/PropertyInfoWithoutInsurance';
import { useForm } from '@inertiajs/react';
import { format, parse } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import React, { useState, useRef } from 'react';

interface Props {
    cities: City[];
    properties: PropertyInfoWithoutInsurance[];
    unitsByProperty: Record<string, string[]>;
    tenantsByUnit: Record<string, Array<{ id: string; full_name: string }>>;
    tenantsData: TenantData[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function MoveOutCreateDrawer({ 
    cities,
    properties,
    unitsByProperty,
    tenantsByUnit,
    tenantsData,
    open, 
    onOpenChange, 
    onSuccess 
}: Props) {
    const cityRef = useRef<HTMLButtonElement>(null);
    const propertyRef = useRef<HTMLButtonElement>(null);
    const unitRef = useRef<HTMLButtonElement>(null);
    const tenantRef = useRef<HTMLButtonElement>(null);
    
    const [validationErrors, setValidationErrors] = useState({
        city: '',
        property: '',
        unit: '',
        tenant: ''
    });
    
    const [availableProperties, setAvailableProperties] = useState<PropertyInfoWithoutInsurance[]>([]);
    const [availableUnits, setAvailableUnits] = useState<string[]>([]);
    const [availableTenants, setAvailableTenants] = useState<Array<{ id: string; full_name: string }>>([]);
    
    const [calendarStates, setCalendarStates] = useState({
        move_out_date: false,
        date_lease_ending_on_buildium: false,
        date_utility_put_under_our_name: false,
    });

    const { data, setData, post, processing, errors, reset } = useForm<MoveOutFormData>({
        city_name: '',
        property_name: '',
        tenants_name: '',
        units_name: '',
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

    // Handle city selection
    const handleCityChange = (cityId: string) => {
        const selectedCity = cities.find(c => c.id.toString() === cityId);
        setData(prev => ({
            ...prev,
            city_name: selectedCity?.city || '',
            property_name: '',
            units_name: '',
            tenants_name: ''
        }));
        
        setValidationErrors(prev => ({ ...prev, city: '', property: '', unit: '', tenant: '' }));

        if (cityId) {
            const filteredProperties = properties.filter(
                property => property.city_id?.toString() === cityId
            );
            setAvailableProperties(filteredProperties);
        } else {
            setAvailableProperties([]);
        }
        setAvailableUnits([]);
        setAvailableTenants([]);
    };

    // Handle property selection
    const handlePropertyChange = (propertyName: string) => {
        setData(prev => ({
            ...prev,
            property_name: propertyName,
            units_name: '',
            tenants_name: ''
        }));
        
        setValidationErrors(prev => ({ ...prev, property: '', unit: '', tenant: '' }));

        if (propertyName && unitsByProperty && unitsByProperty[propertyName]) {
            setAvailableUnits(unitsByProperty[propertyName]);
        } else {
            setAvailableUnits([]);
        }
        setAvailableTenants([]);
    };

    // Handle unit selection
    const handleUnitChange = (unitName: string) => {
        setData(prev => ({
            ...prev,
            units_name: unitName,
            tenants_name: ''
        }));
        
        setValidationErrors(prev => ({ ...prev, unit: '', tenant: '' }));

        if (unitName && tenantsByUnit && tenantsByUnit[unitName]) {
            setAvailableTenants(tenantsByUnit[unitName]);
        } else {
            setAvailableTenants([]);
        }
    };

    // Handle tenant selection
    const handleTenantChange = (tenantName: string) => {
        setData('tenants_name', tenantName);
        setValidationErrors(prev => ({ ...prev, tenant: '' }));
    };

    const handleCalendarToggle = (field: keyof typeof calendarStates) => {
        setCalendarStates(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleDateSelect = (date: Date | undefined, field: string) => {
        if (date) {
            setData(field as keyof MoveOutFormData, format(date, 'yyyy-MM-dd'));
            setCalendarStates(prev => ({
                ...prev,
                [field]: false
            }));
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Clear previous validation errors
        setValidationErrors({
            city: '',
            property: '',
            unit: '',
            tenant: ''
        });
        
        let hasValidationErrors = false;
        
        // Validate city selection
        if (!data.city_name || data.city_name.trim() === '') {
            setValidationErrors(prev => ({ ...prev, city: 'Please select a city before submitting the form.' }));
            if (cityRef.current) {
                cityRef.current.focus();
                cityRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        // Validate property selection
        if (!data.property_name || data.property_name.trim() === '') {
            setValidationErrors(prev => ({ ...prev, property: 'Please select a property before submitting the form.' }));
            if (propertyRef.current) {
                propertyRef.current.focus();
                propertyRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        // Validate unit selection
        if (!data.units_name || data.units_name.trim() === '') {
            setValidationErrors(prev => ({ ...prev, unit: 'Please select a unit before submitting the form.' }));
            if (unitRef.current) {
                unitRef.current.focus();
                unitRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        // Validate tenant selection
        if (!data.tenants_name || data.tenants_name.trim() === '') {
            setValidationErrors(prev => ({ ...prev, tenant: 'Please select a tenant before submitting the form.' }));
            if (tenantRef.current) {
                tenantRef.current.focus();
                tenantRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        if (hasValidationErrors) {
            return;
        }

        // Create form data including city_name and property_name for backend
        const formData = {
            city_name: data.city_name,
            property_name: data.property_name,
            tenants_name: data.tenants_name,
            units_name: data.units_name,
            move_out_date: data.move_out_date,
            lease_status: data.lease_status,
            date_lease_ending_on_buildium: data.date_lease_ending_on_buildium,
            keys_location: data.keys_location,
            utilities_under_our_name: data.utilities_under_our_name,
            date_utility_put_under_our_name: data.date_utility_put_under_our_name,
            walkthrough: data.walkthrough,
            repairs: data.repairs,
            send_back_security_deposit: data.send_back_security_deposit,
            notes: data.notes,
            cleaning: data.cleaning,
            list_the_unit: data.list_the_unit,
            move_out_form: data.move_out_form,
        };
        
        post(route('move-out.store'), {
            // data: formData,
            onSuccess: () => {
                handleCancel();
                onSuccess?.();
            },
        });
    };

    const handleCancel = () => {
        reset();
        setValidationErrors({
            city: '',
            property: '',
            unit: '',
            tenant: ''
        });
        setAvailableProperties([]);
        setAvailableUnits([]);
        setAvailableTenants([]);
        onOpenChange(false);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
            <DrawerContent size="half" title="Create New Move-Out Record">
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-auto p-6">
                        <form onSubmit={submit} className="space-y-4">
                            {/* City Selection */}
                            <div className="rounded-lg border-l-4 border-l-blue-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="city_name" className="text-base font-semibold">
                                        City *
                                    </Label>
                                </div>
                                <Select onValueChange={handleCityChange} value={cities.find(c => c.city === data.city_name)?.id.toString() || ''}>
                                    <SelectTrigger ref={cityRef}>
                                        <SelectValue placeholder="Select city" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {cities?.map((city) => (
                                            <SelectItem key={city.id} value={city.id.toString()}>
                                                {city.city}
                                            </SelectItem>
                                        )) || []}
                                    </SelectContent>
                                </Select>
                                {validationErrors.city && <p className="mt-1 text-sm text-red-600">{validationErrors.city}</p>}
                            </div>

                            {/* Property Selection */}
                            <div className="rounded-lg border-l-4 border-l-green-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="property_name" className="text-base font-semibold">
                                        Property Name *
                                    </Label>
                                </div>
                                <Select 
                                    onValueChange={handlePropertyChange} 
                                    value={data.property_name}
                                    disabled={!data.city_name}
                                >
                                    <SelectTrigger ref={propertyRef}>
                                        <SelectValue placeholder="Select property" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableProperties?.map((property) => (
                                            <SelectItem key={property.id} value={property.property_name}>
                                                {property.property_name}
                                            </SelectItem>
                                        )) || []}
                                    </SelectContent>
                                </Select>
                                {validationErrors.property && <p className="mt-1 text-sm text-red-600">{validationErrors.property}</p>}
                            </div>

                            {/* Unit Selection */}
                            <div className="rounded-lg border-l-4 border-l-purple-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="units_name" className="text-base font-semibold">
                                        Unit Number *
                                    </Label>
                                </div>
                                <Select
                                    onValueChange={handleUnitChange}
                                    value={data.units_name}
                                    disabled={!data.property_name}
                                >
                                    <SelectTrigger ref={unitRef}>
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
                                {validationErrors.unit && <p className="mt-1 text-sm text-red-600">{validationErrors.unit}</p>}
                            </div>

                            {/* Tenant Selection */}
                            <div className="rounded-lg border-l-4 border-l-orange-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="tenants_name" className="text-base font-semibold">
                                        Tenant Name *
                                    </Label>
                                </div>
                                <Select 
                                    onValueChange={handleTenantChange} 
                                    value={data.tenants_name}
                                    disabled={!data.units_name}
                                >
                                    <SelectTrigger ref={tenantRef}>
                                        <SelectValue placeholder="Select tenant" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableTenants?.map((tenant) => (
                                            <SelectItem key={tenant.id} value={tenant.full_name}>
                                                {tenant.full_name}
                                            </SelectItem>
                                        )) || []}
                                    </SelectContent>
                                </Select>
                                {validationErrors.tenant && <p className="mt-1 text-sm text-red-600">{validationErrors.tenant}</p>}
                            </div>

                            {/* Move Out Date */}
                            <div className="rounded-lg border-l-4 border-l-red-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="move_out_date" className="text-base font-semibold">
                                        Move Out Date
                                    </Label>
                                </div>
                                <Popover open={calendarStates.move_out_date} onOpenChange={() => handleCalendarToggle('move_out_date')}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-left font-normal"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {data.move_out_date ? format(parse(data.move_out_date, 'yyyy-MM-dd', new Date()), 'PPP') : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={data.move_out_date ? parse(data.move_out_date, 'yyyy-MM-dd', new Date()) : undefined}
                                            onSelect={(date) => handleDateSelect(date, 'move_out_date')}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.move_out_date && <p className="mt-1 text-sm text-red-600">{errors.move_out_date}</p>}
                            </div>

                            {/* Lease Status */}
                            <div className="rounded-lg border-l-4 border-l-yellow-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="lease_status" className="text-base font-semibold">
                                        Lease Status
                                    </Label>
                                </div>
                                <Input
                                    id="lease_status"
                                    value={data.lease_status}
                                    onChange={(e) => setData('lease_status', e.target.value)}
                                    placeholder="Enter lease status"
                                />
                                {errors.lease_status && <p className="mt-1 text-sm text-red-600">{errors.lease_status}</p>}
                            </div>

                            {/* Date Lease Ending on Buildium */}
                            <div className="rounded-lg border-l-4 border-l-teal-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="date_lease_ending_on_buildium" className="text-base font-semibold">
                                        Date Lease Ending on Buildium
                                    </Label>
                                </div>
                                <Popover open={calendarStates.date_lease_ending_on_buildium} onOpenChange={() => handleCalendarToggle('date_lease_ending_on_buildium')}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-left font-normal"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {data.date_lease_ending_on_buildium ? format(parse(data.date_lease_ending_on_buildium, 'yyyy-MM-dd', new Date()), 'PPP') : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={data.date_lease_ending_on_buildium ? parse(data.date_lease_ending_on_buildium, 'yyyy-MM-dd', new Date()) : undefined}
                                            onSelect={(date) => handleDateSelect(date, 'date_lease_ending_on_buildium')}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.date_lease_ending_on_buildium && <p className="mt-1 text-sm text-red-600">{errors.date_lease_ending_on_buildium}</p>}
                            </div>

                            {/* Keys Location */}
                            <div className="rounded-lg border-l-4 border-l-cyan-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="keys_location" className="text-base font-semibold">
                                        Keys Location
                                    </Label>
                                </div>
                                <Input
                                    id="keys_location"
                                    value={data.keys_location}
                                    onChange={(e) => setData('keys_location', e.target.value)}
                                    placeholder="Enter keys location"
                                />
                                {errors.keys_location && <p className="mt-1 text-sm text-red-600">{errors.keys_location}</p>}
                            </div>

                            {/* Utilities */}
                            <div className="rounded-lg border-l-4 border-l-indigo-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="utilities_under_our_name" className="text-base font-semibold">
                                        Utilities Under Our Name
                                    </Label>
                                </div>
                                <RadioGroup
                                    value={data.utilities_under_our_name}
                                    onValueChange={(value) => setData('utilities_under_our_name', value as "" | "Yes" | "No")}
                                    name="utilities_under_our_name"
                                    options={[
                                        { value: 'Yes', label: 'Yes' },
                                        { value: 'No', label: 'No' }
                                    ]}
                                />
                                {errors.utilities_under_our_name && <p className="mt-1 text-sm text-red-600">{errors.utilities_under_our_name}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-pink-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="date_utility_put_under_our_name" className="text-base font-semibold">
                                        Date Utility Put Under Our Name
                                    </Label>
                                </div>
                                <Popover open={calendarStates.date_utility_put_under_our_name} onOpenChange={() => handleCalendarToggle('date_utility_put_under_our_name')}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-left font-normal"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {data.date_utility_put_under_our_name ? format(parse(data.date_utility_put_under_our_name, 'yyyy-MM-dd', new Date()), 'PPP') : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={data.date_utility_put_under_our_name ? parse(data.date_utility_put_under_our_name, 'yyyy-MM-dd', new Date()) : undefined}
                                            onSelect={(date) => handleDateSelect(date, 'date_utility_put_under_our_name')}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.date_utility_put_under_our_name && <p className="mt-1 text-sm text-red-600">{errors.date_utility_put_under_our_name}</p>}
                            </div>

                            {/* Walkthrough */}
                            <div className="rounded-lg border-l-4 border-l-emerald-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="walkthrough" className="text-base font-semibold">
                                        Walkthrough
                                    </Label>
                                </div>
                                <Textarea
                                    id="walkthrough"
                                    value={data.walkthrough}
                                    onChange={(e) => setData('walkthrough', e.target.value)}
                                    placeholder="Enter walkthrough details"
                                    className="min-h-[100px]"
                                />
                                {errors.walkthrough && <p className="mt-1 text-sm text-red-600">{errors.walkthrough}</p>}
                            </div>

                            {/* Repairs */}
                            <div className="rounded-lg border-l-4 border-l-lime-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="repairs" className="text-base font-semibold">
                                        Repairs
                                    </Label>
                                </div>
                                <Input
                                    id="repairs"
                                    value={data.repairs}
                                    onChange={(e) => setData('repairs', e.target.value)}
                                    placeholder="Enter repair details"
                                />
                                {errors.repairs && <p className="mt-1 text-sm text-red-600">{errors.repairs}</p>}
                            </div>

                            {/* Send Back Security Deposit */}
                            <div className="rounded-lg border-l-4 border-l-amber-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="send_back_security_deposit" className="text-base font-semibold">
                                        Send Back Security Deposit
                                    </Label>
                                </div>
                                <Input
                                    id="send_back_security_deposit"
                                    value={data.send_back_security_deposit}
                                    onChange={(e) => setData('send_back_security_deposit', e.target.value)}
                                    placeholder="Enter security deposit details"
                                />
                                {errors.send_back_security_deposit && <p className="mt-1 text-sm text-red-600">{errors.send_back_security_deposit}</p>}
                            </div>

                            {/* Notes */}
                            <div className="rounded-lg border-l-4 border-l-slate-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="notes" className="text-base font-semibold">
                                        Notes
                                    </Label>
                                </div>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Enter additional notes"
                                    className="min-h-[100px]"
                                />
                                {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
                            </div>

                            {/* Cleaning */}
                            <div className="rounded-lg border-l-4 border-l-violet-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="cleaning" className="text-base font-semibold">
                                        Cleaning
                                    </Label>
                                </div>
                                <RadioGroup
                                    value={data.cleaning}
                                    onValueChange={(value) => setData('cleaning', value as "" | "cleaned" | "uncleaned")}
                                    name="cleaning"
                                    options={[
                                        { value: 'cleaned', label: 'Cleaned' },
                                        { value: 'uncleaned', label: 'Uncleaned' }
                                    ]}
                                />
                                {errors.cleaning && <p className="mt-1 text-sm text-red-600">{errors.cleaning}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-rose-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="list_the_unit" className="text-base font-semibold">
                                        List the Unit
                                    </Label>
                                </div>
                                <Input
                                    id="list_the_unit"
                                    value={data.list_the_unit}
                                    onChange={(e) => setData('list_the_unit', e.target.value)}
                                    placeholder="Enter unit listing details"
                                />
                                {errors.list_the_unit && <p className="mt-1 text-sm text-red-600">{errors.list_the_unit}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-fuchsia-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="move_out_form" className="text-base font-semibold">
                                        Move Out Form
                                    </Label>
                                </div>
                                <RadioGroup
                                    value={data.move_out_form}
                                    onValueChange={(value) => setData('move_out_form', value as "" | "filled" | "not filled")}
                                    name="move_out_form"
                                    options={[
                                        { value: 'filled', label: 'Filled' },
                                        { value: 'not filled', label: 'Not Filled' }
                                    ]}
                                />
                                {errors.move_out_form && <p className="mt-1 text-sm text-red-600">{errors.move_out_form}</p>}
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
                                {processing ? 'Creating...' : 'Create Move-Out Record'}
                            </Button>
                        </div>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}