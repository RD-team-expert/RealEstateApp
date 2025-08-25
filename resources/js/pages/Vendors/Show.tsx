// resources/js/Pages/Vendors/Show.tsx

import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/app-layout';
import { VendorInfo } from '@/types/vendor';
import { PageProps } from '@/types/vendor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePermissions } from '@/hooks/usePermissions';
interface Props extends PageProps {
    vendor: VendorInfo;
}

export default function Show({ auth, vendor }: Props) {
    const { hasPermission, hasAnyPermission, hasAllPermissions} = usePermissions();
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Vendor Details</h2>}
        >
            <Head title="Vendor Details" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">
                                    {vendor.vendor_name} - {vendor.city}
                                </CardTitle>
                                <div className="flex gap-2">
                                    {hasAllPermissions(['vendors.edit','vendors.update'])&&(
                                    <Link href={route('vendors.edit', vendor.id)}>
                                        <Button>Edit</Button>
                                    </Link>)}
                                    <Link href={route('vendors.index')}>
                                        <Button variant="outline">Back to List</Button>
                                    </Link>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Basic Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Basic Information</h3>
                                    <div>
                                        <p className="text-sm text-gray-600">City</p>
                                        <p className="font-medium">{vendor.city}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Vendor Name</p>
                                        <p className="font-medium">{vendor.vendor_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Service Type</p>
                                        <p className="font-medium">{vendor.service_type}</p>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Contact Information</h3>
                                    <div>
                                        <p className="text-sm text-gray-600">Number</p>
                                        <p className="font-medium">
                                            {vendor.number ? (
                                                <a href={`tel:${vendor.number}`} className="text-blue-600 hover:text-blue-900">
                                                    {vendor.number}
                                                </a>
                                            ) : 'Not provided'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Email</p>
                                        <p className="font-medium">
                                            {vendor.email ? (
                                                <a href={`mailto:${vendor.email}`} className="text-blue-600 hover:text-blue-900">
                                                    {vendor.email}
                                                </a>
                                            ) : 'Not provided'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t">
                                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                                    <div>
                                        <p>Created: {new Date(vendor.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p>Updated: {new Date(vendor.updated_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
