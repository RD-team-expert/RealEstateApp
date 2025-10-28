import { Table, TableBody, TableHead, TableHeader, TableRow ,TableCell } from '@/components/ui/table';
import { VendorInfo } from '@/types/vendor';
import VendorTableRow from './VendorTableRow';

interface VendorTableProps {
    vendors: VendorInfo[];
    hasEditPermissions: boolean;
    hasDeletePermission: boolean;
    onEditVendor: (vendor: VendorInfo) => void;
    onDeleteVendor: (vendor: VendorInfo) => void;
}

export default function VendorTable({
    vendors,
    hasEditPermissions,
    hasDeletePermission,
    onEditVendor,
    onDeleteVendor,
}: VendorTableProps) {
    return (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
            <Table className="min-w-full">
                <TableHeader>
                    <TableRow className="border-b border-gray-200 bg-gray-50">
                        <TableHead className="sticky left-0 z-10 border-r border-gray-200 bg-gray-50 px-4 py-3 text-center font-semibold text-gray-900">
                            City
                        </TableHead>
                        <TableHead className="sticky left-[120px] z-10 border-r border-gray-200 bg-gray-50 px-4 py-3 text-center font-semibold text-gray-900">
                            Vendor Name
                        </TableHead>
                        <TableHead className="border-r border-gray-200 px-4 py-3 text-center font-semibold text-gray-900">
                            Phone Number
                        </TableHead>
                        <TableHead className="border-r border-gray-200 px-4 py-3 text-center font-semibold text-gray-900">
                            Email
                        </TableHead>
                        <TableHead className="border-r border-gray-200 px-4 py-3 text-center font-semibold text-gray-900">
                            Service Type
                        </TableHead>
                        <TableHead className="px-4 py-3 text-center font-semibold text-gray-900">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {vendors.length > 0 ? (
                        vendors.map((vendor) => (
                            <VendorTableRow
                                key={vendor.id}
                                vendor={vendor}
                                hasEditPermissions={hasEditPermissions}
                                hasDeletePermission={hasDeletePermission}
                                onEdit={onEditVendor}
                                onDelete={onDeleteVendor}
                            />
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="py-8 text-center text-gray-500">
                                No vendors found
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
