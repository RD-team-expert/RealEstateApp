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
import { VendorTaskTracker } from '@/types/vendor-task-tracker';
import { usePermissions } from '@/hooks/usePermissions';

interface Props {
    tasks: {
        data: VendorTaskTracker[];
        links: any[];
        meta: any;
    };
    search: string | null;
}

export default function Index({ tasks, search }: Props) {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
    const [searchTerm, setSearchTerm] = useState(search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('vendor-task-tracker.index'), { search: searchTerm }, { preserveState: true });
    };

    const handleDelete = (task: VendorTaskTracker) => {
        if (confirm('Are you sure you want to delete this task?')) {
            router.delete(route('vendor-task-tracker.destroy', task.id));
        }
    };

    const getUrgentBadge = (urgent: 'Yes' | 'No') => {
        return (
            <Badge variant={urgent === 'Yes' ? 'destructive' : 'secondary'}>
                {urgent}
            </Badge>
        );
    };

    const getStatusBadge = (status: string | null) => {
        if (!status) return null;

        const variant = status.toLowerCase().includes('completed') ? 'default' :
                      status.toLowerCase().includes('pending') ? 'secondary' : 'outline';

        return <Badge variant={variant}>{status}</Badge>;
    };

    return (
        <AppLayout>
            <Head title="Vendor Task Tracker" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl text-foreground">Vendor Task Tracker</CardTitle>
                                {hasAllPermissions(['vendor-task-tracker.create', 'vendor-task-tracker.store']) && (
                                    <Link href={route('vendor-task-tracker.create')}>
                                        <Button>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Task
                                        </Button>
                                    </Link>
                                )}
                            </div>

                            <form onSubmit={handleSearch} className="flex gap-2 mt-4">
                                <div className="flex-1">
                                    <Input
                                        type="text"
                                        placeholder="Search tasks by city, vendor, unit, or status..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="bg-background text-foreground placeholder:text-muted-foreground"
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
                                            <TableHead className="text-muted-foreground">City</TableHead>
                                            <TableHead className="text-muted-foreground">Submission Date</TableHead>
                                            <TableHead className="text-muted-foreground">Vendor Name</TableHead>
                                            <TableHead className="text-muted-foreground">Unit Name</TableHead>
                                            <TableHead className="text-muted-foreground">Assigned Tasks</TableHead>
                                            <TableHead className="text-muted-foreground">Scheduled Visits</TableHead>
                                            <TableHead className="text-muted-foreground">Task End Date</TableHead>
                                            <TableHead className="text-muted-foreground">Note</TableHead>
                                            <TableHead className="text-muted-foreground">Status</TableHead>
                                            <TableHead className="text-muted-foreground">Urgent</TableHead>
                                            {hasAnyPermission(['vendor-task-tracker.show', 'vendor-task-tracker.edit', 'vendor-task-tracker.update', 'vendor-task-tracker.destroy']) && (
                                                <TableHead className="text-muted-foreground">Actions</TableHead>
                                            )}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tasks.data.map((task) => (
                                            <TableRow key={task.id} className="hover:bg-muted/50 border-border">
                                                <TableCell className="font-medium text-foreground">{task.city}</TableCell>
                                                <TableCell className="text-foreground">
                                                    {new Date(task.task_submission_date).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-foreground">{task.vendor_name}</TableCell>
                                                <TableCell className="text-foreground">{task.unit_name}</TableCell>
                                                <TableCell className="max-w-xs truncate text-foreground">
                                                    {task.assigned_tasks}
                                                </TableCell>
                                                <TableCell className="text-foreground">
                                                    {task.any_scheduled_visits
                                                        ? new Date(task.any_scheduled_visits).toLocaleDateString()
                                                        : 'N/A'
                                                    }
                                                </TableCell>
                                                <TableCell className="text-foreground">
                                                    {task.task_ending_date
                                                        ? new Date(task.task_ending_date).toLocaleDateString()
                                                        : 'N/A'
                                                    }
                                                </TableCell>
                                                <TableCell className="font-medium text-foreground">{task.notes}</TableCell>
                                                <TableCell>
                                                    {getStatusBadge(task.status)}
                                                </TableCell>
                                                <TableCell>
                                                    {getUrgentBadge(task.urgent)}
                                                </TableCell>
                                                {hasAnyPermission(['vendor-task-tracker.show', 'vendor-task-tracker.edit', 'vendor-task-tracker.update', 'vendor-task-tracker.destroy']) && (
                                                    <TableCell>
                                                        <div className="flex gap-1">
                                                            {hasPermission('vendor-task-tracker.show') && (
                                                                <Link href={route('vendor-task-tracker.show', task.id)}>
                                                                    <Button variant="outline" size="sm">
                                                                        <Eye className="h-4 w-4" />
                                                                    </Button>
                                                                </Link>
                                                            )}
                                                            {hasAllPermissions(['vendor-task-tracker.edit', 'vendor-task-tracker.update']) && (
                                                                <Link href={route('vendor-task-tracker.edit', task.id)}>
                                                                    <Button variant="outline" size="sm">
                                                                        <Edit className="h-4 w-4" />
                                                                    </Button>
                                                                </Link>
                                                            )}
                                                            {hasPermission('vendor-task-tracker.destroy') && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleDelete(task)}
                                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {tasks.data.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p className="text-lg">No tasks found.</p>
                                    <p className="text-sm">Try adjusting your search criteria.</p>
                                </div>
                            )}

                            {/* Pagination info */}
                            {tasks.meta && (
                                <div className="mt-6 flex justify-between items-center">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {tasks.meta.from || 0} to {tasks.meta.to || 0} of {tasks.meta.total || 0} results
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
