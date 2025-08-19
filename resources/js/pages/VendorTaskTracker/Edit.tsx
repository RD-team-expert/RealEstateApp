import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/app-layout';
import { VendorTaskTracker, VendorTaskTrackerFormData, UnitData } from '@/types/vendor-task-tracker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
    task: VendorTaskTracker;
    units: UnitData[];
    cities: string[];
    unitsByCity: Record<string, string[]>;
    vendors: string[];
}

export default function Edit({ task, units, cities, unitsByCity, vendors }: Props) {
    const { data, setData, put, processing, errors } = useForm<VendorTaskTrackerFormData>({
        city: task.city ?? '',
        task_submission_date: task.task_submission_date ?? '',
        vendor_name: task.vendor_name ?? '',
        unit_name: task.unit_name ?? '',
        assigned_tasks: task.assigned_tasks ?? '',
        any_scheduled_visits: task.any_scheduled_visits ?? '',
        notes: task.notes ?? '',
        task_ending_date: task.task_ending_date ?? '',
        status: task.status ?? '',
        urgent: task.urgent ?? 'No',
    });

    const [availableUnits, setAvailableUnits] = useState<string[]>(
        task.city && unitsByCity[task.city] ? unitsByCity[task.city] : []
    );

    const handleCityChange = (city: string) => {
        setData('city', city);
        setData('unit_name', '');
        if (city && unitsByCity[city]) {
            setAvailableUnits(unitsByCity[city]);
        } else {
            setAvailableUnits([]);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('vendor-task-tracker.update', task.id));
    };

    return (
        <AppLayout>
            <Head title={`Edit Task #${task.id}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">
                                    Edit Vendor Task #{task.id}
                                </CardTitle>
                                <Link href={route('vendor-task-tracker.index')}>
                                    <Button variant="outline">Back to List</Button>
                                </Link>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                {/* --- Basic Information --- */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="city">City *</Label>
                                        <Select onValueChange={handleCityChange} value={data.city || undefined}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select city" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {cities.map((city) => (
                                                    <SelectItem key={city} value={city}>
                                                        {city}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.city && (
                                            <p className="text-red-600 text-sm mt-1">{errors.city}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="task_submission_date">Task Submission Date *</Label>
                                        <Input
                                            type="date"
                                            id="task_submission_date"
                                            value={data.task_submission_date}
                                            onChange={(e) => setData('task_submission_date', e.target.value)}
                                            error={errors.task_submission_date}
                                        />
                                        {errors.task_submission_date && (
                                            <p className="text-red-600 text-sm mt-1">{errors.task_submission_date}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="vendor_name">Vendor Name *</Label>
                                        <Select onValueChange={(value) => setData('vendor_name', value)} value={data.vendor_name || undefined}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select vendor" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {vendors.map((vendor) => (
                                                    <SelectItem key={vendor} value={vendor}>
                                                        {vendor}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.vendor_name && (
                                            <p className="text-red-600 text-sm mt-1">{errors.vendor_name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="unit_name">Unit Name *</Label>
                                        <Select
                                            onValueChange={(value) => setData('unit_name', value)}
                                            value={data.unit_name || undefined}
                                            disabled={!data.city}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select unit" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableUnits.map((unit) => (
                                                    <SelectItem key={unit} value={unit}>
                                                        {unit}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.unit_name && (
                                            <p className="text-red-600 text-sm mt-1">{errors.unit_name}</p>
                                        )}
                                    </div>
                                </div>

                                {/* --- Task Details --- */}
                                <div>
                                    <Label htmlFor="assigned_tasks">Assigned Tasks *</Label>
                                    <textarea
                                        id="assigned_tasks"
                                        value={data.assigned_tasks}
                                        onChange={(e) => setData('assigned_tasks', e.target.value)}
                                        rows={3}
                                        placeholder="Describe the assigned tasks..."
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                    {errors.assigned_tasks && (
                                        <p className="text-red-600 text-sm mt-1">{errors.assigned_tasks}</p>
                                    )}
                                </div>

                                {/* --- Scheduling --- */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="any_scheduled_visits">Any Scheduled Visits</Label>
                                        <Input
                                            type="date"
                                            id="any_scheduled_visits"
                                            value={data.any_scheduled_visits}
                                            onChange={(e) => setData('any_scheduled_visits', e.target.value)}
                                            error={errors.any_scheduled_visits}
                                        />
                                        {errors.any_scheduled_visits && (
                                            <p className="text-red-600 text-sm mt-1">{errors.any_scheduled_visits}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="task_ending_date">Task Ending Date</Label>
                                        <Input
                                            type="date"
                                            id="task_ending_date"
                                            value={data.task_ending_date}
                                            onChange={(e) => setData('task_ending_date', e.target.value)}
                                            error={errors.task_ending_date}
                                        />
                                        {errors.task_ending_date && (
                                            <p className="text-red-600 text-sm mt-1">{errors.task_ending_date}</p>
                                        )}
                                    </div>
                                </div>

                                {/* --- Status & Priority --- */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="status">Status</Label>
                                        <Select
                                            onValueChange={(value) => setData('status', value)}
                                            value={data.status || undefined}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="New">New</SelectItem>
                                                <SelectItem value="Inprogress">In Progress</SelectItem>
                                                <SelectItem value="Completed">Completed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.status && (
                                            <p className="text-red-600 text-sm mt-1">{errors.status}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="urgent">Urgent? *</Label>
                                        <Select
                                            onValueChange={(value) => setData('urgent', value)}
                                            value={data.urgent || undefined}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select urgency" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Yes">Yes</SelectItem>
                                                <SelectItem value="No">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.urgent && (
                                            <p className="text-red-600 text-sm mt-1">{errors.urgent}</p>
                                        )}
                                    </div>
                                </div>

                                {/* --- Notes --- */}
                                <div>
                                    <Label htmlFor="notes">Notes</Label>
                                    <textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        rows={3}
                                        placeholder="Enter any additional notes..."
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                    {errors.notes && (
                                        <p className="text-red-600 text-sm mt-1">{errors.notes}</p>
                                    )}
                                </div>

                                {/* --- Action Buttons --- */}
                                <div className="flex justify-end gap-2">
                                    <Link href={route('vendor-task-tracker.show', task.id)}>
                                        <Button type="button" variant="outline">Cancel</Button>
                                    </Link>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Updating…' : 'Update Task'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
