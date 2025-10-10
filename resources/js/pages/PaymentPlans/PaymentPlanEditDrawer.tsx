import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { City } from '@/types/City';
import { PropertyInfoWithoutInsurance } from '@/types/PropertyInfoWithoutInsurance';
import { useForm } from '@inertiajs/react';
import { format, parse, isValid } from 'date-fns';
import { CalendarIcon, AlertCircle } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';

interface TenantData {
    id: number;
    full_name: string;
    tenant_id: number;
}

interface PaymentPlan {
    id: number;
    tenant_id: number | null;
    tenant: string;
    unit: string;
    property: string;
    city_name: string | null;
    amount: number;
    paid: number;
    left_to_pay: number;
    status: string;
    dates: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
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
    allUnits: Array<{ id: number; unit_name: string; city_name: string; property_name: string }>;
    tenantsData: TenantData[];
    paymentPlan: PaymentPlan;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function PaymentPlanEditDrawer({ 
    cities,
    properties,
    propertiesByCityId,
    unitsByPropertyId,
    tenantsByUnitId,
    allUnits,
    tenantsData,
    paymentPlan, 
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
    const [originalPaidAmount] = useState(paymentPlan.paid);
    
    // Refs for focusing on validation errors
    const cityRef = useRef<HTMLButtonElement>(null);
    const propertyRef = useRef<HTMLButtonElement>(null);
    const unitRef = useRef<HTMLButtonElement>(null);
    const tenantRef = useRef<HTMLButtonElement>(null);

    const { data, setData, put, processing, errors, reset } = useForm<PaymentPlanFormData>({
        tenant_id: paymentPlan.tenant_id,
        amount: paymentPlan.amount,
        dates: paymentPlan.dates,
        paid: paymentPlan.paid,
        notes: paymentPlan.notes || ''
    });

    // Helper function to safely parse and validate dates
    const parseDate = (dateString: string): Date | null => {
        if (!dateString || dateString.trim() === '') return null;
        
        try {
            const parsedDate = parse(dateString, 'yyyy-MM-dd', new Date());
            return isValid(parsedDate) ? parsedDate : null;
        } catch (error) {
            console.warn('Failed to parse date:', dateString, error);
            return null;
        }
    };

    // Helper function to format date for display
    const formatDateForDisplay = (dateString: string): string => {
        const parsedDate = parseDate(dateString);
        return parsedDate ? format(parsedDate, 'PPP') : 'Pick a date';
    };

    // Initialize form data based on existing paymentPlan data
    useEffect(() => {
        if (paymentPlan && allUnits) {
            // Find the unit info from allUnits using unit name
            const unitInfo = allUnits.find(unit => unit.unit_name === paymentPlan.unit);
            
            if (unitInfo) {
                // Find the corresponding city and property by their names
                const selectedCityObj = cities.find(c => c.city === paymentPlan.city_name);
                const selectedPropertyObj = properties.find(p => p.property_name === paymentPlan.property);
                
                // Set UI state with IDs
                if (selectedCityObj) {
                    setSelectedCity(selectedCityObj.id);
                    // Set available properties for the city
                    if (propertiesByCityId[selectedCityObj.id]) {
                        setAvailableProperties(propertiesByCityId[selectedCityObj.id]);
                    }
                }
                
                if (selectedPropertyObj) {
                    setSelectedProperty(selectedPropertyObj.id);
                    // Set available units for the property
                    if (unitsByPropertyId[selectedPropertyObj.id]) {
                        setAvailableUnits(unitsByPropertyId[selectedPropertyObj.id]);
                    }
                }
                
                setSelectedUnit(unitInfo.id);
                // Set available tenants for the unit
                if (tenantsByUnitId[unitInfo.id]) {
                    setAvailableTenants(tenantsByUnitId[unitInfo.id]);
                }
                
                // Find tenant by name and set ID
                const tenantObj = tenantsData.find(t => t.full_name === paymentPlan.tenant);
                if (tenantObj) {
                    setSelectedTenant(tenantObj.id);
                    setData('tenant_id', tenantObj.id);
                }
            }
        }
    }, [paymentPlan, allUnits, cities, properties, propertiesByCityId, unitsByPropertyId, tenantsByUnitId, tenantsData]);

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

        put(route('payment-plans.update', paymentPlan.id), {
            onSuccess: () => {
                handleCancel();
                onSuccess?.();
            },
        });
    };

    const handleCancel = () => {
        // Reset to original values
        setData({
            tenant_id: paymentPlan.tenant_id,
            amount: paymentPlan.amount,
            dates: paymentPlan.dates,
            paid: paymentPlan.paid,
            notes: paymentPlan.notes || ''
        });
        
        // Reset cascading dropdown selections
        setSelectedCity(null);
        setSelectedProperty(null);
        setSelectedUnit(null);
        setSelectedTenant(null);
        setAvailableProperties([]);
        setAvailableUnits([]);
        setAvailableTenants([]);
        setValidationErrors({
            city: '',
            property: '',
            unit: '',
            tenant: ''
        });
        setCalendarOpen(false);
        onOpenChange(false);
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value) || 0;
        setData('amount', value);
        
        // Auto-adjust paid amount if it exceeds the new total
        if (data.paid > value) {
            setData('paid', value);
        }
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
            <DrawerContent size="half" title="Edit Payment Plan">
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-auto p-6">
                        <form onSubmit={submit} className="space-y-4">
                            {/* Original Payment Info Display */}
                            <div className="rounded-lg border border-muted bg-muted/20 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium text-muted-foreground">Original Payment Plan</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium">Tenant:</span> {paymentPlan.tenant}
                                    </div>
                                    <div>
                                        <span className="font-medium">Property:</span> {paymentPlan.property}
                                    </div>
                                    <div>
                                        <span className="font-medium">Unit:</span> {paymentPlan.unit}
                                    </div>
                                    <div>
                                        <span className="font-medium">City:</span> {paymentPlan.city_name}
                                    </div>
                                </div>
                            </div>

                            {/* City Selection */}
                            <div className="rounded-lg border-l-4 border-l-blue-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="city" className="text-base font-semibold">
                                        City *
                                    </Label>
                                </div>
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
                            <div className="rounded-lg border-l-4 border-l-green-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="property" className="text-base font-semibold">
                                        Property *
                                    </Label>
                                </div>
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
                            <div className="rounded-lg border-l-4 border-l-purple-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="unit" className="text-base font-semibold">
                                        Unit *
                                    </Label>
                                </div>
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
                            <div className="rounded-lg border-l-4 border-l-orange-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="tenant" className="text-base font-semibold">
                                        Tenant *
                                    </Label>
                                </div>
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

                            {/* Date Selection - Fixed version with error handling */}
                            <div className="rounded-lg border-l-4 border-l-red-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="dates" className="text-base font-semibold">
                                        Payment Date *
                                    </Label>
                                </div>
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
                                            {formatDateForDisplay(data.dates)}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={parseDate(data.dates) || undefined}
                                            onSelect={handleDateSelect}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.dates && <p className="mt-1 text-sm text-red-600">{errors.dates}</p>}
                            </div>

                            {/* Amount */}
                            <div className="rounded-lg border-l-4 border-l-emerald-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="amount" className="text-base font-semibold">
                                        Total Amount *
                                    </Label>
                                </div>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    min={originalPaidAmount}
                                    value={data.amount || ''}
                                    onChange={handleAmountChange}
                                    placeholder="0.00"
                                />
                                {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Minimum amount: ${Number(originalPaidAmount || 0).toFixed(2)} (already paid)
                                </p>
                            </div>

                            {/* Paid */}
                            <div className="rounded-lg border-l-4 border-l-teal-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="paid" className="text-base font-semibold">
                                        Paid Amount
                                    </Label>
                                </div>
                                <Input
                                    id="paid"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max={data.amount || undefined}
                                    value={data.paid || ''}
                                    onChange={(e) => {
                                        const value = parseFloat(e.target.value) || 0;
                                        // Ensure paid amount doesn't exceed total amount
                                        const maxPaid = Math.min(value, data.amount || 0);
                                        setData('paid', maxPaid);
                                    }}
                                    placeholder="0.00"
                                />
                                {errors.paid && <p className="mt-1 text-sm text-red-600">{errors.paid}</p>}
                                {data.amount > 0 && (
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Remaining: ${((data.amount || 0) - (data.paid || 0)).toFixed(2)}
                                    </p>
                                )}
                            </div>

                            {/* Notes Section */}
                            <div className="rounded-lg border-l-4 border-l-slate-500 p-4">
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
                        <div className="flex gap-2 w-full">
                            <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
                                Cancel
                            </Button>
                            <Button type="submit" onClick={submit} disabled={processing} className="flex-1">
                                {processing ? 'Updating...' : 'Update Payment Plan'}
                            </Button>
                        </div>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
