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
import { MoveIn } from '@/types/move-in';

import { usePermissions } from '@/hooks/usePermissions';
interface Props {
    moveIns: {
        data: MoveIn[];
        links: any[];
        meta: any;
    };
    search: string | null;
}

export default function Index({ moveIns, search }: Props) {
    const [searchTerm, setSearchTerm] = useState(search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('move-in.index'), { search: searchTerm }, { preserveState: true });
    };
const { hasPermission, hasAnyPermission,hasAllPermissions } = usePermissions();
    const handleDelete = (moveIn: MoveIn) => {
        if (confirm('Are you sure you want to delete this move-in record?')) {
            router.delete(route('move-in.destroy', moveIn.id));
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

    return (
        <AppLayout>
            <Head title="Move-In Management" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">Move-In Management</CardTitle>
                                {hasAllPermissions(['move-in.create','move-in.store',])&&(
                                <Link href={route('move-in.create')}>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Move-In Record
                                    </Button>
                                </Link>)}
                            </div>

                            <form onSubmit={handleSearch} className="flex gap-2 mt-4">
                                <div className="flex-1">
                                    <Input
                                        type="text"
                                        placeholder="Search by unit name or status..."
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
                                            <TableHead>Unit Name</TableHead>
                                            <TableHead>Signed Lease</TableHead>
                                            <TableHead>Lease Signing Date</TableHead>
                                            <TableHead>Move-In Date</TableHead>
                                            <TableHead>Paid Security & First Month</TableHead>
                                            <TableHead>Scheduled Payment Date</TableHead>
                                            <TableHead>Handled Keys</TableHead>
                                            <TableHead>Move in form sent On</TableHead>
                                            <TableHead>Filled Move-In Form</TableHead>
                                            <TableHead>Date of move in form filled in</TableHead>
                                            <TableHead>Submitted Insurance</TableHead>
                                            <TableHead>Date of Insurance expiration </TableHead>
                                            {hasAnyPermission(['move-in.show','move-in.edit','move-in.update','move-in.destroy',])&&(
                                            <TableHead>Actions</TableHead>)}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {moveIns.data.map((moveIn) => (
                                            <TableRow key={moveIn.id} className="hover:bg-gray-50">
                                                <TableCell className="font-medium">{moveIn.unit_name}</TableCell>
                                                <TableCell>
                                                    {getYesNoBadge(moveIn.signed_lease)}
                                                </TableCell>
                                                <TableCell>
                                                    {moveIn.lease_signing_date
                                                        ? new Date(moveIn.lease_signing_date).toLocaleDateString()
                                                        : 'N/A'
                                                    }
                                                </TableCell>
                                                <TableCell>
                                                    {moveIn.move_in_date
                                                        ? new Date(moveIn.move_in_date).toLocaleDateString()
                                                        : 'N/A'
                                                    }
                                                </TableCell>
                                                <TableCell>
                                                    {getYesNoBadge(moveIn.paid_security_deposit_first_month_rent)}
                                                </TableCell>
                                                <TableCell>
                                                    {moveIn.scheduled_paid_time
                                                        ? new Date(moveIn.scheduled_paid_time).toLocaleDateString()
                                                        : 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    {getYesNoBadge(moveIn.handled_keys)}
                                                </TableCell>
                                                {/* move in date */}
                                                <TableCell>
                                                    {moveIn.move_in_form_sent_date
                                                        ? new Date(moveIn.move_in_form_sent_date).toLocaleDateString()
                                                        : 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    {getYesNoBadge(moveIn.filled_move_in_form)}
                                                </TableCell>
                                                {/* move in date */}
                                                <TableCell>
                                                    {moveIn.date_of_move_in_form_filled
                                                        ? new Date(moveIn.date_of_move_in_form_filled).toLocaleDateString()
                                                        : 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    {getYesNoBadge(moveIn.submitted_insurance)}
                                                </TableCell>
                                                {/* move in date */}
                                                <TableCell>
                                                    {moveIn.date_of_insurance_expiration
                                                        ? new Date(moveIn.date_of_insurance_expiration).toLocaleDateString()
                                                        : 'N/A'}
                                                </TableCell>
                                                {hasAnyPermission(['move-in.show','move-in.edit','move-in.update','move-in.destroy',])&&(
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        {hasPermission('move-in.show')&&(
                                                        <Link href={route('move-in.show', moveIn.id)}>
                                                            <Button variant="outline" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>)}
                                                        {hasAllPermissions(['move-in.edit','move-in.update'])&&(
                                                        <Link href={route('move-in.edit', moveIn.id)}>
                                                            <Button variant="outline" size="sm">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>)}
                                                        {hasPermission('move-in.destroy')&&(
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDelete(moveIn)}
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

                            {moveIns.data.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <p className="text-lg">No move-in records found.</p>
                                    <p className="text-sm">Try adjusting your search criteria.</p>
                                </div>
                            )}

                            {/* Pagination info */}
                            {moveIns.meta && (
                                <div className="mt-6 flex justify-between items-center">
                                    <div className="text-sm text-gray-600">
                                        Showing {moveIns.meta.from || 0} to {moveIns.meta.to || 0} of {moveIns.meta.total || 0} results
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
