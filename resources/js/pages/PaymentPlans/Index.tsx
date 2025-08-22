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

interface Props extends PaymentPlanIndexProps {
  search?: string | null;
}

export default function Index({ paymentPlans, search }: Props) {
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
    if (!status) return null;
    let variant: any =
      status === 'Paid'
        ? 'default'
        : status === 'Paid Partly'
        ? 'secondary'
        : 'outline';
    return <Badge variant={variant}>{status}</Badge>;
  };

  return (
    <AppLayout>
      <Head title="Payment Plans" />
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl">Payment Plans Management</CardTitle>
                <Link href="/payment-plans/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payment Plan
                  </Button>
                </Link>
              </div>

              <form onSubmit={handleSearch} className="flex gap-2 mt-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Search by property, unit, tenant, status, or notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Tenant</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Paid</TableHead>
                      <TableHead className="text-right">Left to Pay</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Note</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentPlans.data.map((plan: PaymentPlan) => (
                      <TableRow key={plan.id} className="hover:bg-gray-50">
                        <TableCell>{plan.property}</TableCell>
                        <TableCell>{plan.unit}</TableCell>
                        <TableCell>{plan.tenant}</TableCell>
                        <TableCell className="text-right font-medium text-blue-600">
                          {formatCurrency(plan.amount)}
                        </TableCell>
                        <TableCell className="text-right text-green-600">
                          {formatCurrency(plan.paid)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-red-600">
                          {formatCurrency(plan.left_to_pay)}
                        </TableCell>
                        <TableCell>{getStatusBadge(plan.status)}</TableCell>
                        <TableCell>
                          {new Date(plan.dates).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{plan.notes}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Link href={`/payment-plans/${plan.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/payment-plans/${plan.id}/edit`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(plan)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {paymentPlans.data.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg">No payment plans found.</p>
                  <p className="text-sm">Try adjusting your search criteria.</p>
                </div>
              )}

              {/* Pagination info */}
              {paymentPlans.meta && (
                <div className="mt-6 flex justify-between items-center">
                  <div className="text-sm text-gray-600">
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
