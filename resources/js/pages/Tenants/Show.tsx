import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/app-layout';
import { Tenant } from '@/types/tenant';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
    tenant: Tenant;
}

export default function Show({ tenant }: Props) {
    return (
        <AppLayout>
            <Head title={`${tenant.first_name} ${tenant.last_name}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">
                                    {tenant.first_name} {tenant.last_name}
                                </CardTitle>
                                <div className="flex gap-2">
                                    <Link href={route('tenants.edit', tenant.id)}>
                                        <Button>Edit</Button>
                                    </Link>
                                    <Link href={route('tenants.index')}>
                                        <Button variant="outline">Back to List</Button>
                                    </Link>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Property Information</h3>
                                    <div>
                                        <p className="text-sm text-gray-600">Property Name</p>
                                        <p className="font-medium">{tenant.property_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Unit Number</p>
                                        <p className="font-medium">{tenant.unit_number}</p>
                                    </div>
                                    {tenant.street_address_line && (
                                        <div>
                                            <p className="text-sm text-gray-600">Street Address</p>
                                            <p className="font-medium">{tenant.street_address_line}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Contact Information</h3>
                                    {tenant.login_email && (
                                        <div>
                                            <p className="text-sm text-gray-600">Login Email</p>
                                            <p className="font-medium">{tenant.login_email}</p>
                                        </div>
                                    )}
                                    {tenant.alternate_email && (
                                        <div>
                                            <p className="text-sm text-gray-600">Alternate Email</p>
                                            <p className="font-medium">{tenant.alternate_email}</p>
                                        </div>
                                    )}
                                    {tenant.mobile && (
                                        <div>
                                            <p className="text-sm text-gray-600">Mobile</p>
                                            <p className="font-medium">{tenant.mobile}</p>
                                        </div>
                                    )}
                                    {tenant.emergency_phone && (
                                        <div>
                                            <p className="text-sm text-gray-600">Emergency Phone</p>
                                            <p className="font-medium">{tenant.emergency_phone}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Preferences</h3>
                                    {tenant.cash_or_check && (
                                        <div>
                                            <p className="text-sm text-gray-600">Payment Method</p>
                                            <p className="font-medium">{tenant.cash_or_check}</p>
                                        </div>
                                    )}
                                    {tenant.has_insurance && (
                                        <div>
                                            <p className="text-sm text-gray-600">Has Insurance</p>
                                            <p className="font-medium">{tenant.has_insurance}</p>
                                        </div>
                                    )}
                                    {tenant.sensitive_communication && (
                                        <div>
                                            <p className="text-sm text-gray-600">Sensitive Communication</p>
                                            <p className="font-medium">{tenant.sensitive_communication}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Assistance Information</h3>
                                    {tenant.has_assistance && (
                                        <div>
                                            <p className="text-sm text-gray-600">Has Assistance</p>
                                            <p className="font-medium">{tenant.has_assistance}</p>
                                        </div>
                                    )}
                                    {tenant.has_assistance === 'Yes' && tenant.assistance_amount && (
                                        <div>
                                            <p className="text-sm text-gray-600">Assistance Amount</p>
                                            <p className="font-medium">${tenant.assistance_amount}</p>
                                        </div>
                                    )}
                                    {tenant.has_assistance === 'Yes' && tenant.assistance_company && (
                                        <div>
                                            <p className="text-sm text-gray-600">Assistance Company</p>
                                            <p className="font-medium">{tenant.assistance_company}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t">
                                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                                    <div>
                                        <p>Created: {new Date(tenant.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p>Updated: {new Date(tenant.updated_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
