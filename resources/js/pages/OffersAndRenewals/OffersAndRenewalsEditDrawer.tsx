import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup } from '@/components/ui/radioGroup';
import { useForm } from '@inertiajs/react';
import { format, parse, isValid } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import React, { useState, useRef, useEffect, useMemo } from 'react';

interface HierarchicalData {
  id: number;
  name: string;
  properties: {
    id: number;
    name: string;
    city_id: number;
    units: {
      id: number;
      name: string;
      property_id: number;
      tenants: {
        id: number;
        name: string;
        first_name: string;
        last_name: string;
        unit_id: number;
      }[];
    }[];
  }[];
}

interface OfferRenewal {
  id: number;
  tenant_id?: number;
  city_name?: string;
  property?: string;
  unit?: string;
  tenant?: string;
  date_sent_offer?: string;
  status?: string;
  date_of_acceptance?: string;
  last_notice_sent?: string;
  notice_kind?: string;
  lease_sent?: string;
  date_sent_lease?: string;
  lease_signed?: string;
  date_signed?: string;
  last_notice_sent_2?: string;
  notice_kind_2?: string;
  notes?: string;
  how_many_days_left?: number;
}

interface Props {
    offer: OfferRenewal;
    hierarchicalData: HierarchicalData[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function OffersAndRenewalsEditDrawer({ offer, hierarchicalData, open, onOpenChange, onSuccess }: Props) {
    const cityRef = useRef<HTMLButtonElement>(null);
    const propertyRef = useRef<HTMLButtonElement>(null);
    const unitRef = useRef<HTMLButtonElement>(null);
    const tenantRef = useRef<HTMLButtonElement>(null);
    
    const [validationErrors, setValidationErrors] = useState<{
        city?: string;
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

    // Find initial selections based on offer data
    const findInitialSelections = () => {
        if (!offer.tenant_id) return { cityId: '', propertyId: '', unitId: '', tenantId: '' };

        for (const city of hierarchicalData) {
            for (const property of city.properties) {
                for (const unit of property.units) {
                    const tenant = unit.tenants.find(t => t.id === offer.tenant_id);
                    if (tenant) {
                        return {
                            cityId: city.id.toString(),
                            propertyId: property.id.toString(),
                            unitId: unit.id.toString(),
                            tenantId: tenant.id.toString()
                        };
                    }
                }
            }
        }

        return { cityId: '', propertyId: '', unitId: '', tenantId: '' };
    };

    const initialSelections = findInitialSelections();

    const { data, setData, put, processing, errors, reset } = useForm({
        tenant_id: offer.tenant_id?.toString() || '',
        city_id: initialSelections.cityId,
        property_id: initialSelections.propertyId,
        unit_id: initialSelections.unitId,
        date_sent_offer: formatDateForInput(offer.date_sent_offer),
        status: offer.status || '',
        date_of_acceptance: formatDateForInput(offer.date_of_acceptance),
        last_notice_sent: formatDateForInput(offer.last_notice_sent),
        notice_kind: offer.notice_kind || '',
        lease_sent: offer.lease_sent || '',
        date_sent_lease: formatDateForInput(offer.date_sent_lease),
        lease_signed: offer.lease_signed || '',
        date_signed: formatDateForInput(offer.date_signed),
        last_notice_sent_2: formatDateForInput(offer.last_notice_sent_2),
        notice_kind_2: offer.notice_kind_2 || '',
        notes: offer.notes || '',
        how_many_days_left: offer.how_many_days_left?.toString() || '',
    });

    // Reset form data when offer changes
    useEffect(() => {
        if (offer) {
            const newInitialSelections = findInitialSelections();
            setData({
                tenant_id: offer.tenant_id?.toString() || '',
                city_id: newInitialSelections.cityId,
                property_id: newInitialSelections.propertyId,
                unit_id: newInitialSelections.unitId,
                date_sent_offer: formatDateForInput(offer.date_sent_offer),
                status: offer.status || '',
                date_of_acceptance: formatDateForInput(offer.date_of_acceptance),
                last_notice_sent: formatDateForInput(offer.last_notice_sent),
                notice_kind: offer.notice_kind || '',
                lease_sent: offer.lease_sent || '',
                date_sent_lease: formatDateForInput(offer.date_sent_lease),
                lease_signed: offer.lease_signed || '',
                date_signed: formatDateForInput(offer.date_signed),
                last_notice_sent_2: formatDateForInput(offer.last_notice_sent_2),
                notice_kind_2: offer.notice_kind_2 || '',
                notes: offer.notes || '',
                how_many_days_left: offer.how_many_days_left?.toString() || '',
            });
        }
    }, [offer]);

    // Get available properties based on selected city
    const availableProperties = useMemo(() => {
        if (!data.city_id) return [];
        const selectedCity = hierarchicalData.find(city => city.id.toString() === data.city_id);
        return selectedCity ? selectedCity.properties : [];
    }, [hierarchicalData, data.city_id]);

    // Get available units based on selected property
    const availableUnits = useMemo(() => {
        if (!data.property_id) return [];
        const selectedProperty = availableProperties.find(property => property.id.toString() === data.property_id);
        return selectedProperty ? selectedProperty.units : [];
    }, [availableProperties, data.property_id]);

    // Get available tenants based on selected unit
    const availableTenants = useMemo(() => {
        if (!data.unit_id) return [];
        const selectedUnit = availableUnits.find(unit => unit.id.toString() === data.unit_id);
        return selectedUnit ? selectedUnit.tenants : [];
    }, [availableUnits, data.unit_id]);

    const handleCityChange = (cityId: string) => {
        setData({
            ...data,
            city_id: cityId,
            property_id: '', // Reset dependent fields
            unit_id: '',
            tenant_id: ''
        });
        setValidationErrors(prev => ({ ...prev, city: undefined }));
    };

    const handlePropertyChange = (propertyId: string) => {
        setData({
            ...data,
            property_id: propertyId,
            unit_id: '', // Reset dependent fields
            tenant_id: ''
        });
        setValidationErrors(prev => ({ ...prev, property: undefined }));
    };

    const handleUnitChange = (unitId: string) => {
        setData({
            ...data,
            unit_id: unitId,
            tenant_id: '' // Reset dependent field
        });
        setValidationErrors(prev => ({ ...prev, unit: undefined }));
    };

    const handleTenantChange = (tenantId: string) => {
        setData('tenant_id', tenantId);
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
        
        // Validate required fields in cascading order
        if (!data.city_id || data.city_id.trim() === '') {
            newValidationErrors.city = 'Please select a city before submitting the form.';
            if (cityRef.current) {
                cityRef.current.focus();
                cityRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        if (!data.property_id || data.property_id.trim() === '') {
            newValidationErrors.property = 'Please select a property before submitting the form.';
            if (propertyRef.current && !hasValidationErrors) {
                propertyRef.current.focus();
                propertyRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        if (!data.unit_id || data.unit_id.trim() === '') {
            newValidationErrors.unit = 'Please select a unit before submitting the form.';
            if (unitRef.current && !hasValidationErrors) {
                unitRef.current.focus();
                unitRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        if (!data.tenant_id || data.tenant_id.trim() === '') {
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
        
        put(`/offers_and_renewals/${offer.id}`, {
            onSuccess: () => {
                setValidationErrors({});
                onOpenChange(false);
                onSuccess?.();
            },
        });
    };

    const handleCancel = () => {
        // Reset to original offer data
        const resetSelections = findInitialSelections();
        setData({
            tenant_id: offer.tenant_id?.toString() || '',
            city_id: resetSelections.cityId,
            property_id: resetSelections.propertyId,
            unit_id: resetSelections.unitId,
            date_sent_offer: formatDateForInput(offer.date_sent_offer),
            status: offer.status || '',
            date_of_acceptance: formatDateForInput(offer.date_of_acceptance),
            last_notice_sent: formatDateForInput(offer.last_notice_sent),
            notice_kind: offer.notice_kind || '',
            lease_sent: offer.lease_sent || '',
            date_sent_lease: formatDateForInput(offer.date_sent_lease),
            lease_signed: offer.lease_signed || '',
            date_signed: formatDateForInput(offer.date_signed),
            last_notice_sent_2: formatDateForInput(offer.last_notice_sent_2),
            notice_kind_2: offer.notice_kind_2 || '',
            notes: offer.notes || '',
            how_many_days_left: offer.how_many_days_left?.toString() || '',
        });
        setValidationErrors({});
        onOpenChange(false);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
            <DrawerContent size="half" title={`Edit Offer/Renewal (ID: ${offer.id})`}>
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-auto p-6">
                        <form onSubmit={submit} className="space-y-4">
                            {/* Cascading Selection */}
                            <div className="rounded-lg border-l-4 border-l-indigo-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="city" className="text-base font-semibold">
                                        City *
                                    </Label>
                                </div>
                                <Select onValueChange={handleCityChange} value={data.city_id}>
                                    <SelectTrigger ref={cityRef}>
                                        <SelectValue placeholder="Select city" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {hierarchicalData.map((city) => (
                                            <SelectItem key={city.id} value={city.id.toString()}>
                                                {city.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.city_id && <p className="mt-1 text-sm text-red-600">{errors.city_id}</p>}
                                {validationErrors.city && <p className="mt-1 text-sm text-red-600">{validationErrors.city}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-blue-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="property" className="text-base font-semibold">
                                        Property *
                                    </Label>
                                </div>
                                <Select 
                                    onValueChange={handlePropertyChange} 
                                    value={data.property_id}
                                    disabled={!data.city_id || availableProperties.length === 0}
                                >
                                    <SelectTrigger ref={propertyRef}>
                                        <SelectValue placeholder={
                                            !data.city_id 
                                                ? "Select city first" 
                                                : availableProperties.length === 0 
                                                    ? "No properties available"
                                                    : "Select property"
                                        } />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableProperties.map((property) => (
                                            <SelectItem key={property.id} value={property.id.toString()}>
                                                {property.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.property_id && <p className="mt-1 text-sm text-red-600">{errors.property_id}</p>}
                                {validationErrors.property && <p className="mt-1 text-sm text-red-600">{validationErrors.property}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-green-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="unit" className="text-base font-semibold">
                                        Unit *
                                    </Label>
                                </div>
                                <Select 
                                    onValueChange={handleUnitChange} 
                                    value={data.unit_id}
                                    disabled={!data.property_id || availableUnits.length === 0}
                                >
                                    <SelectTrigger ref={unitRef}>
                                        <SelectValue placeholder={
                                            !data.property_id 
                                                ? "Select property first" 
                                                : availableUnits.length === 0 
                                                    ? "No units available"
                                                    : "Select unit"
                                        } />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableUnits.map((unit) => (
                                            <SelectItem key={unit.id} value={unit.id.toString()}>
                                                {unit.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.unit_id && <p className="mt-1 text-sm text-red-600">{errors.unit_id}</p>}
                                {validationErrors.unit && <p className="mt-1 text-sm text-red-600">{validationErrors.unit}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-purple-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="tenant" className="text-base font-semibold">
                                        Tenant *
                                    </Label>
                                </div>
                                <Select 
                                    onValueChange={handleTenantChange} 
                                    value={data.tenant_id}
                                    disabled={!data.unit_id || availableTenants.length === 0}
                                >
                                    <SelectTrigger ref={tenantRef}>
                                        <SelectValue placeholder={
                                            !data.unit_id 
                                                ? "Select unit first" 
                                                : availableTenants.length === 0 
                                                    ? "No tenants available"
                                                    : "Select tenant"
                                        } />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableTenants.map((tenant) => (
                                            <SelectItem key={tenant.id} value={tenant.id.toString()}>
                                                {tenant.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.tenant_id && <p className="mt-1 text-sm text-red-600">{errors.tenant_id}</p>}
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
                                            {data.date_sent_offer && data.date_sent_offer.trim() !== ''
                                                ? (() => {
                                                    const parsedDate = parseDate(data.date_sent_offer);
                                                    return parsedDate ? format(parsedDate, 'PPP') : 'Pick a date';
                                                })()
                                                : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={parseDate(data.date_sent_offer)}
                                            onSelect={(date) => {
                                                if (date && isValid(date)) {
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
                                            {data.date_of_acceptance && data.date_of_acceptance.trim() !== ''
                                                ? (() => {
                                                    const parsedDate = parseDate(data.date_of_acceptance);
                                                    return parsedDate ? format(parsedDate, 'PPP') : 'Pick a date';
                                                })()
                                                : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={parseDate(data.date_of_acceptance)}
                                            onSelect={(date) => {
                                                if (date && isValid(date)) {
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
                                            {data.last_notice_sent && data.last_notice_sent.trim() !== ''
                                                ? (() => {
                                                    const parsedDate = parseDate(data.last_notice_sent);
                                                    return parsedDate ? format(parsedDate, 'PPP') : 'Pick a date';
                                                })()
                                                : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={parseDate(data.last_notice_sent)}
                                            onSelect={(date) => {
                                                if (date && isValid(date)) {
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
                                            {data.date_sent_lease && data.date_sent_lease.trim() !== ''
                                                ? (() => {
                                                    const parsedDate = parseDate(data.date_sent_lease);
                                                    return parsedDate ? format(parsedDate, 'PPP') : 'Pick a date';
                                                })()
                                                : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={parseDate(data.date_sent_lease)}
                                            onSelect={(date) => {
                                                if (date && isValid(date)) {
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
                                            {data.date_signed && data.date_signed.trim() !== ''
                                                ? (() => {
                                                    const parsedDate = parseDate(data.date_signed);
                                                    return parsedDate ? format(parsedDate, 'PPP') : 'Pick a date';
                                                })()
                                                : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={parseDate(data.date_signed)}
                                            onSelect={(date) => {
                                                if (date && isValid(date)) {
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
                                            {data.last_notice_sent_2 && data.last_notice_sent_2.trim() !== ''
                                                ? (() => {
                                                    const parsedDate = parseDate(data.last_notice_sent_2);
                                                    return parsedDate ? format(parsedDate, 'PPP') : 'Pick a date';
                                                })()
                                                : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={parseDate(data.last_notice_sent_2)}
                                            onSelect={(date) => {
                                                if (date && isValid(date)) {
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

                            {/* Additional Information */}
                            <div className="rounded-lg border-l-4 border-l-lime-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="how_many_days_left" className="text-base font-semibold">
                                        How Many Days Left
                                    </Label>
                                </div>
                                <Input
                                    id="how_many_days_left"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={data.how_many_days_left}
                                    onChange={(e) => setData('how_many_days_left', e.target.value)}
                                    placeholder="Enter number of days"
                                />
                                {errors.how_many_days_left && <p className="mt-1 text-sm text-red-600">{errors.how_many_days_left}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-slate-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="notes" className="text-base font-semibold">
                                        Notes
                                    </Label>
                                </div>
                                <textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    rows={3}
                                    placeholder="Add any additional notes..."
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                                {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
                            </div>
                        </form>
                    </div>

                    <DrawerFooter>
                        <div className="flex gap-2">
                            <Button onClick={handleCancel} variant="outline" className="flex-1">
                                Cancel
                            </Button>
                            <Button onClick={submit} disabled={processing} className="flex-1">
                                {processing ? 'Updating...' : 'Update Offer'}
                            </Button>
                        </div>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
