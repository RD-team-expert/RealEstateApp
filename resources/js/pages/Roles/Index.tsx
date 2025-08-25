import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/app-layout';
import SittingsLayout from '@/Layouts/settings/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Edit, Trash2, Plus, Eye, Shield } from 'lucide-react';
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
    roles: Role[];
}

export default function RolesIndex({ roles }: Props) {
    const { delete: destroy } = useForm();
const { hasPermission, hasAnyPermission, hasAllPermissions} = usePermissions();
    const handleDelete = (roleId: number, roleName: string) => {
        if (confirm(`Are you sure you want to delete the role "${roleName}"?`)) {
            destroy(route('roles.destroy', roleId));
        }
    };

    return (
        <AppLayout>
            <SittingsLayout>
                <Head title="Roles" />
                <div className="py-12">
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-2xl">Roles</CardTitle>
                                    <div className="flex items-center gap-2">
                                        {hasPermission('users.index')&&(
                                        <Link href={route('users.index')}>
                                            <Button variant="outline">
                                                View Users
                                            </Button>
                                        </Link>)}
                                        {hasAllPermissions(['roles.store','roles.create'])&&(
                                        <Link href={route('roles.create')}>
                                            <Button>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Create Role
                                            </Button>
                                        </Link>)}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>ID</TableHead>
                                                <TableHead>Role Name</TableHead>
                                                <TableHead>Permissions</TableHead>
                                                <TableHead>Protected</TableHead>
                                                {hasAnyPermission(['roles.show','roles.destroy','roles.update','roles.edit',])&&(
                                                <TableHead>Actions</TableHead>)}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {roles.map((role) => (
                                                <TableRow key={role.id} className="hover:bg-gray-50">
                                                    <TableCell className="font-medium">{role.id}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            {role.name === 'Super-Admin' && (
                                                                <Shield className="h-4 w-4 text-red-500" />
                                                            )}
                                                            <span className="font-medium">{role.name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                            {role.permissions.length} permissions
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                                                            role.name === 'Super-Admin'
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-green-100 text-green-800'
                                                        }`}>
                                                            {role.name === 'Super-Admin' ? 'Protected' : 'Editable'}
                                                        </span>
                                                    </TableCell>
                                                    {hasAnyPermission(['roles.show','roles.destroy','roles.update','roles.edit',])&&(
                                                    <TableCell>

                                                        <div className="flex gap-2">
                                                            {hasPermission('roles.show')&&(
                                                            <Link href={route('roles.show', role.id)}>
                                                                <Button variant="outline" size="sm" title="View Role">
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </Link>)}
                                                            {hasAllPermissions(['roles.update','roles.edit',])&&(
                                                            <Link href={route('roles.edit', role.id)}>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    title="Edit Role"
                                                                    disabled={role.name === 'Super-Admin'}
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                            </Link>)}

                                                                {hasPermission('roles.destroy')&&(
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleDelete(role.id, role.name)}
                                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                    title="Delete Role"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>)}

                                                        </div>
                                                    </TableCell>)}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    {roles.length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            <p className="text-lg">No roles found.</p>
                                            <p className="text-sm mt-2">Create your first role to get started.</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </SittingsLayout>
        </AppLayout>
    );
}
