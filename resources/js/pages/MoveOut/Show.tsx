import React from 'react';
import { type BreadcrumbItem } from '@/types';import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/app-layout';
import { MoveOut } from '@/types/move-out';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePermissions } from '@/hooks/usePermissions';
interface Props {
    moveOut: MoveOut;
}

export default function Show({ moveOut }: Props) {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

    const getYesNoBadge = (value: 'Yes' | 'No' | null) => {
        if (value === null) return <Badge variant="outline">N/A</Badge>;
        return (
            <Badge variant={value === 'Yes' ? 'default' : 'secondary'}>
                {value}
            </Badge>
        );
    };

    const getCleaningBadge = (value: 'cleaned' | 'uncleaned' | null) => {
        if (value === null) return <Badge variant="outline">N/A</Badge>;
        return (
            <Badge variant={value === 'cleaned' ? 'default' : 'secondary'}>
                {value}
            </Badge>
        );
    };

    const getFormBadge = (value: 'filled' | 'not filled' | null) => {
        if (value === null) return <Badge variant="outline">N/A</Badge>;
        return (
            <Badge variant={value === 'filled' ? 'default' : 'secondary'}>
                {value}
            </Badge>
        );
    };

    const formatDate = (date: string | null) => {
        if (!date) return 'Not Set';
        return new Date(date).toLocaleDateString();
    };


    return (
        <AppLayout >
            <Head title={`Move-Out Details #${moveOut.id}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">Move-Out Record Details - #{moveOut.id}</CardTitle>
                                <div className="flex gap-2">
                                    {hasAllPermissions(['move-out.edit','move-out.update']) && (
                                    <Link href={route('move-out.edit', moveOut.id)}>
                                        <Button>Edit Record</Button>
                                    </Link>)}
                                    <Link href={route('move-out.index')}>
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
                                        <p className="text-sm text-muted-foreground">Tenant Name</p>
                                        <p className="font-medium">{moveOut.tenants_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Unit Name</p>
                                        <p className="font-medium">{moveOut.units_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Lease Status</p>
                                        <p className="font-medium">{moveOut.lease_status || 'N/A'}</p>
                                    </div>
                                </div>

                                {/* Location & Utilities */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Location & Utilities</h3>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Keys Location</p>
                                        <p className="font-medium">{moveOut.keys_location || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Utilities Under Our Name</p>
                                        <div className="mt-1">{getYesNoBadge(moveOut.utilities_under_our_name)}</div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">List the Unit</p>
                                        <p className="font-medium">{moveOut.list_the_unit || 'N/A'}</p>
                                    </div>
                                </div>

                                {/* Status Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Status Information</h3>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Cleaning Status</p>
                                        <div className="mt-1">{getCleaningBadge(moveOut.cleaning)}</div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Move-Out Form</p>
                                        <div className="mt-1">{getFormBadge(moveOut.move_out_form)}</div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Send Back Security Deposit</p>
                                        <p className="font-medium">{moveOut.send_back_security_deposit || 'N/A'}</p>
                                    </div>
                                </div>

                                {/* Additional Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Additional Information</h3>
                                    {moveOut.walkthrough && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Walkthrough</p>
                                            <p className="font-medium">{moveOut.walkthrough}</p>
                                        </div>
                                    )}
                                    {moveOut.repairs && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Repairs</p>
                                            <p className="font-medium">{moveOut.repairs}</p>
                                        </div>
                                    )}
                                    {moveOut.notes && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Notes</p>
                                            <p className="font-medium">{moveOut.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Important Dates Section */}
                            <div className="mt-6 space-y-4">
                                <h3 className="text-lg font-semibold">Important Dates</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-destructive/20 p-4 rounded-lg">
                                        <p className="text-sm text-destructive">Move-Out Date</p>
                                        <p className="text-lg font-semibold text-destructive">
                                            {formatDate(moveOut.move_out_date)}
                                        </p>
                                    </div>
                                    <div className="bg-primary/20 p-4 rounded-lg">
                                        <p className="text-sm text-primary">Date Lease Ending on Buildium</p>
                                        <p className="text-lg font-semibold text-primary">
                                            {formatDate(moveOut.date_lease_ending_on_buildium)}
                                        </p>
                                    </div>
                                    <div className="bg-chart-1/20 p-4 rounded-lg">
                                        <p className="text-sm text-chart-1">Date Utility Put Under Our Name</p>
                                        <p className="text-lg font-semibold text-chart-1">
                                            {formatDate(moveOut.date_utility_put_under_our_name)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-border">
                                <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                                    <div>
                                        <p>Created: {new Date(moveOut.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p>Updated: {new Date(moveOut.updated_at).toLocaleDateString()}</p>
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
