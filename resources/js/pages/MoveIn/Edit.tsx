import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/app-layout';
import { MoveIn, MoveInFormData } from '@/types/move-in';
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
    moveIn: MoveIn;
    units: string[];
}

export default function Edit({ moveIn, units }: Props) {
    const { data, setData, put, processing, errors } = useForm<MoveInFormData>({
        unit_name: moveIn.unit_name ?? '',
        signed_lease: moveIn.signed_lease ?? '',
        lease_signing_date: moveIn.lease_signing_date ?? '',
        move_in_date: moveIn.move_in_date ?? '',
        paid_security_deposit_first_month_rent: moveIn.paid_security_deposit_first_month_rent ?? '',
        scheduled_paid_time: moveIn.scheduled_paid_time ?? '',
        handled_keys: moveIn.handled_keys ?? '',
        move_in_form_sent_date: moveIn.move_in_form_sent_date ?? '',
        filled_move_in_form: moveIn.filled_move_in_form ?? '',
        date_of_move_in_form_filled: moveIn.date_of_move_in_form_filled ?? '',
        submitted_insurance: moveIn.submitted_insurance ?? '',
        date_of_insurance_expiration: moveIn.date_of_insurance_expiration ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('move-in.update', moveIn.id));
    };

    return (
        <AppLayout>
            <Head title={`Edit Move-In Record #${moveIn.id}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">Edit Move-In Record</CardTitle>
                                <Link href={route('move-in.index')}>
                                    <Button variant="outline">Back to List</Button>
                                </Link>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                {/* Unit and Lease Information */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="unit_name">Unit Name *</Label>
                                        <Select onValueChange={(value) => setData('unit_name', value)} value={data.unit_name}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select unit" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {units.map((unit) => (
                                                    <SelectItem key={unit} value={unit}>
                                                        {unit}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.unit_name && <p className="text-red-600 text-sm mt-1">{errors.unit_name}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="signed_lease">Signed Lease *</Label>
                                        <Select onValueChange={(value) => setData('signed_lease', value)} value={data.signed_lease}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select option" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Yes">Yes</SelectItem>
                                                <SelectItem value="No">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.signed_lease && <p className="text-red-600 text-sm mt-1">{errors.signed_lease}</p>}
                                    </div>
                                </div>

                                {/* Date Fields */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="lease_signing_date">Lease Signing Date</Label>
                                        <Input
                                            type="date"
                                            id="lease_signing_date"
                                            value={data.lease_signing_date}
                                            onChange={(e) => setData('lease_signing_date', e.target.value)}
                                            error={errors.lease_signing_date}
                                        />
                                        {errors.lease_signing_date && <p className="text-red-600 text-sm mt-1">{errors.lease_signing_date}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="move_in_date">Move-In Date</Label>
                                        <Input
                                            type="date"
                                            id="move_in_date"
                                            value={data.move_in_date}
                                            onChange={(e) => setData('move_in_date', e.target.value)}
                                            error={errors.move_in_date}
                                        />
                                        {errors.move_in_date && <p className="text-red-600 text-sm mt-1">{errors.move_in_date}</p>}
                                    </div>
                                </div>

                                {/* Payment Information */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="paid_security_deposit_first_month_rent">Paid Security Deposit & First Month Rent</Label>
                                        <Select onValueChange={(value) => setData('paid_security_deposit_first_month_rent', value)} value={data.paid_security_deposit_first_month_rent}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select option" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Yes">Yes</SelectItem>
                                                <SelectItem value="No">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.paid_security_deposit_first_month_rent && <p className="text-red-600 text-sm mt-1">{errors.paid_security_deposit_first_month_rent}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="scheduled_paid_time">Scheduled Paid Time</Label>
                                        <Input
                                            type="date"
                                            id="scheduled_paid_time"
                                            value={data.scheduled_paid_time}
                                            onChange={(e) => setData('scheduled_paid_time', e.target.value)}
                                            error={errors.scheduled_paid_time}
                                        />
                                        {errors.scheduled_paid_time && <p className="text-red-600 text-sm mt-1">{errors.scheduled_paid_time}</p>}
                                    </div>
                                </div>

                                {/* Keys and Forms */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="handled_keys">Handled Keys</Label>
                                        <Select onValueChange={(value) => setData('handled_keys', value)} value={data.handled_keys}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select option" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Yes">Yes</SelectItem>
                                                <SelectItem value="No">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.handled_keys && <p className="text-red-600 text-sm mt-1">{errors.handled_keys}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="move_in_form_sent_date">Move-In Form Sent Date</Label>
                                        <Input
                                            type="date"
                                            id="move_in_form_sent_date"
                                            value={data.move_in_form_sent_date}
                                            onChange={(e) => setData('move_in_form_sent_date', e.target.value)}
                                            error={errors.move_in_form_sent_date}
                                        />
                                        {errors.move_in_form_sent_date && <p className="text-red-600 text-sm mt-1">{errors.move_in_form_sent_date}</p>}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="filled_move_in_form">Filled Move-In Form</Label>
                                        <Select onValueChange={(value) => setData('filled_move_in_form', value)} value={data.filled_move_in_form}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select option" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Yes">Yes</SelectItem>
                                                <SelectItem value="No">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.filled_move_in_form && <p className="text-red-600 text-sm mt-1">{errors.filled_move_in_form}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="date_of_move_in_form_filled">Date of Move-In Form Filled</Label>
                                        <Input
                                            type="date"
                                            id="date_of_move_in_form_filled"
                                            value={data.date_of_move_in_form_filled}
                                            onChange={(e) => setData('date_of_move_in_form_filled', e.target.value)}
                                            error={errors.date_of_move_in_form_filled}
                                        />
                                        {errors.date_of_move_in_form_filled && <p className="text-red-600 text-sm mt-1">{errors.date_of_move_in_form_filled}</p>}
                                    </div>
                                </div>

                                {/* Insurance Information */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="submitted_insurance">Submitted Insurance</Label>
                                        <Select onValueChange={(value) => setData('submitted_insurance', value)} value={data.submitted_insurance}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select option" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Yes">Yes</SelectItem>
                                                <SelectItem value="No">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.submitted_insurance && <p className="text-red-600 text-sm mt-1">{errors.submitted_insurance}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="date_of_insurance_expiration">Date of Insurance Expiration</Label>
                                        <Input
                                            type="date"
                                            id="date_of_insurance_expiration"
                                            value={data.date_of_insurance_expiration}
                                            onChange={(e) => setData('date_of_insurance_expiration', e.target.value)}
                                            error={errors.date_of_insurance_expiration}
                                        />
                                        {errors.date_of_insurance_expiration && <p className="text-red-600 text-sm mt-1">{errors.date_of_insurance_expiration}</p>}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Link href={route('move-in.index', moveIn.id)}>
                                        <Button type="button" variant="outline">Cancel</Button>
                                    </Link>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Updating...' : 'Update Move-In Record'}
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
