import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { OfferRenewal } from '@/types/OfferRenewal';
import AppLayout from '@/Layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePermissions } from '@/hooks/usePermissions';
const Show = () => {
    const { offer } = usePage().props as { offer: OfferRenewal };

    const formatDate = (date: string | null) => {
        if (!date) return 'Not Set';
        return new Date(date).toLocaleDateString();
    };

    const { hasPermission, hasAnyPermission, hasAllPermissions} = usePermissions();
    return (
        <AppLayout>
            <Head title={`Offer ${offer.id}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">
                                    Offer Details - #{offer.id}
                                </CardTitle>
                                <div className="flex gap-2">
                                    {hasAllPermissions(['offers-and-renewals.edit','offers-and-renewals.update'])&&(
                                    <Link href={`/offers_and_renewals/${offer.id}/edit`}>
                                        <Button>Edit</Button>
                                    </Link>)}
                                    <Link href="/offers_and_renewals">
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
                                        <p className="text-sm text-gray-600">Unit</p>
                                        <p className="font-medium">{offer.unit}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Tenant</p>
                                        <p className="font-medium">{offer.tenant}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Date Sent Offer</p>
                                        <p className="font-medium">{formatDate(offer.date_sent_offer)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Status</p>
                                        <p className="font-medium">{offer.status || 'N/A'}</p>
                                    </div>
                                </div>

                                {/* Acceptance Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Acceptance Information</h3>
                                    <div>
                                        <p className="text-sm text-gray-600">Date of Acceptance</p>
                                        <p className="font-medium">{formatDate(offer.date_of_acceptance)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">How Many Days Left</p>
                                        <p className="font-medium">{offer.how_many_days_left || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Expired</p>
                                        <p className="font-medium">{offer.expired || 'N/A'}</p>
                                    </div>
                                </div>

                                {/* Lease Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Lease Information</h3>
                                    <div>
                                        <p className="text-sm text-gray-600">Lease Sent?</p>
                                        <p className="font-medium">{offer.lease_sent || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Date Sent Lease</p>
                                        <p className="font-medium">{formatDate(offer.date_sent_lease)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Lease Signed?</p>
                                        <p className="font-medium">{offer.lease_signed || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Date Signed</p>
                                        <p className="font-medium">{formatDate(offer.date_signed)}</p>
                                    </div>
                                </div>

                                {/* Notice Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Notice Information</h3>
                                    <div>
                                        <p className="text-sm text-gray-600">Last Notice Sent</p>
                                        <p className="font-medium">{formatDate(offer.last_notice_sent)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Notice Kind</p>
                                        <p className="font-medium">{offer.notice_kind || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">2nd Last Notice Sent</p>
                                        <p className="font-medium">{formatDate(offer.last_notice_sent_2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">2nd Notice Kind</p>
                                        <p className="font-medium">{offer.notice_kind_2 || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Notes Section */}
                            {offer.notes && (
                                <div className="mt-6 space-y-4">
                                    <h3 className="text-lg font-semibold">Notes</h3>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-gray-900 whitespace-pre-wrap">{offer.notes}</p>
                                    </div>
                                </div>
                            )}

                            <div className="mt-8 pt-6 border-t">
                                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                                    <div>
                                        <p>Created: {new Date(offer.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p>Updated: {new Date(offer.updated_at).toLocaleDateString()}</p>
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
