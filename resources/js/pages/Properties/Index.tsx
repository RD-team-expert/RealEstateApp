// resources/js/Pages/Properties/Index.tsx
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
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Eye, Plus, Search } from 'lucide-react';
import { Property, PaginatedProperties, PropertyFilters, PropertyStatistics } from '@/types/property';
import type { PageProps } from '@/types/property';

interface Props extends PageProps {
    properties: PaginatedProperties;
    statistics: PropertyStatistics;
    filters: PropertyFilters;
}

export default function Index({ auth, properties, statistics, filters }: Props) {
    const [searchFilters, setSearchFilters] = useState<PropertyFilters>(filters);
    const { flash } = usePage().props;

    const handleFilterChange = (key: keyof PropertyFilters, value: string) => {
        const newFilters = { ...searchFilters, [key]: value };
        setSearchFilters(newFilters);

        router.get(route('properties-info.index'), newFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDelete = (property: Property) => {
        if (confirm('Are you sure you want to delete this property?')) {
            router.delete(route('properties-info.destroy', property.id));
        }
    };

    const getStatusBadge = (property: Property) => {
        if (property.status === 'Expired') {
            return <Badge variant="destructive">Expired</Badge>;
        }
        return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
    };

    const calculateDaysLeft = (expirationDate: string): number => {
        const today = new Date();
        const expDate = new Date(expirationDate);
        const diffTime = expDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    return (
        <AppLayout>
            <Head title="Properties Insurance" />

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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900">Total Properties</h3>
                                <p className="text-3xl font-bold text-blue-600">{statistics.total}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900">Active</h3>
                                <p className="text-3xl font-bold text-green-600">{statistics.active}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900">Expired</h3>
                                <p className="text-3xl font-bold text-red-600">{statistics.expired}</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">Property Insurance List</CardTitle>
                                <Link href={route('properties-info.create')}>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Property
                                    </Button>
                                </Link>
                            </div>

                            {/* Filters */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                                <Input
                                    type="text"
                                    placeholder="Property Name"
                                    value={searchFilters.property_name || ''}
                                    onChange={(e) => handleFilterChange('property_name', e.target.value)}
                                />
                                <Input
                                    type="text"
                                    placeholder="Insurance Company"
                                    value={searchFilters.insurance_company_name || ''}
                                    onChange={(e) => handleFilterChange('insurance_company_name', e.target.value)}
                                />
                                <Input
                                    type="text"
                                    placeholder="Policy Number"
                                    value={searchFilters.policy_number || ''}
                                    onChange={(e) => handleFilterChange('policy_number', e.target.value)}
                                />
                                <select
                                    value={searchFilters.status || ''}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">All Status</option>
                                    <option value="Active">Active</option>
                                    <option value="Expired">Expired</option>
                                </select>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Property Name</TableHead>
                                            <TableHead>Insurance Company</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Effective Date</TableHead>
                                            <TableHead>Policy Number</TableHead>
                                            <TableHead>Expiration Date</TableHead>
                                            <TableHead>Days Left</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {properties.data.map((property) => (
                                            <TableRow key={property.id} className="hover:bg-gray-50">
                                                <TableCell className="font-medium">{property.property_name}</TableCell>
                                                <TableCell>{property.insurance_company_name}</TableCell>
                                                <TableCell>{property.formatted_amount}</TableCell>
                                                <TableCell>{property.effective_date}</TableCell>
                                                <TableCell>{property.policy_number}</TableCell>
                                                <TableCell>
                                                    {property.expiration_date}
                                                </TableCell>
                                                <TableCell>{calculateDaysLeft(property.expiration_date)}</TableCell>
                                                <TableCell>
                                                    {getStatusBadge(property)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        <Link href={route('properties-info.show', property.id)}>
                                                            <Button variant="outline" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Link href={route('properties-info.edit', property.id)}>
                                                            <Button variant="outline" size="sm">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDelete(property)}
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

                            {properties.data.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <p className="text-lg">No properties found.</p>
                                    <p className="text-sm">Try adjusting your search criteria.</p>
                                </div>
                            )}

                            {/* Pagination */}
                            {properties.last_page > 1 && (
                                <div className="mt-6 flex justify-center">
                                    <nav className="flex space-x-2">
                                        {properties.links.map((link, index) => (
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

                            {/* Pagination info */}
                            {properties.meta && (
                                <div className="mt-6 flex justify-between items-center">
                                    <div className="text-sm text-gray-600">
                                        Showing {properties.meta.from || 0} to {properties.meta.to || 0} of {properties.meta.total || 0} results
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
