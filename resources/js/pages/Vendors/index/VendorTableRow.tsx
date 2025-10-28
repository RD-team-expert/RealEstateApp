import { TableCell, TableRow } from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';
import { VendorInfo } from '@/types/vendor';

interface VendorTableRowProps {
    vendor: VendorInfo;
    hasEditPermissions: boolean;
    hasDeletePermission: boolean;
    onEdit: (vendor: VendorInfo) => void;
    onDelete: (vendor: VendorInfo) => void;
}

export default function VendorTableRow({
    vendor,
    hasEditPermissions,
    hasDeletePermission,
    onEdit,
    onDelete,
}: VendorTableRowProps) {
    return (
        <TableRow className="border-b border-gray-200 hover:bg-gray-50">
            <TableCell className="sticky left-0 z-10 border-r border-gray-200 bg-white px-4 py-3 text-center">
                {vendor.city?.city || 'N/A'}
            </TableCell>
            <TableCell className="sticky left-[120px] z-10 border-r border-gray-200 bg-white px-4 py-3 text-center font-medium">
                {vendor.vendor_name}
            </TableCell>
            <TableCell className="border-r border-gray-200 px-4 py-3 text-center">
                {vendor.number || 'N/A'}
            </TableCell>
            <TableCell className="border-r border-gray-200 px-4 py-3 text-center">
                {vendor.email || 'N/A'}
            </TableCell>
            <TableCell className="border-r border-gray-200 px-4 py-3 text-center">
                {vendor.service_type || 'N/A'}
            </TableCell>
            <TableCell className="px-4 py-3 text-center">
                <div className="flex justify-center gap-2">
                    {hasEditPermissions && (
                        <button
                            onClick={() => onEdit(vendor)}
                            className="text-green-600 hover:text-green-800"
                        >
                            <Edit className="h-4 w-4" />
                        </button>
                    )}
                    {hasDeletePermission && (
                        <button
                            onClick={() => onDelete(vendor)}
                            className="text-red-600 hover:text-red-800"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </TableCell>
        </TableRow>
    );
}
