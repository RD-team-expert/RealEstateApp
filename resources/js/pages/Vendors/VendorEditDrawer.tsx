import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup } from '@/components/ui/radioGroup';
import {  VendorInfo } from '@/types/vendor';
import { useForm } from '@inertiajs/react';
import React, { useState, useRef, useEffect } from 'react';

interface Props {
    vendor: VendorInfo | null;
    cities: Array<{ id: number; city: string }>;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function VendorEditDrawer({ vendor, cities, open, onOpenChange, onSuccess }: Props) {
    const cityRef = useRef<HTMLButtonElement>(null);
    const vendorNameRef = useRef<HTMLInputElement>(null);
    const [validationError, setValidationError] = useState<string>('');
    const [vendorNameValidationError, setVendorNameValidationError] = useState<string>('');
    const [, setSelectedCityName] = useState<string>('');

    const { data, setData, put, processing, errors } = useForm({
        city_id: vendor?.city_id?.toString() || '',
        vendor_name: vendor?.vendor_name || '',
        number: vendor?.number || '',
        email: vendor?.email || '',
        service_type: vendor?.service_type || ''
    });

    // Update form data when vendor prop changes
    useEffect(() => {
        if (vendor) {
            const cityId = vendor.city_id?.toString() || '';
            const cityName = vendor.city?.city || '';
            
            setData({
                city_id: cityId,
                vendor_name: vendor.vendor_name,
                number: vendor.number || '',
                email: vendor.email || '',
                service_type: vendor.service_type || ''
            });
            
            setSelectedCityName(cityName);
        }
    }, [vendor]);

    const handleCityChange = (cityId: string) => {
        setData('city_id', cityId);
        
        // Find and store the city name for display purposes
        const selectedCity = cities.find(city => city.id.toString() === cityId);
        setSelectedCityName(selectedCity ? selectedCity.city : '');
        
        setValidationError('');
    };

    const handleVendorNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('vendor_name', e.target.value);
        setVendorNameValidationError('');
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!vendor) return;
        
        // Clear any previous validation errors
        setValidationError('');
        setVendorNameValidationError('');
        
        let hasValidationErrors = false;
        
        // Validate city_id is not empty
        if (!data.city_id || data.city_id.trim() === '') {
            setValidationError('Please select a city before submitting the form.');
            // Focus on the city field
            if (cityRef.current) {
                cityRef.current.focus();
                cityRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        // Validate vendor_name is not empty
        if (!data.vendor_name || data.vendor_name.trim() === '') {
            setVendorNameValidationError('Please enter a vendor name before submitting the form.');
            // Focus on the vendor name field
            if (vendorNameRef.current) {
                vendorNameRef.current.focus();
                vendorNameRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        if (hasValidationErrors) {
            return;
        }
        
        put(route('vendors.update', vendor.id), {
            onSuccess: () => {
                setValidationError('');
                setVendorNameValidationError('');
                onOpenChange(false);
                onSuccess?.();
            },
        });
    };

    const handleCancel = () => {
        if (vendor) {
            const cityId = vendor.city_id?.toString() || '';
            const cityName = vendor.city?.city || '';
            
            setData({
                city_id: cityId,
                vendor_name: vendor.vendor_name,
                number: vendor.number || '',
                email: vendor.email || '',
                service_type: vendor.service_type || ''
            });
            
            setSelectedCityName(cityName);
        }
        setValidationError('');
        setVendorNameValidationError('');
        onOpenChange(false);
    };

    if (!vendor) return null;

    return (
        <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
            <DrawerContent size="half" title={`Edit Vendor - ${vendor.vendor_name}`}>
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-auto p-6">
                        <form onSubmit={submit} className="space-y-4">
                            {/* City and Vendor Name Information */}
                            <div className="rounded-lg border-l-4 border-l-blue-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="city_id" className="text-base font-semibold">
                                        City *
                                    </Label>
                                </div>
                                <Select onValueChange={handleCityChange} value={data.city_id}>
                                    <SelectTrigger ref={cityRef}>
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
                                {errors.city_id && <p className="mt-1 text-sm text-red-600">{errors.city_id}</p>}
                                {validationError && <p className="mt-1 text-sm text-red-600">{validationError}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-green-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="vendor_name" className="text-base font-semibold">
                                        Vendor Name *
                                    </Label>
                                </div>
                                <Input
                                    ref={vendorNameRef}
                                    id="vendor_name"
                                    value={data.vendor_name}
                                    onChange={handleVendorNameChange}
                                    placeholder="Enter vendor name"
                                />
                                {errors.vendor_name && <p className="mt-1 text-sm text-red-600">{errors.vendor_name}</p>}
                                {vendorNameValidationError && <p className="mt-1 text-sm text-red-600">{vendorNameValidationError}</p>}
                            </div>

                            {/* Contact Information */}
                            <div className="rounded-lg border-l-4 border-l-purple-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="number" className="text-base font-semibold">
                                        Phone Number
                                    </Label>
                                </div>
                                <Input
                                    id="number"
                                    value={data.number}
                                    onChange={(e) => setData('number', e.target.value)}
                                    placeholder="Enter phone number"
                                />
                                {errors.number && <p className="mt-1 text-sm text-red-600">{errors.number}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-orange-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="email" className="text-base font-semibold">
                                        Email Address
                                    </Label>
                                </div>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="vendor@example.com"
                                />
                                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                            </div>

                            {/* Service Type */}
                            <div className="rounded-lg border-l-4 border-l-emerald-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="service_type" className="text-base font-semibold">
                                        Service Type
                                    </Label>
                                </div>
                                <RadioGroup
                                    value={data.service_type}
                                    onValueChange={(value) => setData('service_type', value)}
                                    name="service_type"
                                    className="grid grid-cols-2 gap-4"
                                    options={[
                                        { value: 'Maintenance', label: 'Maintenance' },
                                        { value: 'Appliances', label: 'Appliances' },
                                        { value: 'Pest control', label: 'Pest control' },
                                        { value: 'HVAC Repairs', label: 'HVAC Repairs' },
                                        { value: 'Plumbing', label: 'Plumbing' },
                                        { value: 'Landscaping', label: 'Landscaping' },
                                        { value: 'Lock Smith', label: 'Lock Smith' },
                                        { value: 'Garage door', label: 'Garage door' }
                                    ]}
                                />
                                {errors.service_type && <p className="mt-1 text-sm text-red-600">{errors.service_type}</p>}
                            </div>
                        </form>
                    </div>

                    <DrawerFooter className="flex-row justify-end gap-2 border-t bg-muted/50 p-4">
                        <Button type="button" variant="outline" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button type="submit" onClick={submit} disabled={processing}>
                            {processing ? 'Updating...' : 'Update Vendor'}
                        </Button>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
