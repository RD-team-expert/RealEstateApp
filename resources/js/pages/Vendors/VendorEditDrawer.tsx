import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { VendorInfo } from '@/types/vendor';
import { useForm } from '@inertiajs/react';
import React, { useState, useRef, useEffect } from 'react';
import CityField from './edit/CityField';
import VendorNameField from './edit/VendorNameField';
import PhoneNumberField from './edit/PhoneNumberField';
import EmailField from './edit/EmailField';
import ServiceTypeField from './edit/ServiceTypeField';

interface Props {
    vendor: VendorInfo | null;
    cities: Array<{ id: number; city: string }>;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function VendorEditDrawer({ vendor, cities, open, onOpenChange, onSuccess }: Props) {
    const cityRef = useRef<HTMLButtonElement>(null!);
    const vendorNameRef = useRef<HTMLInputElement>(null!);
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
                            <CityField
                                cityRef={cityRef}
                                value={data.city_id}
                                cities={cities}
                                onChange={handleCityChange}
                                error={errors.city_id}
                                validationError={validationError}
                            />

                            <VendorNameField
                                vendorNameRef={vendorNameRef}
                                value={data.vendor_name}
                                onChange={handleVendorNameChange}
                                error={errors.vendor_name}
                                validationError={vendorNameValidationError}
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
                            {processing ? 'Updating...' : 'Update Vendor'}
                        </Button>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
