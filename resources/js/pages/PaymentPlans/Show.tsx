import React from 'react';
import { type BreadcrumbItem } from '@/types';import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/app-layout';
import { PaymentPlanShowProps } from '@/types/PaymentPlan';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePermissions } from '@/hooks/usePermissions';

const formatCurrency = (amount: number | null) => {
  if (amount === null) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(amount));
};

const getStatusBadge = (status: string | null) => {
  if (!status) return <Badge variant="outline">No Status</Badge>;
  const variant =
    status === 'Paid'
      ? 'default'
      : status === 'Paid Partly'
      ? 'secondary'
      : 'outline';
  return <Badge variant={variant}>{status}</Badge>;
};

const Show: React.FC<PaymentPlanShowProps> = ({ paymentPlan }) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  return (
    <AppLayout >
      <Head title={`Payment Plan #${paymentPlan.id}`} />
      <div className="py-12">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl">Payment Plan Details</CardTitle>
                <div className="flex gap-2">
                    {hasAllPermissions(['payment-plans.edit','payment-plans.update']) && (
                  <Link href={route('payment-plans.edit', paymentPlan.id)}>
                    <Button>Edit Payment Plan</Button>
                  </Link>)}
                  <Link href={route('payment-plans.index')}>
                    <Button variant="outline">Back to List</Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  <div>
                    <p className="text-sm text-muted-foreground">Property</p>
                    <p className="font-medium">{paymentPlan.property}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Unit</p>
                    <p className="font-medium">{paymentPlan.unit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tenant</p>
                    <p className="font-medium">{paymentPlan.tenant}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {new Date(paymentPlan.dates).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {/* Status Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Status Information</h3>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div className="mt-1">{getStatusBadge(paymentPlan.status)}</div>
                  </div>
                </div>
              </div>
              {/* Financial Information */}
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold">Financial Details</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-primary/20 p-4 rounded-lg">
                    <p className="text-sm text-primary">Amount</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(paymentPlan.amount)}
                    </p>
                  </div>
                  <div className="bg-chart-1/20 p-4 rounded-lg">
                    <p className="text-sm text-chart-1">Paid</p>
                    <p className="text-2xl font-bold text-chart-1">
                      {formatCurrency(paymentPlan.paid)}
                    </p>
                  </div>
                  <div className="bg-destructive/20 p-4 rounded-lg">
                    <p className="text-sm text-destructive">Left to Pay</p>
                    <p className="text-2xl font-bold text-destructive">
                      {formatCurrency(paymentPlan.left_to_pay)}
                    </p>
                  </div>
                </div>
              </div>
              {/* Notes Section */}
              {paymentPlan.notes && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold">Notes</h3>
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-foreground whitespace-pre-wrap">{paymentPlan.notes}</p>
                  </div>
                </div>
              )}
              {/* Created/Updated */}
              <div className="mt-8 pt-6 border-t border-border">
                <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <p>
                      Created:{' '}
                      {new Date(paymentPlan.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p>
                      Updated:{' '}
                      {new Date(paymentPlan.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Show;
