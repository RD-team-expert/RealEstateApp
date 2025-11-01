import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { PaymentPlan } from '@/types/PaymentPlan';
import { usePermissions } from '@/hooks/usePermissions';
import PaymentPlanTableRow from './PaymentPlanTableRow';

interface PaymentPlansTableProps {
    paymentPlans: { data: PaymentPlan[] };
    onEdit: (plan: PaymentPlan) => void;
    onDelete: (plan: PaymentPlan) => void;
}

export default function PaymentPlansTable({ paymentPlans, onEdit, onDelete }: PaymentPlansTableProps) {
    const { hasAnyPermission } = usePermissions();

    return (
        <Card className="bg-card text-card-foreground shadow-lg">
            <CardContent>
                <div className="relative overflow-x-auto">
                    <Table className="border-collapse rounded-md border border-border">
                        <TableHeader>
                            <TableRow className="border-border">
                                <TableHead className="sticky left-0 z-10 min-w-[120px] border border-border bg-muted text-muted-foreground">
                                    City
                                </TableHead>
                                <TableHead className="sticky left-[120px] z-10 min-w-[150px] border border-border bg-muted text-muted-foreground">
                                    Property
                                </TableHead>
                                <TableHead className="sticky left-[270px] z-10 min-w-[120px] border border-border bg-muted text-muted-foreground">
                                    Unit
                                </TableHead>
                                <TableHead className="sticky left-[390px] z-10 min-w-[150px] border border-border bg-muted text-muted-foreground">
                                    Tenant
                                </TableHead>
                                <TableHead className="border border-border bg-muted text-muted-foreground text-right">Amount</TableHead>
                                <TableHead className="border border-border bg-muted text-muted-foreground text-right">Paid</TableHead>
                                <TableHead className="border border-border bg-muted text-muted-foreground text-right">Left to Pay</TableHead>
                                <TableHead className="border border-border bg-muted text-muted-foreground">Status</TableHead>
                                <TableHead className="border border-border bg-muted text-muted-foreground">Date</TableHead>
                                <TableHead className="border border-border bg-muted text-muted-foreground">Note</TableHead>
                                {hasAnyPermission(['payment-plans.show', 'payment-plans.edit', 'payment-plans.update', 'payment-plans.destroy']) && (
                                    <TableHead className="border border-border bg-muted text-muted-foreground">Actions</TableHead>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paymentPlans.data.map((plan: PaymentPlan) => (
                                <PaymentPlanTableRow
                                    key={plan.id}
                                    plan={plan}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                />
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
            </CardContent>
        </Card>
    );
}
