import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { usePermissions } from '@/hooks/usePermissions';
import AppLayout from '@/layouts/app-layout';
import { MoveOut } from '@/types/move-out';
import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { useState } from 'react';
import MoveOutCreateDrawer from './MoveOutCreateDrawer';
import MoveOutEditDrawer from './MoveOutEditDrawer';
import MoveOutEmptyState from './index/MoveOutEmptyState';
import MoveOutFilters from './index/MoveOutFilters';
import MoveOutPageHeader from './index/MoveOutPageHeader';
import MoveOutPagination from './index/MoveOutPagination';
import MoveOutTable from './index/MoveOutTable';

const formatDateOnly = (value?: string | null, fallback = '-'): string => {
    if (!value) return fallback;
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (!m) return fallback;
    const [, y, mo, d] = m;
    const date = new Date(Number(y), Number(mo) - 1, Number(d));
    return format(date, 'P');
};

const formatDateForInput = (value?: string | null): string => {
    if (!value) return '';
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (!m) return '';
    const [, y, mo, d] = m;
    return `${y}-${mo}-${d}`;
};

const exportToCSV = (data: MoveOut[], filename: string = 'move-outs.csv') => {
    try {
        const formatString = (value: string | null | undefined) => {
            if (value === null || value === undefined) return '';
            return String(value).replace(/"/g, '""');
        };

        const headers = [
            'ID',
            'City Name',
            'Property Name',
            'Unit Name',
            'Move Out Date',
            'Lease Status',
            'Lease Ending on Buildium',
            'Keys Location',
            'Utilities Under Our Name',
            'Date Utility Put Under Our Name',
            'Walkthrough',
            'Repairs',
            'Send Back Security Deposit',
            'Notes',
            'Cleaning',
            'List the Unit',
            'Move Out Form',
        ];

        const csvData = [
            headers.join(','),
            ...data
                .map((moveOut) => {
                    try {
                        return [
                            moveOut.id || '',
                            `"${formatString(moveOut.city_name)}"`,
                            `"${formatString(moveOut.property_name)}"`,
                            `"${formatString(moveOut.unit_name)}"`,
                            `"${formatDateOnly(moveOut.move_out_date, '')}"`,
                            `"${formatString(moveOut.lease_status)}"`,
                            `"${formatDateOnly(moveOut.date_lease_ending_on_buildium, '')}"`,
                            `"${formatString(moveOut.keys_location)}"`,
                            `"${formatString(moveOut.utilities_under_our_name)}"`,
                            `"${formatDateOnly(moveOut.date_utility_put_under_our_name, '')}"`,
                            `"${formatString(moveOut.walkthrough)}"`,
                            `"${formatString(moveOut.repairs)}"`,
                            `"${formatString(moveOut.send_back_security_deposit)}"`,
                            `"${formatString(moveOut.notes)}"`,
                            `"${formatString(moveOut.cleaning)}"`,
                            `"${formatString(moveOut.list_the_unit)}"`,
                            `"${formatString(moveOut.move_out_form)}"`,
                        ].join(',');
                    } catch (rowError) {
                        console.error('Error processing move-out row:', moveOut, rowError);
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
    moveOuts: {
        data: MoveOut[];
        links: any[];
        meta: any;
    };
    unit_id: string | null;
    cities: any[];
    properties: any[];
    propertiesByCityId: Record<number, any[]>;
    unitsByPropertyId: Record<number, Array<{ id: number; unit_name: string }>>;
    allUnits: Array<{ id: number; unit_name: string; city_name: string; property_name: string }>;
}

export default function Index({ moveOuts, cities, properties, propertiesByCityId, unitsByPropertyId, allUnits }: Props) {
    const [isExporting, setIsExporting] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    const [selectedMoveOut, setSelectedMoveOut] = useState<MoveOut | null>(null);

    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

    const handleSearch = (filters: { city_id: number | null; property_id: number | null; unit_id: number | null }) => {
        router.get(route('move-out.index'), filters, { preserveState: true });
    };

    const handleClearFilters = () => {
        router.get(route('move-out.index'), {}, { preserveState: false });
    };

    const handleDelete = (moveOut: MoveOut) => {
        if (confirm('Are you sure you want to delete this move-out record?')) {
            router.delete(route('move-out.destroy', moveOut.id));
        }
    };

    const handleCSVExport = () => {
        if (!moveOuts || !moveOuts.data || moveOuts.data.length === 0) {
            alert('No data to export');
            return;
        }

        setIsExporting(true);

        try {
            const filename = `move-outs-${new Date().toISOString().split('T')[0]}.csv`;
            exportToCSV(moveOuts.data, filename);
        } catch (error) {
            console.error('Export failed:', error);
            alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

    const handleEditClick = (moveOut: MoveOut) => {
        setSelectedMoveOut(moveOut);
        setIsEditDrawerOpen(true);
    };

    return (
        <AppLayout>
            <Head title="Move-Out Management" />

            <div className="min-h-screen bg-background py-12 text-foreground transition-colors">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <MoveOutPageHeader
                        hasCreatePermission={hasAllPermissions(['move-out.create', 'move-out.store'])}
                        isExporting={isExporting}
                        hasData={moveOuts?.data && moveOuts.data.length > 0}
                        onExport={handleCSVExport}
                        onAddNew={() => setIsDrawerOpen(true)}
                    />

                    <Card className="bg-card text-card-foreground shadow-lg">
                        <CardHeader>
                            <MoveOutFilters
                                cities={cities}
                                properties={properties}
                                allUnits={allUnits}
                                onSearch={handleSearch}
                                onClear={handleClearFilters}
                            />
                        </CardHeader>

                        <CardContent>
                            {moveOuts.data.length > 0 ? (
                                <>
                                    <MoveOutTable
                                        moveOuts={moveOuts.data}
                                        formatDateOnly={formatDateOnly}
                                        hasPermission={hasPermission}
                                        hasAnyPermission={hasAnyPermission}
                                        hasAllPermissions={hasAllPermissions}
                                        onEdit={handleEditClick}
                                        onDelete={handleDelete}
                                    />
                                    {moveOuts.meta && <MoveOutPagination meta={moveOuts.meta} />}
                                </>
                            ) : (
                                <MoveOutEmptyState />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <MoveOutCreateDrawer
                cities={cities}
                properties={properties}
                propertiesByCityId={propertiesByCityId}
                unitsByPropertyId={unitsByPropertyId}
                allUnits={allUnits}
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                onSuccess={handleDrawerSuccess}
            />

            {selectedMoveOut && (
                <MoveOutEditDrawer
                    cities={cities}
                    propertiesByCityId={propertiesByCityId}
                    unitsByPropertyId={unitsByPropertyId}
                    allUnits={allUnits}
                    moveOut={{
                        ...selectedMoveOut,
                        move_out_date: formatDateForInput(selectedMoveOut.move_out_date),
                        date_lease_ending_on_buildium: formatDateForInput(selectedMoveOut.date_lease_ending_on_buildium),
                        date_utility_put_under_our_name: formatDateForInput(selectedMoveOut.date_utility_put_under_our_name),
                    }}
                    open={isEditDrawerOpen}
                    onOpenChange={setIsEditDrawerOpen}
                    onSuccess={handleEditDrawerSuccess}
                />
            )}
        </AppLayout>
    );
}
