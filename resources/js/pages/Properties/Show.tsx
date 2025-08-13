// resources/js/Pages/Properties/Show.tsx

import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/app-layout';
import { Property } from '@/types/property';
import type { PageProps } from '@/types/property';

interface Props extends PageProps {
    property: Property;
}

export default function Show({ auth, property }: Props) {
    const getStatusBadge = () => {
        if (property.is_expired) {
            return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">Expired</span>;
        }
        if (property.is_expiring_soon) {
            return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">Expiring Soon</span>;
        }
        return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">Active</span>;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Property Details</h2>}
        >
            <Head title="Property Details" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold">{property.property_name}</h3>
                                <div className="flex space-x-2">
                                    <Link
                                        href={route('properties-info.edit', property.id)}
                                        className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Edit
                                    </Link>
                                    <Link
                                        href={route('properties-info.index')}
                                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Back to List
                                    </Link>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Property Name
                                        </label>
                                        <p className="text-lg text-gray-900">{property.property_name}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Insurance Company
                                        </label>
                                        <p className="text-lg text-gray-900">{property.insurance_company_name}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Amount
                                        </label>
                                        <p className="text-lg text-gray-900 font-semibold">{property.formatted_amount}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Policy Number
                                        </label>
                                        <p className="text-lg text-gray-900">{property.policy_number}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Effective Date
                                        </label>
                                        <p className="text-lg text-gray-900">
                                            {new Date(property.effective_date).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Expiration Date
                                        </label>
                                        <p className="text-lg text-gray-900">
                                            {new Date(property.expiration_date).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Days Left
                                        </label>
                                        <p className="text-lg text-gray-900 font-semibold">{property.days_left}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Status
                                        </label>
                                        <div>{getStatusBadge()}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                    <div>
                                        <span className="font-medium">Created:</span> {new Date(property.created_at).toLocaleDateString()}
                                    </div>
                                    <div>
                                        <span className="font-medium">Last Updated:</span> {new Date(property.updated_at).toLocaleDateString()}
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
