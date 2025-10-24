import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { VendorTaskTracker } from '@/types/vendor-task-tracker';
import { Link } from '@inertiajs/react';
import { Edit, Eye, Trash2 } from 'lucide-react';

interface TaskTableRowProps {
    task: VendorTaskTracker;
    formatDateOnly: (value?: string | null, fallback?: string) => string;
    onEdit: (task: VendorTaskTracker) => void;
    onDelete: (task: VendorTaskTracker) => void;
    permissions: {
        canView: boolean;
        canEdit: boolean;
        canDelete: boolean;
        hasAnyPermission: boolean;
    };
}

export default function TaskTableRow({
    task,
    formatDateOnly,
    onEdit,
    onDelete,
    permissions,
}: TaskTableRowProps) {
    const getUrgentBadge = (urgent: 'Yes' | 'No') => {
        return <Badge variant={urgent === 'Yes' ? 'destructive' : 'secondary'}>{urgent}</Badge>;
    };

    const getStatusBadge = (status: string | null | undefined) => {
        const normalizedStatus = status ?? null;

        if (!normalizedStatus) return <Badge variant="outline">No Status</Badge>;

        const variant = normalizedStatus.toLowerCase().includes('completed')
            ? 'default'
            : normalizedStatus.toLowerCase().includes('pending')
            ? 'secondary'
            : 'outline';

        return <Badge variant={variant}>{normalizedStatus}</Badge>;
    };

    return (
        <TableRow className="border-border hover:bg-muted/50">
            <TableCell className="sticky left-0 z-10 border border-border bg-muted text-center font-medium text-foreground">
                {task.city || '-'}
            </TableCell>
            <TableCell className="sticky left-[120px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                {task.property_name || '-'}
            </TableCell>
            <TableCell className="sticky left-[270px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                {task.unit_name || '-'}
            </TableCell>
            <TableCell className="sticky left-[390px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                {task.vendor_name || '-'}
            </TableCell>
            <TableCell className="border border-border text-center text-foreground">
                {formatDateOnly(task.task_submission_date)}
            </TableCell>
            <TableCell className="border border-border text-center text-foreground">
                <div className="max-w-32 truncate" title={task.assigned_tasks || ''}>
                    {task.assigned_tasks || '-'}
                </div>
            </TableCell>
            <TableCell className="border border-border text-center text-foreground">
                {formatDateOnly(task.any_scheduled_visits)}
            </TableCell>
            <TableCell className="border border-border text-center text-foreground">
                {formatDateOnly(task.task_ending_date)}
            </TableCell>
            <TableCell className="border border-border text-center text-foreground">
                <div className="max-w-24 truncate" title={task.notes || ''}>
                    {task.notes || '-'}
                </div>
            </TableCell>
            <TableCell className="border border-border text-center">{getStatusBadge(task.status)}</TableCell>
            <TableCell className="border border-border text-center">{getUrgentBadge(task.urgent)}</TableCell>
            {permissions.hasAnyPermission && (
                <TableCell className="border border-border text-center">
                    <div className="flex gap-1">
                        {permissions.canView && (
                            <Link href={route('vendor-task-tracker.show', task.id)}>
                                <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </Link>
                        )}
                        {permissions.canEdit && (
                            <Button variant="outline" size="sm" onClick={() => onEdit(task)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                        )}
                        {permissions.canDelete && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onDelete(task)}
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
