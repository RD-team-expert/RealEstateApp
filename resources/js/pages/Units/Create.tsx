// resources/js/Pages/Units/Create.tsx

import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/app-layout';
import { UnitFormData } from '@/types/unit';
import { PageProps } from '@/types/unit';

export default function Create({ auth }: PageProps) {
    const { data, setData, post, processing, errors } = useForm<UnitFormData>({
        city: '',
        property: '',
        unit_name: '',
        tenants: '',
        lease_start: '',
        lease_end: '',
        count_beds: '',
        count_baths: '',
        lease_status: '',
        monthly_rent: '',
        recurring_transaction: '',
        utility_status: '',
        account_number: '',
        insurance: '',
        insurance_expiration_date: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('units.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Add New Unit</h2>}
        >
            <Head title="Add New Unit" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.city}
                                            onChange={(e) => setData('city', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                        {errors.city && (
                                            <p className="text-red-600 text-sm mt-1">{errors.city}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Property *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.property}
                                            onChange={(e) => setData('property', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                        {errors.property && (
                                            <p className="text-red-600 text-sm mt-1">{errors.property}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Unit Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.unit_name}
                                            onChange={(e) => setData('unit_name', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                        {errors.unit_name && (
                                            <p className="text-red-600 text-sm mt-1">{errors.unit_name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tenants
                                        </label>
                                        <input
                                            type="text"
                                            value={data.tenants}
                                            onChange={(e) => setData('tenants', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {errors.tenants && (
                                            <p className="text-red-600 text-sm mt-1">{errors.tenants}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Lease Start
                                        </label>
                                        <input
                                            type="date"
                                            value={data.lease_start}
                                            onChange={(e) => setData('lease_start', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {errors.lease_start && (
                                            <p className="text-red-600 text-sm mt-1">{errors.lease_start}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Lease End
                                        </label>
                                        <input
                                            type="date"
                                            value={data.lease_end}
                                            onChange={(e) => setData('lease_end', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {errors.lease_end && (
                                            <p className="text-red-600 text-sm mt-1">{errors.lease_end}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Count Beds
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={data.count_beds}
                                            onChange={(e) => setData('count_beds', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {errors.count_beds && (
                                            <p className="text-red-600 text-sm mt-1">{errors.count_beds}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Count Baths
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={data.count_baths}
                                            onChange={(e) => setData('count_baths', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {errors.count_baths && (
                                            <p className="text-red-600 text-sm mt-1">{errors.count_baths}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Lease Status
                                        </label>
                                        <input
                                            type="text"
                                            value={data.lease_status}
                                            onChange={(e) => setData('lease_status', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {errors.lease_status && (
                                            <p className="text-red-600 text-sm mt-1">{errors.lease_status}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Monthly Rent
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.monthly_rent}
                                            onChange={(e) => setData('monthly_rent', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {errors.monthly_rent && (
                                            <p className="text-red-600 text-sm mt-1">{errors.monthly_rent}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Recurring Transaction
                                        </label>
                                        <input
                                            type="text"
                                            value={data.recurring_transaction}
                                            onChange={(e) => setData('recurring_transaction', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {errors.recurring_transaction && (
                                            <p className="text-red-600 text-sm mt-1">{errors.recurring_transaction}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Utility Status
                                        </label>
                                        <input
                                            type="text"
                                            value={data.utility_status}
                                            onChange={(e) => setData('utility_status', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {errors.utility_status && (
                                            <p className="text-red-600 text-sm mt-1">{errors.utility_status}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Account Number
                                        </label>
                                        <input
                                            type="text"
                                            value={data.account_number}
                                            onChange={(e) => setData('account_number', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {errors.account_number && (
                                            <p className="text-red-600 text-sm mt-1">{errors.account_number}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Insurance
                                        </label>
                                        <select
                                            value={data.insurance}
                                            onChange={(e) => setData('insurance', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Select Insurance Status</option>
                                            <option value="Yes">Yes</option>
                                            <option value="No">No</option>
                                        </select>
                                        {errors.insurance && (
                                            <p className="text-red-600 text-sm mt-1">{errors.insurance}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Insurance Expiration Date
                                        </label>
                                        <input
                                            type="date"
                                            value={data.insurance_expiration_date}
                                            onChange={(e) => setData('insurance_expiration_date', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {errors.insurance_expiration_date && (
                                            <p className="text-red-600 text-sm mt-1">{errors.insurance_expiration_date}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end space-x-3">
                                    <a
                                        href={route('units.index')}
                                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                                    >
                                        Cancel
                                    </a>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                                    >
                                        {processing ? 'Creating...' : 'Create Unit'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
