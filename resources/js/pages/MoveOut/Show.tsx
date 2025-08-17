import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/app-layout';
import { MoveOut } from '@/types/move-out';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Props {
    moveOut: MoveOut;
}

export default function Show({ moveOut }: Props) {
    const getYesNoBadge = (value: 'Yes' | 'No' | null) => {
        if (value === null) return <Badge variant="outline">N/A</Badge>;
        return (
            <Badge variant={value === 'Yes' ? 'default' : 'secondary'}>
                {value}
            </Badge>
        );
    };

    const getCleaningBadge = (value: 'cleaned' | 'uncleaned' | null) => {
        if (value === null) return <Badge variant="outline">N/A</Badge>;
        return (
            <Badge variant={value === 'cleaned' ? 'default' : 'secondary'}>
                {value}
            </Badge>
        );
    };

    const getFormBadge = (value: 'filled' | 'not filled' | null) => {
        if (value === null) return <Badge variant="outline">N/A</Badge>;
        return (
            <Badge variant={value === 'filled' ? 'default' : 'secondary'}>
                {value}
            </Badge>
        );
    };

    const formatDate = (date: string | null) => {
        if (!date) return 'Not Set';
        return new Date(date).toLocaleDateString();
    };

    return (
        <AppLayout>
            <Head title={`Move-Out Details #${moveOut.id}`} />

            <div className="py-12">
                <div className="max-w-6xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">Move-Out Record Details - #{moveOut.id}</CardTitle>
                                <div className="flex gap-2">
                                    <Link href={route('move-out.edit', moveOut.id)}>
                                        <Button>Edit Record</Button>
                                    </Link>
                                    <Link href={route('move-out.index')}>
                                        <Button variant="outline">Back to List</Button>
                                    </Link>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Basic Information */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Tenant Name</p>
                                        <p className="font-medium text-lg">{moveOut.tenants_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Unit Name</p>
                                        <p className="font-medium text-lg">{moveOut.units_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Lease Status</p>
                                        <p className="font-medium">{moveOut.lease_status || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Date Information */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Important Dates</h3>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="bg-red-50 p-4 rounded-lg">
                                        <p className="text-sm text-red-600">Move-Out Date</p>
                                        <p className="text-lg font-semibold text-red-700">
                                            {formatDate(moveOut.move_out_date)}
                                        </p>
                                    </div>
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <p className="text-sm text-blue-600">Date Lease Ending on Buildium</p>
                                        <p className="text-lg font-semibold text-blue-700">
                                            {formatDate(moveOut.date_lease_ending_on_buildium)}
                                        </p>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <p className="text-sm text-green-600">Date Utility Put Under Our Name</p>
                                        <p className="text-lg font-semibold text-green-700">
                                            {formatDate(moveOut.date_utility_put_under_our_name)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Location and Utilities */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Location & Utilities Information</h3>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Keys Location</p>
                                        <p className="font-medium">{moveOut.keys_location || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Utilities Under Our Name</p>
                                        <div className="mt-1">
                                            {getYesNoBadge(moveOut.utilities_under_our_name)}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">List the Unit</p>
                                        <p className="font-medium">{moveOut.list_the_unit || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Status Information */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Status Information</h3>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Cleaning Status</p>
                                        <div className="mt-1">
                                            {getCleaningBadge(moveOut.cleaning)}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Move-Out Form</p>
                                        <div className="mt-1">
                                            {getFormBadge(moveOut.move_out_form)}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Send Back Security Deposit</p>
                                        <p className="font-medium">{moveOut.send_back_security_deposit || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Detailed Text Information */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Detailed Information</h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">Walkthrough</p>
                                        <div className="bg-gray-50 p-4 rounded-lg min-h-[100px]">
                                            <p className="whitespace-pre-wrap text-gray-800">
                                                {moveOut.walkthrough || 'No walkthrough information provided.'}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">Repairs</p>
                                        <div className="bg-gray-50 p-4 rounded-lg min-h-[100px]">
                                            <p className="whitespace-pre-wrap text-gray-800">
                                                {moveOut.repairs || 'No repair information provided.'}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">Notes</p>
                                        <div className="bg-gray-50 p-4 rounded-lg min-h-[100px]">
                                            <p className="whitespace-pre-wrap text-gray-800">
                                                {moveOut.notes || 'No additional notes provided.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Complete Data Overview Table */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Complete Record Overview</h3>
                                <div className="bg-white border rounded-lg overflow-hidden">
                                    <table className="w-full">
                                        <tbody className="divide-y divide-gray-200">
                                            <tr className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">ID</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">{moveOut.id}</td>
                                            </tr>
                                            <tr className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">Tenant Name</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">{moveOut.tenants_name}</td>
                                            </tr>
                                            <tr className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">Unit Name</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">{moveOut.units_name}</td>
                                            </tr>
                                            <tr className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">Move Out Date</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">{formatDate(moveOut.move_out_date)}</td>
                                            </tr>
                                            <tr className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">Lease Status</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">{moveOut.lease_status || 'N/A'}</td>
                                            </tr>
                                            <tr className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">Date Lease Ending on Buildium</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">{formatDate(moveOut.date_lease_ending_on_buildium)}</td>
                                            </tr>
                                            <tr className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">Keys Location</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">{moveOut.keys_location || 'N/A'}</td>
                                            </tr>
                                            <tr className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">Utilities Under Our Name</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">
                                                    {getYesNoBadge(moveOut.utilities_under_our_name)}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">Date Utility Put Under Our Name</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">{formatDate(moveOut.date_utility_put_under_our_name)}</td>
                                            </tr>
                                            <tr className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">Walkthrough</td>
                                                <td className="px-4 py-3 text-sm text-gray-700 whitespace-pre-wrap max-w-md break-words">{moveOut.walkthrough || 'N/A'}</td>
                                            </tr>
                                            <tr className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">Repairs</td>
                                                <td className="px-4 py-3 text-sm text-gray-700 whitespace-pre-wrap max-w-md break-words">{moveOut.repairs || 'N/A'}</td>
                                            </tr>
                                            <tr className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">Send Back Security Deposit</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">{moveOut.send_back_security_deposit || 'N/A'}</td>
                                            </tr>
                                            <tr className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">Notes</td>
                                                <td className="px-4 py-3 text-sm text-gray-700 whitespace-pre-wrap max-w-md break-words">{moveOut.notes || 'N/A'}</td>
                                            </tr>
                                            <tr className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">Cleaning</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">
                                                    {getCleaningBadge(moveOut.cleaning)}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">List the Unit</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">{moveOut.list_the_unit || 'N/A'}</td>
                                            </tr>
                                            <tr className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">Move Out Form</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">
                                                    {getFormBadge(moveOut.move_out_form)}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <Separator />

                            {/* Record Information */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Record Information</h3>
                                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                                    <div>
                                        <p><strong>Created:</strong> {new Date(moveOut.created_at).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p><strong>Last Updated:</strong> {new Date(moveOut.updated_at).toLocaleString()}</p>
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
