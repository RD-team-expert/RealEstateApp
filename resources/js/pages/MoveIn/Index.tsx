import { Card, CardContent } from '@/components/ui/card';
import { usePermissions } from '@/hooks/usePermissions';
import AppLayout from '@/layouts/app-layout';
import { City } from '@/types/City';
import { MoveIn } from '@/types/move-in';
import { PropertyInfoWithoutInsurance } from '@/types/PropertyInfoWithoutInsurance';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import MoveInCreateDrawer from './MoveInCreateDrawer';
import MoveInEditDrawer from './MoveInEditDrawer';
import PageHeader from './index/PageHeader';
import MoveInFilters from './index/MoveInFilters';
import MoveInTable from './index/MoveInTable';
import EmptyState from './index/EmptyState';
import PaginationInfo from './index/PaginationInfo';

// Updated Unit interface to include ID
interface Unit {
    id: number;
    unit_name: string;
    property_name: string;
    city_name: string;
}

// CSV Export utility function with fixed date formatting
const exportToCSV = (data: MoveIn[], filename: string = 'move-ins.csv') => {
    try {
        const formatDate = (dateStr: string | null | undefined) => {
            if (!dateStr) return '';
            try {
                const d = new Date(dateStr);
                if (isNaN(d.getTime())) return '';
                return new Intl.DateTimeFormat(undefined, {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                    timeZone: 'UTC',
                }).format(d);
            } catch (error) {
                return dateStr || '';
            }
        };

        const formatString = (value: string | null | undefined) => {
            if (value === null || value === undefined) return '';
            return String(value).replace(/"/g, '""');
        };

        const headers = [
            'ID',
            'City',
            'Property Name',
            'Unit Name',
            'Signed Lease',
            'Lease Signing Date',
            'Move-In Date',
            'Paid Security & First Month',
            'Scheduled Payment Date',
            'Handled Keys',
            'Move in form sent On',
            'Filled Move-In Form',
            'Date of move in form filled in',
            'Submitted Insurance',
            'Date of Insurance expiration',
        ];

        const csvData = [
            headers.join(','),
            ...data
                .map((moveIn) => {
                    try {
                        return [
                            moveIn.id || '',
                            `"${formatString(moveIn.city_name)}"`,
                            `"${formatString(moveIn.property_name)}"`,
                            `"${formatString(moveIn.unit_name)}"`,
                            `"${formatString(moveIn.signed_lease)}"`,
                            `"${formatDate(moveIn.lease_signing_date)}"`,
                            `"${formatDate(moveIn.move_in_date)}"`,
                            `"${formatString(moveIn.paid_security_deposit_first_month_rent)}"`,
                            `"${formatDate(moveIn.scheduled_paid_time)}"`,
                            `"${formatString(moveIn.handled_keys)}"`,
                            `"${formatDate(moveIn.move_in_form_sent_date)}"`,
                            `"${formatString(moveIn.filled_move_in_form)}"`,
                            `"${formatDate(moveIn.date_of_move_in_form_filled)}"`,
                            `"${formatString(moveIn.submitted_insurance)}"`,
                            `"${formatDate(moveIn.date_of_insurance_expiration)}"`,
                        ].join(',');
                    } catch (rowError) {
                        console.error('Error processing move-in row:', moveIn, rowError);
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

interface Props {
    moveIns: {
        data: MoveIn[];
        links: any[];
        meta: any;
    };
    search: string | null;
    filters: {
        search?: string;
        city?: string;
        property?: string;
    };
    units: Unit[];
    cities: City[];
    properties: PropertyInfoWithoutInsurance[];
    unitsByProperty: Record<string, Array<{ id: number; unit_name: string }>>;
}

export default function Index({
    moveIns,
    search,
    filters,
    units,
    cities,
    properties,
    unitsByProperty,
}: Props) {
    const [isExporting, setIsExporting] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    const [selectedMoveIn, setSelectedMoveIn] = useState<MoveIn | null>(null);

    // Filter states - initialize with current filters
    const [currentFilters, setCurrentFilters] = useState({
        city: filters?.city || '',
        property: filters?.property || '',
        search: filters?.search || search || '',
    });

    // Update filters when props change
    useEffect(() => {
        setCurrentFilters({
            city: filters?.city || '',
            property: filters?.property || '',
            search: filters?.search || search || '',
        });
    }, [filters, search]);

    const { hasPermission, hasAnyPermission } = usePermissions();

    const handleSearch = (newFilters: { city: string; property: string; search: string }) => {
        setCurrentFilters(newFilters);
        const params: any = {};

        if (newFilters.search?.trim()) params.search = newFilters.search.trim();
        if (newFilters.city?.trim()) params.city = newFilters.city.trim();
        if (newFilters.property?.trim()) params.property = newFilters.property.trim();

        router.get(route('move-in.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        const clearedFilters = {
            city: '',
            property: '',
            search: '',
        };
        setCurrentFilters(clearedFilters);

        router.get(route('move-in.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDelete = (moveIn: MoveIn) => {
        if (confirm('Are you sure you want to delete this move-in record?')) {
            router.delete(route('move-in.destroy', moveIn.id));
        }
    };

    const handleCSVExport = () => {
        if (!moveIns || !moveIns.data || moveIns.data.length === 0) {
            alert('No data to export');
            return;
        }

        setIsExporting(true);

        try {
            console.log('Exporting move-in data:', moveIns.data);
            const filename = `move-ins-${new Date().toISOString().split('T')[0]}.csv`;
            exportToCSV(moveIns.data, filename);

            console.log('Export completed successfully');
        } catch (error) {
            console.error('Export failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            alert(`Export failed: ${errorMessage}. Please check the console for details.`);
        } finally {
            setIsExporting(false);
        }
    };

    const handleDrawerSuccess = () => {
        router.reload();
    };

    const handleEditDrawerSuccess = () => {
        router.reload();
    };

    const handleEdit = (moveIn: MoveIn) => {
        setSelectedMoveIn(moveIn);
        setIsEditDrawerOpen(true);
    };

    const hasActiveFilters = currentFilters.search || currentFilters.city || currentFilters.property;

    return (
        <AppLayout>
            <Head title="Move-In Management" />

            <div className="min-h-screen bg-background py-12 text-foreground transition-colors">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <PageHeader
                        hasActiveFilters={!!hasActiveFilters}
                        isExporting={isExporting}
                        hasData={moveIns?.data && moveIns.data.length > 0}
                        hasCreatePermission={hasPermission('move-in.store')}
                        onExport={handleCSVExport}
                        onCreateClick={() => setIsDrawerOpen(true)}
                    />

                    <Card className="bg-card text-card-foreground shadow-lg">
                        <MoveInFilters
                            cities={cities}
                            properties={properties}
                            initialFilters={currentFilters}
                            onSearch={handleSearch}
                            onClear={handleClearFilters}
                            hasActiveFilters={!!hasActiveFilters}
                        />

                        <CardContent>
                            <MoveInTable
                                moveIns={moveIns.data}
                                canEdit={hasPermission('move-in.update')}
                                canDelete={hasPermission('move-in.destroy')}
                                showActions={hasAnyPermission([
                                    'move-in.show',
                                    'move-in.edit',
                                    'move-in.update',
                                    'move-in.destroy',
                                ])}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />

                            {moveIns.data.length === 0 && (
                                <EmptyState hasActiveFilters={!!hasActiveFilters} />
                            )}

                            {moveIns.meta && (
                                <PaginationInfo
                                    from={moveIns.meta.from}
                                    to={moveIns.meta.to}
                                    total={moveIns.meta.total}
                                    hasActiveFilters={!!hasActiveFilters}
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Move-In Create Drawer */}
            <MoveInCreateDrawer
                units={units}
                cities={cities}
                properties={properties}
                unitsByProperty={unitsByProperty}
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                onSuccess={handleDrawerSuccess}
            />

            {/* Move-In Edit Drawer */}
            {selectedMoveIn && (
                <MoveInEditDrawer
                    moveIn={selectedMoveIn}
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
