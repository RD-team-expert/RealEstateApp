import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { MoveIn } from '@/types/move-in';
import { Edit, Trash2 } from 'lucide-react';

interface MoveInTableRowProps {
    moveIn: MoveIn;
    canEdit: boolean;
    canDelete: boolean;
    onEdit: (moveIn: MoveIn) => void;
    onDelete: (moveIn: MoveIn) => void;
}

export default function MoveInTableRow({
    moveIn,
    canEdit,
    canDelete,
    onEdit,
    onDelete,
}: MoveInTableRowProps) {
    const formatDateUTC = (dateStr?: string | null) => {
        if (!dateStr) return 'N/A';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return 'N/A';
        return new Intl.DateTimeFormat(undefined, {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            timeZone: 'UTC',
        }).format(d);
    };

    const getYesNoBadge = (value: 'Yes' | 'No' | null) => {
        if (value === null) return <Badge variant="outline">N/A</Badge>;
        return (
            <Badge
                variant={value === 'Yes' ? 'default' : 'secondary'}
                className={
                    value === 'Yes'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                }
            >
                {value}
            </Badge>
        );
    };

    return (
        <TableRow className="border-border hover:bg-muted/50">
            <TableCell className="sticky left-0 z-10 border border-border bg-muted text-center font-medium text-foreground">
                {moveIn.city_name}
            </TableCell>
            <TableCell className="sticky left-[120px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                {moveIn.property_name}
            </TableCell>
            <TableCell className="sticky left-[270px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                {moveIn.unit_name}
            </TableCell>
            <TableCell className="border border-border text-center">
                {getYesNoBadge(moveIn.signed_lease)}
            </TableCell>
            <TableCell className="border border-border text-center text-foreground">
                {formatDateUTC(moveIn.lease_signing_date)}
            </TableCell>
            <TableCell className="border border-border text-center text-foreground">
                {formatDateUTC(moveIn.move_in_date)}
            </TableCell>
            <TableCell className="border border-border text-center">
                {getYesNoBadge(moveIn.paid_security_deposit_first_month_rent)}
            </TableCell>
            <TableCell className="border border-border text-center text-foreground">
                {formatDateUTC(moveIn.scheduled_paid_time)}
            </TableCell>
            <TableCell className="border border-border text-center">
                {getYesNoBadge(moveIn.handled_keys)}
            </TableCell>
            <TableCell className="border border-border text-center text-foreground">
                {formatDateUTC(moveIn.move_in_form_sent_date)}
            </TableCell>
            <TableCell className="border border-border text-center">
                {getYesNoBadge(moveIn.filled_move_in_form)}
            </TableCell>
            <TableCell className="border border-border text-center text-foreground">
                {formatDateUTC(moveIn.date_of_move_in_form_filled)}
            </TableCell>
            <TableCell className="border border-border text-center">
                {getYesNoBadge(moveIn.submitted_insurance)}
            </TableCell>
            <TableCell className="border border-border text-center text-foreground">
                {formatDateUTC(moveIn.date_of_insurance_expiration)}
            </TableCell>
            {(canEdit || canDelete) && (
                <TableCell className="border border-border text-center">
                    <div className="flex gap-1">
                        {canEdit && (
                            <Button variant="outline" size="sm" onClick={() => onEdit(moveIn)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                        )}
                        {canDelete && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onDelete(moveIn)}
                                className="border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive"
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
