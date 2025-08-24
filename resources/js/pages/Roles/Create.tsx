import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/app-layout';
import SittingsLayout from '@/Layouts/settings/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface Permission {
    id: number;
    name: string;
}

interface Props {
    permissions: Permission[];
}

export default function CreateRole({ permissions }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        permissions: [] as string[]
    });

    // Group permissions by resource (e.g., users, roles, tenants, etc.)
    const groupedPermissions = React.useMemo(() => {
        const groups: { [key: string]: Permission[] } = {};

        permissions.forEach(permission => {
            const parts = permission.name.split('.');
            const resource = parts[0];

            if (!groups[resource]) {
                groups[resource] = [];
            }
            groups[resource].push(permission);
        });

        return groups;
    }, [permissions]);

    // Smart permission handler - handles create/store and edit/update pairing
    const handleSmartPermissionChange = (resourceName: string, action: string, checked: boolean) => {
        let permissionsToToggle = [`${resourceName}.${action}`];

        // Smart pairing logic
        if (action === 'create') {
            permissionsToToggle.push(`${resourceName}.store`);
        } else if (action === 'store') {
            permissionsToToggle.push(`${resourceName}.create`);
        } else if (action === 'edit') {
            permissionsToToggle.push(`${resourceName}.update`);
        } else if (action === 'update') {
            permissionsToToggle.push(`${resourceName}.edit`);
        }

        if (checked) {
            // Add permissions
            const newPermissions = [...data.permissions];
            permissionsToToggle.forEach(perm => {
                if (!newPermissions.includes(perm)) {
                    newPermissions.push(perm);
                }
            });
            setData('permissions', newPermissions);
        } else {
            // Remove permissions
            const newPermissions = data.permissions.filter(p => !permissionsToToggle.includes(p));
            setData('permissions', newPermissions);
        }
    };

    // Check if permission is selected (considering smart pairing)
    const isPermissionSelected = (permissionName: string) => {
        return data.permissions.includes(permissionName);
    };

    // Get display name for actions
    const getActionDisplayName = (action: string) => {
        const actionMap: { [key: string]: string } = {
            'index': 'View List',
            'show': 'View Details',
            'create': 'Create',
            'store': 'Create', // Hidden - paired with create
            'edit': 'Edit',
            'update': 'Edit', // Hidden - paired with edit
            'destroy': 'Delete'
        };
        return actionMap[action] || action;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('roles.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout>
            <SittingsLayout>
                <Head title="Create Role" />
                <div className="py-12">
                    <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-2xl">Create New Role</CardTitle>
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex justify-between items-center gap-2">
                                            <Link href={route('roles.index')}>
                                                <Button variant="outline">Back to List</Button>
                                            </Link>
                                            <Link href={route('users.index')}>
                                                <Button variant="outline">View Users</Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* --- Basic Information --- */}
                                    <div className="grid gap-4">
                                        {/* Role Name */}
                                        <div>
                                            <Label htmlFor="name">Role Name *</Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="Enter role name"
                                                error={errors.name}
                                                required
                                            />
                                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                        </div>
                                    </div>

                                    {/* --- Permission Assignment --- */}
                                    <div className="space-y-4">
                                        <Label>Select Permissions by Resource</Label>
                                        <div className="max-h-96 overflow-y-auto border border-gray-200 p-4 rounded space-y-6">
                                            {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => (
                                                <div key={resource} className="space-y-3">
                                                    <h4 className="font-semibold text-gray-900 capitalize border-b border-gray-200 pb-2 flex items-center justify-between">
                                                        <span>{resource.replace('-', ' ')}</span>
                                                        <span className="text-xs font-normal text-gray-500">
                                                            {resourcePermissions.filter(p => data.permissions.includes(p.name)).length}/{resourcePermissions.length} selected
                                                        </span>
                                                    </h4>
                                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 ml-4">
                                                        {resourcePermissions.map(permission => {
                                                            const action = permission.name.split('.')[1];
                                                            // Skip store and update as they're paired with create and edit
                                                            if (action === 'store' || action === 'update') return null;

                                                            return (
                                                                <div key={permission.id} className="flex items-center space-x-2">
                                                                    <Checkbox
                                                                        id={`permission-${permission.id}`}
                                                                        checked={isPermissionSelected(permission.name)}
                                                                        onCheckedChange={(checked) =>
                                                                            handleSmartPermissionChange(resource, action, checked as boolean)
                                                                        }
                                                                    />
                                                                    <label
                                                                        htmlFor={`permission-${permission.id}`}
                                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                                    >
                                                                        {getActionDisplayName(action)}
                                                                    </label>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {errors.permissions && <p className="mt-1 text-sm text-red-600">{errors.permissions}</p>}
                                    </div>

                                    {/* Information note */}
                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm text-blue-800">
                                            <strong>Smart Permissions:</strong> When you select "Create" or "Edit", both form access and action permissions are automatically included (e.g., selecting "Create" adds both "create" and "store" permissions).
                                        </p>
                                    </div>

                                    {/* --- Action Buttons --- */}
                                    <div className="flex justify-end gap-2">
                                        <Link href={route('roles.index')}>
                                            <Button type="button" variant="outline">
                                                Cancel
                                            </Button>
                                        </Link>
                                        <Button type="submit" disabled={processing}>
                                            {processing ? 'Creating...' : 'Create Role'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </SittingsLayout>
        </AppLayout>
    );
}
