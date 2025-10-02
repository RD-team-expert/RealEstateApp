import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
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
import { Payment, UnitData } from '@/types/payments';
import { usePermissions } from '@/hooks/usePermissions';
import { type BreadcrumbItem } from '@/types';
import PaymentCreateDrawer from './PaymentCreateDrawer';
import PaymentEditDrawer from './PaymentEditDrawer';

// Updated CSV Export utility function with better error handling
const exportToCSV = (data: Payment[], filename: string = 'payments.csv') => {
    try {
        const formatCurrency = (amount: number | null | undefined) => {
            if (amount === null || amount === undefined || isNaN(amount)) return '0.00';
            return Number(amount).toFixed(2);
        };

        const formatString = (value: string | null | undefined) => {
            if (value === null || value === undefined) return '';
            return String(value).replace(/"/g, '""');
        };

        const formatDate = (dateStr: string | null | undefined) => {
            if (!dateStr) return '';
            try {
                return new Date(dateStr).toLocaleDateString();
            } catch (error) {
                return dateStr || '';
            }
        };

        const headers = [
            'ID',
            'Date',
            'City',
            'Unit Name',
            'Owes',
            'Paid',
            'Left to Pay',
            'Status',
            'Notes',
            'Reversed Payments',
            'Permanent'
        ];

        const csvData = [
            headers.join(','),
            ...data.map(payment => {
                try {
                    return [
                        payment.id || '',
                        `"${formatDate(payment.date)}"`,
                        `"${formatString(payment.city)}"`,
                        `"${formatString(payment.unit_name)}"`,
                        formatCurrency(payment.owes),
                        formatCurrency(payment.paid),
                        formatCurrency(payment.left_to_pay),
                        `"${formatString(payment.status)}"`,
                        `"${formatString(payment.notes)}"`,
                        `"${formatString(payment.reversed_payments)}"`,
                        `"${formatString(payment.permanent)}"`
                    ].join(',');
                } catch (rowError) {
                    console.error('Error processing payment row:', payment, rowError);
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
    payments: {
        data: Payment[];
        links: any[];
        meta: any;
    };
    search: string | null;
    units: UnitData[];
    cities: string[];
    unitsByCity: Record<string, string[]>;
}

export default function Index({ payments, search, units, cities, unitsByCity }: Props) {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
    const [searchTerm, setSearchTerm] = useState(search || '');
    const [isExporting, setIsExporting] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editDrawerOpen, setEditDrawerOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('payments.index'), { search: searchTerm }, { preserveState: true });
    };

    const handleDelete = (payment: Payment) => {
        if (confirm('Are you sure you want to delete this payment?')) {
            router.delete(route('payments.destroy', payment.id));
        }
    };

    const handleEdit = (payment: Payment) => {
        setSelectedPayment(payment);
        setEditDrawerOpen(true);
    };

    const handleEditSuccess = () => {
        // Refresh the page to show updated data
        router.reload();
    };

    const handleCSVExport = () => {
        if (!payments || !payments.data || payments.data.length === 0) {
            alert('No data to export');
            return;
        }

        setIsExporting(true);

        try {
            console.log('Exporting payments data:', payments.data); // Debug log
            const filename = `payments-${new Date().toISOString().split('T')[0]}.csv`;
            exportToCSV(payments.data, filename);

            // Success feedback
            console.log('Export completed successfully');
        } catch (error) {
            console.error('Export failed:', error);
            alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the console for details.`);
        } finally {
            setIsExporting(false);
        }
    };

    const formatCurrency = (amount: number | null) => {
        if (amount === null || amount === undefined || isNaN(amount)) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const getStatusBadge = (status: string | null) => {
        if (!status) return <Badge variant="outline">N/A</Badge>;

        if (status.toLowerCase().includes('paid')) {
            return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">{status}</Badge>;
        } else if (status.toLowerCase().includes('pending')) {
            return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">{status}</Badge>;
        } else {
            return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getPermanentBadge = (permanent: string | null) => {
        if (!permanent) return <Badge variant="outline">N/A</Badge>;

        return (
            <Badge variant={permanent === 'Yes' ? 'default' : 'secondary'} className={
                permanent === 'Yes'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
            }>
                {permanent}
            </Badge>
        );
    };

    return (
        <AppLayout >
            <Head title="Payments" />

            <div className="py-12 bg-background text-foreground transition-colors min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card className="bg-card text-card-foreground shadow-lg">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">Payments Management</CardTitle>
                                <div className="flex gap-2 items-center">
                                    {/* Export Button */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCSVExport}
                                        disabled={isExporting || !payments?.data || payments.data.length === 0}
                                        className="flex items-center"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        {isExporting ? 'Exporting...' : 'Export CSV'}
                                    </Button>

                                    {hasAllPermissions(['payments.create','payments.store']) && (
                                        <Button 
                                            onClick={() => setDrawerOpen(true)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Payment
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <form onSubmit={handleSearch} className="flex gap-2 mt-4">
                                <div className="flex-1">
                                    <Input
                                        type="text"
                                        placeholder="Search payments by city, unit, status, or notes..."
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
                                            <TableHead className="text-muted-foreground">Date</TableHead>
                                            <TableHead className="text-muted-foreground">City</TableHead>
                                            <TableHead className="text-muted-foreground">Unit Name</TableHead>
                                            <TableHead className="text-right text-muted-foreground">Owes</TableHead>
                                            <TableHead className="text-right text-muted-foreground">Paid</TableHead>
                                            <TableHead className="text-right text-muted-foreground">Left to Pay</TableHead>
                                            <TableHead className="text-muted-foreground">Status</TableHead>
                                            <TableHead className="text-muted-foreground">Note</TableHead>
                                            <TableHead className="text-muted-foreground">Reversed Payments</TableHead>
                                            <TableHead className="text-muted-foreground">Permanent</TableHead>
                                            {hasAnyPermission(['payments.show','payments.edit','payments.update','payments.destroy']) && (
                                            <TableHead className="text-muted-foreground">Actions</TableHead>)}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {payments.data.map((payment) => (
                                            <TableRow key={payment.id} className="hover:bg-muted/50 border-border">
                                                <TableCell className="text-foreground">
                                                    {new Date(payment.date).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="font-medium text-foreground">{payment.city}</TableCell>
                                                <TableCell className="text-foreground">{payment.unit_name}</TableCell>
                                                <TableCell className="text-right font-medium text-red-600 dark:text-red-400">
                                                    {formatCurrency(payment.owes)}
                                                </TableCell>
                                                <TableCell className="text-right text-green-600 dark:text-green-400">
                                                    {formatCurrency(payment.paid)}
                                                </TableCell>
                                                <TableCell className="text-right font-medium text-blue-600 dark:text-blue-400">
                                                    {formatCurrency(payment.left_to_pay)}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(payment.status)}
                                                </TableCell>
                                                <TableCell className="text-foreground">{payment.notes}</TableCell>
                                                <TableCell className="text-foreground">{payment.reversed_payments}</TableCell>
                                                <TableCell>
                                                    {getPermanentBadge(payment.permanent)}
                                                </TableCell>
                                                {hasAnyPermission(['payments.show','payments.edit','payments.update','payments.destroy']) && (
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        {hasPermission('payments.show') && (
                                                        <Link href={route('payments.show', payment.id)}>
                                                            <Button variant="outline" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>)}
                                                        {hasAllPermissions(['payments.edit','payments.update']) && (
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={() => handleEdit(payment)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>)}
                                                        {hasPermission('payments.destroy') && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDelete(payment)}
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

                            {payments.data.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p className="text-lg">No payments found.</p>
                                    <p className="text-sm">Try adjusting your search criteria.</p>
                                </div>
                            )}

                            {/* Pagination info */}
                            {payments.meta && (
                                <div className="mt-6 flex justify-between items-center border-t border-border pt-4">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {payments.meta.from || 0} to {payments.meta.to || 0} of {payments.meta.total || 0} results
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <PaymentCreateDrawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                units={units}
                cities={cities}
                unitsByCity={unitsByCity}
            />

            {selectedPayment && (
                <PaymentEditDrawer
                    payment={selectedPayment}
                    units={units}
                    cities={cities}
                    unitsByCity={unitsByCity}
                    open={editDrawerOpen}
                    onOpenChange={setEditDrawerOpen}
                    onSuccess={handleEditSuccess}
                />
            )}
        </AppLayout>
    );
}
