import React from 'react';
import { type BreadcrumbItem } from '@/types';import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/app-layout';
import { MoveIn } from '@/types/move-in';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePermissions } from '@/hooks/usePermissions';
interface Props {
    moveIn: MoveIn;
}

export default function Show({ moveIn }: Props) {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

    const getYesNoBadge = (value: 'Yes' | 'No' | null) => {
        if (value === null) return <Badge variant="outline">N/A</Badge>;
        return (
            <Badge variant={value === 'Yes' ? 'default' : 'secondary'}>
                {value}
            </Badge>
        );
    };

    const formatDate = (date: string | null) => {
        if (!date) return 'Not Set';
        return new Date(date).toLocaleDateString();
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'MoveIn',
            href: '/move-in',
        },
        {
            title: 'Show',
            href: '/move-in/{move_in}',
        },
    ];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Move-In Details #${moveIn.id}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">Move-In Record Details</CardTitle>
                                <div className="flex gap-2">
                                    {hasAllPermissions(['move-in.edit','move-in.update']) && (
                                    <Link href={route('move-in.edit', moveIn.id)}>
                                        <Button>Edit Record</Button>
                                    </Link>)}
                                    <Link href={route('move-in.index')}>
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
                                        <p className="text-sm text-muted-foreground">Unit Name</p>
                                        <p className="font-medium">{moveIn.unit_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Signed Lease</p>
                                        <div className="mt-1">{getYesNoBadge(moveIn.signed_lease)}</div>
                                    </div>
                                </div>

                                {/* Payment & Financial Status */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Payment & Financial Status</h3>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Paid Security Deposit & First Month Rent</p>
                                        <div className="mt-1">{getYesNoBadge(moveIn.paid_security_deposit_first_month_rent)}</div>
                                    </div>
                                </div>

                                {/* Process Status */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Process Status</h3>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Handled Keys</p>
                                        <div className="mt-1">{getYesNoBadge(moveIn.handled_keys)}</div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Filled Move-In Form</p>
                                        <div className="mt-1">{getYesNoBadge(moveIn.filled_move_in_form)}</div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Submitted Insurance</p>
                                        <div className="mt-1">{getYesNoBadge(moveIn.submitted_insurance)}</div>
                                    </div>
                                </div>

                                {/* Form Processing */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Form Processing</h3>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Move-In Form Sent Date</p>
                                        <p className="font-medium">{formatDate(moveIn.move_in_form_sent_date)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Date of Move-In Form Filled</p>
                                        <p className="font-medium">{formatDate(moveIn.date_of_move_in_form_filled)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Important Dates Section */}
                            <div className="mt-6 space-y-4">
                                <h3 className="text-lg font-semibold">Important Dates</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-primary/20 p-4 rounded-lg">
                                        <p className="text-sm text-primary">Lease Signing Date</p>
                                        <p className="text-lg font-semibold text-primary">
                                            {formatDate(moveIn.lease_signing_date)}
                                        </p>
                                    </div>
                                    <div className="bg-chart-1/20 p-4 rounded-lg">
                                        <p className="text-sm text-chart-1">Move-In Date</p>
                                        <p className="text-lg font-semibold text-chart-1">
                                            {formatDate(moveIn.move_in_date)}
                                        </p>
                                    </div>
                                    <div className="bg-secondary/20 p-4 rounded-lg">
                                        <p className="text-sm text-secondary-foreground">Scheduled Paid Time</p>
                                        <p className="text-lg font-semibold text-secondary-foreground">
                                            {formatDate(moveIn.scheduled_paid_time)}
                                        </p>
                                    </div>
                                    <div className="bg-chart-3/20 p-4 rounded-lg">
                                        <p className="text-sm text-chart-3">Insurance Expiration</p>
                                        <p className="text-lg font-semibold text-chart-3">
                                            {formatDate(moveIn.date_of_insurance_expiration)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-border">
                                <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                                    <div>
                                        <p>Created: {new Date(moveIn.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p>Updated: {new Date(moveIn.updated_at).toLocaleDateString()}</p>
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
