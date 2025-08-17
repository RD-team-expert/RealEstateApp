import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/app-layout';
import { VendorTaskTracker } from '@/types/vendor-task-tracker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Props {
    task: VendorTaskTracker;
}

export default function Show({ task }: Props) {
    const getUrgentBadge = (urgent: 'Yes' | 'No') => {
        return (
            <Badge variant={urgent === 'Yes' ? 'destructive' : 'secondary'}>
                {urgent}
            </Badge>
        );
    };

    const getStatusBadge = (status: string | null) => {
        if (!status) return <Badge variant="outline">No Status</Badge>;

        const variant = status.toLowerCase().includes('completed') ? 'default' :
                      status.toLowerCase().includes('pending') ? 'secondary' : 'outline';

        return <Badge variant={variant}>{status}</Badge>;
    };

    return (
        <AppLayout>
            <Head title={`Task Details #${task.id}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">Vendor Task Details</CardTitle>
                                <div className="flex gap-2">
                                    <Link href={route('vendor-task-tracker.edit', task.id)}>
                                        <Button>Edit Task</Button>
                                    </Link>
                                    <Link href={route('vendor-task-tracker.index')}>
                                        <Button variant="outline">Back to List</Button>
                                    </Link>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Basic Information */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">City</p>
                                        <p className="font-medium">{task.city}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Unit Name</p>
                                        <p className="font-medium">{task.unit_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Vendor Name</p>
                                        <p className="font-medium">{task.vendor_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Urgent</p>
                                        {getUrgentBadge(task.urgent)}
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Date Information */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Timeline</h3>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <p className="text-sm text-blue-600">Task Submission Date</p>
                                        <p className="text-lg font-semibold text-blue-700">
                                            {new Date(task.task_submission_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="bg-yellow-50 p-4 rounded-lg">
                                        <p className="text-sm text-yellow-600">Scheduled Visits</p>
                                        <p className="text-lg font-semibold text-yellow-700">
                                            {task.any_scheduled_visits
                                                ? new Date(task.any_scheduled_visits).toLocaleDateString()
                                                : 'Not Scheduled'
                                            }
                                        </p>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <p className="text-sm text-green-600">Task End Date</p>
                                        <p className="text-lg font-semibold text-green-700">
                                            {task.task_ending_date
                                                ? new Date(task.task_ending_date).toLocaleDateString()
                                                : 'Not Set'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Task Details */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Task Details</h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Status</p>
                                        {getStatusBadge(task.status)}
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600">Assigned Tasks</p>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <p className="whitespace-pre-wrap">{task.assigned_tasks}</p>
                                        </div>
                                    </div>

                                    {task.notes && (
                                        <div>
                                            <p className="text-sm text-gray-600">Notes</p>
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <p className="whitespace-pre-wrap">{task.notes}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            {/* Timestamps */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Record Information</h3>
                                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                                    <div>
                                        <p>Created: {new Date(task.created_at).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p>Last Updated: {new Date(task.updated_at).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
