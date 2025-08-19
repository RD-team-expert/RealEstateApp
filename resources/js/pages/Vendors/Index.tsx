import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Trash2, Edit, Eye, Plus, Search } from 'lucide-react';
import { VendorInfo, PaginatedVendors, VendorFilters, VendorStatistics } from '@/types/vendor';
import { PageProps } from '@/types/vendor';

interface Props extends PageProps {
    vendors: PaginatedVendors;
    statistics: VendorStatistics;
    filters: VendorFilters;
    cities: string[];
}

export default function Index({ auth, vendors, statistics, filters, cities }: Props) {
    const [searchFilters, setSearchFilters] = useState<VendorFilters>(filters);
    const { flash } = usePage().props;

    const handleFilterChange = (key: keyof VendorFilters, value: string) => {
        const newFilters = { ...searchFilters, [key]: value };
        setSearchFilters(newFilters);
        router.get(route('vendors.index'), newFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDelete = (vendor: VendorInfo) => {
        if (confirm('Are you sure you want to delete this vendor?')) {
            router.delete(route('vendors.destroy', vendor.id));
        }
    };

    return (
        <AppLayout>
            <Head title="Vendors" />

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
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900">Total Vendors</h3>
                                <p className="text-3xl font-bold text-blue-600">{statistics.total}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900">With Email</h3>
                                <p className="text-3xl font-bold text-green-600">{statistics.with_email}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900">With Phone</h3>
                                <p className="text-3xl font-bold text-purple-600">{statistics.with_number}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900">Cities</h3>
                                <p className="text-3xl font-bold text-orange-600">{Object.keys(statistics.city_counts).length}</p>
                            </CardContent>
                        </Card>
                        {/* Vendors by City */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Vendors by City</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {Object.entries(statistics.city_counts).map(([city, count]) => (
                                    <div key={city} className="text-center">
                                        <p className="text-sm text-gray-600">{city}</p>
                                        <p className="text-xl font-bold text-blue-600">{count}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    </div>



                    <Card className="mt-6">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">Vendors List</CardTitle>
                                <Link href={route('vendors.create')}>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Vendor
                                    </Button>
                                </Link>
                            </div>
                            {/* Filters */}
                            <div className="mt-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <Input
                                        type="text"
                                        placeholder="City"
                                        value={searchFilters.city || ''}
                                        onChange={(e) => handleFilterChange('city', e.target.value)}
                                    />
                                    <Input
                                        type="text"
                                        placeholder="Vendor Name"
                                        value={searchFilters.vendor_name || ''}
                                        onChange={(e) => handleFilterChange('vendor_name', e.target.value)}
                                    />
                                    <Input
                                        type="text"
                                        placeholder="Number"
                                        value={searchFilters.number || ''}
                                        onChange={(e) => handleFilterChange('number', e.target.value)}
                                    />
                                    <Input
                                        type="email"
                                        placeholder="Email"
                                        value={searchFilters.email || ''}
                                        onChange={(e) => handleFilterChange('email', e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>City</TableHead>
                                            <TableHead>Vendor Name</TableHead>
                                            <TableHead>Number</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {vendors.data.map((vendor) => (
                                            <TableRow key={vendor.id} className="hover:bg-gray-50">
                                                <TableCell className="font-medium">{vendor.city}</TableCell>
                                                <TableCell>{vendor.vendor_name}</TableCell>
                                                <TableCell>{vendor.number || '-'}</TableCell>
                                                <TableCell>
                                                    {vendor.email
                                                        ? <a href={`mailto:${vendor.email}`} className="text-blue-600 hover:text-blue-900">{vendor.email}</a>
                                                        : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        <Link href={route('vendors.show', vendor.id)}>
                                                            <Button variant="outline" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Link href={route('vendors.edit', vendor.id)}>
                                                            <Button variant="outline" size="sm">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDelete(vendor)}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            {vendors.data.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <p className="text-lg">No vendors found.</p>
                                    <p className="text-sm">Try adjusting your search filters.</p>
                                </div>
                            )}
                            {/* Pagination */}
                            {vendors.last_page > 1 && (
                                <div className="mt-6 flex justify-center">
                                    <nav className="flex space-x-2">
                                        {vendors.links.map((link, index) => (
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
                            {/* Record count */}
                            <div className="mt-4 text-sm text-gray-600 text-center">
                                Showing {vendors.from || 0} to {vendors.to || 0} of {vendors.total || 0} vendors
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
