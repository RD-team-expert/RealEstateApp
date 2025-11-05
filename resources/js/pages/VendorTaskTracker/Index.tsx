import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { usePermissions } from '@/hooks/usePermissions';
import AppLayout from '@/layouts/app-layout';
import { VendorTaskTracker } from '@/types/vendor-task-tracker';
import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import  { useState } from 'react';
import EmptyState from './index/EmptyState';
import FilterBar from './index/FilterBar';
import PageHeader from './index/PageHeader';
import PaginationInfo from './index/PaginationInfo';
import TaskTable from './index/TaskTable';
import VendorTaskTrackerCreateDrawer from './VendorTaskTrackerCreateDrawer';
import VendorTaskTrackerEditDrawer from './VendorTaskTrackerEditDrawer';


/**
 * Always treat the value as a date-only (no time, no TZ).
 * Works for "YYYY-MM-DD" and for ISO strings by grabbing the first 10 chars.
 */
const formatDateOnly = (value?: string | null, fallback = '-'): string => {
    if (!value) return fallback;

    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (!m) return fallback;

    const [, y, mo, d] = m;
    const date = new Date(Number(y), Number(mo) - 1, Number(d));
    return format(date, 'P');
};


// Export utility function
const exportToCSV = (data: VendorTaskTracker[], filename: string = 'vendor-tasks.csv') => {
    const headers = [
        'ID',
        'City',
        'Property',
        'Unit Name',
        'Vendor Name',
        'Submission Date',
        'Assigned Tasks',
        'Scheduled Visits',
        'Task End Date',
        'Notes',
        'Status',
        'Urgent',
    ];

    const csvData = [
        headers.join(','),
        ...data.map((task) => {
            return [
                task.id,
                `"${task.city || ''}"`,
                `"${task.property_name || ''}"`,
                `"${task.unit_name || ''}"`,
                `"${task.vendor_name || ''}"`,
                `"${formatDateOnly(task.task_submission_date, '')}"`,
                `"${(task.assigned_tasks || '').replace(/"/g, '""')}"`,
                `"${formatDateOnly(task.any_scheduled_visits, '')}"`,
                `"${formatDateOnly(task.task_ending_date, '')}"`,
                `"${(task.notes || '').replace(/"/g, '""')}"`,
                `"${task.status || ''}"`,
                `"${task.urgent}"`,
            ].join(',');
        }),
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
};


interface CityOption {
    id: number;
    city: string;
}


interface PropertyOption {
    id: number;
    property_name: string;
    city?: string;
}


interface UnitOption {
    id: number;
    unit_name: string;
    property_name?: string;
    city?: string;
}


interface VendorOption {
    id: number;
    vendor_name: string;
    city?: string;
}


interface Props {
    tasks: {
        data: VendorTaskTracker[];
        links: any[];
        meta: any;
    };
    filters: {
        search?: string;
        city?: string;
        property?: string;
        unit_name?: string;
        vendor_name?: string;
        status?: string;
    };
    cities: CityOption[];
    properties: PropertyOption[];
    units: UnitOption[];
    vendors: VendorOption[];
    unitsByCity: Record<string, UnitOption[]>;
    propertiesByCity: Record<string, PropertyOption[]>;
    unitsByProperty: Record<string, Record<string, UnitOption[]>>;
    vendorsByCity: Record<string, VendorOption[]>;
}


export default function Index({
    tasks,
    filters,
    units,
    cities,
    properties,
    unitsByCity,
    propertiesByCity,
    unitsByProperty,
    vendorsByCity,
    vendors,
}: Props) {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

    const [isExporting, setIsExporting] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<VendorTaskTracker | null>(null);

    const handleDrawerSuccess = () => {
        // Preserve current filters when redirecting after create
        const currentFilters: Record<string, string> = {};
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                currentFilters[key] = String(value);
            }
        });

        router.get(route('vendor-task-tracker.index'), currentFilters, {
            preserveState: false,
            preserveScroll: true,
        });
        setIsDrawerOpen(false);
    };

    const handleEditDrawerSuccess = () => {
        // Preserve current filters when redirecting after edit
        const currentFilters: Record<string, string> = {};
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                currentFilters[key] = String(value);
            }
        });

        router.get(route('vendor-task-tracker.index'), currentFilters, {
            preserveState: false,
            preserveScroll: true,
        });
        setIsEditDrawerOpen(false);
        setSelectedTask(null);
    };

    const handleEditTask = (task: VendorTaskTracker) => {
        setSelectedTask(task);
        setIsEditDrawerOpen(true);
    };

    const handleDelete = (task: VendorTaskTracker) => {
        if (confirm('Are you sure you want to archive this task?')) {
            // Preserve current filters when redirecting after delete
            const currentFilters: Record<string, string> = {};
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    currentFilters[key] = String(value);
                }
            });

            router.delete(route('vendor-task-tracker.destroy', task.id), {
                onSuccess: () => {
                    router.get(route('vendor-task-tracker.index'), currentFilters, {
                        preserveState: false,
                        preserveScroll: true,
                    });
                }
            });
        }
    };

    const handleCSVExport = () => {
        if (tasks.data.length === 0) {
            alert('No data to export');
            return;
        }

        setIsExporting(true);
        try {
            const filename = `vendor-tasks-${new Date().toISOString().split('T')[0]}.csv`;
            exportToCSV(tasks.data, filename);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    const handleSearch = (searchFilters: any) => {
        const filterParams: Record<string, string> = {};
        Object.entries(searchFilters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                filterParams[key] = String(value);
            }
        });

        router.get(route('vendor-task-tracker.index'), filterParams, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        router.get(
            route('vendor-task-tracker.index'),
            {},
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const permissions = {
        canView: hasPermission('vendor-task-tracker.show'),
        canEdit: hasAllPermissions(['vendor-task-tracker.edit', 'vendor-task-tracker.update']),
        canDelete: hasPermission('vendor-task-tracker.destroy'),
        hasAnyPermission: hasAnyPermission([
            'vendor-task-tracker.show',
            'vendor-task-tracker.edit',
            'vendor-task-tracker.update',
            'vendor-task-tracker.destroy',
        ]),
    };

    return (
        <AppLayout>
            <Head title="Vendor Task Tracker" />

            <div className="min-h-screen bg-background py-12 text-foreground transition-colors">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <PageHeader
                        onExport={handleCSVExport}
                        onAddTask={() => setIsDrawerOpen(true)}
                        isExporting={isExporting}
                        hasExportData={tasks.data.length > 0}
                        canCreate={hasAllPermissions([
                            'vendor-task-tracker.create',
                            'vendor-task-tracker.store',
                        ])}
                    />

                    <Card className="bg-card text-card-foreground shadow-lg">
                        <CardHeader>
                            <FilterBar
                                filters={filters}
                                cities={cities}
                                properties={properties}
                                vendors={vendors}
                                onSearch={handleSearch}
                                onClear={handleClearFilters}
                            />
                        </CardHeader>

                        <CardContent>
                            {tasks.data.length > 0 ? (
                                <>
                                    <TaskTable
                                        tasks={tasks.data}
                                        formatDateOnly={formatDateOnly}
                                        onEdit={handleEditTask}
                                        onDelete={handleDelete}
                                        permissions={permissions}
                                    />
                                    <PaginationInfo meta={tasks.meta} />
                                </>
                            ) : (
                                <EmptyState />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Vendor Task Tracker Create Drawer */}
            <VendorTaskTrackerCreateDrawer
                cities={cities}
                properties={properties}
                units={units}
                vendors={vendors}
                unitsByCity={unitsByCity}
                propertiesByCity={propertiesByCity}
                unitsByProperty={unitsByProperty}
                vendorsByCity={vendorsByCity}
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                onSuccess={handleDrawerSuccess}
            />

            {/* Vendor Task Tracker Edit Drawer */}
            {selectedTask && (
                <VendorTaskTrackerEditDrawer
                    task={selectedTask}
                    cities={cities}
                    properties={properties}
                    units={units}
                    vendors={vendors}
                    unitsByCity={unitsByCity}
                    propertiesByCity={propertiesByCity}
                    unitsByProperty={unitsByProperty}
                    vendorsByCity={vendorsByCity}
                    open={isEditDrawerOpen}
                    onOpenChange={setIsEditDrawerOpen}
                    onSuccess={handleEditDrawerSuccess}
                />
            )}
        </AppLayout>
    );
}
