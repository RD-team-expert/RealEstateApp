import React from 'react';
import { type BreadcrumbItem } from '@/types';import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/app-layout';
import { VendorInfo, VendorFormData } from '@/types/vendor';
import { PageProps } from '@/types/vendor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePermissions } from '@/hooks/usePermissions';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EditPageProps extends PageProps {
    vendor: VendorInfo;
    cities: Array<{ id: number; city: string }>;
}

export default function Edit({ auth, vendor, cities }: EditPageProps) {
    const { hasPermission, hasAnyPermission, hasAllPermissions} = usePermissions();
    const { data, setData, put, processing, errors } = useForm<VendorFormData>({
        city: vendor.city,
        vendor_name: vendor.vendor_name,
        number: vendor.number || '',
        email: vendor.email || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('vendors.update', vendor.id));
    };
const breadcrumbs: BreadcrumbItem[] = [
                        {
                            title: 'Vendors',
                            href: '/vendors',
                        },
                        {
                            title: 'Edit',
                            href: '/vendors/{vendor}/edit',
                        },
                    ];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Vendor - ${vendor.vendor_name}`} />
            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">
                                    Edit Vendor - {vendor.vendor_name}
                                </CardTitle>
                                <div className="flex justify-between items-center gap-2">
                                    <Link href={route('vendors.index')}>
                                        <Button variant="outline">Back to List</Button>
                                    </Link>
                                    {hasPermission('cities.index')&&(
                                    <Link href={route('cities.index')}
                                    data={{ bc: JSON.stringify(breadcrumbs) }}>
                                        <Button variant="outline">View Cities</Button>
                                    </Link>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="city">City *</Label>
                                        <Select
                                            onValueChange={(value) => setData('city', value)}
                                            value={data.city}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a city" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {cities.map((city) => (
                                                    <SelectItem key={city.id} value={city.city}>
                                                        {city.city}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.city && (
                                            <p className="text-red-600 text-sm mt-1">{errors.city}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="vendor_name">Vendor Name *</Label>
                                        <Input
                                            id="vendor_name"
                                            value={data.vendor_name}
                                            onChange={e => setData('vendor_name', e.target.value)}
                                            error={errors.vendor_name}
                                        />
                                        {errors.vendor_name && (
                                            <p className="text-red-600 text-sm mt-1">{errors.vendor_name}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="number">Number</Label>
                                        <Input
                                            id="number"
                                            value={data.number}
                                            onChange={e => setData('number', e.target.value)}
                                            placeholder="Phone number"
                                            error={errors.number}
                                        />
                                        {errors.number && (
                                            <p className="text-red-600 text-sm mt-1">{errors.number}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                            placeholder="vendor@example.com"
                                            error={errors.email}
                                        />
                                        {errors.email && (
                                            <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="service_type">Service Type</Label>
                                        <Select
                                            onValueChange={(value) => setData('service_type', value)}
                                            value={data.service_type}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select service type" />
                                            </SelectTrigger>
                                            <SelectContent >
                                                <SelectItem value="Maintenance">Maintenance</SelectItem>
                                                <SelectItem value="Appliances">Appliances</SelectItem>
                                                <SelectItem value="Pest control">Pest control</SelectItem>
                                                <SelectItem value="HVAC Repairs">HVAC Repairs</SelectItem>
                                                <SelectItem value="Plumping">Plumping</SelectItem>
                                                <SelectItem value="Landscaping">Landscaping</SelectItem>
                                                <SelectItem value="Lock Smith">Lock Smith</SelectItem>
                                                <SelectItem value="Garage door">Garage door</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.service_type && (
                                            <p className="text-red-600 text-sm mt-1">{errors.service_type}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Link href={route('vendors.index')}>
                                        <Button type="button" variant="outline">
                                            Cancel
                                        </Button>
                                    </Link>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Updating…' : 'Update Vendor'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
