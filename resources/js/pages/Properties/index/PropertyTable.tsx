import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Property } from '@/types/property';
import PropertyTableRow from './PropertyTableRow';

interface PropertyTableProps {
    properties: Property[];
    onEdit: (property: Property) => void;
    onDelete: (property: Property) => void;
    canEdit: boolean;
    canDelete: boolean;
    hasAnyActionPermission: boolean;
}

export default function PropertyTable({
    properties,
    onEdit,
    onDelete,
    canEdit,
    canDelete,
    hasAnyActionPermission,
}: PropertyTableProps) {
    return (
        <div className="overflow-x-auto relative">
            <Table className="border-collapse border border-border rounded-md">
                <TableHeader>
                    <TableRow className="border-border">
                        <TableHead className="text-muted-foreground border border-border bg-muted sticky left-0 z-10 min-w-[120px]">
                            Property Name
                        </TableHead>
                        <TableHead className="text-muted-foreground border border-border bg-muted">
                            Insurance Company
                        </TableHead>
                        <TableHead className="text-muted-foreground border border-border bg-muted">
                            Amount
                        </TableHead>
                        <TableHead className="text-muted-foreground border border-border bg-muted">
                            Effective Date
                        </TableHead>
                        <TableHead className="text-muted-foreground border border-border bg-muted">
                            Policy Number
                        </TableHead>
                        <TableHead className="text-muted-foreground border border-border bg-muted">
                            Expiration Date
                        </TableHead>
                        <TableHead className="text-muted-foreground border border-border bg-muted">
                            Days Left
                        </TableHead>
                        <TableHead className="text-muted-foreground border border-border bg-muted">
                            Status
                        </TableHead>
                        {hasAnyActionPermission && (
                            <TableHead className="text-muted-foreground border border-border bg-muted">
                                Actions
                            </TableHead>
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {properties.map((property) => (
                        <PropertyTableRow
                            key={property.id}
                            property={property}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            canEdit={canEdit}
                            canDelete={canDelete}
                            hasAnyActionPermission={hasAnyActionPermission}
                        />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
