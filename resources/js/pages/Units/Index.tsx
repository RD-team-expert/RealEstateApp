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

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Units</h2>}
        >
            <Head title="Units" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
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

                            {/* Units Table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white border border-gray-300">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenants</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Rent</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vacant</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Listed</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applications</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {units.data.map((unit) => (
                                            <tr key={unit.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {unit.city}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {unit.property}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {unit.unit_name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {unit.tenants || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {unit.formatted_monthly_rent}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getVacantBadge(unit.vacant)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getListedBadge(unit.listed)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <span className="bg-orange-100 text-orange-800 px-2 py-1 text-xs font-semibold rounded-full">
                                                        {unit.total_applications}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <Link
                                                        href={route('units.show', unit.id)}
                                                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                    >
                                                        View
                                                    </Link>
                                                    <Link
                                                        href={route('units.edit', unit.id)}
                                                        className="text-yellow-600 hover:text-yellow-900 mr-3"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(unit.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

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
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
