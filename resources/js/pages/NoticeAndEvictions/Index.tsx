import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePermissions } from '@/hooks/usePermissions';
import AppLayout from '@/layouts/app-layout';
import { Notice, NoticeAndEviction, Tenant } from '@/types/NoticeAndEviction';
import { City, PropertyInfoWithoutInsurance } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Download, Edit, Eye, Plus, Search, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import NoticeAndEvictionsCreateDrawer from './NoticeAndEvictionsCreateDrawer';
import NoticeAndEvictionsEditDrawer from './NoticeAndEvictionsEditDrawer';

// CSV Export utility function
const exportToCSV = (data: NoticeAndEviction[], filename: string = 'notice-evictions.csv') => {
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
            'City Name',
            'Property Name',
            'Tenants Name',
            'Status',
            'Date',
            'Type of Notice',
            'Have An Exception',
            'Note',
            'Evictions',
            'Sent to Attorney',
            'Hearing Dates',
            'Evicted/Payment Plan',
            'If Left',
            'Writ Date',
        ];

        const csvData = [
            headers.join(','),
            ...data
                .map((record) => {
                    try {
                        return [
                            record.id || '',
                            `"${formatString(record.unit_name)}"`,
                            `"${formatString(record.city_name)}"`,
                            `"${formatString(record.property_name)}"`,
                            `"${formatString(record.tenants_name)}"`,
                            `"${formatString(record.status)}"`,
                            `"${formatDate(record.date)}"`,
                            `"${formatString(record.type_of_notice)}"`,
                            `"${formatString(record.have_an_exception)}"`,
                            `"${formatString(record.note)}"`,
                            `"${formatString(record.evictions)}"`,
                            `"${formatString(record.sent_to_atorney)}"`,
                            `"${formatDate(record.hearing_dates)}"`,
                            `"${formatString(record.evected_or_payment_plan)}"`,
                            `"${formatString(record.if_left)}"`,
                            `"${formatDate(record.writ_date)}"`,
                        ].join(',');
                    } catch (rowError) {
                        console.error('Error processing record row:', record, rowError);
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
    records: NoticeAndEviction[];
    search?: string;
    tenants?: Tenant[];
    notices?: Notice[];
    cities?: City[];
    properties?: PropertyInfoWithoutInsurance[];
}

const Index = ({ records, search, tenants = [], notices = [], cities = [], properties = [] }: Props) => {
    const [searchTerm, setSearchTerm] = useState(search || '');
    const [isExporting, setIsExporting] = useState(false);
    const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<NoticeAndEviction | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('notice-and-evictions.index'), { search: searchTerm }, { preserveState: true });
    };

    const handleDelete = (record: NoticeAndEviction) => {
        if (window.confirm('Delete this record? This cannot be undone.')) {
            router.delete(`/notice_and_evictions/${record.id}`);
        }
    };

    const handleEdit = (record: NoticeAndEviction) => {
        setSelectedRecord(record);
        setIsEditDrawerOpen(true);
    };

    const handleEditSuccess = () => {
        // Refresh the page to get updated data
        router.reload();
    };

    const handleCSVExport = () => {
        if (!records || records.length === 0) {
            alert('No data to export');
            return;
        }

        setIsExporting(true);

        try {
            console.log('Exporting notice and evictions data:', records); // Debug log
            const filename = `notice-evictions-${new Date().toISOString().split('T')[0]}.csv`;
            exportToCSV(records, filename);

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
        if (!status) return <Badge variant="outline">N/A</Badge>;

        // Use theme-aware status colors
        switch (status.toLowerCase()) {
            case 'active':
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        {status}
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                        {status}
                    </Badge>
                );
            case 'closed':
                return (
                    <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                        {status}
                    </Badge>
                );
            default:
                return <Badge variant="default">{status}</Badge>;
        }
    };

    const getYesNoBadge = (value: string | null) => {
        if (!value || value === '-') return <Badge variant="outline">N/A</Badge>;
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

    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

    return (
        <AppLayout>
            <Head title="Notice & Evictions" />

            <div className="min-h-screen bg-background py-12 text-foreground transition-colors">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Card className="bg-card text-card-foreground shadow-lg">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-2xl">Notice & Evictions</CardTitle>
                                <div className="flex items-center gap-2">
                                    {/* Export Button */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCSVExport}
                                        disabled={isExporting || !records || records.length === 0}
                                        className="flex items-center"
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        {isExporting ? 'Exporting...' : 'Export CSV'}
                                    </Button>

                                    {hasAllPermissions(['notice-and-evictions.create', 'notice-and-evictions.store']) && (
                                        <Button onClick={() => setIsCreateDrawerOpen(true)}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Record
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <form onSubmit={handleSearch} className="mt-4 flex gap-2">
                                <div className="flex-1">
                                    <Input
                                        type="text"
                                        placeholder="Search by unit name, tenant name, or status..."
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
                                            <TableHead className="text-muted-foreground">ID</TableHead>
                                            <TableHead className="text-muted-foreground">Unit Name</TableHead>
                                            <TableHead className="text-muted-foreground">City Name</TableHead>
                                            <TableHead className="text-muted-foreground">Property Name</TableHead>
                                            <TableHead className="text-muted-foreground">Tenants Name</TableHead>
                                            <TableHead className="text-muted-foreground">Status</TableHead>
                                            <TableHead className="text-muted-foreground">Date</TableHead>
                                            <TableHead className="text-muted-foreground">Type of Notice</TableHead>
                                            <TableHead className="text-muted-foreground">Have An Exception?</TableHead>
                                            <TableHead className="text-muted-foreground">Note</TableHead>
                                            <TableHead className="text-muted-foreground">Evictions</TableHead>
                                            <TableHead className="text-muted-foreground">Sent to Attorney</TableHead>
                                            <TableHead className="text-muted-foreground">Hearing Dates</TableHead>
                                            <TableHead className="text-muted-foreground">Evicted/Payment Plan</TableHead>
                                            <TableHead className="text-muted-foreground">If Left?</TableHead>
                                            <TableHead className="text-muted-foreground">Writ Date</TableHead>
                                            {hasAnyPermission([
                                                'notice-and-evictions.show',
                                                'notice-and-evictions.edit',
                                                'notice-and-evictions.update',
                                                'notice-and-evictions.destroy',
                                            ]) && <TableHead className="text-muted-foreground">Actions</TableHead>}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {records.map((record) => (
                                            <TableRow key={record.id} className="border-border hover:bg-muted/50">
                                                <TableCell className="font-medium text-foreground">{record.id}</TableCell>
                                                <TableCell className="text-foreground">{record.unit_name}</TableCell>
                                                <TableCell className="text-foreground">
                                                    {record.city_name || <span className="text-muted-foreground">N/A</span>}
                                                </TableCell>
                                                <TableCell className="text-foreground">
                                                    {record.property_name || <span className="text-muted-foreground">N/A</span>}
                                                </TableCell>
                                                <TableCell className="text-foreground">{record.tenants_name}</TableCell>
                                                <TableCell>{getStatusBadge(record.status ?? null)}</TableCell>
                                                <TableCell className="text-foreground">
                                                    {record.date ? (
                                                        new Date(record.date).toLocaleDateString()
                                                    ) : (
                                                        <span className="text-muted-foreground">N/A</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-foreground">
                                                    {record.type_of_notice || <span className="text-muted-foreground">N/A</span>}
                                                </TableCell>
                                                <TableCell>{getYesNoBadge(record.have_an_exception ?? null)}</TableCell>
                                                <TableCell className="text-foreground">
                                                    {record.note || <span className="text-muted-foreground">N/A</span>}
                                                </TableCell>
                                                <TableCell className="text-foreground">
                                                    {record.evictions || <span className="text-muted-foreground">N/A</span>}
                                                </TableCell>
                                                <TableCell>{getYesNoBadge(record.sent_to_atorney ?? null)}</TableCell>
                                                <TableCell className="text-foreground">
                                                    {record.hearing_dates ? (
                                                        new Date(record.hearing_dates).toLocaleDateString()
                                                    ) : (
                                                        <span className="text-muted-foreground">N/A</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-foreground">
                                                    {record.evected_or_payment_plan || <span className="text-muted-foreground">N/A</span>}
                                                </TableCell>
                                                <TableCell>{getYesNoBadge(record.if_left ?? null)}</TableCell>
                                                <TableCell className="text-foreground">
                                                    {record.writ_date ? (
                                                        new Date(record.writ_date).toLocaleDateString()
                                                    ) : (
                                                        <span className="text-muted-foreground">N/A</span>
                                                    )}
                                                </TableCell>
                                                {hasAnyPermission([
                                                    'notice-and-evictions.show',
                                                    'notice-and-evictions.edit',
                                                    'notice-and-evictions.update',
                                                    'notice-and-evictions.destroy',
                                                ]) && (
                                                    <TableCell>
                                                        <div className="flex gap-1">
                                                            {hasPermission('notice-and-evictions.show') && (
                                                                <Link href={`/notice_and_evictions/${record.id}`}>
                                                                    <Button variant="outline" size="sm">
                                                                        <Eye className="h-4 w-4" />
                                                                    </Button>
                                                                </Link>
                                                            )}
                                                            {hasAllPermissions(['notice-and-evictions.edit', 'notice-and-evictions.update']) && (
                                                                <Button variant="outline" size="sm" onClick={() => handleEdit(record)}>
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            {hasPermission('notice-and-evictions.destroy') && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleDelete(record)}
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

                            {records.length === 0 && (
                                <div className="py-8 text-center text-muted-foreground">
                                    <p className="text-lg">No records found.</p>
                                    <p className="text-sm">Try adjusting your search criteria.</p>
                                </div>
                            )}

                            {/* Records count info */}
                            <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                                <div className="text-sm text-muted-foreground">Showing {records.length} records</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Create Drawer */}
            <NoticeAndEvictionsCreateDrawer open={isCreateDrawerOpen} onOpenChange={setIsCreateDrawerOpen} tenants={tenants} notices={notices} cities={cities} properties={properties} />

            {/* Edit Drawer */}
            {selectedRecord && (
                <NoticeAndEvictionsEditDrawer
                    record={selectedRecord}
                    tenants={tenants}
                    notices={notices}
                    cities={cities}
                    properties={properties}
                    open={isEditDrawerOpen}
                    onOpenChange={setIsEditDrawerOpen}
                    onSuccess={handleEditSuccess}
                />
            )}
        </AppLayout>
    );
};

export default Index;
