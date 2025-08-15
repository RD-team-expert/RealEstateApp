import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/app-layout';
import { Tenant } from '@/types/tenant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const search = formData.get('search') as string;

        router.get(route('tenants.index'), { search }, {
            preserveState: true,
            replace: true,
        });
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

    return (
        <AppLayout>
            <Head title="Tenants" />

            <div className="py-12">
                <div className="max-w-full mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h1 className="text-2xl font-semibold">Tenants</h1>
                                <Link href={route('tenants.create')}>
                                    <Button>Add New Tenant</Button>
                                </Link>
                            </div>

                            <form onSubmit={handleSearch} className="mb-4">
                                <div className="flex gap-2">
                                    <Input
                                        name="search"
                                        placeholder="Search tenants..."
                                        defaultValue={search}
                                        className="max-w-sm"
                                    />
                                    <Button type="submit" variant="outline">
                                        Search
                                    </Button>
                                    {search && (
                                        <Link href={route('tenants.index')}>
                                            <Button type="button" variant="outline">
                                                Clear
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </form>

                            {/* Responsive table wrapper */}
                            <div className="overflow-x-auto">
                                <Table className="min-w-max">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="whitespace-nowrap">Property Name</TableHead>
                                            <TableHead className="whitespace-nowrap">Unit Number</TableHead>
                                            <TableHead className="whitespace-nowrap">First Name</TableHead>
                                            <TableHead className="whitespace-nowrap">Last Name</TableHead>
                                            <TableHead className="whitespace-nowrap">Street Address</TableHead>
                                            <TableHead className="whitespace-nowrap">Login Email</TableHead>
                                            <TableHead className="whitespace-nowrap">Alternate Email</TableHead>
                                            <TableHead className="whitespace-nowrap">Mobile</TableHead>
                                            <TableHead className="whitespace-nowrap">Emergency Phone</TableHead>
                                            <TableHead className="whitespace-nowrap">Payment Method</TableHead>
                                            <TableHead className="whitespace-nowrap">Has Insurance</TableHead>
                                            <TableHead className="whitespace-nowrap">Sensitive Communication</TableHead>
                                            <TableHead className="whitespace-nowrap">Has Assistance</TableHead>
                                            <TableHead className="whitespace-nowrap">Assistance Amount</TableHead>
                                            <TableHead className="whitespace-nowrap">Assistance Company</TableHead>
                                            <TableHead className="whitespace-nowrap">Created</TableHead>
                                            <TableHead className="whitespace-nowrap">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tenants.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={17} className="text-center py-4">
                                                    {search ? 'No tenants found matching your search.' : 'No tenants found.'}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            tenants.map((tenant) => (
                                                <TableRow key={tenant.id}>
                                                    <TableCell className="whitespace-nowrap font-medium">
                                                        {displayValue(tenant.property_name)}
                                                    </TableCell>
                                                    <TableCell className="whitespace-nowrap">
                                                        {displayValue(tenant.unit_number)}
                                                    </TableCell>
                                                    <TableCell className="whitespace-nowrap">
                                                        {displayValue(tenant.first_name)}
                                                    </TableCell>
                                                    <TableCell className="whitespace-nowrap">
                                                        {displayValue(tenant.last_name)}
                                                    </TableCell>
                                                    <TableCell className="max-w-[200px] truncate">
                                                        <span title={tenant.street_address_line || 'N/A'}>
                                                            {displayValue(tenant.street_address_line)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="max-w-[200px] truncate">
                                                        <span title={tenant.login_email || 'N/A'}>
                                                            {displayValue(tenant.login_email)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="max-w-[200px] truncate">
                                                        <span title={tenant.alternate_email || 'N/A'}>
                                                            {displayValue(tenant.alternate_email)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="whitespace-nowrap">
                                                        {displayValue(tenant.mobile)}
                                                    </TableCell>
                                                    <TableCell className="whitespace-nowrap">
                                                        {displayValue(tenant.emergency_phone)}
                                                    </TableCell>
                                                    <TableCell className="whitespace-nowrap">
                                                        {displayValue(tenant.cash_or_check)}
                                                    </TableCell>
                                                    <TableCell className="whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            tenant.has_insurance === 'Yes'
                                                                ? 'bg-green-100 text-green-800'
                                                                : tenant.has_insurance === 'No'
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {displayValue(tenant.has_insurance)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            tenant.sensitive_communication === 'Yes'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : tenant.sensitive_communication === 'No'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {displayValue(tenant.sensitive_communication)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            tenant.has_assistance === 'Yes'
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : tenant.has_assistance === 'No'
                                                                ? 'bg-gray-100 text-gray-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {displayValue(tenant.has_assistance)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="whitespace-nowrap">
                                                        {tenant.assistance_amount ? `$${tenant.assistance_amount}` : 'N/A'}
                                                    </TableCell>
                                                    <TableCell className="max-w-[150px] truncate">
                                                        <span title={tenant.assistance_company || 'N/A'}>
                                                            {displayValue(tenant.assistance_company)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="whitespace-nowrap">
                                                        {new Date(tenant.created_at).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="whitespace-nowrap">
                                                        <div className="flex gap-1">
                                                            <Link href={route('tenants.show', tenant.id)}>
                                                                <Button variant="outline" size="sm">
                                                                    View
                                                                </Button>
                                                            </Link>
                                                            <Link href={route('tenants.edit', tenant.id)}>
                                                                <Button variant="outline" size="sm">
                                                                    Edit
                                                                </Button>
                                                            </Link>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => handleDelete(tenant)}
                                                            >
                                                                Delete
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Summary information */}
                            <div className="mt-4 text-sm text-gray-600">
                                Showing {tenants.length} tenant{tenants.length !== 1 ? 's' : ''}
                                {search && ` matching "${search}"`}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
