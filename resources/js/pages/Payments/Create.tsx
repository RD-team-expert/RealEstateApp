import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/app-layout';
import { PaymentFormData, UnitData } from '@/types/payments';
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
    units: UnitData[];
    cities: string[];
    unitsByCity: Record<string, string[]>;
}

export default function Create({ units, cities, unitsByCity }: Props) {
    const { data, setData, post, processing, errors } = useForm<PaymentFormData>({
        date: '',
        city: '',
        unit_name: '',
        owes: '',
        paid: '',
        status: '',
        notes: '',
        reversed_payments: '',
        permanent: 'No',
    });

    const [availableUnits, setAvailableUnits] = useState<string[]>([]);

    const handleCityChange = (city: string) => {
        setData('city', city);
        setData('unit_name', '');
        if (city && unitsByCity[city]) {
            setAvailableUnits(unitsByCity[city]);
        } else {
            setAvailableUnits([]);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('payments.store'));
    };

    return (
        <AppLayout>
            <Head title="Create Payment" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">Create New Payment</CardTitle>
                                <Link href={route('payments.index')}>
                                    <Button variant="outline">Back to List</Button>
                                </Link>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="date">Date *</Label>
                                        <Input
                                            type="date"
                                            id="date"
                                            value={data.date}
                                            onChange={(e) => setData('date', e.target.value)}
                                            error={errors.date}
                                        />
                                        {errors.date && <p className="text-red-600 text-sm mt-1">{errors.date}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="city">City *</Label>
                                        <Select onValueChange={handleCityChange} value={data.city}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select city" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {cities.map((city) => (
                                                    <SelectItem key={city} value={city}>
                                                        {city}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.city && <p className="text-red-600 text-sm mt-1">{errors.city}</p>}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="unit_name">Unit Name *</Label>
                                        <Select
                                            onValueChange={(value) => setData('unit_name', value)}
                                            value={data.unit_name}
                                            disabled={!data.city}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select unit" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableUnits.map((unit) => (
                                                    <SelectItem key={unit} value={unit}>
                                                        {unit}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.unit_name && <p className="text-red-600 text-sm mt-1">{errors.unit_name}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="owes">Owes *</Label>
                                        <Input
                                            id="owes"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.owes}
                                            onChange={(e) => setData('owes', e.target.value)}
                                            error={errors.owes}
                                        />
                                        {errors.owes && <p className="text-red-600 text-sm mt-1">{errors.owes}</p>}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="paid">Paid</Label>
                                        <Input
                                            id="paid"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.paid}
                                            onChange={(e) => setData('paid', e.target.value)}
                                            error={errors.paid}
                                        />
                                        {errors.paid && <p className="text-red-600 text-sm mt-1">{errors.paid}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="status">Status</Label>
                                        <Input
                                            id="status"
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            error={errors.status}
                                        />
                                        {errors.status && <p className="text-red-600 text-sm mt-1">{errors.status}</p>}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="notes">Notes</Label>
                                    <textarea
                                        id="notes"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        rows={3}
                                        placeholder="Enter any additional notes..."
                                    />
                                    {errors.notes && <p className="text-red-600 text-sm mt-1">{errors.notes}</p>}
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="reversed_payments">Reversed Payments?</Label>
                                        <Input
                                            id="reversed_payments"
                                            value={data.reversed_payments}
                                            onChange={(e) => setData('reversed_payments', e.target.value)}
                                            error={errors.reversed_payments}
                                        />
                                        {errors.reversed_payments && <p className="text-red-600 text-sm mt-1">{errors.reversed_payments}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="permanent">Permanent *</Label>
                                        <Select
                                            onValueChange={(value) => setData('permanent', value)}
                                            value={data.permanent}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select permanent status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Yes">Yes</SelectItem>
                                                <SelectItem value="No">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.permanent && <p className="text-red-600 text-sm mt-1">{errors.permanent}</p>}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Link href={route('payments.index')}>
                                        <Button type="button" variant="outline">Cancel</Button>
                                    </Link>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Creating...' : 'Create Payment'}
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
