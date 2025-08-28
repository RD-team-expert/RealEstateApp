import React from 'react';
import { type BreadcrumbItem } from '@/types';import { Head, Link, usePage } from '@inertiajs/react';
import { NoticeAndEviction } from '@/types/NoticeAndEviction';
import AppLayout from '@/Layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePermissions } from '@/hooks/usePermissions';

const Show = () => {
    const { record } = usePage().props as { record: NoticeAndEviction };

    const formatDate = (date: string | null) => {
        if (!date) return 'Not Set';
        return new Date(date).toLocaleDateString();
    };

    const getStatusBadge = (status: string | null) => {
        if (!status) return <Badge variant="outline">N/A</Badge>;

        switch (status.toLowerCase()) {
            case 'active':
                return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">{status}</Badge>;
            case 'pending':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">{status}</Badge>;
            case 'closed':
                return <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">{status}</Badge>;
            default:
                return <Badge variant="default">{status}</Badge>;
        }
    };

    const getYesNoBadge = (value: string | null) => {
        if (!value || value === '-') return <Badge variant="outline">N/A</Badge>;
        return (
            <Badge variant={value === 'Yes' ? 'default' : 'secondary'} className={
                value === 'Yes'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
            }>
                {value}
            </Badge>
        );
    };


    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();


    return (
        <AppLayout >
            <Head title={`Notice & Eviction #${record.id}`} />

            <div className="py-12 bg-background text-foreground transition-colors min-h-screen">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <Card className="bg-card text-card-foreground shadow-lg">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">
                                    Notice & Eviction Details - #{record.id}
                                </CardTitle>
                                <div className="flex gap-2">
                                    {hasAllPermissions(['notice-and-evictions.edit','notice-and-evictions.update']) && (
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
                                    <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Unit Name</p>
                                        <p className="font-medium text-foreground">{record.unit_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Tenants Name</p>
                                        <p className="font-medium text-foreground">{record.tenants_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Status</p>
                                        <div className="mt-1">
                                            {getStatusBadge(record.status)}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Date</p>
                                        <p className="font-medium text-foreground">{formatDate(record.date)}</p>
                                    </div>
                                </div>

                                {/* Notice Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-foreground">Notice Information</h3>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Type of Notice</p>
                                        <p className="font-medium text-foreground">{record.type_of_notice || <span className="text-muted-foreground">N/A</span>}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Have An Exception?</p>
                                        <div className="mt-1">
                                            {getYesNoBadge(record.have_an_exception)}
                                        </div>
                                    </div>
                                    {record.note && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Note</p>
                                            <Card className="bg-muted/50 mt-1">
                                                <CardContent className="p-3">
                                                    <p className="text-foreground">{record.note}</p>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    )}
                                </div>

                                {/* Eviction Process */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-foreground">Eviction Process</h3>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Evictions</p>
                                        <p className="font-medium text-foreground">{record.evictions || <span className="text-muted-foreground">N/A</span>}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Sent to Attorney</p>
                                        <div className="mt-1">
                                            {getYesNoBadge(record.sent_to_atorney)}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Hearing Dates</p>
                                        <p className="font-medium text-foreground">{record.hearing_dates || <span className="text-muted-foreground">N/A</span>}</p>
                                    </div>
                                </div>

                                {/* Resolution Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-foreground">Resolution Information</h3>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Evected/Payment Plan</p>
                                        <p className="font-medium text-foreground">{record.evected_or_payment_plan || <span className="text-muted-foreground">N/A</span>}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">If Left</p>
                                        <div className="mt-1">
                                            {getYesNoBadge(record.if_left)}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Writ Date</p>
                                        <p className="font-medium text-foreground">{formatDate(record.writ_date)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-border">
                                <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
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
