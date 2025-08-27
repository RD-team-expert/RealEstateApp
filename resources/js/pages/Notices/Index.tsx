import React, { useState } from 'react';
import { Head, Link, router,usePage } from '@inertiajs/react';
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
import { Trash2, Edit, Plus, Search } from 'lucide-react';
import { Notice } from '@/types/Notice';
import { usePermissions } from '@/hooks/usePermissions';
import { type BreadcrumbItem } from '@/types';
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

    const getDaysBadge = (days: number) => {
        if (days <= 3) {
            return <Badge variant="destructive">{days} days</Badge>;
        } else if (days <= 7) {
            return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">{days} days</Badge>;
        } else {
            return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">{days} days</Badge>;
        }
    };

    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

    const { url } = usePage();
  const searching = url.split('?')[1] ?? '';
  const bcParam = new URLSearchParams(searching).get('bc');

  const breadcrumbs: BreadcrumbItem[] = React.useMemo(() => {
    const base: BreadcrumbItem[] = [{ title: 'Notices', href: '/notices' }];
    if (!bcParam) return base;
    try {
      const prev = JSON.parse(bcParam) as BreadcrumbItem[];
      return Array.isArray(prev) ? [...prev, ...base] : base;
    } catch {
      return base;
    }
  }, [bcParam]);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notices" />

            <div className="py-12 bg-background text-foreground transition-colors min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card className="bg-card text-card-foreground shadow-lg">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">Notices</CardTitle>
                                {hasAllPermissions(['notices.create','notices.store']) && (
                                <Link href="/notices/create"
                                data={{ bc: JSON.stringify(breadcrumbs) }}>
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
                                            <TableHead className="text-muted-foreground">Notice Name</TableHead>
                                            <TableHead className="text-muted-foreground">Days</TableHead>
                                            {hasAnyPermission(['notices.edit','notices.update','notices.destroy']) && (
                                            <TableHead className="text-muted-foreground">Actions</TableHead>)}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {notices.map((notice) => (
                                            <TableRow key={notice.id} className="hover:bg-muted/50 border-border">
                                                <TableCell className="font-medium text-foreground">{notice.notice_name}</TableCell>
                                                <TableCell>
                                                    {getDaysBadge(notice.days)}
                                                </TableCell>
                                                {hasAnyPermission(['notices.edit','notices.update','notices.destroy']) && (
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        {hasAllPermissions(['notices.edit','notices.update']) && (
                                                        <Link href={`/notices/${notice.id}/edit`}
                                                        data={{ bc: JSON.stringify(breadcrumbs) }}>
                                                            <Button variant="outline" size="sm">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>)}
                                                        {hasPermission('notices.destroy') && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDelete(notice)}
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

                            {notices.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p className="text-lg">No notices found.</p>
                                    <p className="text-sm">Try adjusting your search criteria.</p>
                                </div>
                            )}

                            {/* Records count info */}
                            <div className="mt-6 flex justify-between items-center border-t border-border pt-4">
                                <div className="text-sm text-muted-foreground">
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
