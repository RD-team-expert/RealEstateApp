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
import { Payment } from '@/types/payments';

interface Props {
    payments: {
        data: Payment[];
        links: any[];
        meta: any;
    };
    search: string | null;
}

export default function Index({ payments, search }: Props) {
    const [searchTerm, setSearchTerm] = useState(search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('payments.index'), { search: searchTerm }, { preserveState: true });
    };

    const handleDelete = (payment: Payment) => {
        if (confirm('Are you sure you want to delete this payment?')) {
            router.delete(route('payments.destroy', payment.id));
        }
    };

    const formatCurrency = (amount: number | null) => {
        if (amount === null) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const getStatusBadge = (status: string | null) => {
        if (!status) return null;

        const variant = status.toLowerCase().includes('paid') ? 'default' :
                      status.toLowerCase().includes('pending') ? 'secondary' : 'outline';

        return <Badge variant={variant}>{status}</Badge>;
    };

    return (
        <AppLayout>
            <Head title="Payments" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">Payments Management</CardTitle>
                                <Link href={route('payments.create')}>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Payment
                                    </Button>
                                </Link>
                            </div>

                            <form onSubmit={handleSearch} className="flex gap-2 mt-4">
                                <div className="flex-1">
                                    <Input
                                        type="text"
                                        placeholder="Search payments by city, unit, status, or notes..."
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
                                            <TableHead>Date</TableHead>
                                            <TableHead>City</TableHead>
                                            <TableHead>Unit Name</TableHead>
                                            <TableHead className="text-right">Owes</TableHead>
                                            <TableHead className="text-right">Paid</TableHead>
                                            <TableHead className="text-right">Left to Pay</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Permanent</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {payments.data.map((payment) => (
                                            <TableRow key={payment.id} className="hover:bg-gray-50">
                                                <TableCell>
                                                    {new Date(payment.date).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="font-medium">{payment.city}</TableCell>
                                                <TableCell>{payment.unit_name}</TableCell>
                                                <TableCell className="text-right font-medium text-red-600">
                                                    {formatCurrency(payment.owes)}
                                                </TableCell>
                                                <TableCell className="text-right text-green-600">
                                                    {formatCurrency(payment.paid)}
                                                </TableCell>
                                                <TableCell className="text-right font-medium text-blue-600">
                                                    {formatCurrency(payment.left_to_pay)}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(payment.status)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={payment.permanent === 'Yes' ? 'default' : 'secondary'}>
                                                        {payment.permanent}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        <Link href={route('payments.show', payment.id)}>
                                                            <Button variant="outline" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Link href={route('payments.edit', payment.id)}>
                                                            <Button variant="outline" size="sm">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDelete(payment)}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {payments.data.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <p className="text-lg">No payments found.</p>
                                    <p className="text-sm">Try adjusting your search criteria.</p>
                                </div>
                            )}

                            {/* Pagination info */}
                            {payments.meta && (
                                <div className="mt-6 flex justify-between items-center">
                                    <div className="text-sm text-gray-600">
                                        Showing {payments.meta.from || 0} to {payments.meta.to || 0} of {payments.meta.total || 0} results
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
