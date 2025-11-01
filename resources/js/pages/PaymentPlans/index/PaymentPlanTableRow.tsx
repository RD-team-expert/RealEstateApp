import { Link } from '@inertiajs/react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, Eye } from 'lucide-react';
import { PaymentPlan } from '@/types/PaymentPlan';
import { usePermissions } from '@/hooks/usePermissions';
import { formatCurrency } from './formatCurrency';
import { formatDateOnly } from './formatDate';
import StatusBadge from './StatusBadge';

interface PaymentPlanTableRowProps {
    plan: PaymentPlan;
    onEdit: (plan: PaymentPlan) => void;
    onDelete: (plan: PaymentPlan) => void;
}

export default function PaymentPlanTableRow({ plan, onEdit, onDelete }: PaymentPlanTableRowProps) {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

    return (
        <TableRow className="border-border hover:bg-muted/50">
            <TableCell className="sticky left-0 z-10 border border-border bg-muted text-center font-medium text-foreground">
                {plan.city_name || 'N/A'}
            </TableCell>
            <TableCell className="sticky left-[120px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                {plan.property}
            </TableCell>
            <TableCell className="sticky left-[270px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                {plan.unit}
            </TableCell>
            <TableCell className="sticky left-[390px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                {plan.tenant}
            </TableCell>
            <TableCell className="border border-border text-center font-medium text-blue-600 dark:text-blue-400">
                {formatCurrency(plan.amount)}
            </TableCell>
            <TableCell className="border border-border text-center text-green-600 dark:text-green-400">
                {formatCurrency(plan.paid)}
            </TableCell>
            <TableCell className="border border-border text-center font-medium text-red-600 dark:text-red-400">
                {formatCurrency(plan.left_to_pay)}
            </TableCell>
            <TableCell className="border border-border text-center">
                <StatusBadge status={plan.status} />
            </TableCell>
            <TableCell className="border border-border text-center text-foreground">
                {formatDateOnly(plan.dates) || 'N/A'}
            </TableCell>
            <TableCell className="border border-border text-center">
                {plan.notes ? (
                    <div className="max-w-24 truncate" title={plan.notes}>
                        {plan.notes}
                    </div>
                ) : (
                    <span className="text-muted-foreground">N/A</span>
                )}
            </TableCell>
            {hasAnyPermission(['payment-plans.show', 'payment-plans.edit', 'payment-plans.update', 'payment-plans.destroy']) && (
                <TableCell className="border border-border text-center">
                    <div className="flex gap-1">
                        {hasPermission('payment-plans.show') && (
                            <Link href={route('payment-plans.show', plan.id)}>
                                <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </Link>
                        )}
                        {hasAllPermissions(['payment-plans.update', 'payment-plans.edit']) && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEdit(plan)}
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                        )}
                        {hasPermission('payment-plans.destroy') && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onDelete(plan)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </TableCell>
            )}
        </TableRow>
    );
}
