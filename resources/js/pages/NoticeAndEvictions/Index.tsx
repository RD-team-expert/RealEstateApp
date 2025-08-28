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
import { usePermissions } from '@/hooks/usePermissions';
import { type BreadcrumbItem } from '@/types';
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

        // Use theme-aware status colors
        switch (status.toLowerCase()) {
            case 'active':
                return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">{status}</Badge>;
            case 'pending':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">{status}</Badge>;
            case 'closed':
                return <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">{status}</Badge>;
            default:
                return <Badge variant="default">{status}</Badge>;
        }
    };

    const getYesNoBadge = (value: string | null) => {
        if (!value || value === '-') return <Badge variant="outline">N/A</Badge>;
        return (
            <Badge variant={value === 'Yes' ? 'default' : 'secondary'} className={
                value === 'Yes'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
            }>
                {value}
            </Badge>
        );
    };

    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

    
    return (
        <AppLayout >
            <Head title="Notice & Evictions" />

            <div className="py-12 bg-background text-foreground transition-colors min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card className="bg-card text-card-foreground shadow-lg">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">Notice & Evictions</CardTitle>
                                {hasAllPermissions(['notice-and-evictions.create','notice-and-evictions.store']) && (
                                <Link href="/notice_and_evictions/create">
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Record
                                    </Button>
                                </Link>)}
                            </div>
                            <form onSubmit={handleSearch} className="flex gap-2 mt-4">
                                <div className="flex-1">
                                    <Input
                                        type="text"
                                        placeholder="Search by unit name, tenant name, or status..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="bg-input text-input-foreground"
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
                                        <TableRow className="border-border">
                                            <TableHead className="text-muted-foreground">ID</TableHead>
                                            <TableHead className="text-muted-foreground">Unit Name</TableHead>
                                            <TableHead className="text-muted-foreground">Tenants Name</TableHead>
                                            <TableHead className="text-muted-foreground">Status</TableHead>
                                            <TableHead className="text-muted-foreground">Date</TableHead>
                                            <TableHead className="text-muted-foreground">Type of Notice</TableHead>
                                            <TableHead className="text-muted-foreground">Have An Exception?</TableHead>
                                            <TableHead className="text-muted-foreground">Note</TableHead>
                                            <TableHead className="text-muted-foreground">Evictions</TableHead>
                                            <TableHead className="text-muted-foreground">Sent to Attorney</TableHead>
                                            <TableHead className="text-muted-foreground">Hearing Dates</TableHead>
                                            <TableHead className="text-muted-foreground">Evicted/Payment Plan</TableHead>
                                            <TableHead className="text-muted-foreground">If Left?</TableHead>
                                            <TableHead className="text-muted-foreground">Writ Date</TableHead>
                                            {hasAnyPermission(['notice-and-evictions.show','notice-and-evictions.edit','notice-and-evictions.update','notice-and-evictions.destroy']) && (
                                            <TableHead className="text-muted-foreground">Actions</TableHead>)}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {records.map((record) => (
                                            <TableRow key={record.id} className="hover:bg-muted/50 border-border">
                                                <TableCell className="font-medium text-foreground">{record.id}</TableCell>
                                                <TableCell className="text-foreground">{record.unit_name}</TableCell>
                                                <TableCell className="text-foreground">{record.tenants_name}</TableCell>
                                                <TableCell>
                                                    {getStatusBadge(record.status)}
                                                </TableCell>
                                                <TableCell className="text-foreground">
                                                    {record.date
                                                        ? new Date(record.date).toLocaleDateString()
                                                        : <span className="text-muted-foreground">N/A</span>
                                                    }
                                                </TableCell>
                                                <TableCell className="text-foreground">{record.type_of_notice || <span className="text-muted-foreground">N/A</span>}</TableCell>
                                                <TableCell>
                                                    {getYesNoBadge(record.have_an_exception)}
                                                </TableCell>
                                                <TableCell className="text-foreground">{record.note || <span className="text-muted-foreground">N/A</span>}</TableCell>
                                                <TableCell className="text-foreground">{record.evictions || <span className="text-muted-foreground">N/A</span>}</TableCell>
                                                <TableCell>
                                                    {getYesNoBadge(record.sent_to_atorney)}
                                                </TableCell>
                                                <TableCell className="text-foreground">
                                                    {record.hearing_dates
                                                        ? new Date(record.hearing_dates).toLocaleDateString()
                                                        : <span className="text-muted-foreground">N/A</span>
                                                    }
                                                </TableCell>
                                                <TableCell className="text-foreground">{record.evected_or_payment_plan || <span className="text-muted-foreground">N/A</span>}</TableCell>
                                                <TableCell>
                                                    {getYesNoBadge(record.if_left)}
                                                </TableCell>
                                                <TableCell className="text-foreground">
                                                    {record.writ_date
                                                        ? new Date(record.writ_date).toLocaleDateString()
                                                        : <span className="text-muted-foreground">N/A</span>
                                                    }
                                                </TableCell>
                                                {hasAnyPermission(['notice-and-evictions.show','notice-and-evictions.edit','notice-and-evictions.update','notice-and-evictions.destroy']) && (
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        {hasPermission('notice-and-evictions.show') && (
                                                        <Link href={`/notice_and_evictions/${record.id}`}>
                                                            <Button variant="outline" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>)}
                                                        {hasAllPermissions(['notice-and-evictions.edit','notice-and-evictions.update']) && (
                                                        <Link href={`/notice_and_evictions/${record.id}/edit`}>
                                                            <Button variant="outline" size="sm">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>)}
                                                        {hasPermission('notice-and-evictions.destroy') && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDelete(record)}
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
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

                            {records.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p className="text-lg">No records found.</p>
                                    <p className="text-sm">Try adjusting your search criteria.</p>
                                </div>
                            )}

                            {/* Records count info */}
                            <div className="mt-6 flex justify-between items-center border-t border-border pt-4">
                                <div className="text-sm text-muted-foreground">
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
