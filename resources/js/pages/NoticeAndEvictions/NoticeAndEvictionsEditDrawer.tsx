import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup } from '@/components/ui/radioGroup';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NoticeAndEviction, Tenant, Notice } from '@/types/NoticeAndEviction';
import { City, PropertyInfoWithoutInsurance } from '@/types';
import { useForm } from '@inertiajs/react';
import { format, parse, isValid } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';

interface Props {
    record: NoticeAndEviction;
    tenants: Tenant[];
    notices: Notice[];
    cities: City[];
    properties: PropertyInfoWithoutInsurance[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function NoticeAndEvictionsEditDrawer({ record, tenants, notices, cities, properties, open, onOpenChange, onSuccess }: Props) {
    const unitNameRef = useRef<HTMLButtonElement>(null);
    const tenantNameRef = useRef<HTMLButtonElement>(null);
    const [validationError, setValidationError] = useState<string>('');
    const [tenantValidationError, setTenantValidationError] = useState<string>('');
    const [availableProperties, setAvailableProperties] = useState<PropertyInfoWithoutInsurance[]>(properties);
    
    const [calendarStates, setCalendarStates] = useState({
        date: false,
        hearing_dates: false,
        writ_date: false,
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

    const { data, setData, put, processing, errors, reset } = useForm<Partial<NoticeAndEviction>>({
        unit_name: record.unit_name || '',
        tenants_name: record.tenants_name || '',
        city_name: record.city_name || '',
        property_name: record.property_name || '',
        status: record.status || '',
        date: record.date || '',
        type_of_notice: record.type_of_notice || '',
        have_an_exception: record.have_an_exception || '',
        note: record.note || '',
        evictions: record.evictions || '',
        sent_to_atorney: record.sent_to_atorney || '',
        hearing_dates: record.hearing_dates || '',
        evected_or_payment_plan: record.evected_or_payment_plan || '',
        if_left: record.if_left || '',
        writ_date: record.writ_date || '',
    });

    // Reset form data when record changes
    useEffect(() => {
        if (record) {
            setData({
                unit_name: record.unit_name || '',
                tenants_name: record.tenants_name || '',
                city_name: record.city_name || '',
                property_name: record.property_name || '',
                status: record.status || '',
                date: record.date || '',
                type_of_notice: record.type_of_notice || '',
                have_an_exception: record.have_an_exception || '',
                note: record.note || '',
                evictions: record.evictions || '',
                sent_to_atorney: record.sent_to_atorney || '',
                hearing_dates: record.hearing_dates || '',
                evected_or_payment_plan: record.evected_or_payment_plan || '',
                if_left: record.if_left || '',
                writ_date: record.writ_date || '',
            });
            
            // Initialize available properties based on existing city
            if (record.city_name) {
                const filteredProperties = properties.filter(property => property.city === record.city_name);
                setAvailableProperties(filteredProperties);
            }
        }
    }, [record, properties]);

    const handleUnitChange = (unitName: string) => {
        setData('unit_name', unitName);
        setValidationError('');
    };

    const handleTenantChange = (tenantName: string) => {
        setData('tenants_name', tenantName);
        setTenantValidationError('');
    };

    const handleCityChange = (cityName: string) => {
        setData('city_name', cityName);
        setData('property_name', ''); // Reset property when city changes
        
        // Filter properties based on selected city
        const filteredProperties = properties.filter(property => property.city === cityName);
        setAvailableProperties(filteredProperties);
    };

    const handlePropertyChange = (propertyName: string) => {
        setData('property_name', propertyName);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Clear any previous validation errors
        setValidationError('');
        setTenantValidationError('');
        
        let hasValidationErrors = false;
        
        // Validate unit_name is not empty
        if (!data.unit_name || data.unit_name.trim() === '') {
            setValidationError('Please select a unit before submitting the form.');
            // Focus on the unit name field
            if (unitNameRef.current) {
                unitNameRef.current.focus();
                unitNameRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        // Validate tenants_name is not empty
        if (!data.tenants_name || data.tenants_name.trim() === '') {
            setTenantValidationError('Please select a tenant before submitting the form.');
            // Focus on the tenant name field
            if (tenantNameRef.current) {
                tenantNameRef.current.focus();
                tenantNameRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        if (hasValidationErrors) {
            return;
        }
        
        put(`/notice_and_evictions/${record.id}`, {
            onSuccess: () => {
                setValidationError('');
                setTenantValidationError('');
                onOpenChange(false);
                onSuccess?.();
            },
        });
    };

    const handleCancel = () => {
        // Reset to original record data
        setData({
            unit_name: record.unit_name || '',
            tenants_name: record.tenants_name || '',
            status: record.status || '',
            date: record.date || '',
            type_of_notice: record.type_of_notice || '',
            have_an_exception: record.have_an_exception || '',
            note: record.note || '',
            evictions: record.evictions || '',
            sent_to_atorney: record.sent_to_atorney || '',
            hearing_dates: record.hearing_dates || '',
            evected_or_payment_plan: record.evected_or_payment_plan || '',
            if_left: record.if_left || '',
            writ_date: record.writ_date || '',
        });
        setValidationError('');
        setTenantValidationError('');
        onOpenChange(false);
    };

    const unitOptions = Array.from(new Set(tenants.map(t => t.unit_number)));
    const tenantOptions = tenants.map(t => ({
        label: `${t.first_name} ${t.last_name}`,
        value: `${t.first_name} ${t.last_name}`,
    }));

    return (
        <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
            <DrawerContent size="half" title={`Edit Notice & Eviction (ID: ${record.id})`}>
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-auto p-6">
                        <form onSubmit={submit} className="space-y-4">
                            {/* Unit and Tenant Information */}
                            <div className="rounded-lg border-l-4 border-l-blue-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="unit_name" className="text-base font-semibold">
                                        Unit Name *
                                    </Label>
                                </div>
                                <Select onValueChange={handleUnitChange} value={data.unit_name}>
                                    <SelectTrigger ref={unitNameRef}>
                                        <SelectValue placeholder="Select unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {unitOptions?.map((unit) => (
                                            <SelectItem key={unit} value={unit}>
                                                {unit}
                                            </SelectItem>
                                        )) || []}
                                    </SelectContent>
                                </Select>
                                {errors.unit_name && <p className="mt-1 text-sm text-red-600">{errors.unit_name}</p>}
                                {validationError && <p className="mt-1 text-sm text-red-600">{validationError}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-green-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="tenants_name" className="text-base font-semibold">
                                        Tenants Name *
                                    </Label>
                                </div>
                                <Select onValueChange={handleTenantChange} value={data.tenants_name}>
                                    <SelectTrigger ref={tenantNameRef}>
                                        <SelectValue placeholder="Select tenant" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tenantOptions?.map((tenant) => (
                                            <SelectItem key={tenant.value} value={tenant.value}>
                                                {tenant.label}
                                            </SelectItem>
                                        )) || []}
                                    </SelectContent>
                                </Select>
                                {errors.tenants_name && <p className="mt-1 text-sm text-red-600">{errors.tenants_name}</p>}
                                {tenantValidationError && <p className="mt-1 text-sm text-red-600">{tenantValidationError}</p>}
                            </div>

                            {/* City and Property Information */}
                            <div className="rounded-lg border-l-4 border-l-teal-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="city_name" className="text-base font-semibold">
                                        City Name
                                    </Label>
                                </div>
                                <Select onValueChange={handleCityChange} value={data.city_name}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select city" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {cities?.map((city) => (
                                            <SelectItem key={city.id} value={city.city}>
                                                {city.city}
                                            </SelectItem>
                                        )) || []}
                                    </SelectContent>
                                </Select>
                                {errors.city_name && <p className="mt-1 text-sm text-red-600">{errors.city_name}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-indigo-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="property_name" className="text-base font-semibold">
                                        Property Name
                                    </Label>
                                </div>
                                <Select onValueChange={handlePropertyChange} value={data.property_name}>
                                    <SelectTrigger>
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
                                {errors.property_name && <p className="mt-1 text-sm text-red-600">{errors.property_name}</p>}
                            </div>

                            {/* Status and Date */}
                            <div className="rounded-lg border-l-4 border-l-purple-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="status" className="text-base font-semibold">
                                        Status
                                    </Label>
                                </div>
                                <RadioGroup
                                    value={data.status}
                                    onValueChange={(value) => setData('status', value)}
                                    name="status"
                                    options={[
                                        { value: 'Posted', label: 'Posted' },
                                        { value: 'Sent to representative', label: 'Sent to representative' }
                                    ]}
                                />
                                {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-orange-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="date" className="text-base font-semibold">
                                        Date
                                    </Label>
                                </div>
                                <Popover
                                    open={calendarStates.date}
                                    onOpenChange={(open) => setCalendarOpen('date', open)}
                                    modal={false}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`w-full justify-start text-left font-normal ${!data.date && 'text-muted-foreground'}`}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {data.date && data.date.trim() !== ''
                                                ? (() => {
                                                    const parsedDate = parseDate(data.date);
                                                    return parsedDate ? format(parsedDate, 'PPP') : 'Pick a date';
                                                })()
                                                : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={parseDate(data.date)}
                                            onSelect={(date) => {
                                                if (date && isValid(date)) {
                                                    setData('date', format(date, 'yyyy-MM-dd'));
                                                    setCalendarOpen('date', false);
                                                }
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
                            </div>

                            {/* Notice Information */}
                            <div className="rounded-lg border-l-4 border-l-emerald-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="type_of_notice" className="text-base font-semibold">
                                        Type of Notice
                                    </Label>
                                </div>
                                <Select onValueChange={(value) => setData('type_of_notice', value)} value={data.type_of_notice}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {notices?.map((notice) => (
                                            <SelectItem key={notice.notice_name} value={notice.notice_name}>
                                                {notice.notice_name}
                                            </SelectItem>
                                        )) || []}
                                    </SelectContent>
                                </Select>
                                {errors.type_of_notice && <p className="mt-1 text-sm text-red-600">{errors.type_of_notice}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-teal-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="have_an_exception" className="text-base font-semibold">
                                        Have An Exception?
                                    </Label>
                                </div>
                                <RadioGroup
                                    value={data.have_an_exception}
                                    onValueChange={(value) => setData('have_an_exception', value)}
                                    name="have_an_exception"
                                />
                                {errors.have_an_exception && <p className="mt-1 text-sm text-red-600">{errors.have_an_exception}</p>}
                            </div>

                            {/* Note */}
                            <div className="rounded-lg border-l-4 border-l-indigo-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="note" className="text-base font-semibold">
                                        Note
                                    </Label>
                                </div>
                                <textarea
                                    id="note"
                                    value={data.note ?? ''}
                                    onChange={(e) => setData('note', e.target.value)}
                                    rows={3}
                                    placeholder="Enter any notes..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] resize-vertical"
                                />
                                {errors.note && <p className="mt-1 text-sm text-red-600">{errors.note}</p>}
                            </div>

                            {/* Evictions Information */}
                            <div className="rounded-lg border-l-4 border-l-pink-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="evictions" className="text-base font-semibold">
                                        Evictions
                                    </Label>
                                </div>
                                <Input
                                    id="evictions"
                                    value={data.evictions ?? ''}
                                    onChange={(e) => setData('evictions', e.target.value)}
                                    placeholder="Enter evictions information"
                                />
                                {errors.evictions && <p className="mt-1 text-sm text-red-600">{errors.evictions}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-red-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="sent_to_atorney" className="text-base font-semibold">
                                        Sent to Attorney
                                    </Label>
                                </div>
                                <RadioGroup
                                    value={data.sent_to_atorney}
                                    onValueChange={(value) => setData('sent_to_atorney', value)}
                                    name="sent_to_atorney"
                                />
                                {errors.sent_to_atorney && <p className="mt-1 text-sm text-red-600">{errors.sent_to_atorney}</p>}
                            </div>

                            {/* Hearing Dates */}
                            <div className="rounded-lg border-l-4 border-l-yellow-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="hearing_dates" className="text-base font-semibold">
                                        Hearing Dates
                                    </Label>
                                </div>
                                <Popover
                                    open={calendarStates.hearing_dates}
                                    onOpenChange={(open) => setCalendarOpen('hearing_dates', open)}
                                    modal={false}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`w-full justify-start text-left font-normal ${!data.hearing_dates && 'text-muted-foreground'}`}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {data.hearing_dates && data.hearing_dates.trim() !== ''
                                                ? (() => {
                                                    const parsedDate = parseDate(data.hearing_dates);
                                                    return parsedDate ? format(parsedDate, 'PPP') : 'Pick a date';
                                                })()
                                                : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={parseDate(data.hearing_dates)}
                                            onSelect={(date) => {
                                                if (date && isValid(date)) {
                                                    setData('hearing_dates', format(date, 'yyyy-MM-dd'));
                                                    setCalendarOpen('hearing_dates', false);
                                                }
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.hearing_dates && <p className="mt-1 text-sm text-red-600">{errors.hearing_dates}</p>}
                            </div>

                            {/* Final Fields */}
                            <div className="rounded-lg border-l-4 border-l-cyan-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="evected_or_payment_plan" className="text-base font-semibold">
                                        Evected Or Payment Plan
                                    </Label>
                                </div>
                                <RadioGroup
                                    value={data.evected_or_payment_plan}
                                    onValueChange={(value) => setData('evected_or_payment_plan', value)}
                                    name="evected_or_payment_plan"
                                    options={[
                                        { value: 'Evected', label: 'Evected' },
                                        { value: 'Payment Plan', label: 'Payment Plan' }
                                    ]}
                                />
                                {errors.evected_or_payment_plan && <p className="mt-1 text-sm text-red-600">{errors.evected_or_payment_plan}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-slate-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="if_left" className="text-base font-semibold">
                                        If Left?
                                    </Label>
                                </div>
                                <RadioGroup
                                    value={data.if_left}
                                    onValueChange={(value) => setData('if_left', value)}
                                    name="if_left"
                                />
                                {errors.if_left && <p className="mt-1 text-sm text-red-600">{errors.if_left}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-amber-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="writ_date" className="text-base font-semibold">
                                        Writ Date
                                    </Label>
                                </div>
                                <Popover
                                    open={calendarStates.writ_date}
                                    onOpenChange={(open) => setCalendarOpen('writ_date', open)}
                                    modal={false}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`w-full justify-start text-left font-normal ${!data.writ_date && 'text-muted-foreground'}`}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {data.writ_date && data.writ_date.trim() !== ''
                                                ? (() => {
                                                    const parsedDate = parseDate(data.writ_date);
                                                    return parsedDate ? format(parsedDate, 'PPP') : 'Pick a date';
                                                })()
                                                : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={parseDate(data.writ_date)}
                                            onSelect={(date) => {
                                                if (date && isValid(date)) {
                                                    setData('writ_date', format(date, 'yyyy-MM-dd'));
                                                    setCalendarOpen('writ_date', false);
                                                }
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.writ_date && <p className="mt-1 text-sm text-red-600">{errors.writ_date}</p>}
                            </div>
                        </form>
                    </div>

                    {/* Footer with action buttons */}
                    <DrawerFooter>
                        <div className="flex gap-2 justify-end">
                            <Button type="button" variant="outline" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button type="submit" onClick={submit} disabled={processing}>
                                {processing ? 'Updating...' : 'Update Notice & Eviction'}
                            </Button>
                        </div>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}