// resources/js/Pages/Units/Show.tsx
import React from 'react';
import { type BreadcrumbItem } from '@/types';import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/app-layout';
import { Unit } from '@/types/unit';
import { PageProps } from '@/types/unit';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePermissions } from '@/hooks/usePermissions';

interface Props extends PageProps {
    unit: Unit;
}

export default function Show({ auth, unit }: Props) {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

    const getVacantBadge = (vacant: string) => {
        return (
            <Badge
                variant={vacant === 'Yes' ? 'destructive' : 'default'}
                className={vacant === 'Yes'
                    ? undefined
                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                }
            >
                {vacant}
            </Badge>
        );
    };

    const getListedBadge = (listed: string) => {
        return (
            <Badge
                variant={listed === 'Yes' ? 'default' : 'secondary'}
                className={listed === 'Yes'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                }
            >
                {listed}
            </Badge>
        );
    };

    const getInsuranceBadge = (insurance: string | null) => {
        if (!insurance) return <Badge variant="outline">Not Set</Badge>;
        return (
            <Badge
                variant={insurance === 'Yes' ? 'default' : 'destructive'}
                className={insurance === 'Yes'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : undefined
                }
            >
                {insurance}
            </Badge>
        );
    };

    const getApplicationsBadge = (count: number) => {
        return (
            <Badge
                variant="secondary"
                className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
            >
                {count}
            </Badge>
        );
    };
const breadcrumbs: BreadcrumbItem[] = [
                    {
                        title: 'Units',
                        href: '/units',
                    },
                    {
                        title: 'Show',
                        href: '/units/{unit}',
                    },
                ];
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-foreground leading-tight">Unit Details</h2>}
            breadcrumbs={breadcrumbs}
        >
            <Head title="Unit Details" />

            <div className="py-12 bg-background text-foreground transition-colors min-h-screen">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <Card className="bg-card text-card-foreground shadow-lg">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">
                                    {unit.unit_name} - {unit.property}, {unit.city}
                                </CardTitle>
                                <div className="flex gap-2">
                                    {hasAllPermissions(['units.update','units.edit']) && (
                                    <Link href={route('units.edit', unit.id)}>
                                        <Button>Edit</Button>
                                    </Link>)}
                                    <Link href={route('units.index')}>
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
                                        <p className="text-sm text-muted-foreground">City</p>
                                        <p className="font-medium text-foreground">{unit.city}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Property</p>
                                        <p className="font-medium text-foreground">{unit.property}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Unit Name</p>
                                        <p className="font-medium text-foreground">{unit.unit_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Tenants</p>
                                        <p className="font-medium text-foreground">{unit.tenants || <span className="text-muted-foreground">No tenants</span>}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Bedrooms & Bathrooms</p>
                                        <p className="font-medium text-foreground">
                                            {unit.count_beds || 0} bed{(unit.count_beds || 0) !== 1 ? 's' : ''}, {unit.count_baths || 0} bath{(unit.count_baths || 0) !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>

                                {/* Financial & Status Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-foreground">Financial & Status Information</h3>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Monthly Rent</p>
                                        <p className="font-medium text-blue-600 dark:text-blue-400 text-lg">{unit.formatted_monthly_rent}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Lease Status</p>
                                        <p className="font-medium text-foreground">{unit.lease_status || <span className="text-muted-foreground">Not specified</span>}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Vacant Status</p>
                                        <div className="mt-1">{getVacantBadge(unit.vacant)}</div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Listed Status</p>
                                        <div className="mt-1">{getListedBadge(unit.listed)}</div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Applications</p>
                                        <div className="mt-1">
                                            {getApplicationsBadge(unit.total_applications)}
                                        </div>
                                    </div>
                                </div>

                                {/* Lease Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-foreground">Lease Information</h3>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Lease Period</p>
                                        <p className="font-medium text-foreground">
                                            {unit.lease_start && unit.lease_end
                                                ? `${new Date(unit.lease_start).toLocaleDateString()} - ${new Date(unit.lease_end).toLocaleDateString()}`
                                                : <span className="text-muted-foreground">Not specified</span>
                                            }
                                        </p>
                                    </div>
                                </div>

                                {/* Insurance Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-foreground">Insurance Information</h3>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Insurance</p>
                                        <div className="mt-1">{getInsuranceBadge(unit.insurance)}</div>
                                    </div>
                                    {unit.insurance_expiration_date && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Insurance Expiration</p>
                                            <p className="font-medium text-foreground">
                                                {new Date(unit.insurance_expiration_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Additional Information */}
                            <div className="mt-6 space-y-4">
                                <h3 className="text-lg font-semibold text-foreground">Additional Information</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Recurring Transaction</p>
                                        <p className="font-medium text-foreground">{unit.recurring_transaction || <span className="text-muted-foreground">Not specified</span>}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Utility Status</p>
                                        <p className="font-medium text-foreground">{unit.utility_status || <span className="text-muted-foreground">Not specified</span>}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Account Number</p>
                                        <p className="font-medium text-foreground">{unit.account_number || <span className="text-muted-foreground">Not specified</span>}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-border">
                                <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                                    <div>
                                        <p>Created: {new Date(unit.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p>Updated: {new Date(unit.updated_at).toLocaleDateString()}</p>
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
