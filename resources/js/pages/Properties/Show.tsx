// resources/js/Pages/Properties/Show.tsx
import React from 'react';
import { type BreadcrumbItem } from '@/types';import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/app-layout';
import { Property } from '@/types/property';
import type { PageProps } from '@/types/property';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePermissions } from '@/hooks/usePermissions';

interface Props extends PageProps {
    property: Property;
}

export default function Show({ auth, property }: Props) {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

    // Helper function to format dates without timezone issues
    const formatDate = (dateString: string): string => {
        const [year, month, day] = dateString.split('-');
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString();
    };

    // Calculate days left with proper date handling
    const calculateDaysLeft = (expirationDate: string): number => {
        const today = new Date();
        const [year, month, day] = expirationDate.split('-');
        const expDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

        // Set both dates to start of day for accurate comparison
        today.setHours(0, 0, 0, 0);
        expDate.setHours(0, 0, 0, 0);

        const diffTime = expDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Get status badge based on days left calculation
    const getStatusBadge = () => {
        const daysLeft = calculateDaysLeft(property.expiration_date);

        if (daysLeft <= 0) {
            return <Badge variant="destructive">Expired</Badge>;
        }
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Active</Badge>;
    };

    // Get days left display with color coding and badge styling
    const getDaysLeftBadge = () => {
        const daysLeft = calculateDaysLeft(property.expiration_date);

        if (daysLeft <= 0) {
            return <Badge variant="destructive">Expired ({Math.abs(daysLeft)} days ago)</Badge>;
        } else if (daysLeft <= 30) {
            return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">{daysLeft} days left</Badge>;
        } else {
            return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">{daysLeft} days left</Badge>;
        }
    };


    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-foreground leading-tight">Property Details</h2>}
            
        >
            <Head title="Property Details" />

            <div className="py-12 bg-background text-foreground transition-colors min-h-screen">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <Card className="bg-card text-card-foreground shadow-lg">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">
                                    {property.property_name}
                                </CardTitle>
                                <div className="flex gap-2">
                                    {hasAllPermissions(['properties.update','properties.edit']) && (
                                    <Link href={route('properties-info.edit', property.id)}>
                                        <Button>Edit</Button>
                                    </Link>)}
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
                                    <h3 className="text-lg font-semibold text-foreground">Property Information</h3>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Property Name</p>
                                        <p className="font-medium text-foreground">{property.property_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Insurance Company</p>
                                        <p className="font-medium text-foreground">{property.insurance_company_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Amount</p>
                                        <p className="font-medium text-foreground text-blue-600 dark:text-blue-400">{property.formatted_amount}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Policy Number</p>
                                        <p className="font-medium text-foreground">{property.policy_number}</p>
                                    </div>
                                </div>

                                {/* Insurance Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-foreground">Insurance Information</h3>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Effective Date</p>
                                        <p className="font-medium text-foreground">
                                            {formatDate(property.effective_date)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Expiration Date</p>
                                        <p className="font-medium text-foreground">
                                            {formatDate(property.expiration_date)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Days Left</p>
                                        <div className="mt-1">{getDaysLeftBadge()}</div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Status</p>
                                        <div className="mt-1">{getStatusBadge()}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-border">
                                <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                                    <div>
                                        <p>Created: {new Date(property.created_at + 'T00:00:00').toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p>Updated: {new Date(property.updated_at + 'T00:00:00').toLocaleDateString()}</p>
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
