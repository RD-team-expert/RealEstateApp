import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/app-layout';
import { Payment } from '@/types/payments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Props {
    payment: Payment;
}

export default function Show({ payment }: Props) {
    const formatCurrency = (amount: number | null) => {
        if (amount === null) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const getStatusBadge = (status: string | null) => {
        if (!status) return <Badge variant="outline">No Status</Badge>;
        const variant = status.toLowerCase().includes('paid') ? 'default' :
                      status.toLowerCase().includes('pending') ? 'secondary' : 'outline';
        return <Badge variant={variant}>{status}</Badge>;
    };

    return (
        <AppLayout>
            <Head title={`Payment Details #${payment.id}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">Payment Details</CardTitle>
                                <div className="flex gap-2">
                                    <Link href={route('payments.edit', payment.id)}>
                                        <Button>Edit Payment</Button>
                                    </Link>
                                    <Link href={route('payments.index')}>
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
                                        <p className="text-sm text-gray-600">Date</p>
                                        <p className="font-medium">{new Date(payment.date).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">City</p>
                                        <p className="font-medium">{payment.city}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Unit Name</p>
                                        <p className="font-medium">{payment.unit_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Permanent</p>
                                        <div className="mt-1">
                                            <Badge variant={payment.permanent === 'Yes' ? 'default' : 'secondary'}>
                                                {payment.permanent}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Status Information</h3>
                                    <div>
                                        <p className="text-sm text-gray-600">Status</p>
                                        <div className="mt-1">{getStatusBadge(payment.status)}</div>
                                    </div>
                                    {payment.reversed_payments && (
                                        <div>
                                            <p className="text-sm text-gray-600">Reversed Payments</p>
                                            <p className="font-medium">{payment.reversed_payments}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Financial Information */}
                            <div className="mt-6 space-y-4">
                                <h3 className="text-lg font-semibold">Financial Details</h3>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="bg-red-50 p-4 rounded-lg">
                                        <p className="text-sm text-red-600">Amount Owed</p>
                                        <p className="text-2xl font-bold text-red-700">{formatCurrency(payment.owes)}</p>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <p className="text-sm text-green-600">Amount Paid</p>
                                        <p className="text-2xl font-bold text-green-700">{formatCurrency(payment.paid)}</p>
                                    </div>
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <p className="text-sm text-blue-600">Left to Pay</p>
                                        <p className="text-2xl font-bold text-blue-700">{formatCurrency(payment.left_to_pay)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Notes Section */}
                            {payment.notes && (
                                <div className="mt-6 space-y-4">
                                    <h3 className="text-lg font-semibold">Notes</h3>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-gray-900 whitespace-pre-wrap">{payment.notes}</p>
                                    </div>
                                </div>
                            )}

                            <div className="mt-8 pt-6 border-t">
                                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                                    <div>
                                        <p>Created: {new Date(payment.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p>Updated: {new Date(payment.updated_at).toLocaleDateString()}</p>
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
