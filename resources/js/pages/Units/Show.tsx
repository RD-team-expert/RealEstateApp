// resources/js/Pages/Units/Show.tsx

import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/app-layout';
import { Unit } from '@/types/unit';
import { PageProps } from '@/types/unit';

interface Props extends PageProps {
    unit: Unit;
}

export default function Show({ auth, unit }: Props) {
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
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold">
                                    {unit.unit_name} - {unit.property}, {unit.city}
                                </h3>
                                <div className="flex space-x-2">
                                    <Link
                                        href={route('units.edit', unit.id)}
                                        className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Edit
                                    </Link>
                                    <Link
                                        href={route('units.index')}
                                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Back to List
                                    </Link>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Basic Information */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            City
                                        </label>
                                        <p className="text-lg text-gray-900">{unit.city}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Property
                                        </label>
                                        <p className="text-lg text-gray-900">{unit.property}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Unit Name
                                        </label>
                                        <p className="text-lg text-gray-900">{unit.unit_name}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tenants
                                        </label>
                                        <p className="text-lg text-gray-900">{unit.tenants || 'No tenants'}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Lease Period
                                        </label>
                                        <p className="text-lg text-gray-900">
                                            {unit.lease_start && unit.lease_end
                                                ? `${new Date(unit.lease_start).toLocaleDateString()} - ${new Date(unit.lease_end).toLocaleDateString()}`
                                                : 'Not specified'
                                            }
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Bedrooms & Bathrooms
                                        </label>
                                        <p className="text-lg text-gray-900">
                                            {unit.count_beds || 0} bed{(unit.count_beds || 0) !== 1 ? 's' : ''}, {unit.count_baths || 0} bath{(unit.count_baths || 0) !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>

                                {/* Status and Financial Information */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Monthly Rent
                                        </label>
                                        <p className="text-lg text-gray-900 font-semibold">{unit.formatted_monthly_rent}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Lease Status
                                        </label>
                                        <p className="text-lg text-gray-900">{unit.lease_status || 'Not specified'}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Vacant Status
                                        </label>
                                        <div>{getVacantBadge(unit.vacant)}</div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Listed Status
                                        </label>
                                        <div>{getListedBadge(unit.listed)}</div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Total Applications
                                        </label>
                                        <p className="text-lg text-gray-900">
                                            <span className="bg-orange-100 text-orange-800 px-3 py-1 text-sm font-semibold rounded-full">
                                                {unit.total_applications}
                                            </span>
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Insurance
                                        </label>
                                        <div>{getInsuranceBadge(unit.insurance)}</div>
                                    </div>

                                    {unit.insurance_expiration_date && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Insurance Expiration
                                            </label>
                                            <p className="text-lg text-gray-900">
                                                {new Date(unit.insurance_expiration_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Additional Information */}
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <h4 className="text-lg font-semibold mb-4">Additional Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Recurring Transaction
                                        </label>
                                        <p className="text-gray-900">{unit.recurring_transaction || 'Not specified'}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Utility Status
                                        </label>
                                        <p className="text-gray-900">{unit.utility_status || 'Not specified'}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Account Number
                                        </label>
                                        <p className="text-gray-900">{unit.account_number || 'Not specified'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                    <div>
                                        <span className="font-medium">Created:</span> {new Date(unit.created_at).toLocaleDateString()}
                                    </div>
                                    <div>
                                        <span className="font-medium">Last Updated:</span> {new Date(unit.updated_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
