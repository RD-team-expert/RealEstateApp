// resources/js/Pages/Applications/Show.tsx

import React from 'react';
import { type BreadcrumbItem } from '@/types';import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/app-layout';
import { Application } from '@/types/application';
import { PageProps } from '@/types/application';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePermissions } from '@/hooks/usePermissions';
import { Download, FileText } from 'lucide-react';

interface Props extends PageProps {
    application: Application;
}

export default function Show({ auth, application }: Props) {
    const getStatusBadge = (status: string | null) => {
        if (!status) return <Badge variant="secondary">No Status</Badge>;

        // Use shadcn Badge component with appropriate variants
        switch (status.toLowerCase()) {
            case 'approved':
                return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">{status}</Badge>;
            case 'new':
                return <Badge variant="secondary">{status}</Badge>;
            case 'undecided':
                return <Badge variant="outline" className="border-yellow-300 text-yellow-800 dark:border-yellow-700 dark:text-yellow-300">{status}</Badge>;
            default:
                return <Badge variant="default">{status}</Badge>;
        }
    };

    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();


    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-foreground leading-tight">Application Details</h2>}

        >
            <Head title="Application Details" />

            <div className="py-12 bg-background text-foreground transition-colors min-h-screen">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <Card className="bg-card text-card-foreground shadow-lg">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">
                                    {application.name} - {application.property}
                                </CardTitle>
                                <div className="flex gap-2">
                                    {hasAllPermissions(['applications.edit','applications.update'])&&(
                                    <Link href={route('applications.edit', application.id)}>
                                        <Button>Edit</Button>
                                    </Link>)}
                                    <Link href={route('applications.index')}>
                                        <Button variant="outline">Back to List</Button>
                                    </Link>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-foreground">Application Information</h3>
                                    <div>
                                        <p className="text-sm text-muted-foreground">City</p>
                                        <p className="font-medium text-foreground">{application.city}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Property</p>
                                        <p className="font-medium text-foreground">{application.property}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Name</p>
                                        <p className="font-medium text-foreground">{application.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Co-signer</p>
                                        <p className="font-medium text-foreground">{application.co_signer}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Unit</p>
                                        <p className="font-medium text-foreground">{application.unit}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-foreground">Status & Progress</h3>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Status</p>
                                        <div className="mt-1">{getStatusBadge(application.status)}</div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Date</p>
                                        <p className="font-medium text-foreground">
                                            {application.date ? new Date(application.date).toLocaleDateString() : 'Not specified'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Stage in Progress</p>
                                        <p className="font-medium text-foreground">{application.stage_in_progress || 'Not specified'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Attachment Section */}
                            {application.attachment_name && (
                                <div className="mt-6 space-y-4">
                                    <h3 className="text-lg font-semibold text-foreground">Attachment</h3>
                                    <Card className="bg-muted/50">
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-primary/10 p-2 rounded-lg">
                                                    <FileText className="w-6 h-6 text-primary" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-foreground">{application.attachment_name}</p>
                                                    <p className="text-sm text-muted-foreground">Click to download</p>
                                                </div>
                                                <Button asChild size="sm">
                                                    <a href={`/applications/${application.id}/download`}>
                                                        <Download className="w-4 h-4 mr-2" />
                                                        Download
                                                    </a>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {application.notes && (
                                <div className="mt-6 space-y-4">
                                    <h3 className="text-lg font-semibold text-foreground">Notes</h3>
                                    <Card className="bg-muted/50">
                                        <CardContent className="p-4">
                                            <p className="text-foreground whitespace-pre-wrap">{application.notes}</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            <div className="mt-8 pt-6 border-t border-border">
                                <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
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
