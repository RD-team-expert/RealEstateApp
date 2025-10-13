import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { City } from '@/types/City';
import { PropertyInfoWithoutInsurance } from '@/types/PropertyInfoWithoutInsurance';
import { useForm } from '@inertiajs/react';
import { format, parse } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import React, { useState, useRef } from 'react';

interface TenantData {
    id: number;
    full_name: string;
    tenant_id: number;
}

type PaymentPlanFormData = {
    tenant_id: number | null;
    amount: number;
    dates: string;
    paid: number;
    notes: string;
}

interface Props {
    cities: City[];
    properties: PropertyInfoWithoutInsurance[];
    propertiesByCityId: Record<number, PropertyInfoWithoutInsurance[]>;
    unitsByPropertyId: Record<number, Array<{ id: number; unit_name: string }>>;
    tenantsByUnitId: Record<number, Array<{ id: number; full_name: string; tenant_id: number }>>;
    tenantsData: TenantData[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function PaymentPlanCreateDrawer({ 
    cities,
    // properties,
    propertiesByCityId,
    unitsByPropertyId,
    tenantsByUnitId,
    // tenantsData,
    open, 
    onOpenChange, 
    onSuccess 
}: Props) {
    // State for cascading dropdowns
    const [selectedCity, setSelectedCity] = useState<number | null>(null);
    const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
    const [selectedUnit, setSelectedUnit] = useState<number | null>(null);
    const [selectedTenant, setSelectedTenant] = useState<number | null>(null);
    
    // Available options based on selections
    const [availableProperties, setAvailableProperties] = useState<PropertyInfoWithoutInsurance[]>([]);
    const [availableUnits, setAvailableUnits] = useState<Array<{ id: number; unit_name: string }>>([]);
    const [availableTenants, setAvailableTenants] = useState<Array<{ id: number; full_name: string; tenant_id: number }>>([]);
    
    // Validation errors
    const [validationErrors, setValidationErrors] = useState({
        city: '',
        property: '',
        unit: '',
        tenant: ''
    });
    
    // Calendar state
    const [calendarOpen, setCalendarOpen] = useState(false);
    
    // Refs for focusing on validation errors
    const cityRef = useRef<HTMLButtonElement>(null);
    const propertyRef = useRef<HTMLButtonElement>(null);
    const unitRef = useRef<HTMLButtonElement>(null);
    const tenantRef = useRef<HTMLButtonElement>(null);

    const { data, setData, post, processing, errors, reset } = useForm<PaymentPlanFormData>({
        tenant_id: null,
        amount: 0,
        dates: '',
        paid: 0,
        notes: '',
    });

    // Handle city selection
    const handleCityChange = (cityId: string) => {
        const cityIdNum = parseInt(cityId);
        setSelectedCity(cityIdNum);
        setSelectedProperty(null);
        setSelectedUnit(null);
        setSelectedTenant(null);
        setData('tenant_id', null);
        
        setValidationErrors(prev => ({ ...prev, city: '', property: '', unit: '', tenant: '' }));

        if (cityIdNum && propertiesByCityId[cityIdNum]) {
            setAvailableProperties(propertiesByCityId[cityIdNum]);
        } else {
            setAvailableProperties([]);
        }
        setAvailableUnits([]);
        setAvailableTenants([]);
    };

    // Handle property selection
    const handlePropertyChange = (propertyId: string) => {
        const propertyIdNum = parseInt(propertyId);
        setSelectedProperty(propertyIdNum);
        setSelectedUnit(null);
        setSelectedTenant(null);
        setData('tenant_id', null);
        
        setValidationErrors(prev => ({ ...prev, property: '', unit: '', tenant: '' }));

        if (propertyIdNum && unitsByPropertyId[propertyIdNum]) {
            setAvailableUnits(unitsByPropertyId[propertyIdNum]);
        } else {
            setAvailableUnits([]);
        }
        setAvailableTenants([]);
    };

    // Handle unit selection
    const handleUnitChange = (unitId: string) => {
        const unitIdNum = parseInt(unitId);
        setSelectedUnit(unitIdNum);
        setSelectedTenant(null);
        setData('tenant_id', null);
        
        setValidationErrors(prev => ({ ...prev, unit: '', tenant: '' }));

        if (unitIdNum && tenantsByUnitId[unitIdNum]) {
            setAvailableTenants(tenantsByUnitId[unitIdNum]);
        } else {
            setAvailableTenants([]);
        }
    };

    // Handle tenant selection
    const handleTenantChange = (tenantId: string) => {
        const tenantIdNum = parseInt(tenantId);
        const tenant = availableTenants.find(t => t.id === tenantIdNum);
        if (tenant) {
            setSelectedTenant(tenantIdNum);
            setData('tenant_id', tenant.id);
            setValidationErrors(prev => ({ ...prev, tenant: '' }));
        }
    };

    // Handle date selection - Fixed version
    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            setData('dates', format(date, 'yyyy-MM-dd'));
            setCalendarOpen(false);
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
        if (!selectedCity) {
            setValidationErrors(prev => ({ ...prev, city: 'Please select a city before submitting the form.' }));
            if (cityRef.current) {
                cityRef.current.focus();
                cityRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        // Validate property selection
        if (!selectedProperty) {
            setValidationErrors(prev => ({ ...prev, property: 'Please select a property before submitting the form.' }));
            if (propertyRef.current) {
                propertyRef.current.focus();
                propertyRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        // Validate unit selection
        if (!selectedUnit) {
            setValidationErrors(prev => ({ ...prev, unit: 'Please select a unit before submitting the form.' }));
            if (unitRef.current) {
                unitRef.current.focus();
                unitRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        // Validate tenant selection
        if (!selectedTenant || !data.tenant_id) {
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

        post(route('payment-plans.store'), {
            onSuccess: () => {
                handleCancel();
                onSuccess?.();
            },
        });
    };

    const handleCancel = () => {
        reset();
        setSelectedCity(null);
        setSelectedProperty(null);
        setSelectedUnit(null);
        setSelectedTenant(null);
        setValidationErrors({
            city: '',
            property: '',
            unit: '',
            tenant: ''
        });
        setAvailableProperties([]);
        setAvailableUnits([]);
        setAvailableTenants([]);
        setCalendarOpen(false);
        onOpenChange(false);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
            <DrawerContent size="half" title="Create Payment Plan">
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-auto p-6">
                        <form onSubmit={submit} className="space-y-4">
                            {/* Cascading Dropdowns */}
                            <div className="rounded-lg border-l-4 border-l-purple-500 p-4">
                                <div className="mb-4 flex items-center gap-2">
                                    <Label className="text-base font-semibold">
                                        Location & Tenant Selection *
                                    </Label>
                                </div>
                                
                                <div className="grid grid-cols-1 gap-4">
                                    {/* City Selection */}
                                    <div>
                                        <Label htmlFor="city" className="text-sm font-medium mb-2 block">
                                            City *
                                        </Label>
                                        <Select
                                            onValueChange={handleCityChange}
                                            value={selectedCity?.toString() || ''}
                                        >
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
                                        {validationErrors.city && <p className="mt-1 text-sm text-red-600">{validationErrors.city}</p>}
                                    </div>

                                    {/* Property Selection */}
                                    <div>
                                        <Label htmlFor="property" className="text-sm font-medium mb-2 block">
                                            Property *
                                        </Label>
                                        <Select
                                            onValueChange={handlePropertyChange}
                                            value={selectedProperty?.toString() || ''}
                                            disabled={!selectedCity}
                                        >
                                            <SelectTrigger ref={propertyRef}>
                                                <SelectValue placeholder="Select property" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableProperties.map((property) => (
                                                    <SelectItem key={property.id} value={property.id.toString()}>
                                                        {property.property_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {validationErrors.property && <p className="mt-1 text-sm text-red-600">{validationErrors.property}</p>}
                                    </div>

                                    {/* Unit Selection */}
                                    <div>
                                        <Label htmlFor="unit" className="text-sm font-medium mb-2 block">
                                            Unit *
                                        </Label>
                                        <Select
                                            onValueChange={handleUnitChange}
                                            value={selectedUnit?.toString() || ''}
                                            disabled={!selectedProperty}
                                        >
                                            <SelectTrigger ref={unitRef}>
                                                <SelectValue placeholder="Select unit" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableUnits.map((unit) => (
                                                    <SelectItem key={unit.id} value={unit.id.toString()}>
                                                        {unit.unit_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {validationErrors.unit && <p className="mt-1 text-sm text-red-600">{validationErrors.unit}</p>}
                                    </div>

                                    {/* Tenant Selection */}
                                    <div>
                                        <Label htmlFor="tenant" className="text-sm font-medium mb-2 block">
                                            Tenant *
                                        </Label>
                                        <Select
                                            onValueChange={handleTenantChange}
                                            value={selectedTenant?.toString() || ''}
                                            disabled={!selectedUnit}
                                        >
                                            <SelectTrigger ref={tenantRef}>
                                                <SelectValue placeholder="Select tenant" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableTenants.map((tenant) => (
                                                    <SelectItem key={tenant.id} value={tenant.id.toString()}>
                                                        {tenant.full_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.tenant_id && <p className="mt-1 text-sm text-red-600">{errors.tenant_id}</p>}
                                        {validationErrors.tenant && <p className="mt-1 text-sm text-red-600">{validationErrors.tenant}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Payment Plan Details */}
                            <div className="rounded-lg border-l-4 border-l-emerald-500 p-4">
                                <div className="mb-4">
                                    <Label className="text-base font-semibold">
                                        Payment Plan Details
                                    </Label>
                                </div>
                                
                                {/* Due Date (Dates) - Fixed version */}
                                <div className="mt-4">
                                    <Label htmlFor="dates" className="text-sm font-medium mb-2 block">
                                        Date *
                                    </Label>
                                    <Popover
                                        open={calendarOpen}
                                        onOpenChange={setCalendarOpen}
                                        modal={false}
                                    >
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={`w-full justify-start text-left font-normal ${!data.dates && 'text-muted-foreground'}`}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {data.dates ? format(parse(data.dates, 'yyyy-MM-dd', new Date()), 'PPP') : 'Pick a date'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                            <Calendar
                                                mode="single"
                                                selected={data.dates ? parse(data.dates, 'yyyy-MM-dd', new Date()) : undefined}
                                                onSelect={handleDateSelect}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    {errors.dates && <p className="mt-1 text-sm text-red-600">{errors.dates}</p>}
                                </div>

                                {/* Amount */}
                                <div className="mt-4">
                                    <Label htmlFor="amount" className="text-sm font-medium mb-2 block">
                                        Amount *
                                    </Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.amount || ''}
                                        onChange={(e) => setData('amount', parseFloat(e.target.value) || 0)}
                                        placeholder="0.00"
                                    />
                                    {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
                                </div>

                                {/* Paid */}
                                <div className="mt-4">
                                    <Label htmlFor="paid" className="text-sm font-medium mb-2 block">
                                        Paid
                                    </Label>
                                    <Input
                                        id="paid"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.paid ?? ''}
                                        onChange={(e) => setData('paid', parseFloat(e.target.value) || 0)}
                                        placeholder="0.00"
                                    />
                                    {errors.paid && <p className="mt-1 text-sm text-red-600">{errors.paid}</p>}
                                </div>
                            </div>

                            {/* Notes Section */}
                            <div className="rounded-lg border-l-4 border-l-teal-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="notes" className="text-base font-semibold">
                                        Notes
                                    </Label>
                                </div>
                                <Textarea
                                    id="notes"
                                    value={data.notes || ''}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    rows={3}
                                    placeholder="Enter any additional notes..."
                                    maxLength={1000}
                                />
                                {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {(data.notes || '').length}/1000 characters
                                </p>
                            </div>
                        </form>
                    </div>

                    <DrawerFooter>
                        <div className="flex justify-end gap-2 w-full">
                            <Button type="button" variant="outline" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button type="submit" onClick={submit} disabled={processing}>
                                {processing ? 'Creating...' : 'Create Payment Plan'}
                            </Button>
                        </div>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
