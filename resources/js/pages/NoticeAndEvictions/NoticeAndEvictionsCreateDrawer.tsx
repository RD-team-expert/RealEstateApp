import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup } from '@/components/ui/radioGroup';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { City, Notice, PropertyInfoWithoutInsurance, Tenant } from '@/types/NoticeAndEviction';

import { useForm } from '@inertiajs/react';
import { format, parse } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';

// Define types for our cascading data structures
interface Unit {
    id: number;
    property_id: number;
    unit_name: string;
    property_name: string;
    city_name: string;
}

interface ExtendedTenant extends Tenant {
    unit_id: number;
    full_name: string;
    unit_name: string;
    property_name: string;
    city_name: string;
}

interface ExtendedProperty extends PropertyInfoWithoutInsurance {
    city_id: number;
    city_name: string;
}

interface Props {
    cities: City[];
    properties: ExtendedProperty[];
    units: Unit[];
    tenants: ExtendedTenant[];
    notices: Notice[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function NoticeAndEvictionsCreateDrawer({ cities, properties, units, tenants, notices, open, onOpenChange, onSuccess }: Props) {
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

    // Cascading dropdown state
    const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
    const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
    const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);

    // Filtered options based on selections
    const [filteredProperties, setFilteredProperties] = useState<ExtendedProperty[]>([]);
    const [filteredUnits, setFilteredUnits] = useState<Unit[]>([]);
    const [filteredTenants, setFilteredTenants] = useState<ExtendedTenant[]>([]);

    const [calendarStates, setCalendarStates] = useState({
        date: false,
        hearing_dates: false,
        writ_date: false,
    });

    const setCalendarOpen = (field: keyof typeof calendarStates, open: boolean) => {
        setCalendarStates((prev) => ({ ...prev, [field]: open }));
    };

    const { data, setData, post, processing, errors, reset } = useForm({
        tenant_id: null as number | null,
        status: '',
        date: '',
        type_of_notice: '',
        have_an_exception: '',
        note: '',
        evictions: '',
        sent_to_atorney: '',
        hearing_dates: '',
        evected_or_payment_plan: '',
        if_left: '',
        writ_date: '',
    });

    // Handle city selection
    const handleCityChange = (cityId: string) => {
        const cityIdNum = parseInt(cityId);
        setSelectedCityId(cityIdNum);
        setSelectedPropertyId(null);
        setSelectedUnitId(null);
        setData('tenant_id', null);

        // Filter properties based on selected city
        const filtered = properties.filter((property) => property.city_id === cityIdNum);
        setFilteredProperties(filtered);
        setFilteredUnits([]);
        setFilteredTenants([]);

        setValidationErrors((prev) => ({ ...prev, city: '', property: '', unit: '', tenant: '' }));
    };

    // Handle property selection
    const handlePropertyChange = (propertyId: string) => {
        const propertyIdNum = parseInt(propertyId);
        setSelectedPropertyId(propertyIdNum);
        setSelectedUnitId(null);
        setData('tenant_id', null);

        // Filter units based on selected property
        const filtered = units.filter((unit) => unit.property_id === propertyIdNum);
        setFilteredUnits(filtered);
        setFilteredTenants([]);

        setValidationErrors((prev) => ({ ...prev, property: '', unit: '', tenant: '' }));
    };

    // Handle unit selection
    const handleUnitChange = (unitId: string) => {
        const unitIdNum = parseInt(unitId);
        setSelectedUnitId(unitIdNum);
        setData('tenant_id', null);

        // Filter tenants based on selected unit
        const filtered = tenants.filter((tenant) => tenant.unit_id === unitIdNum);
        setFilteredTenants(filtered);

        setValidationErrors((prev) => ({ ...prev, unit: '', tenant: '' }));
    };

    // Handle tenant selection
    const handleTenantChange = (tenantId: string) => {
        const tenantIdNum = parseInt(tenantId);
        setData('tenant_id', tenantIdNum);

        setValidationErrors((prev) => ({ ...prev, tenant: '' }));
    };

    // Reset all cascading selections when drawer opens/closes
    useEffect(() => {
        if (open) {
            // Reset all selections when opening
            setSelectedCityId(null);
            setSelectedPropertyId(null);
            setSelectedUnitId(null);
            setFilteredProperties([]);
            setFilteredUnits([]);
            setFilteredTenants([]);
            setValidationErrors({});
        }
    }, [open]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        // Clear any previous validation errors
        setValidationErrors({});

        let hasValidationErrors = false;
        const newErrors: { [key: string]: string } = {};

        // Validate cascading selections
        if (!selectedCityId) {
            newErrors.city = 'Please select a city before submitting the form.';
            hasValidationErrors = true;
        }

        if (!selectedPropertyId) {
            newErrors.property = 'Please select a property before submitting the form.';
            hasValidationErrors = true;
        }

        if (!selectedUnitId) {
            newErrors.unit = 'Please select a unit before submitting the form.';
            hasValidationErrors = true;
        }

        if (!data.tenant_id) {
            newErrors.tenant = 'Please select a tenant before submitting the form.';
            hasValidationErrors = true;
        }

        if (hasValidationErrors) {
            setValidationErrors(newErrors);
            return;
        }

        post('/notice_and_evictions', {
            onSuccess: () => {
                reset();
                setSelectedCityId(null);
                setSelectedPropertyId(null);
                setSelectedUnitId(null);
                setFilteredProperties([]);
                setFilteredUnits([]);
                setFilteredTenants([]);
                setValidationErrors({});
                onOpenChange(false);
                onSuccess?.();
            },
            onError: (errors) => {
                console.log('Form submission errors:', errors);
            },
        });
    };

    const handleCancel = () => {
        reset();
        setSelectedCityId(null);
        setSelectedPropertyId(null);
        setSelectedUnitId(null);
        setFilteredProperties([]);
        setFilteredUnits([]);
        setFilteredTenants([]);
        setValidationErrors({});
        onOpenChange(false);
    };

    // Get selected display values for form fields
    const getSelectedCityName = () => {
        const city = cities.find((c) => c.id === selectedCityId);
        return city?.city || '';
    };

    const getSelectedPropertyName = () => {
        const property = filteredProperties.find((p) => p.id === selectedPropertyId);
        return property?.property_name || '';
    };

    const getSelectedUnitName = () => {
        const unit = filteredUnits.find((u) => u.id === selectedUnitId);
        return unit?.unit_name || '';
    };

    const getSelectedTenantName = () => {
        const tenant = filteredTenants.find((t) => t.id === data.tenant_id);
        return tenant ? `${tenant.first_name} ${tenant.last_name}` : '';
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
            <DrawerContent size="half" title="Create New Notice & Eviction">
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-auto p-6">
                        <form onSubmit={submit} className="space-y-4">
                            {/* Cascading Selection: City → Property → Unit → Tenant */}
                            <div className="rounded-lg border-l-4 border-l-blue-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="city" className="text-base font-semibold">
                                        City *
                                    </Label>
                                </div>
                                <Select onValueChange={handleCityChange} value={selectedCityId?.toString() || ''}>
                                    <SelectTrigger>
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
                                {validationErrors.city && <p className="mt-1 text-sm text-red-600">{validationErrors.city}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-indigo-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="property" className="text-base font-semibold">
                                        Property *
                                    </Label>
                                </div>
                                <Select onValueChange={handlePropertyChange} value={selectedPropertyId?.toString() || ''} disabled={!selectedCityId}>
                                    <SelectTrigger className={!selectedCityId ? 'opacity-50' : ''}>
                                        <SelectValue placeholder={selectedCityId ? 'Select property' : 'Select city first'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredProperties.map((property) => (
                                            <SelectItem key={property.id} value={property.id.toString()}>
                                                {property.property_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {validationErrors.property && <p className="mt-1 text-sm text-red-600">{validationErrors.property}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-green-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="unit" className="text-base font-semibold">
                                        Unit *
                                    </Label>
                                </div>
                                <Select onValueChange={handleUnitChange} value={selectedUnitId?.toString() || ''} disabled={!selectedPropertyId}>
                                    <SelectTrigger className={!selectedPropertyId ? 'opacity-50' : ''}>
                                        <SelectValue placeholder={selectedPropertyId ? 'Select unit' : 'Select property first'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredUnits.map((unit) => (
                                            <SelectItem key={unit.id} value={unit.id.toString()}>
                                                {unit.unit_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {validationErrors.unit && <p className="mt-1 text-sm text-red-600">{validationErrors.unit}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-teal-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="tenant" className="text-base font-semibold">
                                        Tenant *
                                    </Label>
                                </div>
                                <Select onValueChange={handleTenantChange} value={data.tenant_id?.toString() || ''} disabled={!selectedUnitId}>
                                    <SelectTrigger className={!selectedUnitId ? 'opacity-50' : ''}>
                                        <SelectValue placeholder={selectedUnitId ? 'Select tenant' : 'Select unit first'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredTenants.map((tenant) => (
                                            <SelectItem key={tenant.id} value={tenant.id.toString()}>
                                                {tenant.first_name} {tenant.last_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.tenant_id && <p className="mt-1 text-sm text-red-600">{errors.tenant_id}</p>}
                                {validationErrors.tenant && <p className="mt-1 text-sm text-red-600">{validationErrors.tenant}</p>}
                            </div>

                            {/* Selection Summary - Shows selected values */}
                            {(selectedCityId || selectedPropertyId || selectedUnitId || data.tenant_id) && (
                                <div className="rounded-lg border-l-4 border-l-gray-500 bg-gray-50 p-4">
                                    <Label className="text-base font-semibold text-gray-700">Selection Summary</Label>
                                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                                        {selectedCityId && (
                                            <p>
                                                <strong>City:</strong> {getSelectedCityName()}
                                            </p>
                                        )}
                                        {selectedPropertyId && (
                                            <p>
                                                <strong>Property:</strong> {getSelectedPropertyName()}
                                            </p>
                                        )}
                                        {selectedUnitId && (
                                            <p>
                                                <strong>Unit:</strong> {getSelectedUnitName()}
                                            </p>
                                        )}
                                        {data.tenant_id && (
                                            <p>
                                                <strong>Tenant:</strong> {getSelectedTenantName()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

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
                                        { value: 'Sent to representative', label: 'Sent to representative' },
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
                                <Popover open={calendarStates.date} onOpenChange={(open) => setCalendarOpen('date', open)} modal={false}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`w-full justify-start text-left font-normal ${!data.date && 'text-muted-foreground'}`}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {data.date ? format(parse(data.date, 'yyyy-MM-dd', new Date()), 'PPP') : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={data.date ? parse(data.date, 'yyyy-MM-dd', new Date()) : undefined}
                                            onSelect={(date) => {
                                                if (date) {
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
                                        {notices.map((notice) => (
                                            <SelectItem key={notice.id} value={notice.notice_name}>
                                                {notice.notice_name}
                                            </SelectItem>
                                        ))}
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
                                    value={data.note || ''}
                                    onChange={(e) => setData('note', e.target.value)}
                                    rows={3}
                                    placeholder="Enter any notes..."
                                    className="resize-vertical min-h-[100px] w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                                    value={data.evictions || ''}
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
                                            {data.hearing_dates ? format(parse(data.hearing_dates, 'yyyy-MM-dd', new Date()), 'PPP') : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={data.hearing_dates ? parse(data.hearing_dates, 'yyyy-MM-dd', new Date()) : undefined}
                                            onSelect={(date) => {
                                                if (date) {
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
                                        { value: 'Payment Plan', label: 'Payment Plan' },
                                    ]}
                                />
                                {errors.evected_or_payment_plan && <p className="mt-1 text-sm text-red-600">{errors.evected_or_payment_plan}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-violet-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="if_left" className="text-base font-semibold">
                                        If Left?
                                    </Label>
                                </div>
                                <RadioGroup value={data.if_left} onValueChange={(value) => setData('if_left', value)} name="if_left" />
                                {errors.if_left && <p className="mt-1 text-sm text-red-600">{errors.if_left}</p>}
                            </div>

                            {/* Writ Date */}
                            <div className="rounded-lg border-l-4 border-l-slate-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="writ_date" className="text-base font-semibold">
                                        Writ Date
                                    </Label>
                                </div>
                                <Popover open={calendarStates.writ_date} onOpenChange={(open) => setCalendarOpen('writ_date', open)} modal={false}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`w-full justify-start text-left font-normal ${!data.writ_date && 'text-muted-foreground'}`}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {data.writ_date ? format(parse(data.writ_date, 'yyyy-MM-dd', new Date()), 'PPP') : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={data.writ_date ? parse(data.writ_date, 'yyyy-MM-dd', new Date()) : undefined}
                                            onSelect={(date) => {
                                                if (date) {
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

                    <DrawerFooter>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
                                Cancel
                            </Button>
                            <Button type="submit" onClick={submit} disabled={processing} className="flex-1">
                                {processing ? 'Creating...' : 'Create Notice & Eviction'}
                            </Button>
                        </div>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
