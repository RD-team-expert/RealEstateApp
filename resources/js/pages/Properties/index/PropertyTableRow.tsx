import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';
import { Property } from '@/types/property';
import PropertyStatusBadge from './PropertyStatusBadge';
import PropertyDaysLeftBadge from './PropertyDaysLeftBadge';

interface PropertyTableRowProps {
    property: Property;
    onEdit: (property: Property) => void;
    onDelete: (property: Property) => void;
    canEdit: boolean;
    canDelete: boolean;
    hasAnyActionPermission: boolean;
}

export default function PropertyTableRow({
    property,
    onEdit,
    onDelete,
    canEdit,
    canDelete,
    hasAnyActionPermission,
}: PropertyTableRowProps) {
    const calculateDaysLeft = (expirationDate: string): number => {
        const today = new Date();
        const expDate = new Date(expirationDate);
        const diffTime = expDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    return (
        <TableRow className="hover:bg-muted/50 border-border">
            <TableCell className="font-medium text-center text-foreground border border-border bg-muted sticky left-0 z-10 min-w-[120px]">
                {property.property?.property_name || 'N/A'}
            </TableCell>
            <TableCell className="text-center text-foreground border border-border">
                {property.insurance_company_name}
            </TableCell>
            <TableCell className="text-center text-foreground border border-border">
                {property.formatted_amount}
            </TableCell>
            <TableCell className="text-center text-foreground border border-border">
                {property.effective_date}
            </TableCell>
            <TableCell className="text-center text-foreground border border-border">
                {property.policy_number}
            </TableCell>
            <TableCell className="text-center text-foreground border border-border">
                {property.expiration_date}
            </TableCell>
            <TableCell className="text-center border border-border">
                <PropertyDaysLeftBadge daysLeft={calculateDaysLeft(property.expiration_date)} />
            </TableCell>
            <TableCell className="text-center border border-border">
                <PropertyStatusBadge status={property.status} />
            </TableCell>
            {hasAnyActionPermission && (
                <TableCell className="text-center border border-border">
                    <div className="flex gap-1">
                        {canEdit && (
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => onEdit(property)}
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                        )}
                        {canDelete && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onDelete(property)}
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
