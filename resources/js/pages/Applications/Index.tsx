// resources/js/Pages/Applications/Index.tsx
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { usePermissions } from '@/hooks/usePermissions';
import AppLayout from '@/layouts/app-layout';
import { Application, ApplicationFilters, PaginatedApplications } from '@/types/application';
import { PageProps } from '@/types/auth';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import ApplicationCreateDrawer from './ApplicationCreateDrawer';
import ApplicationEditDrawer from './ApplicationEditDrawer';
import ApplicationsTable from './index/ApplicationsTable';
import EmptyState from './index/EmptyState';
import FilterBar from './index/FilterBar';
import FlashMessages from './index/FlashMessages';
import PageHeader from './index/PageHeader';
import Pagination from './index/Pagination';

interface CityData {
    id: number;
    name: string;
}

interface PropertyData {
    id: number;
    name: string;
    city_id: number;
}

interface UnitData {
    id: number;
    name: string;
    property_id: number;
}

interface Props extends PageProps {
    applications: PaginatedApplications;
    filters: ApplicationFilters;
    cities: CityData[];
    properties: Record<string, PropertyData[]>;
    units: Record<string, UnitData[]>;
}

// CSV Export utility function
const exportToCSV = (data: Application[], filename: string = 'applications.csv') => {
    try {
        const formatString = (value: string | null | undefined) => {
            if (value === null || value === undefined) return '';
            return String(value).replace(/"/g, '""');
        };

        const formatDateOnly = (value?: string | null): string => {
            if (!value) return '';
            const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
            if (!m) return '';
            return value.substring(0, 10);
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
                            `"${formatString(application.unit_name)}"`,
                            `"${formatString(application.name)}"`,
                            `"${formatString(application.co_signer)}"`,
                            `"${formatString(application.status)}"`,
                            `"${formatDateOnly(application.date)}"`,
                            `"${formatString(application.stage_in_progress)}"`,
                            `"${formatString(application.notes)}"`,
                            `"${formatString(application.attachment_name)}"`,
                        ].join(',');
                    } catch (rowError) {
                        console.error('Error processing application row:', application, rowError);
                        return '';
                    }
                })
                .filter((row) => row !== ''),
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

export default function Index({ applications, cities, properties, units }: Props) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const { flash } = usePage().props;
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

    const [searchFilters, setSearchFilters] = useState({
        city: '',
        property: '',
        unit: '',
        name: '',
    });

    const handleSearch = (filters: { city: string; property: string; unit: string; name: string }) => {
        setSearchFilters(filters);
        router.get(route('applications.index'), filters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        const cleared = {
            city: '',
            property: '',
            unit: '',
            name: '',
        };
        setSearchFilters(cleared);
        router.get(route('applications.index'), {}, { preserveState: false });
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
            const filename = `applications-${new Date().toISOString().split('T')[0]}.csv`;
            exportToCSV(applications.data, filename);
            console.log('Export completed successfully');
        } catch (error) {
            console.error('Export failed:', error);
            alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsExporting(false);
        }
    };

    const handleDrawerSuccess = () => {
        router.get(route('applications.index'), searchFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleEditDrawerSuccess = () => {
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

    const hasCreatePermission = hasAllPermissions(['applications.create', 'applications.store']);
    const hasViewPermission = hasPermission('applications.show');
    const hasEditPermission = hasAnyPermission(['applications.edit', 'applications.update']);
    const hasDeletePermission = hasPermission('applications.destroy');
    const hasAnyActionPermission = hasAnyPermission([
        'applications.show',
        'applications.edit',
        'applications.update',
        'applications.destroy',
    ]);

    return (
        <AppLayout>
            <Head title="Applications" />
            <div className="min-h-screen bg-background py-12 text-foreground transition-colors">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <FlashMessages success={(flash as any)?.success} error={(flash as any)?.error} />

                    <PageHeader
                        onExport={handleCSVExport}
                        onAddNew={() => setIsDrawerOpen(true)}
                        isExporting={isExporting}
                        hasExportData={!!(applications?.data && applications.data.length > 0)}
                        hasCreatePermission={hasCreatePermission}
                    />

                    <Card className="bg-card text-card-foreground shadow-lg">
                        <CardHeader>
                            <FilterBar
                                cities={cities}
                                properties={properties}
                                units={units}
                                onSearch={handleSearch}
                                onClear={handleClearFilters}
                            />
                        </CardHeader>

                        <CardContent>
                            {applications.data.length > 0 ? (
                                <>
                                    <ApplicationsTable
                                        applications={applications.data}
                                        onEdit={handleEditClick}
                                        onDelete={handleDelete}
                                        hasViewPermission={hasViewPermission}
                                        hasEditPermission={hasEditPermission}
                                        hasDeletePermission={hasDeletePermission}
                                        hasAnyActionPermission={hasAnyActionPermission}
                                    />
                                    <Pagination links={applications.links} lastPage={applications.last_page} />
                                </>
                            ) : (
                                <EmptyState />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <ApplicationCreateDrawer
                cities={cities}
                properties={properties}
                units={units}
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                onSuccess={handleDrawerSuccess}
            />

            {selectedApplication && (
                <ApplicationEditDrawer
                    application={selectedApplication}
                    cities={cities}
                    properties={properties}
                    units={units}
                    open={isEditDrawerOpen}
                    onOpenChange={setIsEditDrawerOpen}
                    onSuccess={handleEditDrawerSuccess}
                />
            )}
        </AppLayout>
    );
}
