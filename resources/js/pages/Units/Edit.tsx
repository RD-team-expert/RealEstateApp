// resources/js/Pages/Units/Edit.tsx

import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/app-layout';
import { Unit, UnitFormData } from '@/types/unit';
import { PageProps } from '@/types/unit';

interface Props extends PageProps {
    unit: Unit;
}

export default function Edit({ auth, unit }: Props) {
    const { data, setData, put, processing, errors } = useForm<UnitFormData>({
        city: unit.city,
        property: unit.property,
        unit_name: unit.unit_name,
        tenants: unit.tenants || '',
        lease_start: unit.lease_start || '',
        lease_end: unit.lease_end || '',
        count_beds: unit.count_beds?.toString() || '',
        count_baths: unit.count_baths?.toString() || '',
        lease_status: unit.lease_status || '',
        monthly_rent: unit.monthly_rent?.toString() || '',
        recurring_transaction: unit.recurring_transaction || '',
        utility_status: unit.utility_status || '',
        account_number: unit.account_number || '',
        insurance: unit.insurance || '',
        insurance_expiration_date: unit.insurance_expiration_date || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('units.update', unit.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Edit Unit</h2>}
        >
            <Head title="Edit Unit" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {/* Note about calculated fields */}
                            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <strong>Note:</strong> Vacant, Listed, and Total Applications are automatically calculated based on your inputs.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* City */}
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

                                    {/* Property */}
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

                                    {/* Unit Name */}
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

                                    {/* Tenants */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tenants
                                        </label>
                                        <input
                                            type="text"
                                            value={data.tenants}
                                            onChange={(e) => setData('tenants', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter tenant name(s)"
                                        />
                                        {errors.tenants && (
                                            <p className="text-red-600 text-sm mt-1">{errors.tenants}</p>
                                        )}
                                    </div>

                                    {/* Lease Start */}
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

                                    {/* Lease End */}
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

                                    {/* Count Beds */}
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
                                            placeholder="Number of bedrooms"
                                        />
                                        {errors.count_beds && (
                                            <p className="text-red-600 text-sm mt-1">{errors.count_beds}</p>
                                        )}
                                    </div>

                                    {/* Count Baths */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Count Baths
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.5"
                                            value={data.count_baths}
                                            onChange={(e) => setData('count_baths', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Number of bathrooms"
                                        />
                                        {errors.count_baths && (
                                            <p className="text-red-600 text-sm mt-1">{errors.count_baths}</p>
                                        )}
                                    </div>

                                    {/* Lease Status */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Lease Status
                                        </label>
                                        <input
                                            type="text"
                                            value={data.lease_status}
                                            onChange={(e) => setData('lease_status', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="e.g., Active, Expired, Pending"
                                        />
                                        {errors.lease_status && (
                                            <p className="text-red-600 text-sm mt-1">{errors.lease_status}</p>
                                        )}
                                    </div>

                                    {/* Monthly Rent */}
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
                                            placeholder="0.00"
                                        />
                                        {errors.monthly_rent && (
                                            <p className="text-red-600 text-sm mt-1">{errors.monthly_rent}</p>
                                        )}
                                    </div>

                                    {/* Recurring Transaction */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Recurring Transaction
                                        </label>
                                        <input
                                            type="text"
                                            value={data.recurring_transaction}
                                            onChange={(e) => setData('recurring_transaction', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Transaction details"
                                        />
                                        {errors.recurring_transaction && (
                                            <p className="text-red-600 text-sm mt-1">{errors.recurring_transaction}</p>
                                        )}
                                    </div>

                                    {/* Utility Status */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Utility Status
                                        </label>
                                        <input
                                            type="text"
                                            value={data.utility_status}
                                            onChange={(e) => setData('utility_status', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="e.g., Included, Tenant Responsible"
                                        />
                                        {errors.utility_status && (
                                            <p className="text-red-600 text-sm mt-1">{errors.utility_status}</p>
                                        )}
                                    </div>

                                    {/* Account Number */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Account Number
                                        </label>
                                        <input
                                            type="text"
                                            value={data.account_number}
                                            onChange={(e) => setData('account_number', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Account or reference number"
                                        />
                                        {errors.account_number && (
                                            <p className="text-red-600 text-sm mt-1">{errors.account_number}</p>
                                        )}
                                    </div>

                                    {/* Insurance */}
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

                                    {/* Insurance Expiration Date */}
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

                                {/* Current calculated values display */}
                                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">Current Calculated Values:</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium text-gray-700">Vacant:</span>
                                            <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                                                unit.vacant === 'Yes' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                                {unit.vacant}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Listed:</span>
                                            <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                                                unit.listed === 'Yes' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {unit.listed}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Total Applications:</span>
                                            <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                                                {unit.total_applications}
                                            </span>
                                        </div>
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
                                        {processing ? 'Updating...' : 'Update Unit'}
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
