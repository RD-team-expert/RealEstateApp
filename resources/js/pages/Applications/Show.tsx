// resources/js/Pages/Applications/Show.tsx

import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/app-layout';
import { Application } from '@/types/application';
import { PageProps } from '@/types/application';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props extends PageProps {
    application: Application;
}

export default function Show({ auth, application }: Props) {
    const getStatusBadge = (status: string | null) => {
        if (!status) return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800">No Status</span>;

        // Simple styling without predefined status mapping
        return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">{status}</span>;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Application Details</h2>}
        >
            <Head title="Application Details" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">
                                    {application.name} - {application.property}
                                </CardTitle>
                                <div className="flex gap-2">
                                    <Link href={route('applications.edit', application.id)}>
                                        <Button>Edit</Button>
                                    </Link>
                                    <Link href={route('applications.index')}>
                                        <Button variant="outline">Back to List</Button>
                                    </Link>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Application Information</h3>
                                    <div>
                                        <p className="text-sm text-gray-600">City</p>
                                        <p className="font-medium">{application.city}</p>
                                    </div>
                                    <div></div>
                                    <div>
                                        <p className="text-sm text-gray-600">Property</p>
                                        <p className="font-medium">{application.property}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Name</p>
                                        <p className="font-medium">{application.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Co-signer</p>
                                        <p className="font-medium">{application.co_signer}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Unit</p>
                                        <p className="font-medium">{application.unit}</p>
                                    </div>
                                    {/* Attachment Section */}
                                {application.attachment_name && (
                                    <div className="mt-6 space-y-4">
                                        <h3 className="text-lg font-semibold">Attachment</h3>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-blue-100 p-2 rounded-lg">
                                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">{application.attachment_name}</p>
                                                    <p className="text-sm text-gray-500">Click to download</p>
                                                </div>
                                                <a
                                                    href={`/applications/${application.id}/download`}
                                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                >
                                                    Download
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Status & Progress</h3>
                                    <div>
                                        <p className="text-sm text-gray-600">Status</p>
                                        <div className="mt-1">{getStatusBadge(application.status)}</div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Date</p>
                                        <p className="font-medium">
                                            {application.date ? new Date(application.date).toLocaleDateString() : 'Not specified'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Stage in Progress</p>
                                        <p className="font-medium">{application.stage_in_progress || 'Not specified'}</p>
                                    </div>
                                </div>
                            </div>

                            {application.notes && (
                                <div className="mt-6 space-y-4">
                                    <h3 className="text-lg font-semibold">Notes</h3>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-gray-900 whitespace-pre-wrap">{application.notes}</p>
                                    </div>
                                </div>
                            )}

                            <div className="mt-8 pt-6 border-t">
                                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                                    <div>
                                        <p>Created: {new Date(application.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p>Updated: {new Date(application.updated_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
