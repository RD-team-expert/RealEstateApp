import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { NoticeAndEviction } from '@/types/NoticeAndEviction';
import AppLayout from '@/Layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { usePermissions } from '@/hooks/usePermissions';
const Show = () => {
    const { record } = usePage().props as { record: NoticeAndEviction };

    const formatDate = (date: string | null) => {
        if (!date) return 'Not Set';
        return new Date(date).toLocaleDateString();
    };
const { hasPermission, hasAnyPermission, hasAllPermissions} = usePermissions();
    return (
        <AppLayout>
            <Head title={`Notice & Eviction #${record.id}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">
                                    Notice & Eviction Details - #{record.id}
                                </CardTitle>
                                <div className="flex gap-2">
                                    {hasAllPermissions(['notice-and-evictions.edit','notice-and-evictions.update'])&&(
                                    <Link href={`/notice_and_evictions/${record.id}/edit`}>
                                        <Button>Edit</Button>
                                    </Link>)}
                                    <Link href="/notice_and_evictions">
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
                                        <p className="text-sm text-gray-600">Unit Name</p>
                                        <p className="font-medium">{record.unit_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Tenants Name</p>
                                        <p className="font-medium">{record.tenants_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Status</p>
                                        <p className="font-medium">{record.status || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Date</p>
                                        <p className="font-medium">{formatDate(record.date)}</p>
                                    </div>
                                </div>

                                {/* Notice Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Notice Information</h3>
                                    <div>
                                        <p className="text-sm text-gray-600">Type of Notice</p>
                                        <p className="font-medium">{record.type_of_notice || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Have An Exception?</p>
                                        <p className="font-medium">{record.have_an_exception || 'N/A'}</p>
                                    </div>
                                    {record.note && (
                                        <div>
                                            <p className="text-sm text-gray-600">Note</p>
                                            <p className="font-medium">{record.note}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Eviction Process */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Eviction Process</h3>
                                    <div>
                                        <p className="text-sm text-gray-600">Evictions</p>
                                        <p className="font-medium">{record.evictions || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Sent to Attorney</p>
                                        <p className="font-medium">{record.sent_to_atorney || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Hearing Dates</p>
                                        <p className="font-medium">{record.hearing_dates || 'N/A'}</p>
                                    </div>
                                </div>

                                {/* Resolution Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Resolution Information</h3>
                                    <div>
                                        <p className="text-sm text-gray-600">Evected/Payment Plan</p>
                                        <p className="font-medium">{record.evected_or_payment_plan || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">If Left</p>
                                        <p className="font-medium">{record.if_left || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Writ Date</p>
                                        <p className="font-medium">{formatDate(record.writ_date)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t">
                                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                                    <div>
                                        <p>Created: {new Date(record.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p>Updated: {new Date(record.updated_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
};

export default Show;
