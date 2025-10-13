import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup } from '@/components/ui/radioGroup';
import { Tenant } from '@/types/tenant';
import { City } from '@/types/City';
import { PropertyInfoWithoutInsurance } from '@/types/PropertyInfoWithoutInsurance';
import { useForm } from '@inertiajs/react';
import React, { useState, useRef, useEffect } from 'react';

interface Props {
    tenant: Tenant;
    cities: City[];
    properties: PropertyInfoWithoutInsurance[];
    unitsByProperty: Record<string, Array<{id: number; unit_name: string}>>;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function TenantEditDrawer({ 
    tenant,
    cities, 
    properties, 
    unitsByProperty, 
    open, 
    onOpenChange, 
    onSuccess 
}: Props) {
    const propertyNameRef = useRef<HTMLButtonElement>(null);
    const unitNumberRef = useRef<HTMLButtonElement>(null);
    const [validationError, setValidationError] = useState<string>('');
    const [unitValidationError, setUnitValidationError] = useState<string>('');
    const [availableUnits, setAvailableUnits] = useState<Array<{id: number; unit_name: string}>>([]);
    const [availableProperties, setAvailableProperties] = useState<PropertyInfoWithoutInsurance[]>([]);
    const [selectedPropertyName, setSelectedPropertyName] = useState<string>('');

    const { data, setData, put, processing, errors } = useForm({
        unit_id: tenant.unit_id?.toString() ?? '',
        first_name: tenant.first_name ?? '',
        last_name: tenant.last_name ?? '',
        street_address_line: tenant.street_address_line ?? '',
        login_email: tenant.login_email ?? '',
        alternate_email: tenant.alternate_email ?? '',
        mobile: tenant.mobile ?? '',
        emergency_phone: tenant.emergency_phone ?? '',
        cash_or_check: tenant.cash_or_check ?? '',
        has_insurance: tenant.has_insurance ?? '',
        sensitive_communication: tenant.sensitive_communication ?? '',
        has_assistance: tenant.has_assistance ?? '',
        assistance_amount: tenant.assistance_amount?.toString() ?? '',
        assistance_company: tenant.assistance_company ?? '',
    });

    // Find the city ID for the tenant's property
    const getCurrentCityId = () => {
        if (!tenant.property_name) return '';
        const property = properties.find(p => p.property_name === tenant.property_name);
        return property?.city_id?.toString() ?? '';
    };

    const [selectedCityId, setSelectedCityId] = useState<string>(getCurrentCityId());

    // Initialize available properties and units based on tenant data
    useEffect(() => {
        if (selectedCityId) {
            const filteredProperties = properties.filter(
                property => property.city_id?.toString() === selectedCityId
            );
            setAvailableProperties(filteredProperties);
        }

        if (tenant.property_name) {
            setSelectedPropertyName(tenant.property_name);
            if (unitsByProperty[tenant.property_name]) {
                setAvailableUnits(unitsByProperty[tenant.property_name]);
            }
        }
    }, [selectedCityId, tenant.property_name, properties, unitsByProperty]);

    // Filter properties based on selected city
    const handleCityChange = (cityId: string) => {
        setSelectedCityId(cityId);
        setSelectedPropertyName('');
        setData('unit_id', '');
        setValidationError('');
        setUnitValidationError('');

        if (cityId) {
            const filteredProperties = properties.filter(
                property => property.city_id?.toString() === cityId
            );
            setAvailableProperties(filteredProperties);
        } else {
            setAvailableProperties([]);
        }
        setAvailableUnits([]);
    };

    const handlePropertyChange = (propertyName: string) => {
        setSelectedPropertyName(propertyName);
        setData('unit_id', '');
        setValidationError('');
        setUnitValidationError('');

        if (propertyName && unitsByProperty && unitsByProperty[propertyName]) {
            setAvailableUnits(unitsByProperty[propertyName]);
        } else {
            setAvailableUnits([]);
        }
    };

    const handleUnitChange = (unitId: string) => {
        setData('unit_id', unitId);
        setUnitValidationError('');
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Clear any previous validation errors
        setValidationError('');
        setUnitValidationError('');
        
        let hasValidationErrors = false;
        
        // Validate property is selected
        if (!selectedPropertyName || selectedPropertyName.trim() === '') {
            setValidationError('Please select a property before submitting the form.');
            if (propertyNameRef.current) {
                propertyNameRef.current.focus();
                propertyNameRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        // Validate unit_id is not empty
        if (!data.unit_id || data.unit_id.trim() === '') {
            setUnitValidationError('Please select a unit before submitting the form.');
            if (unitNumberRef.current) {
                unitNumberRef.current.focus();
                unitNumberRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        if (hasValidationErrors) {
            return;
        }
        
        put(route('tenants.update', tenant.id), {
            onSuccess: () => {
                setValidationError('');
                setUnitValidationError('');
                onOpenChange(false);
                onSuccess?.();
            },
        });
    };

    const handleCancel = () => {
        // Reset form to original tenant data
        setData({
            unit_id: tenant.unit_id?.toString() ?? '',
            first_name: tenant.first_name ?? '',
            last_name: tenant.last_name ?? '',
            street_address_line: tenant.street_address_line ?? '',
            login_email: tenant.login_email ?? '',
            alternate_email: tenant.alternate_email ?? '',
            mobile: tenant.mobile ?? '',
            emergency_phone: tenant.emergency_phone ?? '',
            cash_or_check: tenant.cash_or_check ?? '',
            has_insurance: tenant.has_insurance ?? '',
            sensitive_communication: tenant.sensitive_communication ?? '',
            has_assistance: tenant.has_assistance ?? '',
            assistance_amount: tenant.assistance_amount?.toString() ?? '',
            assistance_company: tenant.assistance_company ?? '',
        });
        setValidationError('');
        setUnitValidationError('');
        setSelectedCityId(getCurrentCityId());
        setSelectedPropertyName(tenant.property_name ?? '');
        onOpenChange(false);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
            <DrawerContent size="half" title={`Edit ${tenant.first_name} ${tenant.last_name}`}>
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-auto p-6">
                        <form onSubmit={submit} className="space-y-4">
                            {/* City Selection */}
                            <div className="rounded-lg border-l-4 border-l-blue-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="city_id" className="text-base font-semibold">
                                        City *
                                    </Label>
                                </div>
                                <Select onValueChange={handleCityChange} value={selectedCityId}>
                                    <SelectTrigger>
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
                            </div>

                            {/* Property Information */}
                            <div className="rounded-lg border-l-4 border-l-green-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="property_name" className="text-base font-semibold">
                                        Property Name *
                                    </Label>
                                </div>
                                <Select 
                                    onValueChange={handlePropertyChange} 
                                    value={selectedPropertyName}
                                    disabled={!selectedCityId}
                                >
                                    <SelectTrigger ref={propertyNameRef}>
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
                                
                                {validationError && <p className="mt-1 text-sm text-red-600">{validationError}</p>}
                            </div>

                            {/* Unit Selection */}
                            <div className="rounded-lg border-l-4 border-l-purple-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="unit_id" className="text-base font-semibold">
                                        Unit *
                                    </Label>
                                </div>
                                <Select
                                    onValueChange={handleUnitChange}
                                    value={data.unit_id}
                                    disabled={!selectedPropertyName}
                                >
                                    <SelectTrigger ref={unitNumberRef}>
                                        <SelectValue placeholder="Select unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableUnits?.map((unit) => (
                                            <SelectItem key={unit.id} value={unit.id.toString()}>
                                                {unit.unit_name}
                                            </SelectItem>
                                        )) || []}
                                    </SelectContent>
                                </Select>
                                {errors.unit_id && <p className="mt-1 text-sm text-red-600">{errors.unit_id}</p>}
                                {unitValidationError && <p className="mt-1 text-sm text-red-600">{unitValidationError}</p>}
                            </div>

                            {/* Personal Information */}
                            <div className="rounded-lg border-l-4 border-l-orange-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="first_name" className="text-base font-semibold">
                                        First Name *
                                    </Label>
                                </div>
                                <Input
                                    id="first_name"
                                    value={data.first_name}
                                    onChange={(e) => setData('first_name', e.target.value)}
                                    placeholder="Enter first name"
                                />
                                {errors.first_name && <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-emerald-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="last_name" className="text-base font-semibold">
                                        Last Name *
                                    </Label>
                                </div>
                                <Input
                                    id="last_name"
                                    value={data.last_name}
                                    onChange={(e) => setData('last_name', e.target.value)}
                                    placeholder="Enter last name"
                                />
                                {errors.last_name && <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>}
                            </div>

                            {/* Street Address */}
                            <div className="rounded-lg border-l-4 border-l-slate-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="street_address_line" className="text-base font-semibold">
                                        Street Address
                                    </Label>
                                </div>
                                <Input
                                    id="street_address_line"
                                    value={data.street_address_line}
                                    onChange={(e) => setData('street_address_line', e.target.value)}
                                    placeholder="Enter street address"
                                />
                                {errors.street_address_line && <p className="mt-1 text-sm text-red-600">{errors.street_address_line}</p>}
                            </div>

                            {/* Contact Information */}
                            <div className="rounded-lg border-l-4 border-l-teal-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="login_email" className="text-base font-semibold">
                                        Login Email
                                    </Label>
                                </div>
                                <Input
                                    id="login_email"
                                    type="email"
                                    value={data.login_email}
                                    onChange={(e) => setData('login_email', e.target.value)}
                                    placeholder="Enter login email address"
                                />
                                {errors.login_email && <p className="mt-1 text-sm text-red-600">{errors.login_email}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-sky-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="alternate_email" className="text-base font-semibold">
                                        Alternate Email
                                    </Label>
                                </div>
                                <Input
                                    id="alternate_email"
                                    type="email"
                                    value={data.alternate_email}
                                    onChange={(e) => setData('alternate_email', e.target.value)}
                                    placeholder="Enter alternate email address"
                                />
                                {errors.alternate_email && <p className="mt-1 text-sm text-red-600">{errors.alternate_email}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-indigo-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="mobile" className="text-base font-semibold">
                                        Mobile Phone
                                    </Label>
                                </div>
                                <Input
                                    id="mobile"
                                    value={data.mobile}
                                    onChange={(e) => setData('mobile', e.target.value)}
                                    placeholder="Enter mobile phone number"
                                />
                                {errors.mobile && <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-pink-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="emergency_phone" className="text-base font-semibold">
                                        Emergency Phone
                                    </Label>
                                </div>
                                <Input
                                    id="emergency_phone"
                                    value={data.emergency_phone}
                                    onChange={(e) => setData('emergency_phone', e.target.value)}
                                    placeholder="Enter emergency phone number"
                                />
                                {errors.emergency_phone && <p className="mt-1 text-sm text-red-600">{errors.emergency_phone}</p>}
                            </div>

                            {/* Payment Method */}
                            <div className="rounded-lg border-l-4 border-l-red-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="cash_or_check" className="text-base font-semibold">
                                        Payment Method
                                    </Label>
                                </div>
                                <RadioGroup
                                    value={data.cash_or_check}
                                    onValueChange={(value) => setData('cash_or_check', value)}
                                    name="cash_or_check"
                                    options={[
                                        { value: 'Cash', label: 'Cash' },
                                        { value: 'Check', label: 'Check' }
                                    ]}
                                />
                                {errors.cash_or_check && <p className="mt-1 text-sm text-red-600">{errors.cash_or_check}</p>}
                            </div>

                            {/* Has Insurance */}
                            <div className="rounded-lg border-l-4 border-l-yellow-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="has_insurance" className="text-base font-semibold">
                                        Has Insurance
                                    </Label>
                                </div>
                                <RadioGroup
                                    value={data.has_insurance}
                                    onValueChange={(value) => setData('has_insurance', value)}
                                    name="has_insurance"
                                    options={[
                                        { value: 'Yes', label: 'Yes' },
                                        { value: 'No', label: 'No' }
                                    ]}
                                />
                                {errors.has_insurance && <p className="mt-1 text-sm text-red-600">{errors.has_insurance}</p>}
                            </div>

                            {/* Sensitive Communication */}
                            <div className="rounded-lg border-l-4 border-l-cyan-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="sensitive_communication" className="text-base font-semibold">
                                        Sensitive Communication
                                    </Label>
                                </div>
                                <RadioGroup
                                    value={data.sensitive_communication}
                                    onValueChange={(value) => setData('sensitive_communication', value)}
                                    name="sensitive_communication"
                                    options={[
                                        { value: 'Yes', label: 'Yes' },
                                        { value: 'No', label: 'No' }
                                    ]}
                                />
                                {errors.sensitive_communication && <p className="mt-1 text-sm text-red-600">{errors.sensitive_communication}</p>}
                            </div>

                            {/* Has Assistance */}
                            <div className="rounded-lg border-l-4 border-l-violet-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="has_assistance" className="text-base font-semibold">
                                        Has Assistance
                                    </Label>
                                </div>
                                <RadioGroup
                                    value={data.has_assistance}
                                    onValueChange={(value) => setData('has_assistance', value)}
                                    name="has_assistance"
                                    options={[
                                        { value: 'Yes', label: 'Yes' },
                                        { value: 'No', label: 'No' }
                                    ]}
                                />
                                {errors.has_assistance && <p className="mt-1 text-sm text-red-600">{errors.has_assistance}</p>}
                            </div>

                            {/* Assistance Details - Show only if has_assistance is 'Yes' */}
                            {data.has_assistance === 'Yes' && (
                                <>
                                    <div className="rounded-lg border-l-4 border-l-rose-500 p-4">
                                        <div className="mb-2">
                                            <Label htmlFor="assistance_amount" className="text-base font-semibold">
                                                Assistance Amount
                                            </Label>
                                        </div>
                                        <Input
                                            id="assistance_amount"
                                            type="number"
                                            step="0.01"
                                            value={data.assistance_amount}
                                            onChange={(e) => setData('assistance_amount', e.target.value)}
                                            placeholder="Enter assistance amount"
                                        />
                                        {errors.assistance_amount && <p className="mt-1 text-sm text-red-600">{errors.assistance_amount}</p>}
                                    </div>

                                    <div className="rounded-lg border-l-4 border-l-amber-500 p-4">
                                        <div className="mb-2">
                                            <Label htmlFor="assistance_company" className="text-base font-semibold">
                                                Assistance Company
                                            </Label>
                                        </div>
                                        <Input
                                            id="assistance_company"
                                            value={data.assistance_company}
                                            onChange={(e) => setData('assistance_company', e.target.value)}
                                            placeholder="Enter assistance company name"
                                        />
                                        {errors.assistance_company && <p className="mt-1 text-sm text-red-600">{errors.assistance_company}</p>}
                                    </div>
                                </>
                            )}
                        </form>
                    </div>

                    <DrawerFooter>
                        <div className="flex gap-2">
                            <Button 
                                onClick={submit} 
                                disabled={processing}
                                className="flex-1"
                            >
                                {processing ? 'Updating...' : 'Update Tenant'}
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={handleCancel}
                                disabled={processing}
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
