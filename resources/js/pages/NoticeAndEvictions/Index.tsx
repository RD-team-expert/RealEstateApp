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
import { NoticeAndEviction } from '@/types/NoticeAndEviction';

interface Props {
    records: NoticeAndEviction[];
    search?: string;
}

const Index = ({ records, search }: Props) => {
    const [searchTerm, setSearchTerm] = useState(search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('notice-and-evictions.index'), { search: searchTerm }, { preserveState: true });
    };

    const handleDelete = (record: NoticeAndEviction) => {
        if (window.confirm('Delete this record? This cannot be undone.')) {
            router.delete(`/notice_and_evictions/${record.id}`);
        }
    };

    const getStatusBadge = (status: string | null) => {
        if (!status) return <Badge variant="outline">N/A</Badge>;
        return <Badge variant="default">{status}</Badge>;
    };

    const getYesNoBadge = (value: string | null) => {
        if (!value || value === '-') return <Badge variant="outline">N/A</Badge>;
        return (
            <Badge variant={value === 'Yes' ? 'default' : 'secondary'}>
                {value}
            </Badge>
        );
    };

    return (
        <AppLayout>
            <Head title="Notice & Evictions" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">Notice & Evictions</CardTitle>
                                <Link href="/notice_and_evictions/create">
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Record
                                    </Button>
                                </Link>
                            </div>
                            <form onSubmit={handleSearch} className="flex gap-2 mt-4">
                                <div className="flex-1">
                                    <Input
                                        type="text"
                                        placeholder="Search by unit name, tenant name, or status..."
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
                                            <TableHead>ID</TableHead>
                                            <TableHead>Unit Name</TableHead>
                                            <TableHead>Tenants Name</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Type of Notice</TableHead>
                                            <TableHead>Have An Exception?</TableHead>
                                            <TableHead>Note</TableHead>
                                            <TableHead>Evictions</TableHead>
                                            <TableHead>Sent to Attorney</TableHead>
                                            <TableHead>Hearing Dates</TableHead>
                                            <TableHead>Evicted/Payment Plan</TableHead>
                                            <TableHead>If Left?</TableHead>
                                            <TableHead>Writ Date</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {records.map((record) => (
                                            <TableRow key={record.id} className="hover:bg-gray-50">
                                                <TableCell className="font-medium">{record.id}</TableCell>
                                                <TableCell>{record.unit_name}</TableCell>
                                                <TableCell>{record.tenants_name}</TableCell>
                                                <TableCell>
                                                    {getStatusBadge(record.status)}
                                                </TableCell>
                                                <TableCell>
                                                    {record.date
                                                        ? new Date(record.date).toLocaleDateString()
                                                        : 'N/A'
                                                    }
                                                </TableCell>
                                                <TableCell>{record.type_of_notice || 'N/A'}</TableCell>
                                                <TableCell>
                                                    {getYesNoBadge(record.have_an_exception)}
                                                </TableCell>
                                                <TableCell>{record.note || 'N/A'}</TableCell>
                                                <TableCell>{record.evictions || 'N/A'}</TableCell>
                                                <TableCell>
                                                    {getYesNoBadge(record.sent_to_atorney)}
                                                </TableCell>
                                                <TableCell>
                                                    {record.hearing_dates
                                                        ? new Date(record.hearing_dates).toLocaleDateString()
                                                        : 'N/A'
                                                    }
                                                </TableCell>
                                                <TableCell>{record.evected_or_payment_plan || 'N/A'}</TableCell>
                                                <TableCell>
                                                    {getYesNoBadge(record.if_left)}
                                                </TableCell>
                                                <TableCell>
                                                    {record.writ_date
                                                        ? new Date(record.writ_date).toLocaleDateString()
                                                        : 'N/A'
                                                    }
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        <Link href={`/notice_and_evictions/${record.id}`}>
                                                            <Button variant="outline" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Link href={`/notice_and_evictions/${record.id}/edit`}>
                                                            <Button variant="outline" size="sm">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDelete(record)}
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

                            {records.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <p className="text-lg">No records found.</p>
                                    <p className="text-sm">Try adjusting your search criteria.</p>
                                </div>
                            )}

                            {/* Records count info */}
                            <div className="mt-6 flex justify-between items-center">
                                <div className="text-sm text-gray-600">
                                    Showing {records.length} records
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
};

export default Index;
