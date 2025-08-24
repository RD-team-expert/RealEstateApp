import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/app-layout';
import SittingsLayout from '@/Layouts/settings/layout';

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
    const handleDelete = (roleId: number, roleName: string) => {
        if (confirm(`Are you sure you want to delete the role "${roleName}"?`)) {
            router.delete(route('roles.destroy', roleId));
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Roles</h2>}
        >
            <SittingsLayout>
            <Head title="Roles" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-medium">Manage Roles</h3>
                                <Link
                                    href={route('roles.create')}
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Create New Role
                                </Link>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full table-auto border-collapse border border-gray-200">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="border border-gray-200 px-4 py-2 text-left">Role Name</th>
                                            <th className="border border-gray-200 px-4 py-2 text-left">Permissions</th>
                                            <th className="border border-gray-200 px-4 py-2 text-left">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {roles.map(role => (
                                            <tr key={role.id}>
                                                <td className="border border-gray-200 px-4 py-2 font-medium">
                                                    {role.name}
                                                </td>
                                                <td className="border border-gray-200 px-4 py-2">
                                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                                                        {role.permissions.length} permissions
                                                    </span>
                                                </td>
                                                <td className="border border-gray-200 px-4 py-2">
                                                    <div className="flex space-x-2">
                                                        <Link
                                                            href={route('roles.show', role.id)}
                                                            className="text-green-600 hover:underline"
                                                        >
                                                            View
                                                        </Link>
                                                        <Link
                                                            href={route('roles.edit', role.id)}
                                                            className="text-blue-600 hover:underline"
                                                        >
                                                            Edit
                                                        </Link>
                                                        {role.name !== 'Super-Admin' && (
                                                            <button
                                                                onClick={() => handleDelete(role.id, role.name)}
                                                                className="text-red-600 hover:underline"
                                                            >
                                                                Delete
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </SittingsLayout>
        </AuthenticatedLayout>
    );
}
