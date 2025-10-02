import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup } from '@/components/ui/radioGroup';
import { OfferRenewal, Tenant } from '@/types/OfferRenewal';
import { useForm } from '@inertiajs/react';
import { format, parse } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import React, { useState, useRef } from 'react';

interface Props {
    tenants: Tenant[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function OffersAndRenewalsCreateDrawer({ tenants, open, onOpenChange, onSuccess }: Props) {
    const propertyRef = useRef<HTMLButtonElement>(null);
    const unitRef = useRef<HTMLButtonElement>(null);
    const tenantRef = useRef<HTMLButtonElement>(null);
    const [validationErrors, setValidationErrors] = useState<{
        property?: string;
        unit?: string;
        tenant?: string;
        date_sent_offer?: string;
    }>({});
    
    const [calendarStates, setCalendarStates] = useState({
        date_sent_offer: false,
        date_of_acceptance: false,
        last_notice_sent: false,
        date_sent_lease: false,
        date_signed: false,
        last_notice_sent_2: false,
    });

    const setCalendarOpen = (field: keyof typeof calendarStates, open: boolean) => {
        setCalendarStates((prev) => ({ ...prev, [field]: open }));
    };

    const { data, setData, post, processing, errors, reset } = useForm({
        property: '',
        unit: '',
        tenant: '',
        date_sent_offer: '',
        status: '',
        date_of_acceptance: '',
        last_notice_sent: '',
        notice_kind: '',
        lease_sent: '',
        date_sent_lease: '',
        lease_signed: '',
        date_signed: '',
        last_notice_sent_2: '',
        notice_kind_2: '',
        notes: '',
        how_many_days_left: '',
    });

    // Get unique properties for Property dropdown
    const properties = Array.from(new Set((tenants || []).map(t => t.property_name)));

    // Get unique units for Unit dropdown
    const units = Array.from(new Set((tenants || []).map(t => t.unit_number)));

    // Build tenant name list for Tenant dropdown
    const tenantNames = (tenants || []).map(t => ({
        label: `${t.first_name} ${t.last_name}`,
        value: `${t.first_name} ${t.last_name}`,
    }));

    const handlePropertyChange = (property: string) => {
        setData('property', property);
        setValidationErrors(prev => ({ ...prev, property: undefined }));
    };

    const handleUnitChange = (unit: string) => {
        setData('unit', unit);
        setValidationErrors(prev => ({ ...prev, unit: undefined }));
    };

    const handleTenantChange = (tenant: string) => {
        setData('tenant', tenant);
        setValidationErrors(prev => ({ ...prev, tenant: undefined }));
    };

    const handleDateSentOfferChange = (date: string) => {
        setData('date_sent_offer', date);
        setValidationErrors(prev => ({ ...prev, date_sent_offer: undefined }));
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Clear any previous validation errors
        setValidationErrors({});
        
        let hasValidationErrors = false;
        const newValidationErrors: typeof validationErrors = {};
        
        // Validate required fields
        if (!data.property || data.property.trim() === '') {
            newValidationErrors.property = 'Please select a property before submitting the form.';
            if (propertyRef.current) {
                propertyRef.current.focus();
                propertyRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        if (!data.unit || data.unit.trim() === '') {
            newValidationErrors.unit = 'Please select a unit before submitting the form.';
            if (unitRef.current && !hasValidationErrors) {
                unitRef.current.focus();
                unitRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        if (!data.tenant || data.tenant.trim() === '') {
            newValidationErrors.tenant = 'Please select a tenant before submitting the form.';
            if (tenantRef.current && !hasValidationErrors) {
                tenantRef.current.focus();
                tenantRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        if (!data.date_sent_offer || data.date_sent_offer.trim() === '') {
            newValidationErrors.date_sent_offer = 'Please select a date sent offer before submitting the form.';
            hasValidationErrors = true;
        }
        
        if (hasValidationErrors) {
            setValidationErrors(newValidationErrors);
            return;
        }
        
        post(route('offers_and_renewals.store'), {
            onSuccess: () => {
                reset();
                setValidationErrors({});
                onOpenChange(false);
                onSuccess?.();
            },
        });
    };

    const handleCancel = () => {
        reset();
        setValidationErrors({});
        onOpenChange(false);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
            <DrawerContent size="half" title="Create New Offer/Renewal">
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-auto p-6">
                        <form onSubmit={submit} className="space-y-4">
                            {/* Basic Information */}
                            <div className="rounded-lg border-l-4 border-l-blue-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="property" className="text-base font-semibold">
                                        Property *
                                    </Label>
                                </div>
                                <Select onValueChange={handlePropertyChange} value={data.property}>
                                    <SelectTrigger ref={propertyRef}>
                                        <SelectValue placeholder="Select property" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {properties.map((property) => (
                                            <SelectItem key={property} value={property}>
                                                {property}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.property && <p className="mt-1 text-sm text-red-600">{errors.property}</p>}
                                {validationErrors.property && <p className="mt-1 text-sm text-red-600">{validationErrors.property}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-green-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="unit" className="text-base font-semibold">
                                        Unit *
                                    </Label>
                                </div>
                                <Select onValueChange={handleUnitChange} value={data.unit}>
                                    <SelectTrigger ref={unitRef}>
                                        <SelectValue placeholder="Select unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {units.map((unit) => (
                                            <SelectItem key={unit} value={unit}>
                                                {unit}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.unit && <p className="mt-1 text-sm text-red-600">{errors.unit}</p>}
                                {validationErrors.unit && <p className="mt-1 text-sm text-red-600">{validationErrors.unit}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-purple-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="tenant" className="text-base font-semibold">
                                        Tenant *
                                    </Label>
                                </div>
                                <Select onValueChange={handleTenantChange} value={data.tenant}>
                                    <SelectTrigger ref={tenantRef}>
                                        <SelectValue placeholder="Select tenant" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tenantNames.map((tenant) => (
                                            <SelectItem key={tenant.value} value={tenant.value}>
                                                {tenant.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.tenant && <p className="mt-1 text-sm text-red-600">{errors.tenant}</p>}
                                {validationErrors.tenant && <p className="mt-1 text-sm text-red-600">{validationErrors.tenant}</p>}
                            </div>

                            {/* Offer Information */}
                            <div className="rounded-lg border-l-4 border-l-orange-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="date_sent_offer" className="text-base font-semibold">
                                        Date Sent Offer *
                                    </Label>
                                </div>
                                <Popover
                                    open={calendarStates.date_sent_offer}
                                    onOpenChange={(open) => setCalendarOpen('date_sent_offer', open)}
                                    modal={false}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`w-full justify-start text-left font-normal ${!data.date_sent_offer && 'text-muted-foreground'}`}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {data.date_sent_offer
                                                ? format(parse(data.date_sent_offer, 'yyyy-MM-dd', new Date()), 'PPP')
                                                : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={data.date_sent_offer ? parse(data.date_sent_offer, 'yyyy-MM-dd', new Date()) : undefined}
                                            onSelect={(date) => {
                                                if (date) {
                                                    handleDateSentOfferChange(format(date, 'yyyy-MM-dd'));
                                                    setCalendarOpen('date_sent_offer', false);
                                                }
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.date_sent_offer && <p className="mt-1 text-sm text-red-600">{errors.date_sent_offer}</p>}
                                {validationErrors.date_sent_offer && <p className="mt-1 text-sm text-red-600">{validationErrors.date_sent_offer}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-emerald-500 p-4">
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
                                        { value: 'Accepted', label: 'Accepted' },
                                        { value: "Didn't Accept", label: "Didn't Accept" },
                                        { value: "Didn't respond", label: "Didn't respond" }
                                    ]}
                                />
                                {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-teal-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="date_of_acceptance" className="text-base font-semibold">
                                        Date of Acceptance
                                    </Label>
                                </div>
                                <Popover
                                    open={calendarStates.date_of_acceptance}
                                    onOpenChange={(open) => setCalendarOpen('date_of_acceptance', open)}
                                    modal={false}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`w-full justify-start text-left font-normal ${!data.date_of_acceptance && 'text-muted-foreground'}`}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {data.date_of_acceptance
                                                ? format(parse(data.date_of_acceptance, 'yyyy-MM-dd', new Date()), 'PPP')
                                                : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={data.date_of_acceptance ? parse(data.date_of_acceptance, 'yyyy-MM-dd', new Date()) : undefined}
                                            onSelect={(date) => {
                                                if (date) {
                                                    setData('date_of_acceptance', format(date, 'yyyy-MM-dd'));
                                                    setCalendarOpen('date_of_acceptance', false);
                                                }
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.date_of_acceptance && <p className="mt-1 text-sm text-red-600">{errors.date_of_acceptance}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-indigo-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="last_notice_sent" className="text-base font-semibold">
                                        Offer Last Notice Sent
                                    </Label>
                                </div>
                                <Popover
                                    open={calendarStates.last_notice_sent}
                                    onOpenChange={(open) => setCalendarOpen('last_notice_sent', open)}
                                    modal={false}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`w-full justify-start text-left font-normal ${!data.last_notice_sent && 'text-muted-foreground'}`}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {data.last_notice_sent
                                                ? format(parse(data.last_notice_sent, 'yyyy-MM-dd', new Date()), 'PPP')
                                                : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={data.last_notice_sent ? parse(data.last_notice_sent, 'yyyy-MM-dd', new Date()) : undefined}
                                            onSelect={(date) => {
                                                if (date) {
                                                    setData('last_notice_sent', format(date, 'yyyy-MM-dd'));
                                                    setCalendarOpen('last_notice_sent', false);
                                                }
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.last_notice_sent && <p className="mt-1 text-sm text-red-600">{errors.last_notice_sent}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-pink-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="notice_kind" className="text-base font-semibold">
                                        Offer Notice Kind
                                    </Label>
                                </div>
                                <RadioGroup
                                    value={data.notice_kind}
                                    onValueChange={(value) => setData('notice_kind', value)}
                                    name="notice_kind"
                                    options={[
                                        { value: 'Email', label: 'Email' },
                                        { value: 'Call', label: 'Call' }
                                    ]}
                                />
                                {errors.notice_kind && <p className="mt-1 text-sm text-red-600">{errors.notice_kind}</p>}
                            </div>

                            {/* Lease Information */}
                            <div className="rounded-lg border-l-4 border-l-red-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="lease_sent" className="text-base font-semibold">
                                        Lease Sent?
                                    </Label>
                                </div>
                                <RadioGroup
                                    value={data.lease_sent}
                                    onValueChange={(value) => setData('lease_sent', value)}
                                    name="lease_sent"
                                    options={[
                                        { value: 'Yes', label: 'Yes' },
                                        { value: 'No', label: 'No' }
                                    ]}
                                />
                                {errors.lease_sent && <p className="mt-1 text-sm text-red-600">{errors.lease_sent}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-yellow-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="date_sent_lease" className="text-base font-semibold">
                                        Date Sent Lease
                                    </Label>
                                </div>
                                <Popover
                                    open={calendarStates.date_sent_lease}
                                    onOpenChange={(open) => setCalendarOpen('date_sent_lease', open)}
                                    modal={false}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`w-full justify-start text-left font-normal ${!data.date_sent_lease && 'text-muted-foreground'}`}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {data.date_sent_lease
                                                ? format(parse(data.date_sent_lease, 'yyyy-MM-dd', new Date()), 'PPP')
                                                : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={data.date_sent_lease ? parse(data.date_sent_lease, 'yyyy-MM-dd', new Date()) : undefined}
                                            onSelect={(date) => {
                                                if (date) {
                                                    setData('date_sent_lease', format(date, 'yyyy-MM-dd'));
                                                    setCalendarOpen('date_sent_lease', false);
                                                }
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.date_sent_lease && <p className="mt-1 text-sm text-red-600">{errors.date_sent_lease}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-cyan-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="lease_signed" className="text-base font-semibold">
                                        Lease Signed?
                                    </Label>
                                </div>
                                <RadioGroup
                                    value={data.lease_signed}
                                    onValueChange={(value) => setData('lease_signed', value)}
                                    name="lease_signed"
                                    options={[
                                        { value: 'Signed', label: 'Signed' },
                                        { value: 'Unsigned', label: 'Unsigned' }
                                    ]}
                                />
                                {errors.lease_signed && <p className="mt-1 text-sm text-red-600">{errors.lease_signed}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-violet-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="date_signed" className="text-base font-semibold">
                                        Date Signed
                                    </Label>
                                </div>
                                <Popover
                                    open={calendarStates.date_signed}
                                    onOpenChange={(open) => setCalendarOpen('date_signed', open)}
                                    modal={false}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`w-full justify-start text-left font-normal ${!data.date_signed && 'text-muted-foreground'}`}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {data.date_signed
                                                ? format(parse(data.date_signed, 'yyyy-MM-dd', new Date()), 'PPP')
                                                : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={data.date_signed ? parse(data.date_signed, 'yyyy-MM-dd', new Date()) : undefined}
                                            onSelect={(date) => {
                                                if (date) {
                                                    setData('date_signed', format(date, 'yyyy-MM-dd'));
                                                    setCalendarOpen('date_signed', false);
                                                }
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.date_signed && <p className="mt-1 text-sm text-red-600">{errors.date_signed}</p>}
                            </div>

                            {/* Renewal Information */}
                            <div className="rounded-lg border-l-4 border-l-rose-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="last_notice_sent_2" className="text-base font-semibold">
                                        Renewal Last Notice Sent
                                    </Label>
                                </div>
                                <Popover
                                    open={calendarStates.last_notice_sent_2}
                                    onOpenChange={(open) => setCalendarOpen('last_notice_sent_2', open)}
                                    modal={false}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`w-full justify-start text-left font-normal ${!data.last_notice_sent_2 && 'text-muted-foreground'}`}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {data.last_notice_sent_2
                                                ? format(parse(data.last_notice_sent_2, 'yyyy-MM-dd', new Date()), 'PPP')
                                                : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={data.last_notice_sent_2 ? parse(data.last_notice_sent_2, 'yyyy-MM-dd', new Date()) : undefined}
                                            onSelect={(date) => {
                                                if (date) {
                                                    setData('last_notice_sent_2', format(date, 'yyyy-MM-dd'));
                                                    setCalendarOpen('last_notice_sent_2', false);
                                                }
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.last_notice_sent_2 && <p className="mt-1 text-sm text-red-600">{errors.last_notice_sent_2}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-amber-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="notice_kind_2" className="text-base font-semibold">
                                        Renewal Notice Kind
                                    </Label>
                                </div>
                                <RadioGroup
                                    value={data.notice_kind_2}
                                    onValueChange={(value) => setData('notice_kind_2', value)}
                                    name="notice_kind_2"
                                    options={[
                                        { value: 'Email', label: 'Email' },
                                        { value: 'Call', label: 'Call' }
                                    ]}
                                />
                                {errors.notice_kind_2 && <p className="mt-1 text-sm text-red-600">{errors.notice_kind_2}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-lime-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="how_many_days_left" className="text-base font-semibold">
                                        How Many Days Left
                                    </Label>
                                </div>
                                <Input
                                    id="how_many_days_left"
                                    type="number"
                                    step={1}
                                    value={data.how_many_days_left ?? ''}
                                    onChange={(e) => setData('how_many_days_left', e.target.value)}
                                    placeholder="Enter number of days"
                                />
                                {errors.how_many_days_left && <p className="mt-1 text-sm text-red-600">{errors.how_many_days_left}</p>}
                            </div>

                            {/* Notes */}
                            <div className="rounded-lg border-l-4 border-l-slate-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="notes" className="text-base font-semibold">
                                        Notes
                                    </Label>
                                </div>
                                <textarea
                                    id="notes"
                                    value={data.notes ?? ''}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    rows={3}
                                    placeholder="Enter any notes..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] resize-vertical"
                                />
                                {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
                            </div>
                        </form>
                    </div>

                    <DrawerFooter>
                        <div className="flex gap-2 justify-end">
                            <Button type="button" variant="outline" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button type="submit" onClick={submit} disabled={processing}>
                                {processing ? 'Creating...' : 'Create Offer/Renewal'}
                            </Button>
                        </div>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}