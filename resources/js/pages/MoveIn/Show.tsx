import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/app-layout';
import { MoveIn } from '@/types/move-in';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Props {
    moveIn: MoveIn;
}

export default function Show({ moveIn }: Props) {
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

    return (
        <AppLayout>
            <Head title={`Move-In Details #${moveIn.id}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">Move-In Record Details</CardTitle>
                                <div className="flex gap-2">
                                    <Link href={route('move-in.edit', moveIn.id)}>
                                        <Button>Edit Record</Button>
                                    </Link>
                                    <Link href={route('move-in.index')}>
                                        <Button variant="outline">Back to List</Button>
                                    </Link>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Basic Information */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Unit Name</p>
                                        <p className="font-medium text-lg">{moveIn.unit_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Signed Lease</p>
                                        {getYesNoBadge(moveIn.signed_lease)}
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Date Information */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Important Dates</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <p className="text-sm text-blue-600">Lease Signing Date</p>
                                        <p className="text-lg font-semibold text-blue-700">
                                            {formatDate(moveIn.lease_signing_date)}
                                        </p>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <p className="text-sm text-green-600">Move-In Date</p>
                                        <p className="text-lg font-semibold text-green-700">
                                            {formatDate(moveIn.move_in_date)}
                                        </p>
                                    </div>
                                    <div className="bg-yellow-50 p-4 rounded-lg">
                                        <p className="text-sm text-yellow-600">Scheduled Paid Time</p>
                                        <p className="text-lg font-semibold text-yellow-700">
                                            {formatDate(moveIn.scheduled_paid_time)}
                                        </p>
                                    </div>
                                    <div className="bg-purple-50 p-4 rounded-lg">
                                        <p className="text-sm text-purple-600">Insurance Expiration</p>
                                        <p className="text-lg font-semibold text-purple-700">
                                            {formatDate(moveIn.date_of_insurance_expiration)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Payment & Financial Status */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Payment & Financial Status</h3>
                                <div className="grid md:grid-cols-1 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Paid Security Deposit & First Month Rent</p>
                                        {getYesNoBadge(moveIn.paid_security_deposit_first_month_rent)}
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Process Status */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Process Status</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Handled Keys</p>
                                        {getYesNoBadge(moveIn.handled_keys)}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Filled Move-In Form</p>
                                        {getYesNoBadge(moveIn.filled_move_in_form)}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Submitted Insurance</p>
                                        {getYesNoBadge(moveIn.submitted_insurance)}
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Form Dates */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Form Processing Dates</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Move-In Form Sent Date</p>
                                        <p className="font-medium">{formatDate(moveIn.move_in_form_sent_date)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Date of Move-In Form Filled</p>
                                        <p className="font-medium">{formatDate(moveIn.date_of_move_in_form_filled)}</p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Record Information */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Record Information</h3>
                                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                                    <div>
                                        <p>Created: {new Date(moveIn.created_at).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p>Last Updated: {new Date(moveIn.updated_at).toLocaleString()}</p>
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
