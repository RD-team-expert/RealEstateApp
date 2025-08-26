// resources/js/Pages/Applications/Index.tsx
import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePermissions } from '@/hooks/usePermissions';
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
import { Application, PaginatedApplications, ApplicationFilters, ApplicationStatistics } from '@/types/application';
import { PageProps } from '@/types/application';

interface Props extends PageProps {
    applications: PaginatedApplications;
    statistics: ApplicationStatistics;
    filters: ApplicationFilters;
}

export default function Index({ auth, applications, statistics, filters }: Props) {
    const [searchFilters, setSearchFilters] = useState<ApplicationFilters>(filters);
    const { flash } = usePage().props;
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

    const handleFilterChange = (key: keyof ApplicationFilters, value: string) => {
        const newFilters = { ...searchFilters, [key]: value };
        setSearchFilters(newFilters);
        router.get(route('applications.index'), newFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDelete = (application: Application) => {
        if (confirm('Are you sure you want to delete this application?')) {
            router.delete(route('applications.destroy', application.id));
        }
    };

    const getStatusBadge = (status: string | null) => {
        if (!status) return <Badge variant="outline">No Status</Badge>;
        return <Badge variant="default">{status}</Badge>;
    };

    return (
        <AppLayout>
            <Head title="Applications" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="mb-4 bg-chart-1/20 border border-chart-1 text-chart-1 px-4 py-3 rounded">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-4 bg-destructive/20 border border-destructive text-destructive px-4 py-3 rounded">
                            {flash.error}
                        </div>
                    )}

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold text-foreground">Total Applications</h3>
                                <p className="text-3xl font-bold text-primary">{statistics.total}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold text-foreground">By Status</h3>
                                <div className="mt-2 space-y-1">
                                    {Object.entries(statistics.status_counts).map(([status, count]) => (
                                        <div key={status} className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">{status || 'No Status'}:</span>
                                            <span className="font-semibold text-foreground">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold text-foreground">By Stage</h3>
                                <div className="mt-2 space-y-1">
                                    {Object.entries(statistics.stage_counts).slice(0, 5).map(([stage, count]) => (
                                        <div key={stage} className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">{stage || 'No Stage'}:</span>
                                            <span className="font-semibold text-foreground">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">Applications</CardTitle>
                                {hasAllPermissions(['applications.create','applications.store']) && (
                                <Link href={route('applications.create')}>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Application
                                    </Button>
                                </Link>)}
                            </div>

                            {/* Filters */}
                            <div className="space-y-4 mt-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <Input
                                        type="text"
                                        placeholder="Property"
                                        value={searchFilters.property || ''}
                                        onChange={(e) => handleFilterChange('property', e.target.value)}
                                    />
                                    <Input
                                        type="text"
                                        placeholder="Name"
                                        value={searchFilters.name || ''}
                                        onChange={(e) => handleFilterChange('name', e.target.value)}
                                    />
                                    <Input
                                        type="text"
                                        placeholder="Unit"
                                        value={searchFilters.unit || ''}
                                        onChange={(e) => handleFilterChange('unit', e.target.value)}
                                    />
                                    <Input
                                        type="text"
                                        placeholder="Status"
                                        value={searchFilters.status || ''}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <Input
                                        type="text"
                                        placeholder="Co-signer"
                                        value={searchFilters.co_signer || ''}
                                        onChange={(e) => handleFilterChange('co_signer', e.target.value)}
                                    />
                                    <Input
                                        type="text"
                                        placeholder="Stage in Progress"
                                        value={searchFilters.stage_in_progress || ''}
                                        onChange={(e) => handleFilterChange('stage_in_progress', e.target.value)}
                                    />
                                    <Input
                                        type="date"
                                        placeholder="Date From"
                                        value={searchFilters.date_from || ''}
                                        onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                    />
                                    <Input
                                        type="date"
                                        placeholder="Date To"
                                        value={searchFilters.date_to || ''}
                                        onChange={(e) => handleFilterChange('date_to', e.target.value)}
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
                                            <TableHead>Property</TableHead>
                                            <TableHead>Unit</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Co-signer</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Stage</TableHead>
                                            <TableHead>Note</TableHead>
                                            <TableHead>Attachment</TableHead>
                                            {hasAnyPermission(['applications.show','applications.edit','applications.update','applications.destroy']) && (
                                            <TableHead>Actions</TableHead>)}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {applications.data.map((application) => (
                                            <TableRow key={application.id} className="hover:bg-muted/50">
                                                <TableCell className="font-medium">{application.city}</TableCell>
                                                <TableCell className="font-medium">{application.property}</TableCell>
                                                <TableCell>{application.unit}</TableCell>
                                                <TableCell>{application.name}</TableCell>
                                                <TableCell>{application.co_signer}</TableCell>
                                                <TableCell>
                                                    {getStatusBadge(application.status)}
                                                </TableCell>
                                                <TableCell>
                                                    {application.date
                                                        ? new Date(application.date).toLocaleDateString()
                                                        : 'N/A'
                                                    }
                                                </TableCell>
                                                <TableCell>{application.stage_in_progress || 'N/A'}</TableCell>
                                                <TableCell>{application.notes || 'N/A'}</TableCell>
                                                <TableCell>
                                                    {application.attachment_name ? (
                                                        <a
                                                            href={`/applications/${application.id}/download`}
                                                            className="text-primary hover:underline text-sm"
                                                        >
                                                            {application.attachment_name}
                                                        </a>
                                                    ) : (
                                                        <span className="text-muted-foreground text-sm">No attachment</span>
                                                    )}
                                                </TableCell>
                                                {hasAnyPermission(['applications.show','applications.edit','applications.update','applications.destroy']) && (
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        {hasPermission('applications.show') && (
                                                        <Link href={route('applications.show', application.id)}>
                                                            <Button variant="outline" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>)}
                                                        {hasAnyPermission(['applications.edit','applications.update']) && (
                                                        <Link href={route('applications.edit', application.id)}>
                                                            <Button variant="outline" size="sm">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>)}
                                                        {hasPermission('applications.destroy') && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDelete(application)}
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
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

                            {applications.data.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p className="text-lg">No applications found.</p>
                                    <p className="text-sm">Try adjusting your search criteria.</p>
                                </div>
                            )}

                            {/* Pagination */}
                            {applications.last_page > 1 && (
                                <div className="mt-6 flex justify-center">
                                    <nav className="flex space-x-2">
                                        {applications.links.map((link, index) => (
                                            <button
                                                key={index}
                                                onClick={() => link.url && router.get(link.url)}
                                                disabled={!link.url}
                                                className={`px-3 py-2 text-sm rounded ${
                                                    link.active
                                                        ? 'bg-primary text-primary-foreground'
                                                        : link.url
                                                        ? 'bg-muted text-foreground hover:bg-accent'
                                                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </nav>
                                </div>
                            )}

                            {/* Pagination info */}
                            {applications.meta && (
                                <div className="mt-6 flex justify-between items-center">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {applications.meta.from || 0} to {applications.meta.to || 0} of {applications.meta.total || 0} results
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
