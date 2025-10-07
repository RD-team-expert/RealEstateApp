import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { PaymentPlanIndexProps, PaymentPlan, DropdownData } from '@/types/PaymentPlan';
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
import { usePermissions } from '@/hooks/usePermissions';
import { type BreadcrumbItem } from '@/types';
import PaymentPlanCreateDrawer from './PaymentPlanCreateDrawer';
import PaymentPlanEditDrawer from './PaymentPlanEditDrawer';

// CSV Export utility function
const exportToCSV = (data: PaymentPlan[], filename: string = 'payment-plans.csv') => {
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
            'Property',
            'Unit',
            'Tenant',
            'Amount',
            'Paid',
            'Left to Pay',
            'Status',
            'Date',
            'Notes'
        ];

        const csvData = [
            headers.join(','),
            ...data.map(plan => {
                try {
                    return [
                        plan.id || '',
                        `"${formatString(plan.property)}"`,
                        `"${formatString(plan.unit)}"`,
                        `"${formatString(plan.tenant)}"`,
                        formatCurrency(plan.amount),
                        formatCurrency(plan.paid),
                        formatCurrency(plan.left_to_pay),
                        `"${formatString(plan.status)}"`,
                        `"${formatDate(plan.dates)}"`,
                        `"${formatString(plan.notes)}"`
                    ].join(',');
                } catch (rowError) {
                    console.error('Error processing payment plan row:', plan, rowError);
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

interface Props extends PaymentPlanIndexProps {
  search?: string | null;
  dropdownData?: DropdownData;
}

export default function Index({ paymentPlans, search, dropdownData }: Props) {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
    const [searchTerm, setSearchTerm] = useState(search || '');
    const [isExporting, setIsExporting] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editDrawerOpen, setEditDrawerOpen] = useState(false);
    const [selectedPaymentPlan, setSelectedPaymentPlan] = useState<PaymentPlan | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/payment-plans', { search: searchTerm }, { preserveState: true });
    };

    const handleDelete = (paymentPlan: PaymentPlan) => {
        if (confirm('Are you sure you want to delete this payment plan?')) {
            router.delete(`/payment-plans/${paymentPlan.id}`);
        }
    };

    const handleEdit = (paymentPlan: PaymentPlan) => {
        setSelectedPaymentPlan(paymentPlan);
        setEditDrawerOpen(true);
    };

    const handleCSVExport = () => {
        if (!paymentPlans || !paymentPlans.data || paymentPlans.data.length === 0) {
            alert('No data to export');
            return;
        }

        setIsExporting(true);

        try {
            console.log('Exporting payment plans data:', paymentPlans.data); // Debug log
            const filename = `payment-plans-${new Date().toISOString().split('T')[0]}.csv`;
            exportToCSV(paymentPlans.data, filename);

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
        if (amount === null) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(Number(amount));
    };

    const getStatusBadge = (status: string | null) => {
        if (!status) return <Badge variant="outline">N/A</Badge>;

        switch (status) {
            case 'Paid':
                return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Paid</Badge>;
            case 'Paid Partly':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Paid Partly</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <AppLayout >
            <Head title="Payment Plans" />

            <div className="py-12 bg-background text-foreground transition-colors min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card className="bg-card text-card-foreground shadow-lg">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">Payment Plans Management</CardTitle>
                                <div className="flex gap-2 items-center">
                                    {/* Export Button */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCSVExport}
                                        disabled={isExporting || !paymentPlans?.data || paymentPlans.data.length === 0}
                                        className="flex items-center"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        {isExporting ? 'Exporting...' : 'Export CSV'}
                                    </Button>

                                    {hasAllPermissions(['payment-plans.create','payment-plans.store']) && (
                                        <Button onClick={() => setDrawerOpen(true)}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Payment Plan
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <form onSubmit={handleSearch} className="flex gap-2 mt-4">
                                <div className="flex-1">
                                    <Input
                                    type="text"
                                    placeholder="Search by property, city, unit, tenant, status, or notes..."
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
                                            <TableHead className="text-muted-foreground">Property</TableHead>
                                            <TableHead className="text-muted-foreground">City</TableHead>
                                            <TableHead className="text-muted-foreground">Unit</TableHead>
                                            <TableHead className="text-muted-foreground">Tenant</TableHead>
                                            <TableHead className="text-right text-muted-foreground">Amount</TableHead>
                                            <TableHead className="text-right text-muted-foreground">Paid</TableHead>
                                            <TableHead className="text-right text-muted-foreground">Left to Pay</TableHead>
                                            <TableHead className="text-muted-foreground">Status</TableHead>
                                            <TableHead className="text-muted-foreground">Date</TableHead>
                                            <TableHead className="text-muted-foreground">Note</TableHead>
                                            {hasAnyPermission(['payment-plans.show','payment-plans.edit','payment-plans.update','payment-plans.destroy']) && (
                                            <TableHead className="text-muted-foreground">Actions</TableHead>)}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paymentPlans.data.map((plan: PaymentPlan) => (
                                            <TableRow key={plan.id} className="hover:bg-muted/50 border-border">
                                                <TableCell className="text-foreground">{plan.property}</TableCell>
                                                <TableCell className="text-foreground">{plan.city_name || 'N/A'}</TableCell>
                                                <TableCell className="text-foreground">{plan.unit}</TableCell>
                                                <TableCell className="text-foreground">{plan.tenant}</TableCell>
                                                <TableCell className="text-right font-medium text-blue-600 dark:text-blue-400">
                                                    {formatCurrency(plan.amount)}
                                                </TableCell>
                                                <TableCell className="text-right text-green-600 dark:text-green-400">
                                                    {formatCurrency(plan.paid)}
                                                </TableCell>
                                                <TableCell className="text-right font-medium text-red-600 dark:text-red-400">
                                                    {formatCurrency(plan.left_to_pay)}
                                                </TableCell>
                                                <TableCell>{getStatusBadge(plan.status)}</TableCell>
                                                <TableCell className="text-foreground">
                                                    {new Date(plan.dates).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-foreground">{plan.notes}</TableCell>
                                                {hasAnyPermission(['payment-plans.show','payment-plans.edit','payment-plans.update','payment-plans.destroy']) && (
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        <Link href={route('payment-plans.show', plan.id)}>
                                                            <Button variant="outline" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        {hasAllPermissions(['payment-plans.update','payment-plans.edit']) && (
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={() => handleEdit(plan)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>)}
                                                        {hasPermission('payment-plans.destroy') && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDelete(plan)}
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

                            {paymentPlans.data.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p className="text-lg">No payment plans found.</p>
                                    <p className="text-sm">Try adjusting your search criteria.</p>
                                </div>
                            )}

                            {/* Pagination info */}
                            {/* {paymentPlans.meta && (
                                <div className="mt-6 flex justify-between items-center border-t border-border pt-4">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {paymentPlans.meta.from || 0} to {paymentPlans.meta.to || 0} of {paymentPlans.meta.total || 0} results
                                    </div>
                                </div>
                            )} */}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Payment Plan Create Drawer */}
            {dropdownData && (
                <PaymentPlanCreateDrawer
                    dropdownData={dropdownData}
                    open={drawerOpen}
                    onOpenChange={setDrawerOpen}
                    onSuccess={() => {
                        router.reload();
                    }}
                />
            )}

            {/* Payment Plan Edit Drawer */}
            {dropdownData && selectedPaymentPlan && (
                <PaymentPlanEditDrawer
                    paymentPlan={selectedPaymentPlan}
                    dropdownData={dropdownData}
                    open={editDrawerOpen}
                    onOpenChange={setEditDrawerOpen}
                    onSuccess={() => {
                        router.reload();
                        setSelectedPaymentPlan(null);
                    }}
                />
            )}
        </AppLayout>
    );
}
