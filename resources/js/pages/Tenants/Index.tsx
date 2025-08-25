import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/app-layout';
import { Tenant } from '@/types/tenant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Eye, Plus, Search } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface Props {
    tenants: Tenant[];
    search?: string;
}

export default function Index({ tenants, search }: Props) {
    const { hasPermission, hasAnyPermission, hasAllPermissions} = usePermissions();
    const [searchTerm, setSearchTerm] = useState(search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('tenants.index'), { search: searchTerm }, { preserveState: true });
    };

    const handleDelete = (tenant: Tenant) => {
        if (confirm(`Are you sure you want to delete ${tenant.first_name} ${tenant.last_name}?`)) {
            router.delete(route('tenants.destroy', tenant.id));
        }
    };

    // Helper function to display values or 'N/A'
    const displayValue = (value: string | number | null | undefined): string => {
        if (value === null || value === undefined || value === '') {
            return 'N/A';
        }
        return String(value);
    };

    const getYesNoBadge = (value: 'Yes' | 'No' | string | null) => {
        if (value === null || value === undefined || value === '') return <Badge variant="outline">N/A</Badge>;
        return (
            <Badge variant={value === 'Yes' ? 'default' : 'secondary'}>
                {value}
            </Badge>
        );
    };

    const getInsuranceBadge = (value: 'Yes' | 'No' | string | null) => {
        if (value === null || value === undefined || value === '') return <Badge variant="outline">N/A</Badge>;
        return (
            <Badge variant={value === 'Yes' ? 'default' : 'destructive'}>
                {value}
            </Badge>
        );
    };

    const getSensitiveBadge = (value: 'Yes' | 'No' | string | null) => {
        if (value === null || value === undefined || value === '') return <Badge variant="outline">N/A</Badge>;
        return (
            <Badge variant={value === 'Yes' ? 'destructive' : 'default'}>
                {value}
            </Badge>
        );
    };

    const getAssistanceBadge = (value: 'Yes' | 'No' | string | null) => {
        if (value === null || value === undefined || value === '') return <Badge variant="outline">N/A</Badge>;
        return (
            <Badge variant={value === 'Yes' ? 'default' : 'secondary'}>
                {value}
            </Badge>
        );
    };

    return (
        <AppLayout>
            <Head title="Tenants" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">Tenants</CardTitle>
                                {hasAllPermissions(['tenants.create','tenants.store'])&&(
                                <Link href={route('tenants.create')}>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add New Tenant
                                    </Button>
                                </Link>)}
                            </div>
                            <form onSubmit={handleSearch} className="flex gap-2 mt-4">
                                <div className="flex-1">
                                    <Input
                                        type="text"
                                        placeholder="Search tenants..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <Button type="submit">
                                    <Search className="h-4 w-4" />
                                </Button>
                            </form>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Property Name</TableHead>
                                            <TableHead>Unit Number</TableHead>
                                            <TableHead>First Name</TableHead>
                                            <TableHead>Last Name</TableHead>
                                            <TableHead>Street Address</TableHead>
                                            <TableHead>Login Email</TableHead>
                                            <TableHead>Alternate Email</TableHead>
                                            <TableHead>Mobile</TableHead>
                                            <TableHead>Emergency Phone</TableHead>
                                            <TableHead>Payment Method</TableHead>
                                            <TableHead>Has Insurance</TableHead>
                                            <TableHead>Sensitive Communication</TableHead>
                                            <TableHead>Has Assistance</TableHead>
                                            <TableHead>Assistance Amount</TableHead>
                                            <TableHead>Assistance Company</TableHead>
                                            <TableHead>Created</TableHead>
                                            {hasAnyPermission(['tenants.show','tenants.edit','tenants.update','tenants.destroy'])&&(
                                            <TableHead>Actions</TableHead>)}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tenants.map((tenant) => (
                                            <TableRow key={tenant.id} className="hover:bg-gray-50">
                                                <TableCell className="font-medium">
                                                    {displayValue(tenant.property_name)}
                                                </TableCell>
                                                <TableCell>
                                                    {displayValue(tenant.unit_number)}
                                                </TableCell>
                                                <TableCell>
                                                    {displayValue(tenant.first_name)}
                                                </TableCell>
                                                <TableCell>
                                                    {displayValue(tenant.last_name)}
                                                </TableCell>
                                                <TableCell className="max-w-[200px]">
                                                    <div className="truncate" title={tenant.street_address_line || 'N/A'}>
                                                        {displayValue(tenant.street_address_line)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="max-w-[200px]">
                                                    <div className="truncate" title={tenant.login_email || 'N/A'}>
                                                        {displayValue(tenant.login_email)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="max-w-[200px]">
                                                    <div className="truncate" title={tenant.alternate_email || 'N/A'}>
                                                        {displayValue(tenant.alternate_email)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {displayValue(tenant.mobile)}
                                                </TableCell>
                                                <TableCell>
                                                    {displayValue(tenant.emergency_phone)}
                                                </TableCell>
                                                <TableCell>
                                                    {displayValue(tenant.cash_or_check)}
                                                </TableCell>
                                                <TableCell>
                                                    {getInsuranceBadge(tenant.has_insurance)}
                                                </TableCell>
                                                <TableCell>
                                                    {getSensitiveBadge(tenant.sensitive_communication)}
                                                </TableCell>
                                                <TableCell>
                                                    {getAssistanceBadge(tenant.has_assistance)}
                                                </TableCell>
                                                <TableCell>
                                                    {tenant.assistance_amount ? `$${tenant.assistance_amount}` : 'N/A'}
                                                </TableCell>
                                                <TableCell className="max-w-[150px]">
                                                    <div className="truncate" title={tenant.assistance_company || 'N/A'}>
                                                        {displayValue(tenant.assistance_company)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(tenant.created_at).toLocaleDateString()}
                                                </TableCell>
                                                {hasAnyPermission(['tenants.show','tenants.edit','tenants.update','tenants.destroy'])&&(
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        {hasPermission('tenants.show')&&(
                                                        <Link href={route('tenants.show', tenant.id)}>
                                                            <Button variant="outline" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>)}
                                                        {hasAllPermissions(['tenants.edit','tenants.update'])&&(
                                                        <Link href={route('tenants.edit', tenant.id)}>
                                                            <Button variant="outline" size="sm">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>)}
                                                        {hasPermission('tenants.destroy')&&(
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDelete(tenant)}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
                            {tenants.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <p className="text-lg">No tenants found.</p>
                                    <p className="text-sm">Try adjusting your search criteria.</p>
                                </div>
                            )}
                            {/* Summary information */}
                            <div className="mt-6 flex justify-between items-center">
                                <div className="text-sm text-gray-600">
                                    Showing {tenants.length} tenant{tenants.length !== 1 ? 's' : ''}
                                    {search && ` matching "${search}"`}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
