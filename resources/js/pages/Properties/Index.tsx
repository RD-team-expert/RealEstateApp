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
import { usePermissions } from '@/hooks/usePermissions';
import { type BreadcrumbItem } from '@/types';
interface Props extends PageProps {
    properties: PaginatedProperties;
    statistics: PropertyStatistics;
    filters: PropertyFilters;
}

export default function Index({ auth, properties, statistics, filters }: Props) {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
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
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Active</Badge>;
    };

    const getDaysLeftBadge = (daysLeft: number) => {
        if (daysLeft < 0) {
            return <Badge variant="destructive">{Math.abs(daysLeft)} days overdue</Badge>;
        } else if (daysLeft <= 30) {
            return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">{daysLeft} days left</Badge>;
        } else {
            return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">{daysLeft} days left</Badge>;
        }
    };

    const calculateDaysLeft = (expirationDate: string): number => {
        const today = new Date();
        const expDate = new Date(expirationDate);
        const diffTime = expDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    return (
        <AppLayout >
            <Head title="Properties Insurance" />

            <div className="py-12 bg-background text-foreground transition-colors min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Flash Messages */}
                    {flash?.success && (
                        <Card className="mb-4 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                            <CardContent className="p-4">
                                <div className="text-green-700 dark:text-green-300">{flash.success}</div>
                            </CardContent>
                        </Card>
                    )}
                    {flash?.error && (
                        <Card className="mb-4 border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
                            <CardContent className="p-4">
                                <div className="text-red-700 dark:text-red-300">{flash.error}</div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Card className="bg-card text-card-foreground">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold text-foreground">Total Properties</h3>
                                <p className="text-3xl font-bold text-primary">{statistics.total}</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-card text-card-foreground">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold text-foreground">Active</h3>
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{statistics.active}</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-card text-card-foreground">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold text-foreground">Expired</h3>
                                <p className="text-3xl font-bold text-destructive">{statistics.expired}</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="bg-card text-card-foreground shadow-lg">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">Property Insurance List</CardTitle>
                                {hasAllPermissions(['properties.create','properties.store']) && (
                                <Link href={route('properties-info.create')}>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Property
                                    </Button>
                                </Link>)}
                            </div>

                            {/* Filters */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                                <Input
                                    type="text"
                                    placeholder="Property Name"
                                    value={searchFilters.property_name || ''}
                                    onChange={(e) => handleFilterChange('property_name', e.target.value)}
                                    className="bg-input text-input-foreground"
                                />
                                <Input
                                    type="text"
                                    placeholder="Insurance Company"
                                    value={searchFilters.insurance_company_name || ''}
                                    onChange={(e) => handleFilterChange('insurance_company_name', e.target.value)}
                                    className="bg-input text-input-foreground"
                                />
                                <Input
                                    type="text"
                                    placeholder="Policy Number"
                                    value={searchFilters.policy_number || ''}
                                    onChange={(e) => handleFilterChange('policy_number', e.target.value)}
                                    className="bg-input text-input-foreground"
                                />
                                <select
                                    value={searchFilters.status || ''}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
                                        <TableRow className="border-border">
                                            <TableHead className="text-muted-foreground">Property Name</TableHead>
                                            <TableHead className="text-muted-foreground">Insurance Company</TableHead>
                                            <TableHead className="text-muted-foreground">Amount</TableHead>
                                            <TableHead className="text-muted-foreground">Effective Date</TableHead>
                                            <TableHead className="text-muted-foreground">Policy Number</TableHead>
                                            <TableHead className="text-muted-foreground">Expiration Date</TableHead>
                                            <TableHead className="text-muted-foreground">Days Left</TableHead>
                                            <TableHead className="text-muted-foreground">Status</TableHead>
                                            {hasAnyPermission(['properties.destroy','properties.update','properties.edit','properties.show']) && (
                                            <TableHead className="text-muted-foreground">Actions</TableHead>)}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {properties.data.map((property) => (
                                            <TableRow key={property.id} className="hover:bg-muted/50 border-border">
                                                <TableCell className="font-medium text-foreground">{property.property_name}</TableCell>
                                                <TableCell className="text-foreground">{property.insurance_company_name}</TableCell>
                                                <TableCell className="text-foreground">{property.formatted_amount}</TableCell>
                                                <TableCell className="text-foreground">{property.effective_date}</TableCell>
                                                <TableCell className="text-foreground">{property.policy_number}</TableCell>
                                                <TableCell className="text-foreground">
                                                    {property.expiration_date}
                                                </TableCell>
                                                <TableCell>
                                                    {getDaysLeftBadge(calculateDaysLeft(property.expiration_date))}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(property)}
                                                </TableCell>
                                                {hasAnyPermission(['properties.destroy','properties.update','properties.edit','properties.show']) && (
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        {hasPermission('properties.show') && (
                                                        <Link href={route('properties-info.show', property.id)}>
                                                            <Button variant="outline" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>)}
                                                        {hasAllPermissions(['properties.update','properties.edit']) && (
                                                        <Link href={route('properties-info.edit', property.id)}>
                                                            <Button variant="outline" size="sm">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>)}
                                                        {hasPermission('properties.destroy') && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDelete(property)}
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>)}
                                                    </div>
                                                </TableCell>)}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {properties.data.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
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
                                                className={`px-3 py-2 text-sm rounded transition-colors ${
                                                    link.active
                                                        ? 'bg-primary text-primary-foreground'
                                                        : link.url
                                                        ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </nav>
                                </div>
                            )}

                            {/* Pagination info */}
                            {properties.meta && (
                                <div className="mt-6 flex justify-between items-center border-t border-border pt-4">
                                    <div className="text-sm text-muted-foreground">
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
