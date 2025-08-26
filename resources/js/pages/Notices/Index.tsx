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
import { Trash2, Edit, Plus, Search } from 'lucide-react';
import { Notice } from '@/types/Notice';
import { usePermissions } from '@/hooks/usePermissions';
interface Props {
    notices: Notice[];
    search?: string;
}

const Index = ({ notices, search }: Props) => {
    const [searchTerm, setSearchTerm] = useState(search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('notices.index'), { search: searchTerm }, { preserveState: true });
    };

    const handleDelete = (notice: Notice) => {
        if (window.confirm('Delete this notice? This cannot be undone.')) {
            router.delete(`/notices/${notice.id}`);
        }
    };

    const { hasPermission, hasAnyPermission, hasAllPermissions} = usePermissions();
    return (
        <AppLayout>
            <Head title="Notices" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">Notices</CardTitle>
                                {hasAllPermissions(['notices.create','notices.store'])&&(
                                <Link href="/notices/create">
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Notice
                                    </Button>
                                </Link>)}
                            </div>
                            <form onSubmit={handleSearch} className="flex gap-2 mt-4">
                                <div className="flex-1">
                                    <Input
                                        type="text"
                                        placeholder="Search by notice name..."
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
                                            <TableHead>Notice Name</TableHead>
                                            <TableHead>Days</TableHead>
                                            {hasAnyPermission(['notices.edit','notices.update','notices.destroy'])&&(
                                            <TableHead>Actions</TableHead>)}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {notices.map((notice) => (
                                            <TableRow key={notice.id} className="hover:bg-gray-50">
                                                <TableCell className="font-medium">{notice.notice_name}</TableCell>
                                                <TableCell>{notice.days}</TableCell>
                                                {hasAnyPermission(['notices.edit','notices.update','notices.destroy'])&&(
                                                <TableCell>

                                                    <div className="flex gap-1">
                                                        {hasAllPermissions(['notices.edit','notices.update'])&&(
                                                        <Link href={`/notices/${notice.id}/edit`}>
                                                            <Button variant="outline" size="sm">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>)}
                                                        {hasPermission('notices.destroy')&&(
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDelete(notice)}
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

                            {notices.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <p className="text-lg">No notices found.</p>
                                    <p className="text-sm">Try adjusting your search criteria.</p>
                                </div>
                            )}

                            {/* Records count info */}
                            <div className="mt-6 flex justify-between items-center">
                                <div className="text-sm text-gray-600">
                                    Showing {notices.length} notices
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
