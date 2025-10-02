// resources/js/Pages/Applications/Index.tsx
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePermissions } from '@/hooks/usePermissions';
import AppLayout from '@/layouts/app-layout';
import { Application, ApplicationFilters, ApplicationStatistics, PaginatedApplications, UnitData } from '@/types/application';
import { PageProps } from '@/types/auth';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Download, Edit, Eye, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import ApplicationCreateDrawer from './ApplicationCreateDrawer';
import ApplicationEditDrawer from './ApplicationEditDrawer';

// CSV Export utility function
const exportToCSV = (data: Application[], filename: string = 'applications.csv') => {
    try {
        const formatDate = (dateStr: string | null | undefined) => {
            if (!dateStr) return '';
            try {
                return new Date(dateStr).toLocaleDateString();
            } catch (error) {
                return dateStr || '';
            }
        };

        const formatString = (value: string | null | undefined) => {
            if (value === null || value === undefined) return '';
            return String(value).replace(/"/g, '""');
        };

        const headers = ['ID', 'City', 'Property', 'Unit', 'Name', 'Co-signer', 'Status', 'Date', 'Stage in Progress', 'Notes', 'Attachment Name'];

        const csvData = [
            headers.join(','),
            ...data
                .map((application) => {
                    try {
                        return [
                            application.id || '',
                            `"${formatString(application.city)}"`,
                            `"${formatString(application.property)}"`,
                            `"${formatString(application.unit)}"`,
                            `"${formatString(application.name)}"`,
                            `"${formatString(application.co_signer)}"`,
                            `"${formatString(application.status)}"`,
                            `"${formatDate(application.date)}"`,
                            `"${formatString(application.stage_in_progress)}"`,
                            `"${formatString(application.notes)}"`,
                            `"${formatString(application.attachment_name)}"`,
                        ].join(',');
                    } catch (rowError) {
                        console.error('Error processing application row:', application, rowError);
                        return ''; // Skip problematic rows
                    }
                })
                .filter((row) => row !== ''), // Remove empty rows
        ].join('\n');

        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return true;
    } catch (error) {
        console.error('CSV Export Error:', error);
        throw error;
    }
};

interface Props extends PageProps {
    applications: PaginatedApplications;
    statistics: ApplicationStatistics;
    filters: ApplicationFilters;
    units: UnitData[];
    cities: string[];
    properties: Record<string, string[]>;
    unitsByProperty: Record<string, Record<string, string[]>>;
}

export default function Index({ applications, statistics, filters, units, cities, properties, unitsByProperty }: Props) {
    const [searchFilters, setSearchFilters] = useState<ApplicationFilters>(filters);
    const [isExporting, setIsExporting] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
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

    const handleCSVExport = () => {
        if (!applications || !applications.data || applications.data.length === 0) {
            alert('No data to export');
            return;
        }

        setIsExporting(true);

        try {
            console.log('Exporting applications data:', applications.data); // Debug log
            const filename = `applications-${new Date().toISOString().split('T')[0]}.csv`;
            exportToCSV(applications.data, filename);

            // Success feedback
            console.log('Export completed successfully');
        } catch (error) {
            console.error('Export failed:', error);
            alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the console for details.`);
        } finally {
            setIsExporting(false);
        }
    };

    const getStatusBadge = (status: string | null) => {
        if (!status) return <Badge variant="outline">No Status</Badge>;
        return <Badge variant="default">{status}</Badge>;
    };

    const handleDrawerSuccess = () => {
        // Refresh the page data after successful creation
        router.get(route('applications.index'), searchFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleEditDrawerSuccess = () => {
        // Refresh the page data after successful edit
        router.get(route('applications.index'), searchFilters, {
            preserveState: true,
            preserveScroll: true,
        });
        setIsEditDrawerOpen(false);
        setSelectedApplication(null);
    };

    const handleEditClick = (application: Application) => {
        setSelectedApplication(application);
        setIsEditDrawerOpen(true);
    };

    return (
        <AppLayout>
            <Head title="Applications" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Flash Messages */}
                    {(flash as any)?.success && (
                        <div className="mb-4 rounded border border-chart-1 bg-chart-1/20 px-4 py-3 text-chart-1">{(flash as any)?.success}</div>
                    )}
                    {(flash as any)?.error && (
                        <div className="mb-4 rounded border border-destructive bg-destructive/20 px-4 py-3 text-destructive">
                            {(flash as any)?.error}
                        </div>
                    )}

                    {/* Statistics Cards */}
                    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
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
                                    {Object.entries(statistics.stage_counts)
                                        .slice(0, 5)
                                        .map(([stage, count]) => (
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
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-2xl">Applications</CardTitle>
                                <div className="flex items-center gap-2">
                                    {/* Export Button */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCSVExport}
                                        disabled={isExporting || !applications?.data || applications.data.length === 0}
                                        className="flex items-center"
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        {isExporting ? 'Exporting...' : 'Export CSV'}
                                    </Button>

                                    {hasAllPermissions(['applications.create', 'applications.store']) && (
                                        <Button onClick={() => setIsDrawerOpen(true)}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Application
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="mt-4 space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
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
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
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
                                            {hasAnyPermission([
                                                'applications.show',
                                                'applications.edit',
                                                'applications.update',
                                                'applications.destroy',
                                            ]) && <TableHead>Actions</TableHead>}
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
                                                <TableCell>{getStatusBadge(application.status)}</TableCell>
                                                <TableCell>{application.date ? new Date(application.date).toLocaleDateString() : 'N/A'}</TableCell>
                                                <TableCell>{application.stage_in_progress || 'N/A'}</TableCell>
                                                <TableCell>{application.notes || 'N/A'}</TableCell>
                                                <TableCell>
                                                    {application.attachment_name ? (
                                                        <a
                                                            href={`/applications/${application.id}/download`}
                                                            className="text-sm text-primary hover:underline"
                                                        >
                                                            {application.attachment_name}
                                                        </a>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">No attachment</span>
                                                    )}
                                                </TableCell>
                                                {hasAnyPermission([
                                                    'applications.show',
                                                    'applications.edit',
                                                    'applications.update',
                                                    'applications.destroy',
                                                ]) && (
                                                    <TableCell>
                                                        <div className="flex gap-1">
                                                            {hasPermission('applications.show') && (
                                                                <Link href={route('applications.show', application.id)}>
                                                                    <Button variant="outline" size="sm">
                                                                        <Eye className="h-4 w-4" />
                                                                    </Button>
                                                                </Link>
                                                            )}
                                                            {hasAnyPermission(['applications.edit', 'applications.update']) && (
                                                                <Button 
                                                                    variant="outline" 
                                                                    size="sm"
                                                                    onClick={() => handleEditClick(application)}
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            {hasPermission('applications.destroy') && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleDelete(application)}
                                                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {applications.data.length === 0 && (
                                <div className="py-8 text-center text-muted-foreground">
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
                                                className={`rounded px-3 py-2 text-sm ${
                                                    link.active
                                                        ? 'bg-primary text-primary-foreground'
                                                        : link.url
                                                          ? 'bg-muted text-foreground hover:bg-accent'
                                                          : 'cursor-not-allowed bg-muted text-muted-foreground'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </nav>
                                </div>
                            )}

                            {/* Pagination info */}
                            {/* {applications.meta && (
                                <div className="mt-6 flex justify-between items-center">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {applications.meta.from || 0} to {applications.meta.to || 0} of {applications.meta.total || 0} results
                                    </div>
                                </div>
                            )} */}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Application Create Drawer */}
            <ApplicationCreateDrawer
                units={units}
                cities={cities}
                properties={properties}
                unitsByProperty={unitsByProperty}
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                onSuccess={handleDrawerSuccess}
            />

            {/* Application Edit Drawer */}
            {selectedApplication && (
                <ApplicationEditDrawer
                    application={selectedApplication}
                    units={units}
                    cities={cities}
                    properties={properties}
                    unitsByProperty={unitsByProperty}
                    open={isEditDrawerOpen}
                    onOpenChange={setIsEditDrawerOpen}
                    onSuccess={handleEditDrawerSuccess}
                />
            )}
        </AppLayout>
    );
}
