import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePermissions } from '@/hooks/usePermissions';
import AppLayout from '@/layouts/app-layout';
import { MoveOut } from '@/types/move-out';
import { Head, Link, router } from '@inertiajs/react';
import { Download, Edit, Eye, Plus, Search, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import MoveOutCreateDrawer from './MoveOutCreateDrawer';
import MoveOutEditDrawer from './MoveOutEditDrawer';

// CSV Export utility function
const exportToCSV = (data: MoveOut[], filename: string = 'move-outs.csv') => {
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

        const headers = [
            'ID',
            'Unit Name',
            'Tenant Name',
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
                            `"${formatString(moveOut.units_name)}"`,
                            `"${formatString(moveOut.tenants_name)}"`,
                            `"${formatDate(moveOut.move_out_date)}"`,
                            `"${formatString(moveOut.lease_status)}"`,
                            `"${formatDate(moveOut.date_lease_ending_on_buildium)}"`,
                            `"${formatString(moveOut.keys_location)}"`,
                            `"${formatString(moveOut.utilities_under_our_name)}"`,
                            `"${formatDate(moveOut.date_utility_put_under_our_name)}"`,
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

interface Props {
    moveOuts: {
        data: MoveOut[];
        links: any[];
        meta: any;
    };
    search: string | null;
    tenants: string[];
    unitsByTenant: Record<string, string[]>;
    tenantsData: any[];
}

export default function Index({ moveOuts, search, tenants, unitsByTenant, tenantsData }: Props) {
    const [searchTerm, setSearchTerm] = useState(search || '');
    const [isExporting, setIsExporting] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    const [selectedMoveOut, setSelectedMoveOut] = useState<MoveOut | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('move-out.index'), { search: searchTerm }, { preserveState: true });
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
            console.log('Exporting move-out data:', moveOuts.data); // Debug log
            const filename = `move-outs-${new Date().toISOString().split('T')[0]}.csv`;
            exportToCSV(moveOuts.data, filename);

            // Success feedback
            console.log('Export completed successfully');
        } catch (error) {
            console.error('Export failed:', error);
            alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the console for details.`);
        } finally {
            setIsExporting(false);
        }
    };

    const handleDrawerSuccess = () => {
        // Refresh the page data after successful creation
        router.reload();
    };

    const handleEditDrawerSuccess = () => {
        // Refresh the page data after successful update
        router.reload();
    };

    const handleEditClick = (moveOut: MoveOut) => {
        setSelectedMoveOut(moveOut);
        setIsEditDrawerOpen(true);
    };

    const getYesNoBadge = (value: 'Yes' | 'No' | null) => {
        if (value === null) return <Badge variant="outline">N/A</Badge>;
        return (
            <Badge
                variant={value === 'Yes' ? 'default' : 'secondary'}
                className={
                    value === 'Yes'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                }
            >
                {value}
            </Badge>
        );
    };

    const getCleaningBadge = (value: 'cleaned' | 'uncleaned' | null) => {
        if (value === null) return <Badge variant="outline">N/A</Badge>;
        return (
            <Badge
                variant={value === 'cleaned' ? 'default' : 'secondary'}
                className={
                    value === 'cleaned'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                }
            >
                {value}
            </Badge>
        );
    };

    const getFormBadge = (value: 'filled' | 'not filled' | null) => {
        if (value === null) return <Badge variant="outline">N/A</Badge>;
        return (
            <Badge
                variant={value === 'filled' ? 'default' : 'secondary'}
                className={
                    value === 'filled'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                }
            >
                {value}
            </Badge>
        );
    };

    const formatDate = (date: string | null) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString();
    };

    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

    return (
        <AppLayout>
            <Head title="Move-Out Management" />

            <div className="min-h-screen bg-background py-12 text-foreground transition-colors">
                <div className="mx-auto max-w-[100vw] sm:px-6 lg:px-8">
                    <Card className="bg-card text-card-foreground shadow-lg">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-2xl">Move-Out Management</CardTitle>
                                <div className="flex items-center gap-2">
                                    {/* Export Button */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCSVExport}
                                        disabled={isExporting || !moveOuts?.data || moveOuts.data.length === 0}
                                        className="flex items-center"
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        {isExporting ? 'Exporting...' : 'Export CSV'}
                                    </Button>

                                    {hasAllPermissions(['move-out.create', 'move-out.store']) && (
                                        <Button onClick={() => setIsDrawerOpen(true)}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Move-Out Record
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <form onSubmit={handleSearch} className="mt-4 flex gap-2">
                                <div className="flex-1">
                                    <Input
                                        type="text"
                                        placeholder="Search by tenant name, unit, or status..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="text-input-foreground bg-input"
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
                                        <TableRow className="border-border">
                                            <TableHead className="min-w-[120px] text-muted-foreground">Unit Name</TableHead>
                                            <TableHead className="min-w-[150px] text-muted-foreground">Tenant Name</TableHead>
                                            <TableHead className="min-w-[120px] text-muted-foreground">Move Out Date</TableHead>
                                            <TableHead className="min-w-[120px] text-muted-foreground">Lease Status</TableHead>
                                            <TableHead className="min-w-[150px] text-muted-foreground">Lease Ending on Buildium</TableHead>
                                            <TableHead className="min-w-[120px] text-muted-foreground">Keys Location</TableHead>
                                            <TableHead className="min-w-[140px] text-muted-foreground">Utilities Under Our Name</TableHead>
                                            <TableHead className="min-w-[160px] text-muted-foreground">Date Utility Put Under Our Name</TableHead>
                                            <TableHead className="min-w-[150px] text-muted-foreground">Walkthrough</TableHead>
                                            <TableHead className="min-w-[120px] text-muted-foreground">Repairs</TableHead>
                                            <TableHead className="min-w-[160px] text-muted-foreground">Send Back Security Deposit</TableHead>
                                            <TableHead className="min-w-[120px] text-muted-foreground">Notes</TableHead>
                                            <TableHead className="min-w-[100px] text-muted-foreground">Cleaning</TableHead>
                                            <TableHead className="min-w-[120px] text-muted-foreground">List the Unit</TableHead>
                                            <TableHead className="min-w-[120px] text-muted-foreground">Move Out Form</TableHead>
                                            {hasAnyPermission(['move-out.show', 'move-out.edit', 'move-out.update', 'move-out.destroy']) && (
                                                <TableHead className="min-w-[120px] text-muted-foreground">Actions</TableHead>
                                            )}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {moveOuts.data.map((moveOut) => (
                                            <TableRow key={moveOut.id} className="border-border hover:bg-muted/50">
                                                <TableCell className="text-foreground">{moveOut.units_name}</TableCell>
                                                <TableCell className="font-medium text-foreground">{moveOut.tenants_name}</TableCell>
                                                <TableCell className="text-foreground">{formatDate(moveOut.move_out_date)}</TableCell>
                                                <TableCell>
                                                    {moveOut.lease_status ? (
                                                        <Badge variant="outline">{moveOut.lease_status}</Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground">N/A</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-foreground">{formatDate(moveOut.date_lease_ending_on_buildium)}</TableCell>
                                                <TableCell className="text-foreground">
                                                    {moveOut.keys_location || <span className="text-muted-foreground">N/A</span>}
                                                </TableCell>
                                                <TableCell>{getYesNoBadge(moveOut.utilities_under_our_name)}</TableCell>
                                                <TableCell className="text-foreground">
                                                    {formatDate(moveOut.date_utility_put_under_our_name)}
                                                </TableCell>
                                                <TableCell className="max-w-[150px] truncate text-foreground">
                                                    {moveOut.walkthrough ? (
                                                        <span title={moveOut.walkthrough}>
                                                            {moveOut.walkthrough.length > 50
                                                                ? `${moveOut.walkthrough.substring(0, 50)}...`
                                                                : moveOut.walkthrough}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">N/A</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="max-w-[120px] truncate text-foreground">
                                                    {moveOut.repairs ? (
                                                        <span title={moveOut.repairs}>
                                                            {moveOut.repairs.length > 30 ? `${moveOut.repairs.substring(0, 30)}...` : moveOut.repairs}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">N/A</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-foreground">
                                                    {moveOut.send_back_security_deposit || <span className="text-muted-foreground">N/A</span>}
                                                </TableCell>
                                                <TableCell className="max-w-[120px] truncate text-foreground">
                                                    {moveOut.notes ? (
                                                        <span title={moveOut.notes}>
                                                            {moveOut.notes.length > 30 ? `${moveOut.notes.substring(0, 30)}...` : moveOut.notes}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">N/A</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>{getCleaningBadge(moveOut.cleaning)}</TableCell>
                                                <TableCell className="text-foreground">
                                                    {moveOut.list_the_unit || <span className="text-muted-foreground">N/A</span>}
                                                </TableCell>
                                                <TableCell>{getFormBadge(moveOut.move_out_form)}</TableCell>
                                                {hasAnyPermission(['move-out.show', 'move-out.edit', 'move-out.update', 'move-out.destroy']) && (
                                                    <TableCell>
                                                        <div className="flex gap-1">
                                                            {hasPermission('move-out.show') && (
                                                                <Link href={route('move-out.show', moveOut.id)}>
                                                                    <Button variant="outline" size="sm">
                                                                        <Eye className="h-4 w-4" />
                                                                    </Button>
                                                                </Link>
                                                            )}
                                                            {hasAllPermissions(['move-out.edit', 'move-out.update']) && (
                                                                <Button 
                                                                    variant="outline" 
                                                                    size="sm"
                                                                    onClick={() => handleEditClick(moveOut)}
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            {hasPermission('move-out.destroy') && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleDelete(moveOut)}
                                                                    className="border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive"
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

                            {moveOuts.data.length === 0 && (
                                <div className="py-8 text-center text-muted-foreground">
                                    <p className="text-lg">No move-out records found.</p>
                                    <p className="text-sm">Try adjusting your search criteria.</p>
                                </div>
                            )}

                            {/* Pagination info */}
                            {moveOuts.meta && (
                                <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {moveOuts.meta.from || 0} to {moveOuts.meta.to || 0} of {moveOuts.meta.total || 0} results
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Move-Out Create Drawer */}
            <MoveOutCreateDrawer
                tenants={tenants}
                unitsByTenant={unitsByTenant}
                tenantsData={tenantsData}
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                onSuccess={handleDrawerSuccess}
            />

            {/* Move-Out Edit Drawer */}
            <MoveOutEditDrawer
                open={isEditDrawerOpen}
                onOpenChange={setIsEditDrawerOpen}
                onSuccess={handleEditDrawerSuccess}
                moveOut={selectedMoveOut}
                tenants={tenants}
                unitsByTenant={unitsByTenant}
                tenantsData={tenantsData}
            />
        </AppLayout>
    );
}
