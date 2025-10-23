import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoveOut } from '@/types/move-out';
import MoveOutTableRow from './MoveOutTableRow';

interface MoveOutTableProps {
    moveOuts: MoveOut[];
    formatDateOnly: (value?: string | null, fallback?: string) => string;
    hasPermission: (permission: string) => boolean;
    hasAnyPermission: (permissions: string[]) => boolean;
    hasAllPermissions: (permissions: string[]) => boolean;
    onEdit: (moveOut: MoveOut) => void;
    onDelete: (moveOut: MoveOut) => void;
}

export default function MoveOutTable({
    moveOuts,
    formatDateOnly,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    onEdit,
    onDelete,
}: MoveOutTableProps) {
    return (
        <div className="relative overflow-x-auto">
            <Table className="border-collapse rounded-md border border-border">
                <TableHeader>
                    <TableRow className="border-border">
                        <TableHead className="sticky left-0 z-10 min-w-[120px] border border-border bg-muted text-muted-foreground">
                            City
                        </TableHead>
                        <TableHead className="sticky left-[120px] z-10 min-w-[150px] border border-border bg-muted text-muted-foreground">
                            Property Name
                        </TableHead>
                        <TableHead className="sticky left-[270px] z-10 min-w-[120px] border border-border bg-muted text-muted-foreground">
                            Unit Name
                        </TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground">Move Out Date</TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground">Lease Status</TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground">
                            Lease Ending on Buildium
                        </TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground">Keys Location</TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground">
                            Utilities Under Our Name
                        </TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground">
                            Date Utility Put Under Our Name
                        </TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground">Walkthrough</TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground">Repairs</TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground">
                            Send Back Security Deposit
                        </TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground">Notes</TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground">Cleaning</TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground">List the Unit</TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground">Move Out Form</TableHead>
                        {hasAnyPermission(['move-out.show', 'move-out.edit', 'move-out.update', 'move-out.destroy']) && (
                            <TableHead className="border border-border bg-muted text-muted-foreground">Actions</TableHead>
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {moveOuts.map((moveOut) => (
                        <MoveOutTableRow
                            key={moveOut.id}
                            moveOut={moveOut}
                            formatDateOnly={formatDateOnly}
                            hasPermission={hasPermission}
                            hasAnyPermission={hasAnyPermission}
                            hasAllPermissions={hasAllPermissions}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
