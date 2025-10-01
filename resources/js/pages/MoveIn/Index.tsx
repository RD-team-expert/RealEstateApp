import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
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
import { Trash2, Edit, Eye, Plus, Search, Download } from 'lucide-react';
import { MoveIn } from '@/types/move-in';
import { usePermissions } from '@/hooks/usePermissions';
import { type BreadcrumbItem } from '@/types';
import MoveInCreateDrawer from './MoveInCreateDrawer';

// CSV Export utility function
const exportToCSV = (data: MoveIn[], filename: string = 'move-ins.csv') => {
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
            'Date of Insurance expiration'
        ];

        const csvData = [
            headers.join(','),
            ...data.map(moveIn => {
                try {
                    return [
                        moveIn.id || '',
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
                        `"${formatDate(moveIn.date_of_insurance_expiration)}"`
                    ].join(',');
                } catch (rowError) {
                    console.error('Error processing move-in row:', moveIn, rowError);
                    return ''; // Skip problematic rows
                }
            }).filter(row => row !== '') // Remove empty rows
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
    units: string[];
}

export default function Index({ moveIns, search, units }: Props) {
    const [searchTerm, setSearchTerm] = useState(search || '');
    const [isExporting, setIsExporting] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('move-in.index'), { search: searchTerm }, { preserveState: true });
    };

    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

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
            console.log('Exporting move-in data:', moveIns.data); // Debug log
            const filename = `move-ins-${new Date().toISOString().split('T')[0]}.csv`;
            exportToCSV(moveIns.data, filename);

            // Success feedback
            console.log('Export completed successfully');
        } catch (error) {
            console.error('Export failed:', error);
            alert(`Export failed: ${error.message || 'Unknown error'}. Please check the console for details.`);
        } finally {
            setIsExporting(false);
        }
    };

    const handleDrawerSuccess = () => {
        // Refresh the page data after successful creation
        router.reload();
    };

    const getYesNoBadge = (value: 'Yes' | 'No' | null) => {
        if (value === null) return <Badge variant="outline">N/A</Badge>;
        return (
            <Badge variant={value === 'Yes' ? 'default' : 'secondary'} className={
                value === 'Yes'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
            }>
                {value}
            </Badge>
        );
    };

    return (
        <AppLayout >
            <Head title="Move-In Management" />

            <div className="py-12 bg-background text-foreground transition-colors min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card className="bg-card text-card-foreground shadow-lg">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">Move-In Management</CardTitle>
                                <div className="flex gap-2 items-center">
                                    {/* Export Button */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCSVExport}
                                        disabled={isExporting || !moveIns?.data || moveIns.data.length === 0}
                                        className="flex items-center"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        {isExporting ? 'Exporting...' : 'Export CSV'}
                                    </Button>

                                    {hasAllPermissions(['move-in.create','move-in.store']) && (
                                        <Button onClick={() => setIsDrawerOpen(true)}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Move-In Record
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <form onSubmit={handleSearch} className="flex gap-2 mt-4">
                                <div className="flex-1">
                                    <Input
                                        type="text"
                                        placeholder="Search by unit name or status..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="bg-input text-input-foreground"
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
                                            <TableHead className="text-muted-foreground">Unit Name</TableHead>
                                            <TableHead className="text-muted-foreground">Signed Lease</TableHead>
                                            <TableHead className="text-muted-foreground">Lease Signing Date</TableHead>
                                            <TableHead className="text-muted-foreground">Move-In Date</TableHead>
                                            <TableHead className="text-muted-foreground">Paid Security & First Month</TableHead>
                                            <TableHead className="text-muted-foreground">Scheduled Payment Date</TableHead>
                                            <TableHead className="text-muted-foreground">Handled Keys</TableHead>
                                            <TableHead className="text-muted-foreground">Move in form sent On</TableHead>
                                            <TableHead className="text-muted-foreground">Filled Move-In Form</TableHead>
                                            <TableHead className="text-muted-foreground">Date of move in form filled in</TableHead>
                                            <TableHead className="text-muted-foreground">Submitted Insurance</TableHead>
                                            <TableHead className="text-muted-foreground">Date of Insurance expiration</TableHead>
                                            {hasAnyPermission(['move-in.show','move-in.edit','move-in.update','move-in.destroy']) && (
                                            <TableHead className="text-muted-foreground">Actions</TableHead>)}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {moveIns.data.map((moveIn) => (
                                            <TableRow key={moveIn.id} className="hover:bg-muted/50 border-border">
                                                <TableCell className="font-medium text-foreground">{moveIn.unit_name}</TableCell>
                                                <TableCell>
                                                    {getYesNoBadge(moveIn.signed_lease)}
                                                </TableCell>
                                                <TableCell className="text-foreground">
                                                    {moveIn.lease_signing_date
                                                        ? new Date(moveIn.lease_signing_date).toLocaleDateString()
                                                        : 'N/A'
                                                    }
                                                </TableCell>
                                                <TableCell className="text-foreground">
                                                    {moveIn.move_in_date
                                                        ? new Date(moveIn.move_in_date).toLocaleDateString()
                                                        : 'N/A'
                                                    }
                                                </TableCell>
                                                <TableCell>
                                                    {getYesNoBadge(moveIn.paid_security_deposit_first_month_rent)}
                                                </TableCell>
                                                <TableCell className="text-foreground">
                                                    {moveIn.scheduled_paid_time
                                                        ? new Date(moveIn.scheduled_paid_time).toLocaleDateString()
                                                        : 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    {getYesNoBadge(moveIn.handled_keys)}
                                                </TableCell>
                                                <TableCell className="text-foreground">
                                                    {moveIn.move_in_form_sent_date
                                                        ? new Date(moveIn.move_in_form_sent_date).toLocaleDateString()
                                                        : 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    {getYesNoBadge(moveIn.filled_move_in_form)}
                                                </TableCell>
                                                <TableCell className="text-foreground">
                                                    {moveIn.date_of_move_in_form_filled
                                                        ? new Date(moveIn.date_of_move_in_form_filled).toLocaleDateString()
                                                        : 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    {getYesNoBadge(moveIn.submitted_insurance)}
                                                </TableCell>
                                                <TableCell className="text-foreground">
                                                    {moveIn.date_of_insurance_expiration
                                                        ? new Date(moveIn.date_of_insurance_expiration).toLocaleDateString()
                                                        : 'N/A'}
                                                </TableCell>
                                                {hasAnyPermission(['move-in.show','move-in.edit','move-in.update','move-in.destroy']) && (
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        {hasPermission('move-in.show') && (
                                                        <Link href={route('move-in.show', moveIn.id)}>
                                                            <Button variant="outline" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>)}
                                                        {hasAllPermissions(['move-in.edit','move-in.update']) && (
                                                        <Link href={route('move-in.edit', moveIn.id)}>
                                                            <Button variant="outline" size="sm">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                        </Link>)}
                                                        {hasPermission('move-in.destroy') && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDelete(moveIn)}
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

                            {moveIns.data.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p className="text-lg">No move-in records found.</p>
                                    <p className="text-sm">Try adjusting your search criteria.</p>
                                </div>
                            )}

                            {/* Pagination info */}
                            {moveIns.meta && (
                                <div className="mt-6 flex justify-between items-center border-t border-border pt-4">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {moveIns.meta.from || 0} to {moveIns.meta.to || 0} of {moveIns.meta.total || 0} results
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Move-In Create Drawer */}
            <MoveInCreateDrawer
                units={units}
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                onSuccess={handleDrawerSuccess}
            />
        </AppLayout>
    );
}
