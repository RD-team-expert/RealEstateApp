import React from 'react';
import { type BreadcrumbItem } from '@/types';import { Head, Link, usePage } from '@inertiajs/react';
import { OfferRenewal } from '@/types/OfferRenewal';
import AppLayout from '@/Layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePermissions } from '@/hooks/usePermissions';

const Show = () => {
    const { offer } = usePage().props as { offer: OfferRenewal };

    const formatDate = (date: string | null) => {
        if (!date) return 'Not Set';
        return new Date(date).toLocaleDateString();
    };

    const getStatusBadge = (status: string | null) => {
        if (!status) return <Badge variant="outline">N/A</Badge>;

        switch (status.toLowerCase()) {
            case 'accepted':
                return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">{status}</Badge>;
            case 'pending':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">{status}</Badge>;
            case 'rejected':
                return <Badge variant="destructive">{status}</Badge>;
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

    const getDaysLeftBadge = (days: string | null) => {
        if (!days) return <Badge variant="outline">N/A</Badge>;
        const numDays = parseInt(days);
        if (numDays <= 7) {
            return <Badge variant="destructive">{days} days left</Badge>;
        } else if (numDays <= 30) {
            return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">{days} days left</Badge>;
        } else {
            return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">{days} days left</Badge>;
        }
    };

    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();


    return (
        <AppLayout >
            <Head title={`Offer ${offer.id}`} />

            <div className="py-12 bg-background text-foreground transition-colors min-h-screen">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <Card className="bg-card text-card-foreground shadow-lg">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">
                                    Offer Details - #{offer.id}
                                </CardTitle>
                                <div className="flex gap-2">
                                    {hasAllPermissions(['offers-and-renewals.edit','offers-and-renewals.update']) && (
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
                                    <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Unit</p>
                                        <p className="font-medium text-foreground">{offer.unit}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Tenant</p>
                                        <p className="font-medium text-foreground">{offer.tenant}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Date Sent Offer</p>
                                        <p className="font-medium text-foreground">{formatDate(offer.date_sent_offer)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Status</p>
                                        <div className="mt-1">
                                            {getStatusBadge(offer.status)}
                                        </div>
                                    </div>
                                </div>

                                {/* Acceptance Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-foreground">Acceptance Information</h3>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Date of Acceptance</p>
                                        <p className="font-medium text-foreground">{formatDate(offer.date_of_acceptance)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">How Many Days Left</p>
                                        <div className="mt-1">
                                            {getDaysLeftBadge(offer.how_many_days_left)}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Expired</p>
                                        <div className="mt-1">
                                            <Badge variant={offer.expired === 'expired' ? 'destructive' : 'default'}>
                                                {offer.expired || 'N/A'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                {/* Lease Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-foreground">Lease Information</h3>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Lease Sent?</p>
                                        <div className="mt-1">
                                            {getYesNoBadge(offer.lease_sent)}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Date Sent Lease</p>
                                        <p className="font-medium text-foreground">{formatDate(offer.date_sent_lease)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Lease Signed?</p>
                                        <div className="mt-1">
                                            {getYesNoBadge(offer.lease_signed)}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Date Signed</p>
                                        <p className="font-medium text-foreground">{formatDate(offer.date_signed)}</p>
                                    </div>
                                </div>

                                {/* Notice Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-foreground">Notice Information</h3>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Last Notice Sent</p>
                                        <p className="font-medium text-foreground">{formatDate(offer.last_notice_sent)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Notice Kind</p>
                                        <p className="font-medium text-foreground">{offer.notice_kind || <span className="text-muted-foreground">N/A</span>}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">2nd Last Notice Sent</p>
                                        <p className="font-medium text-foreground">{formatDate(offer.last_notice_sent_2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">2nd Notice Kind</p>
                                        <p className="font-medium text-foreground">{offer.notice_kind_2 || <span className="text-muted-foreground">N/A</span>}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Notes Section */}
                            {offer.notes && (
                                <div className="mt-6 space-y-4">
                                    <h3 className="text-lg font-semibold text-foreground">Notes</h3>
                                    <Card className="bg-muted/50">
                                        <CardContent className="p-4">
                                            <p className="text-foreground whitespace-pre-wrap">{offer.notes}</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            <div className="mt-8 pt-6 border-t border-border">
                                <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
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
