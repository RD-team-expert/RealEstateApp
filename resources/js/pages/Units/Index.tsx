// resources/js/Pages/Units/Index.tsx

import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/app-layout';
import { Unit, PaginatedUnits, UnitFilters, UnitStatistics } from '@/types/unit';
import { PageProps } from '@/types/unit';

interface Props extends PageProps {
    units: PaginatedUnits;
    statistics: UnitStatistics;
    filters: UnitFilters;
}

export default function Index({ auth, units, statistics, filters }: Props) {
    const [searchFilters, setSearchFilters] = useState<UnitFilters>(filters);
    const { flash } = usePage().props;

    const handleFilterChange = (key: keyof UnitFilters, value: string) => {
        const newFilters = { ...searchFilters, [key]: value };
        setSearchFilters(newFilters);

        router.get(route('units.index'), newFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this unit?')) {
            router.delete(route('units.destroy', id));
        }
    };

    const getVacantBadge = (vacant: string) => {
        const colorClass = vacant === 'Yes' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorClass}`}>{vacant}</span>;
    };

    const getListedBadge = (listed: string) => {
        const colorClass = listed === 'Yes' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800';
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorClass}`}>{listed}</span>;
    };

    const getInsuranceBadge = (insurance: string | null) => {
        if (!insurance) return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">-</span>;
        const colorClass = insurance === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorClass}`}>{insurance}</span>;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Units</h2>}
        >
            <Head title="Units" />

            <div className="py-12">
                <div className="max-w-full mx-auto sm:px-6 lg:px-8">
                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {flash.error}
                        </div>
                    )}

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-lg font-semibold text-gray-900">Total Units</h3>
                            <p className="text-3xl font-bold text-blue-600">{statistics.total}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-lg font-semibold text-gray-900">Vacant</h3>
                            <p className="text-3xl font-bold text-red-600">{statistics.vacant}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-lg font-semibold text-gray-900">Occupied</h3>
                            <p className="text-3xl font-bold text-green-600">{statistics.occupied}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-lg font-semibold text-gray-900">Listed</h3>
                            <p className="text-3xl font-bold text-purple-600">{statistics.listed}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-lg font-semibold text-gray-900">Total Applications</h3>
                            <p className="text-3xl font-bold text-orange-600">{statistics.total_applications}</p>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {/* Header and Add Button */}
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold">Units List</h3>
                                <Link
                                    href={route('units.create')}
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Add Unit
                                </Link>
                            </div>

                            {/* Filters */}
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
                                <input
                                    type="text"
                                    placeholder="City"
                                    value={searchFilters.city || ''}
                                    onChange={(e) => handleFilterChange('city', e.target.value)}
                                    className="border border-gray-300 rounded px-3 py-2"
                                />
                                <input
                                    type="text"
                                    placeholder="Property"
                                    value={searchFilters.property || ''}
                                    onChange={(e) => handleFilterChange('property', e.target.value)}
                                    className="border border-gray-300 rounded px-3 py-2"
                                />
                                <input
                                    type="text"
                                    placeholder="Unit Name"
                                    value={searchFilters.unit_name || ''}
                                    onChange={(e) => handleFilterChange('unit_name', e.target.value)}
                                    className="border border-gray-300 rounded px-3 py-2"
                                />
                                <select
                                    value={searchFilters.vacant || ''}
                                    onChange={(e) => handleFilterChange('vacant', e.target.value)}
                                    className="border border-gray-300 rounded px-3 py-2"
                                >
                                    <option value="">All Vacant Status</option>
                                    <option value="Yes">Vacant</option>
                                    <option value="No">Occupied</option>
                                </select>
                                <select
                                    value={searchFilters.listed || ''}
                                    onChange={(e) => handleFilterChange('listed', e.target.value)}
                                    className="border border-gray-300 rounded px-3 py-2"
                                >
                                    <option value="">All Listed Status</option>
                                    <option value="Yes">Listed</option>
                                    <option value="No">Not Listed</option>
                                </select>
                                <select
                                    value={searchFilters.insurance || ''}
                                    onChange={(e) => handleFilterChange('insurance', e.target.value)}
                                    className="border border-gray-300 rounded px-3 py-2"
                                >
                                    <option value="">All Insurance</option>
                                    <option value="Yes">Has Insurance</option>
                                    <option value="No">No Insurance</option>
                                </select>
                            </div>

                            {/* Units Table - ALL COLUMNS */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white border border-gray-300">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Name</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenants</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lease Start</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lease End</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beds</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Baths</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lease Status</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Rent</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recurring Transaction</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utility Status</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Number</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Insurance</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Insurance Exp.</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vacant</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Listed</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applications</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {units.data.map((unit) => (
                                            <tr key={unit.id} className="hover:bg-gray-50">
                                                {/* City */}
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {unit.city}
                                                </td>

                                                {/* Property */}
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {unit.property}
                                                </td>

                                                {/* Unit Name */}
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <span className="font-medium">{unit.unit_name}</span>
                                                </td>

                                                {/* Tenants */}
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {unit.tenants || '-'}
                                                </td>

                                                {/* Lease Start */}
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {unit.lease_start ? new Date(unit.lease_start).toLocaleDateString() : '-'}
                                                </td>

                                                {/* Lease End */}
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {unit.lease_end ? new Date(unit.lease_end).toLocaleDateString() : '-'}
                                                </td>

                                                {/* Count Beds */}
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {unit.count_beds || '-'}
                                                </td>

                                                {/* Count Baths */}
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {unit.count_baths || '-'}
                                                </td>

                                                {/* Lease Status */}
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {unit.lease_status || '-'}
                                                </td>

                                                {/* Monthly Rent */}
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <span className="font-medium">{unit.formatted_monthly_rent}</span>
                                                </td>

                                                {/* Recurring Transaction */}
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="max-w-32 truncate" title={unit.recurring_transaction || ''}>
                                                        {unit.recurring_transaction || '-'}
                                                    </div>
                                                </td>

                                                {/* Utility Status */}
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="max-w-24 truncate" title={unit.utility_status || ''}>
                                                        {unit.utility_status || '-'}
                                                    </div>
                                                </td>

                                                {/* Account Number */}
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="max-w-24 truncate" title={unit.account_number || ''}>
                                                        {unit.account_number || '-'}
                                                    </div>
                                                </td>

                                                {/* Insurance */}
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    {getInsuranceBadge(unit.insurance)}
                                                </td>

                                                {/* Insurance Expiration Date */}
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {unit.insurance_expiration_date ? new Date(unit.insurance_expiration_date).toLocaleDateString() : '-'}
                                                </td>

                                                {/* Vacant (Calculated) */}
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    {getVacantBadge(unit.vacant)}
                                                </td>

                                                {/* Listed (Calculated) */}
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    {getListedBadge(unit.listed)}
                                                </td>

                                                {/* Total Applications (Calculated) */}
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <span className="bg-orange-100 text-orange-800 px-2 py-1 text-xs font-semibold rounded-full">
                                                        {unit.total_applications}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <Link
                                                            href={route('units.show', unit.id)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                            title="View"
                                                        >
                                                            View
                                                        </Link>
                                                        <Link
                                                            href={route('units.edit', unit.id)}
                                                            className="text-yellow-600 hover:text-yellow-900"
                                                            title="Edit"
                                                        >
                                                            Edit
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(unit.id)}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Delete"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* No results message */}
                            {units.data.length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">No units found matching your criteria.</p>
                                </div>
                            )}

                            {/* Pagination */}
                            {units.last_page > 1 && (
                                <div className="mt-6 flex justify-center">
                                    <nav className="flex space-x-2">
                                        {units.links.map((link, index) => (
                                            <button
                                                key={index}
                                                onClick={() => link.url && router.get(link.url)}
                                                disabled={!link.url}
                                                className={`px-3 py-2 text-sm rounded ${
                                                    link.active
                                                        ? 'bg-blue-500 text-white'
                                                        : link.url
                                                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </nav>
                                </div>
                            )}

                            {/* Total count */}
                            <div className="mt-4 text-sm text-gray-600 text-center">
                                Showing {units.from} to {units.to} of {units.total} units
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
