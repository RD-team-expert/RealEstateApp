import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { MoveOut } from '@/types/move-out';
import { Link } from '@inertiajs/react';
import { Edit, Eye, Trash2 } from 'lucide-react';

interface MoveOutTableRowProps {
    moveOut: MoveOut;
    formatDateOnly: (value?: string | null, fallback?: string) => string;
    hasPermission: (permission: string) => boolean;
    hasAnyPermission: (permissions: string[]) => boolean;
    hasAllPermissions: (permissions: string[]) => boolean;
    onEdit: (moveOut: MoveOut) => void;
    onDelete: (moveOut: MoveOut) => void;
}

export default function MoveOutTableRow({
    moveOut,
    formatDateOnly,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    onEdit,
    onDelete,
}: MoveOutTableRowProps) {
    const getYesNoBadge = (value: 'Yes' | 'No' | null) => {
        if (value === null) return <Badge variant="outline">N/A</Badge>;
        return (
            <Badge
                variant={value === 'Yes' ? 'default' : 'secondary'}
                className={
                    value === 'Yes'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                }
            >
                {value}
            </Badge>
        );
    };

    const getCleaningBadge = (value: 'cleaned' | 'uncleaned' | null) => {
        if (value === null) return <Badge variant="outline">N/A</Badge>;
        return (
            <Badge
                variant={value === 'cleaned' ? 'default' : 'secondary'}
                className={
                    value === 'cleaned'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                }
            >
                {value}
            </Badge>
        );
    };

    const getFormBadge = (value: 'filled' | 'not filled' | null) => {
        if (value === null) return <Badge variant="outline">N/A</Badge>;
        return (
            <Badge
                variant={value === 'filled' ? 'default' : 'secondary'}
                className={
                    value === 'filled'
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
                {moveOut.city_name || 'N/A'}
            </TableCell>
            <TableCell className="sticky left-[120px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                {moveOut.property_name || 'N/A'}
            </TableCell>
            <TableCell className="sticky left-[270px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                {moveOut.unit_name || 'N/A'}
            </TableCell>
            <TableCell className="border border-border text-center text-foreground">
                {moveOut.tenants ? (
                    <div className="max-w-24 truncate" title={moveOut.tenants}>
                        {moveOut.tenants}
                    </div>
                ) : (
                    <span className="text-muted-foreground">N/A</span>
                )}
            </TableCell>
            <TableCell className="border border-border text-center text-foreground">
                {formatDateOnly(moveOut.move_out_date)}
            </TableCell>
            <TableCell className="border border-border text-center">
                {moveOut.lease_status ? (
                    <Badge variant="outline">{moveOut.lease_status}</Badge>
                ) : (
                    <span className="text-muted-foreground">N/A</span>
                )}
            </TableCell>
            <TableCell className="border border-border text-center text-foreground">
                {formatDateOnly(moveOut.date_lease_ending_on_buildium)}
            </TableCell>
            <TableCell className="border border-border text-center text-foreground">
                {moveOut.keys_location || <span className="text-muted-foreground">N/A</span>}
            </TableCell>
            <TableCell className="border border-border text-center">
                {getYesNoBadge(moveOut.utilities_under_our_name)}
            </TableCell>
            <TableCell className="border border-border text-center">
                {moveOut.utility_type ? (
                    <div className="max-w-32 truncate" title={moveOut.utility_type}>
                        {moveOut.utility_type}
                    </div>
                ) : (
                    <span className="text-muted-foreground">N/A</span>
                )}
            </TableCell>
            <TableCell className="border border-border text-center text-foreground">
                {formatDateOnly(moveOut.date_utility_put_under_our_name)}
            </TableCell>
            <TableCell className="border border-border text-center">
                {moveOut.walkthrough ? (
                    <div className="max-w-32 truncate" title={moveOut.walkthrough}>
                        {moveOut.walkthrough}
                    </div>
                ) : (
                    <span className="text-muted-foreground">N/A</span>
                )}
            </TableCell>
            <TableCell className="border border-border text-center">
                {moveOut.repairs ? (
                    <div className="max-w-24 truncate" title={moveOut.repairs}>
                        {moveOut.repairs}
                    </div>
                ) : (
                    <span className="text-muted-foreground">N/A</span>
                )}
            </TableCell>
            <TableCell className="border border-border text-center text-foreground">
                {moveOut.send_back_security_deposit || <span className="text-muted-foreground">N/A</span>}
            </TableCell>
            <TableCell className="border border-border text-center">
                {moveOut.notes ? (
                    <div className="max-w-24 truncate" title={moveOut.notes}>
                        {moveOut.notes}
                    </div>
                ) : (
                    <span className="text-muted-foreground">N/A</span>
                )}
            </TableCell>
            <TableCell className="border border-border text-center">
                {getCleaningBadge(moveOut.cleaning)}
            </TableCell>
            <TableCell className="border border-border text-center text-foreground">
                {moveOut.list_the_unit || <span className="text-muted-foreground">N/A</span>}
            </TableCell>
            <TableCell className="border border-border text-center">
                {getFormBadge(moveOut.move_out_form)}
            </TableCell>
            
            {hasAnyPermission(['move-out.show', 'move-out.edit', 'move-out.update', 'move-out.destroy']) && (
                <TableCell className="border border-border text-center">
                    <div className="flex gap-1">
                        {hasPermission('move-out.show') && (
                            <Link href={route('move-out.show', moveOut.id)}>
                                <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </Link>
                        )}
                        {hasAllPermissions(['move-out.edit', 'move-out.update']) && (
                            <Button variant="outline" size="sm" onClick={() => onEdit(moveOut)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                        )}
                        {hasPermission('move-out.destroy') && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onDelete(moveOut)}
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
