import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/app-layout';
import SittingsLayout from '@/Layouts/settings/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, Key } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
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
const { hasPermission, hasAnyPermission, hasAllPermissions} = usePermissions();
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

    const isSuperAdmin = role.name === 'Super-Admin';

    return (
        <AppLayout>
            <SittingsLayout>
                <Head title={`Role: ${role.name}`} />

                <div className="py-12">
                    <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-2xl flex items-center gap-2">
                                        {isSuperAdmin && <Shield className="h-6 w-6 text-red-500" />}
                                        {role.name}
                                    </CardTitle>
                                    <div className="flex gap-2">
                                        {hasAllPermissions(['roles.update','roles.edit',])&&(
                                        <Link href={route('roles.edit', role.id)}>
                                            <Button disabled={isSuperAdmin}>Edit</Button>
                                        </Link>)}
                                        <Link href={route('roles.index')}>
                                            <Button variant="outline">Back to List</Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Basic Information */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                            <Users className="h-5 w-5" />
                                            Basic Information
                                        </h3>
                                        <div>
                                            <p className="text-sm text-gray-600">Role Name</p>
                                            <p className="font-medium">{role.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Status</p>
                                            <p className="font-medium">
                                                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                                                    isSuperAdmin
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-green-100 text-green-800'
                                                }`}>
                                                    {isSuperAdmin ? 'Protected' : 'Editable'}
                                                </span>
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Role ID</p>
                                            <p className="font-medium">#{role.id}</p>
                                        </div>
                                    </div>

                                    {/* Permission Summary */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                            <Key className="h-5 w-5" />
                                            Permission Summary
                                        </h3>
                                        <div>
                                            <p className="text-sm text-gray-600">Total Permissions</p>
                                            <p className="font-medium">
                                                <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {role.permissions.length} permissions
                                                </span>
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Resources Covered</p>
                                            <p className="font-medium">
                                                <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                                    {Object.keys(groupedPermissions).length} resources
                                                </span>
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Permission Types</p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {Array.from(new Set(role.permissions.map(p => p.name.split('.')[1]))).map(action => (
                                                    <span key={action} className={`px-2 py-1 text-xs font-semibold rounded-full ${getActionColorClass(action)}`}>
                                                        {getActionDisplayName(action)}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Special Note for Super-Admin */}
                                {isSuperAdmin && (
                                    <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0">
                                                <Shield className="w-5 h-5 text-yellow-600" />
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

                                {/* Detailed Permissions */}
                                <div className="mt-8 pt-6 border-t">
                                    <h4 className="text-lg font-semibold mb-4">Detailed Permissions</h4>

                                    {Object.keys(groupedPermissions).length > 0 ? (
                                        <div className="space-y-6">
                                            {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => (
                                                <div key={resource} className="space-y-3">
                                                    <h5 className="font-medium text-gray-900 capitalize border-b border-gray-200 pb-2">
                                                        {resource.replace('-', ' ')}
                                                        <span className="ml-2 text-sm font-normal text-gray-600">
                                                            ({resourcePermissions.length} permissions)
                                                        </span>
                                                    </h5>
                                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 ml-4">
                                                        {resourcePermissions.map(permission => {
                                                            const action = permission.name.split('.')[1];
                                                            return (
                                                                <div
                                                                    key={permission.id}
                                                                    className={`px-3 py-2 rounded-md text-sm font-medium ${getActionColorClass(action)}`}
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
                                        <div className="text-center py-8 text-gray-500">
                                            <p className="text-lg">No permissions assigned.</p>
                                            <p className="text-sm mt-2">Edit this role to assign permissions.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 pt-6 border-t">
                                    <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                                        <div>
                                            <p>Role ID: #{role.id}</p>
                                        </div>
                                        <div>
                                            <p>Total Permissions: {role.permissions.length}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </SittingsLayout>
        </AppLayout>
    );
}
