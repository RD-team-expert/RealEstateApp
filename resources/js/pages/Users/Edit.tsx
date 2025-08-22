import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/app-layout';
import SittingsLayout from '@/Layouts/settings/layout';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
    user: User;
}

export default function Edit({ user }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('users.update', user.id));
    };

    return (
        <AppLayout>
            <SittingsLayout>
            <Head title={`Edit User - ${user.name}`} />
            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">
                                    Edit User - {user.name}
                                </CardTitle>
                                <div className="flex justify-between items-center gap-2">
                                    <Link href={route('users.index')}>
                                        <Button variant="outline">Back to List</Button>
                                    </Link>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Note about password field */}
                            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <strong>Note:</strong> Leave password fields blank to keep the current password unchanged.
                                </p>
                            </div>

                            <form onSubmit={submit} className="space-y-6">
                                {/* --- Basic Information --- */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="name">Name *</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            error={errors.name}
                                            required
                                        />
                                        {errors.name && (
                                            <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="email">Email *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            error={errors.email}
                                            required
                                        />
                                        {errors.email && (
                                            <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                                        )}
                                    </div>
                                </div>

                                {/* --- Password Information --- */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="password">New Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Leave blank to keep current password"
                                            error={errors.password}
                                        />
                                        {errors.password && (
                                            <p className="text-red-600 text-sm mt-1">{errors.password}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="password_confirmation">Confirm New Password</Label>
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            placeholder="Confirm new password"
                                            error={errors.password_confirmation}
                                        />
                                        {errors.password_confirmation && (
                                            <p className="text-red-600 text-sm mt-1">{errors.password_confirmation}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Current user information display */}
                                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">Current User Information:</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium text-gray-700">User ID:</span>
                                            <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {user.id}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Email Verified:</span>
                                            <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                                                user.email_verified_at ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {user.email_verified_at ? 'Yes' : 'No'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Created:</span>
                                            <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Last Updated:</span>
                                            <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                                {new Date(user.updated_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* --- Action Buttons --- */}
                                <div className="flex justify-end gap-2">
                                    <Link href={route('users.index')}>
                                        <Button type="button" variant="outline">
                                            Cancel
                                        </Button>
                                    </Link>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Updating…' : 'Update User'}
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
