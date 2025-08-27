import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { PaymentPlanIndexProps, PaymentPlan } from '@/types/PaymentPlan';
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
import { Trash2, Edit, Eye, Plus, Search } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { type BreadcrumbItem } from '@/types';
interface Props extends PaymentPlanIndexProps {
  search?: string | null;
}

export default function Index({ paymentPlans, search }: Props) {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
    const [searchTerm, setSearchTerm] = useState(search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/payment-plans', { search: searchTerm }, { preserveState: true });
    };

    const handleDelete = (paymentPlan: PaymentPlan) => {
        if (confirm('Are you sure you want to delete this payment plan?')) {
            router.delete(`/payment-plans/${paymentPlan.id}`);
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

    const breadcrumbs: BreadcrumbItem[] = [
              {
                  title: 'Payment Plans',
                  href: '/payment-plans',
              }
          ];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payment Plans" />

            <div className="py-12 bg-background text-foreground transition-colors min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card className="bg-card text-card-foreground shadow-lg">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">Payment Plans Management</CardTitle>
                                {hasAllPermissions(['payment-plans.create','payment-plans.store']) && (
                                <Link href="/payment-plans/create">
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Payment Plan
                                    </Button>
                                </Link>)}
                            </div>

                            <form onSubmit={handleSearch} className="flex gap-2 mt-4">
                                <div className="flex-1">
                                    <Input
                                        type="text"
                                        placeholder="Search by property, unit, tenant, status, or notes..."
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
                                                        <Link href={route('payment-plans.edit', plan.id)}>
                                                            <Button variant="outline" size="sm">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>)}
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
                            {paymentPlans.meta && (
                                <div className="mt-6 flex justify-between items-center border-t border-border pt-4">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {paymentPlans.meta.from || 0} to {paymentPlans.meta.to || 0} of {paymentPlans.meta.total || 0} results
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
