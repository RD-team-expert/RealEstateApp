// resources/js/Pages/Vendors/Show.tsx

import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/app-layout';
import { VendorInfo } from '@/types/vendor';
import { PageProps } from '@/types/vendor';

interface Props extends PageProps {
    vendor: VendorInfo;
}

export default function Show({ auth, vendor }: Props) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Vendor Details</h2>}
        >
            <Head title="Vendor Details" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold">
                                    {vendor.vendor_name} - {vendor.city}
                                </h3>
                                <div className="flex space-x-2">
                                    <Link
                                        href={route('vendors.edit', vendor.id)}
                                        className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Edit
                                    </Link>
                                    <Link
                                        href={route('vendors.index')}
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
                                            City
                                        </label>
                                        <p className="text-lg text-gray-900">{vendor.city}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Vendor Name
                                        </label>
                                        <p className="text-lg text-gray-900">{vendor.vendor_name}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Number
                                        </label>
                                        <p className="text-lg text-gray-900">
                                            {vendor.number ? (
                                                <a href={`tel:${vendor.number}`} className="text-blue-600 hover:text-blue-900">
                                                    {vendor.number}
                                                </a>
                                            ) : 'Not provided'}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email
                                        </label>
                                        <p className="text-lg text-gray-900">
                                            {vendor.email ? (
                                                <a href={`mailto:${vendor.email}`} className="text-blue-600 hover:text-blue-900">
                                                    {vendor.email}
                                                </a>
                                            ) : 'Not provided'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                    <div>
                                        <span className="font-medium">Created:</span> {new Date(vendor.created_at).toLocaleDateString()}
                                    </div>
                                    <div>
                                        <span className="font-medium">Last Updated:</span> {new Date(vendor.updated_at).toLocaleDateString()}
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
