// components/PaymentActions.tsx
import { Button } from '@/components/ui/button';
import { Payment } from '@/types/payments';
import { Link } from '@inertiajs/react';
import { Edit, Eye, Trash2 } from 'lucide-react';

interface PaymentActionsProps {
    payment: Payment;
    onEdit: (payment: Payment) => void;
    onDelete: (payment: Payment) => void;
    hasPermission: (permission: string) => boolean;
    hasAllPermissions: (permissions: string[]) => boolean;
}

export default function PaymentActions({
    payment,
    onEdit,
    onDelete,
    hasPermission,
    hasAllPermissions
}: PaymentActionsProps) {
    return (
        <div className="flex gap-1 justify-center">
            {hasPermission('payments.show') && (
                <Link href={route('payments.show', payment.id)}>
                    <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                    </Button>
                </Link>
            )}
            {hasAllPermissions(['payments.edit', 'payments.update']) && (
                <Button variant="outline" size="sm" onClick={() => onEdit(payment)}>
                    <Edit className="h-4 w-4" />
                </Button>
            )}
            {hasPermission('payments.destroy') && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(payment)}
                    className="border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
