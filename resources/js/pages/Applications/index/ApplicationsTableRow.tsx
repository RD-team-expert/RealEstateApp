// resources/js/Pages/Applications/index/ApplicationsTableRow.tsx
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Application } from '@/types/application';
import { Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { Edit, Eye, Trash2, FileText } from 'lucide-react';

interface ApplicationsTableRowProps {
    application: Application;
    onEdit: (application: Application) => void;
    onDelete: (application: Application) => void;
    hasViewPermission: boolean;
    hasEditPermission: boolean;
    hasDeletePermission: boolean;
    filters?: {
        city: string;
        property: string;
        unit: string;
        name: string;
        applicant_applied_from: string;
    };
}

const formatDateOnly = (value?: string | null, fallback = '-'): string => {
    if (!value) return fallback;

    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (!m) return fallback;

    const [, y, mo, d] = m;
    const date = new Date(Number(y), Number(mo) - 1, Number(d));
    return format(date, 'P');
};

const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline">No Status</Badge>;
    return <Badge variant="default">{status}</Badge>;
};

export default function ApplicationsTableRow({
    application,
    onEdit,
    onDelete,
    hasViewPermission,
    hasEditPermission,
    hasDeletePermission,
    filters,
}: ApplicationsTableRowProps) {
    const attachmentCount = application.attachments?.length || 0;

    return (
        <TableRow className="border-border hover:bg-muted/50">
            <TableCell className="sticky left-0 z-10 border border-border bg-muted text-center font-medium text-foreground">
                {application.city}
            </TableCell>
            <TableCell className="sticky left-[120px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                {application.property}
            </TableCell>
            <TableCell className="sticky left-[270px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                {application.unit_name}
            </TableCell>
            <TableCell className="border border-border text-center text-foreground">{application.name}</TableCell>
            <TableCell className="border border-border text-center text-foreground">
                {application.co_signer || <span className="text-muted-foreground">N/A</span>}
            </TableCell>
            <TableCell className="border border-border text-center">{getStatusBadge(application.status)}</TableCell>
            <TableCell className="border border-border text-center text-foreground">
                {application.applicant_applied_from || <span className="text-muted-foreground">N/A</span>}
            </TableCell>
            <TableCell className="border border-border text-center text-foreground">{formatDateOnly(application.date)}</TableCell>
            <TableCell className="border border-border text-center text-foreground">
                {application.stage_in_progress || 'N/A'}
            </TableCell>
            <TableCell className="border border-border text-center">
                {application.notes ? (
                    <div className="max-w-24 truncate" title={application.notes}>
                        {application.notes}
                    </div>
                ) : (
                    <span className="text-muted-foreground">N/A</span>
                )}
            </TableCell>
            <TableCell className="border border-border text-center">
                {attachmentCount > 0 ? (
                    <Badge variant="secondary" className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {attachmentCount} {attachmentCount === 1 ? 'file' : 'files'}
                    </Badge>
                ) : (
                    <span className="text-sm text-muted-foreground">No files</span>
                )}
            </TableCell>
            {(hasViewPermission || hasEditPermission || hasDeletePermission) && (
                <TableCell className="border border-border text-center">
                    <div className="flex gap-1">
                        {hasViewPermission && (
                            <Link
                                href={route('applications.show', {
                                    application: application.id,
                                    city: filters?.city || '',
                                    property: filters?.property || '',
                                    unit: filters?.unit || '',
                                    name: filters?.name || '',
                                    applicant_applied_from: filters?.applicant_applied_from || '',
                                })}
                            >
                                <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </Link>
                        )}
                        {hasEditPermission && (
                            <Button variant="outline" size="sm" onClick={() => onEdit(application)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                        )}
                        {hasDeletePermission && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onDelete(application)}
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
