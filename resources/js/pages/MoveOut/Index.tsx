import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Eye, Plus, Search } from 'lucide-react';
import { MoveOut } from '@/types/move-out';
import { usePermissions } from '@/hooks/usePermissions';
interface Props {
    moveOuts: {
        data: MoveOut[];
        links: any[];
        meta: any;
    };
    search: string | null;
}

export default function Index({ moveOuts, search }: Props) {
    const [searchTerm, setSearchTerm] = useState(search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('move-out.index'), { search: searchTerm }, { preserveState: true });
    };

    const handleDelete = (moveOut: MoveOut) => {
        if (confirm('Are you sure you want to delete this move-out record?')) {
            router.delete(route('move-out.destroy', moveOut.id));
        }
    };

    const getYesNoBadge = (value: 'Yes' | 'No' | null) => {
        if (value === null) return <Badge variant="outline">N/A</Badge>;
        return (
            <Badge variant={value === 'Yes' ? 'default' : 'secondary'}>
                {value}
            </Badge>
        );
    };

    const getCleaningBadge = (value: 'cleaned' | 'uncleaned' | null) => {
        if (value === null) return <Badge variant="outline">N/A</Badge>;
        return (
            <Badge variant={value === 'cleaned' ? 'default' : 'secondary'}>
                {value}
            </Badge>
        );
    };

    const getFormBadge = (value: 'filled' | 'not filled' | null) => {
        if (value === null) return <Badge variant="outline">N/A</Badge>;
        return (
            <Badge variant={value === 'filled' ? 'default' : 'secondary'}>
                {value}
            </Badge>
        );
    };

    const formatDate = (date: string | null) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString();
    };

    const { hasPermission, hasAnyPermission,hasAllPermissions } = usePermissions();
    return (
        <AppLayout>
            <Head title="Move-Out Management" />

            <div className="py-12">
                <div className="max-w-[100vw] mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">Move-Out Management</CardTitle>
                                {hasAllPermissions(['move-out.create','move-out.store',])&&(
                                <Link href={route('move-out.create')}>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Move-Out Record
                                    </Button>
                                </Link>)}
                            </div>

                            <form onSubmit={handleSearch} className="flex gap-2 mt-4">
                                <div className="flex-1">
                                    <Input
                                        type="text"
                                        placeholder="Search by tenant name, unit, or status..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <Button type="submit">
                                    <Search className="h-4 w-4" />
                                </Button>
                            </form>
                        </CardHeader>

                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>

                                            <TableHead className="min-w-[120px]">Unit Name</TableHead>
                                            <TableHead className="min-w-[150px]">Tenant Name</TableHead>
                                            <TableHead className="min-w-[120px]">Move Out Date</TableHead>
                                            <TableHead className="min-w-[120px]">Lease Status</TableHead>
                                            <TableHead className="min-w-[150px]">Lease Ending on Buildium</TableHead>
                                            <TableHead className="min-w-[120px]">Keys Location</TableHead>
                                            <TableHead className="min-w-[140px]">Utilities Under Our Name</TableHead>
                                            <TableHead className="min-w-[160px]">Date Utility Put Under Our Name</TableHead>
                                            <TableHead className="min-w-[150px]">Walkthrough</TableHead>
                                            <TableHead className="min-w-[120px]">Repairs</TableHead>
                                            <TableHead className="min-w-[160px]">Send Back Security Deposit</TableHead>
                                            <TableHead className="min-w-[120px]">Notes</TableHead>
                                            <TableHead className="min-w-[100px]">Cleaning</TableHead>
                                            <TableHead className="min-w-[120px]">List the Unit</TableHead>
                                            <TableHead className="min-w-[120px]">Move Out Form</TableHead>
                                            {hasAnyPermission(['move-out.show','move-out.edit','move-out.update','move-out.destroy',])&&(
                                            <TableHead className="min-w-[120px]">Actions</TableHead>)}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {moveOuts.data.map((moveOut) => (
                                            <TableRow key={moveOut.id} className="hover:bg-gray-50">
                                                <TableCell>{moveOut.units_name}</TableCell>
                                                <TableCell className="font-medium">{moveOut.tenants_name}</TableCell>
                                                <TableCell>{formatDate(moveOut.move_out_date)}</TableCell>
                                                <TableCell>
                                                    {moveOut.lease_status ? (
                                                        <Badge variant="outline">{moveOut.lease_status}</Badge>
                                                    ) : 'N/A'}
                                                </TableCell>
                                                <TableCell>{formatDate(moveOut.date_lease_ending_on_buildium)}</TableCell>
                                                <TableCell>{moveOut.keys_location || 'N/A'}</TableCell>
                                                <TableCell>
                                                    {getYesNoBadge(moveOut.utilities_under_our_name)}
                                                </TableCell>
                                                <TableCell>{formatDate(moveOut.date_utility_put_under_our_name)}</TableCell>
                                                <TableCell className="max-w-[150px] truncate">
                                                    {moveOut.walkthrough ? (
                                                        <span title={moveOut.walkthrough}>
                                                            {moveOut.walkthrough.length > 50
                                                                ? `${moveOut.walkthrough.substring(0, 50)}...`
                                                                : moveOut.walkthrough
                                                            }
                                                        </span>
                                                    ) : 'N/A'}
                                                </TableCell>
                                                <TableCell className="max-w-[120px] truncate">
                                                    {moveOut.repairs ? (
                                                        <span title={moveOut.repairs}>
                                                            {moveOut.repairs.length > 30
                                                                ? `${moveOut.repairs.substring(0, 30)}...`
                                                                : moveOut.repairs
                                                            }
                                                        </span>
                                                    ) : 'N/A'}
                                                </TableCell>
                                                <TableCell>{moveOut.send_back_security_deposit || 'N/A'}</TableCell>
                                                <TableCell className="max-w-[120px] truncate">
                                                    {moveOut.notes ? (
                                                        <span title={moveOut.notes}>
                                                            {moveOut.notes.length > 30
                                                                ? `${moveOut.notes.substring(0, 30)}...`
                                                                : moveOut.notes
                                                            }
                                                        </span>
                                                    ) : 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    {getCleaningBadge(moveOut.cleaning)}
                                                </TableCell>
                                                <TableCell>{moveOut.list_the_unit || 'N/A'}</TableCell>
                                                <TableCell>
                                                    {getFormBadge(moveOut.move_out_form)}
                                                </TableCell>
                                                {hasAnyPermission(['move-out.show','move-out.edit','move-out.update','move-out.destroy',])&&(
                                                <TableCell>

                                                    <div className="flex gap-1">
                                                        {hasPermission('move-out.show')&&(
                                                        <Link href={route('move-out.show', moveOut.id)}>
                                                            <Button variant="outline" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>)}
                                                        {hasAllPermissions(['move-out.edit','move-out.update'])&&(
                                                        <Link href={route('move-out.edit', moveOut.id)}>
                                                            <Button variant="outline" size="sm">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>)}
                                                        {hasPermission('move-out.destroy')&&(
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDelete(moveOut)}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>)}
                                                    </div>
                                                </TableCell>)}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {moveOuts.data.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <p className="text-lg">No move-out records found.</p>
                                    <p className="text-sm">Try adjusting your search criteria.</p>
                                </div>
                            )}

                            {/* Pagination info */}
                            {moveOuts.meta && (
                                <div className="mt-6 flex justify-between items-center">
                                    <div className="text-sm text-gray-600">
                                        Showing {moveOuts.meta.from || 0} to {moveOuts.meta.to || 0} of {moveOuts.meta.total || 0} results
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
