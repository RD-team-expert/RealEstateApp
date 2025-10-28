import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { useForm } from '@inertiajs/react';
import React, { useState, useRef } from 'react';
import CityField from './create/CityField';
import VendorNameField from './create/VendorNameField';
import PhoneNumberField from './create/PhoneNumberField';
import EmailField from './create/EmailField';
import ServiceTypeField from './create/ServiceTypeField';

interface Props {
    cities: Array<{ id: number; city: string }>;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function VendorCreateDrawer({ cities, open, onOpenChange, onSuccess }: Props) {
    const cityRef = useRef<HTMLButtonElement>(null);
    const vendorNameRef = useRef<HTMLInputElement>(null);
    const [validationError, setValidationError] = useState<string>('');
    const [vendorNameValidationError, setVendorNameValidationError] = useState<string>('');
    const [, setSelectedCityName] = useState<string>('');

    const { data, setData, post, processing, errors, reset } = useForm({
        city_id: '',
        vendor_name: '',
        number: '',
        email: '',
        service_type: ''
    });

    const handleCityChange = (cityId: string) => {
        setData('city_id', cityId);
        
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
        
        setValidationError('');
        setVendorNameValidationError('');
        
        let hasValidationErrors = false;
        
        if (!data.city_id || data.city_id.trim() === '') {
            setValidationError('Please select a city before submitting the form.');
            if (cityRef.current) {
                cityRef.current.focus();
                cityRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        if (!data.vendor_name || data.vendor_name.trim() === '') {
            setVendorNameValidationError('Please enter a vendor name before submitting the form.');
            if (vendorNameRef.current) {
                vendorNameRef.current.focus();
                vendorNameRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        if (hasValidationErrors) {
            return;
        }
        
        post(route('vendors.store'), {
            onSuccess: () => {
                reset();
                setSelectedCityName('');
                setValidationError('');
                setVendorNameValidationError('');
                onOpenChange(false);
                onSuccess?.();
            },
        });
    };

    const handleCancel = () => {
        reset();
        setSelectedCityName('');
        setValidationError('');
        setVendorNameValidationError('');
        onOpenChange(false);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
            <DrawerContent size="half" title="Create New Vendor">
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-auto p-6">
                        <form onSubmit={submit} className="space-y-4">
                            <CityField
                                cities={cities}
                                value={data.city_id}
                                onChange={handleCityChange}
                                error={errors.city_id}
                                validationError={validationError}
                                ref={cityRef}
                            />

                            <VendorNameField
                                value={data.vendor_name}
                                onChange={handleVendorNameChange}
                                error={errors.vendor_name}
                                validationError={vendorNameValidationError}
                                ref={vendorNameRef}
                            />

                            <PhoneNumberField
                                value={data.number}
                                onChange={(e) => setData('number', e.target.value)}
                                error={errors.number}
                            />

                            <EmailField
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                error={errors.email}
                            />

                            <ServiceTypeField
                                value={data.service_type}
                                onChange={(value) => setData('service_type', value)}
                                error={errors.service_type}
                            />
                        </form>
                    </div>

                    <DrawerFooter className="flex-row justify-end gap-2 border-t bg-muted/50 p-4">
                        <Button type="button" variant="outline" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button type="submit" onClick={submit} disabled={processing}>
                            {processing ? 'Creating...' : 'Create Vendor'}
                        </Button>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
