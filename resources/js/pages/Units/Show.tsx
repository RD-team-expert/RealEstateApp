// resources/js/Pages/Units/Show.tsx
import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/app-layout';
import { Unit } from '@/types/unit';
import { PageProps } from '@/types/unit';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePermissions } from '@/hooks/usePermissions';
interface Props extends PageProps {
    unit: Unit;
}

export default function Show({ auth, unit }: Props) {
    const { hasPermission, hasAnyPermission, hasAllPermissions} = usePermissions();
    const getVacantBadge = (vacant: string) => {
        const colorClass = vacant === 'Yes' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
        return <span className={`px-3 py-1 text-sm font-semibold rounded-full ${colorClass}`}>{vacant}</span>;
    };

    const getListedBadge = (listed: string) => {
        const colorClass = listed === 'Yes' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800';
        return <span className={`px-3 py-1 text-sm font-semibold rounded-full ${colorClass}`}>{listed}</span>;
    };

    const getInsuranceBadge = (insurance: string | null) => {
        if (!insurance) return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800">Not Set</span>;
        const colorClass = insurance === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
        return <span className={`px-3 py-1 text-sm font-semibold rounded-full ${colorClass}`}>{insurance}</span>;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Unit Details</h2>}
        >
            <Head title="Unit Details" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">
                                    {unit.unit_name} - {unit.property}, {unit.city}
                                </CardTitle>
                                <div className="flex gap-2">
                                    {hasAllPermission(['units.update','units.edit'])&&(
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
                                    <h3 className="text-lg font-semibold">Basic Information</h3>
                                    <div>
                                        <p className="text-sm text-gray-600">City</p>
                                        <p className="font-medium">{unit.city}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Property</p>
                                        <p className="font-medium">{unit.property}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Unit Name</p>
                                        <p className="font-medium">{unit.unit_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Tenants</p>
                                        <p className="font-medium">{unit.tenants || 'No tenants'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Bedrooms & Bathrooms</p>
                                        <p className="font-medium">
                                            {unit.count_beds || 0} bed{(unit.count_beds || 0) !== 1 ? 's' : ''}, {unit.count_baths || 0} bath{(unit.count_baths || 0) !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>

                                {/* Financial & Status Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Financial & Status Information</h3>
                                    <div>
                                        <p className="text-sm text-gray-600">Monthly Rent</p>
                                        <p className="font-medium">{unit.formatted_monthly_rent}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Lease Status</p>
                                        <p className="font-medium">{unit.lease_status || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Vacant Status</p>
                                        <div className="mt-1">{getVacantBadge(unit.vacant)}</div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Listed Status</p>
                                        <div className="mt-1">{getListedBadge(unit.listed)}</div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Total Applications</p>
                                        <div className="mt-1">
                                            <span className="bg-orange-100 text-orange-800 px-3 py-1 text-sm font-semibold rounded-full">
                                                {unit.total_applications}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Lease Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Lease Information</h3>
                                    <div>
                                        <p className="text-sm text-gray-600">Lease Period</p>
                                        <p className="font-medium">
                                            {unit.lease_start && unit.lease_end
                                                ? `${new Date(unit.lease_start).toLocaleDateString()} - ${new Date(unit.lease_end).toLocaleDateString()}`
                                                : 'Not specified'
                                            }
                                        </p>
                                    </div>
                                </div>

                                {/* Insurance Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Insurance Information</h3>
                                    <div>
                                        <p className="text-sm text-gray-600">Insurance</p>
                                        <div className="mt-1">{getInsuranceBadge(unit.insurance)}</div>
                                    </div>
                                    {unit.insurance_expiration_date && (
                                        <div>
                                            <p className="text-sm text-gray-600">Insurance Expiration</p>
                                            <p className="font-medium">
                                                {new Date(unit.insurance_expiration_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Additional Information */}
                            <div className="mt-6 space-y-4">
                                <h3 className="text-lg font-semibold">Additional Information</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Recurring Transaction</p>
                                        <p className="font-medium">{unit.recurring_transaction || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Utility Status</p>
                                        <p className="font-medium">{unit.utility_status || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Account Number</p>
                                        <p className="font-medium">{unit.account_number || 'Not specified'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t">
                                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
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
