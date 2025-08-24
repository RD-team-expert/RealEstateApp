import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/app-layout';
import SittingsLayout from '@/Layouts/settings/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Permission {
    id: number;
    name: string;
}

interface Role {
    id: number;
    name: string;
    permissions: Permission[];
}

interface Props {
    role: Role;
}

export default function ShowRole({ role }: Props) {
    // Group permissions by resource (e.g., users, roles, tenants, etc.)
    const groupedPermissions = React.useMemo(() => {
        const groups: { [key: string]: Permission[] } = {};

        role.permissions.forEach(permission => {
            const parts = permission.name.split('.');
            const resource = parts[0];

            if (!groups[resource]) {
                groups[resource] = [];
            }
            groups[resource].push(permission);
        });

        return groups;
    }, [role.permissions]);

    // Get display name for actions
    const getActionDisplayName = (action: string) => {
        const actionMap: { [key: string]: string } = {
            'index': 'View List',
            'show': 'View Details',
            'create': 'Create Form',
            'store': 'Create Action',
            'edit': 'Edit Form',
            'update': 'Update Action',
            'destroy': 'Delete'
        };
        return actionMap[action] || action;
    };

    // Get color scheme for different action types
    const getActionColorClass = (action: string) => {
        const colorMap: { [key: string]: string } = {
            'index': 'bg-blue-100 text-blue-800',
            'show': 'bg-green-100 text-green-800',
            'create': 'bg-purple-100 text-purple-800',
            'store': 'bg-purple-100 text-purple-800',
            'edit': 'bg-yellow-100 text-yellow-800',
            'update': 'bg-yellow-100 text-yellow-800',
            'destroy': 'bg-red-100 text-red-800'
        };
        return colorMap[action] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Role Details</h2>}
        >
            <SittingsLayout>
            <Head title={`Role: ${role.name}`} />

            <div className="py-12">
                <div className="max-w-6xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl font-bold text-gray-900">
                                    {role.name}
                                </CardTitle>
                                <div className="flex space-x-2">
                                    <Link href={route('roles.edit', role.id)}>
                                        <Button>Edit Role</Button>
                                    </Link>
                                    <Link href={route('roles.index')}>
                                        <Button variant="outline">Back to Roles</Button>
                                    </Link>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Role Summary */}
                            <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-700">Role Name:</span>
                                        <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {role.name}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Total Permissions:</span>
                                        <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                            {role.permissions.length}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Resources:</span>
                                        <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                            {Object.keys(groupedPermissions).length}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Categorized Permissions */}
                            <div className="mb-6">
                                <h4 className="text-lg font-medium text-gray-900 mb-6">
                                    Permissions by Resource ({role.permissions.length} total)
                                </h4>

                                {Object.keys(groupedPermissions).length > 0 ? (
                                    <div className="space-y-6">
                                        {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => (
                                            <div key={resource} className="border border-gray-200 rounded-lg p-4">
                                                <h5 className="font-semibold text-gray-900 capitalize text-lg mb-4 border-b border-gray-200 pb-2">
                                                    {resource.replace('-', ' ')}
                                                    <span className="ml-2 text-sm font-normal text-gray-600">
                                                        ({resourcePermissions.length} permissions)
                                                    </span>
                                                </h5>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                                    {resourcePermissions.map(permission => {
                                                        const action = permission.name.split('.')[1];
                                                        return (
                                                            <div
                                                                key={permission.id}
                                                                className={`px-3 py-2 rounded-full text-sm font-medium ${getActionColorClass(action)}`}
                                                            >
                                                                <div className="flex flex-col">
                                                                    <span className="font-semibold">
                                                                        {getActionDisplayName(action)}
                                                                    </span>
                                                                    <span className="text-xs opacity-75">
                                                                        {permission.name}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                        <div className="mx-auto w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mb-4">
                                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Permissions Assigned</h3>
                                        <p className="text-gray-500 mb-4">
                                            This role doesn't have any permissions yet. Click "Edit Role" to assign permissions.
                                        </p>
                                        <Link href={route('roles.edit', role.id)}>
                                            <Button>Assign Permissions</Button>
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Special Note for Super-Admin */}
                            {role.name === 'Super-Admin' && (
                                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-yellow-800">
                                                Protected Role
                                            </h3>
                                            <div className="mt-2 text-sm text-yellow-700">
                                                <p>
                                                    The Super-Admin role is protected and automatically receives all permissions in the system.
                                                    This role cannot be deleted or have its permissions modified.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
            </SittingsLayout>
        </AuthenticatedLayout>
    );
}
