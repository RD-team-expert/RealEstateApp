// resources/js/Pages/Properties/Show.tsx
import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/app-layout';
import { Property } from '@/types/property';
import type { PageProps } from '@/types/property';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props extends PageProps {
    property: Property;
}

export default function Show({ auth, property }: Props) {
    const getStatusBadge = () => {
        if (property.is_expired) {
            return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">Expired</span>;
        }
        if (property.is_expiring_soon) {
            return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">Expiring Soon</span>;
        }
        return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">Active</span>;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Property Details</h2>}
        >
            <Head title="Property Details" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">
                                    {property.property_name}
                                </CardTitle>
                                <div className="flex gap-2">
                                    <Link href={route('properties-info.edit', property.id)}>
                                        <Button>Edit</Button>
                                    </Link>
                                    <Link href={route('properties-info.index')}>
                                        <Button variant="outline">Back to List</Button>
                                    </Link>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Property Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Property Information</h3>
                                    <div>
                                        <p className="text-sm text-gray-600">Property Name</p>
                                        <p className="font-medium">{property.property_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Insurance Company</p>
                                        <p className="font-medium">{property.insurance_company_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Amount</p>
                                        <p className="font-medium">{property.formatted_amount}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Policy Number</p>
                                        <p className="font-medium">{property.policy_number}</p>
                                    </div>
                                </div>

                                {/* Insurance Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Insurance Information</h3>
                                    <div>
                                        <p className="text-sm text-gray-600">Effective Date</p>
                                        <p className="font-medium">
                                            {property.effective_date}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Expiration Date</p>
                                        <p className="font-medium">
                                            {property.expiration_date}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Days Left</p>
                                        <p className="font-medium">{property.days_left}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Status</p>
                                        <div className="mt-1">{getStatusBadge()}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t">
                                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                                    <div>
                                        <p>Created: {new Date(property.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p>Updated: {new Date(property.updated_at).toLocaleDateString()}</p>
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
