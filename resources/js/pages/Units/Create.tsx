import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/Layouts/app-layout';
import { PageProps, UnitFormData } from '@/types/unit';
import { Head, Link, useForm } from '@inertiajs/react';
import React from 'react';

interface CreatePageProps extends PageProps {
    cities: Array<{ id: number; city: string }>;
}

export default function Create({ auth, cities }: CreatePageProps) {
    const { data, setData, post, processing, errors } = useForm<UnitFormData>({
        city: '',
        property: '',
        unit_name: '',
        tenants: '',
        lease_start: '',
        lease_end: '',
        count_beds: '',
        count_baths: '',
        lease_status: '',
        monthly_rent: '',
        recurring_transaction: '',
        utility_status: '',
        account_number: '',
        insurance: '',
        insurance_expiration_date: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('units.store'));
    };

    return (
        <AppLayout>
            <Head title="Create Unit" />
            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-2xl">Create New Unit</CardTitle>
                                <div className="flex items-center justify-between gap-2">
                                    <Link href={route('units.index')}>
                                        <Button variant="outline">Back to List</Button>
                                    </Link>
                                    <Link href={'/cities'}>
                                        <Button variant="outline">View Cities</Button>
                                    </Link>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    {/* City */}
                                    <div>
                                        <Label htmlFor="city">City *</Label>
                                        <Select
                                            onValueChange={(value) => setData('city', value)}
                                            value={data.city}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a city" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {cities.map((city) => (
                                                    <SelectItem key={city.id} value={city.city}>
                                                        {city.city}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                                    </div>

                                    {/* Property */}
                                    <div>
                                        <Label htmlFor="property">Property *</Label>
                                        <Input
                                            id="property"
                                            value={data.property}
                                            onChange={(e) => setData('property', e.target.value)}
                                            error={errors.property}
                                        />
                                        {errors.property && <p className="mt-1 text-sm text-red-600">{errors.property}</p>}
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    {/* Unit Name */}
                                    <div>
                                        <Label htmlFor="unit_name">Unit Name *</Label>
                                        <Input
                                            id="unit_name"
                                            value={data.unit_name}
                                            onChange={(e) => setData('unit_name', e.target.value)}
                                            error={errors.unit_name}
                                        />
                                        {errors.unit_name && <p className="mt-1 text-sm text-red-600">{errors.unit_name}</p>}
                                    </div>

                                    {/* Tenants */}
                                    <div>
                                        <Label htmlFor="tenants">Tenants</Label>
                                        <Input
                                            id="tenants"
                                            value={data.tenants}
                                            onChange={(e) => setData('tenants', e.target.value)}
                                            error={errors.tenants}
                                        />
                                        {errors.tenants && <p className="mt-1 text-sm text-red-600">{errors.tenants}</p>}
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    {/* Lease Start */}
                                    <div>
                                        <Label htmlFor="lease_start">Lease Start</Label>
                                        <Input
                                            id="lease_start"
                                            type="date"
                                            value={data.lease_start}
                                            onChange={(e) => setData('lease_start', e.target.value)}
                                            error={errors.lease_start}
                                        />
                                        {errors.lease_start && <p className="mt-1 text-sm text-red-600">{errors.lease_start}</p>}
                                    </div>

                                    {/* Lease End */}
                                    <div>
                                        <Label htmlFor="lease_end">Lease End</Label>
                                        <Input
                                            id="lease_end"
                                            type="date"
                                            value={data.lease_end}
                                            onChange={(e) => setData('lease_end', e.target.value)}
                                            error={errors.lease_end}
                                        />
                                        {errors.lease_end && <p className="mt-1 text-sm text-red-600">{errors.lease_end}</p>}
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    {/* Count Beds */}
                                    <div>
                                        <Label htmlFor="count_beds">Count Beds</Label>
                                        <Input
                                            id="count_beds"
                                            type="number"
                                            min="0"
                                            value={data.count_beds}
                                            onChange={(e) => setData('count_beds', e.target.value)}
                                            error={errors.count_beds}
                                        />
                                        {errors.count_beds && <p className="mt-1 text-sm text-red-600">{errors.count_beds}</p>}
                                    </div>

                                    {/* Count Baths */}
                                    <div>
                                        <Label htmlFor="count_baths">Count Baths</Label>
                                        <Input
                                            id="count_baths"
                                            type="number"
                                            min="0"
                                            value={data.count_baths}
                                            onChange={(e) => setData('count_baths', e.target.value)}
                                            error={errors.count_baths}
                                        />
                                        {errors.count_baths && <p className="mt-1 text-sm text-red-600">{errors.count_baths}</p>}
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    {/* Lease Status */}
                                    <div>
                                        <Label htmlFor="lease_status">Lease Status</Label>
                                        <Select
                                            onValueChange={(value) => setData('lease_status', value)}
                                            value={data.lease_status}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select lease status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Fixed">Fixed</SelectItem>
                                                <SelectItem value="Fixed with roll over">Fixed with roll over</SelectItem>
                                                <SelectItem value="At will">At will</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.lease_status && <p className="mt-1 text-sm text-red-600">{errors.lease_status}</p>}
                                    </div>

                                    {/* Monthly Rent */}
                                    <div>
                                        <Label htmlFor="monthly_rent">Monthly Rent</Label>
                                        <Input
                                            id="monthly_rent"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.monthly_rent}
                                            onChange={(e) => setData('monthly_rent', e.target.value)}
                                            error={errors.monthly_rent}
                                        />
                                        {errors.monthly_rent && <p className="mt-1 text-sm text-red-600">{errors.monthly_rent}</p>}
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    {/* Recurring Transaction */}
                                    <div>
                                        <Label htmlFor="recurring_transaction">Recurring Transaction</Label>
                                        <Input
                                            id="recurring_transaction"
                                            value={data.recurring_transaction}
                                            onChange={(e) => setData('recurring_transaction', e.target.value)}
                                            error={errors.recurring_transaction}
                                        />
                                        {errors.recurring_transaction && <p className="mt-1 text-sm text-red-600">{errors.recurring_transaction}</p>}
                                    </div>

                                    {/* Utility Status */}
                                    <div>
                                        <Label htmlFor="utility_status">Utility Status</Label>
                                        <Input
                                            id="utility_status"
                                            value={data.utility_status}
                                            onChange={(e) => setData('utility_status', e.target.value)}
                                            error={errors.utility_status}
                                        />
                                        {errors.utility_status && <p className="mt-1 text-sm text-red-600">{errors.utility_status}</p>}
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    {/* Account Number */}
                                    <div>
                                        <Label htmlFor="account_number">Account Number</Label>
                                        <Input
                                            id="account_number"
                                            value={data.account_number}
                                            onChange={(e) => setData('account_number', e.target.value)}
                                            error={errors.account_number}
                                        />
                                        {errors.account_number && <p className="mt-1 text-sm text-red-600">{errors.account_number}</p>}
                                    </div>

                                    {/* Insurance */}
                                    <div>
                                        <Label htmlFor="insurance">Insurance</Label>
                                        <Select
                                            onValueChange={(value) => setData('insurance', value)}
                                            value={data.insurance}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select insurance status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Yes">Yes</SelectItem>
                                                <SelectItem value="No">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.insurance && <p className="mt-1 text-sm text-red-600">{errors.insurance}</p>}
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    {/* Insurance Expiration Date */}
                                    <div>
                                        <Label htmlFor="insurance_expiration_date">Insurance Expiration Date</Label>
                                        <Input
                                            id="insurance_expiration_date"
                                            type="date"
                                            value={data.insurance_expiration_date}
                                            onChange={(e) => setData('insurance_expiration_date', e.target.value)}
                                            error={errors.insurance_expiration_date}
                                        />
                                        {errors.insurance_expiration_date && (
                                            <p className="mt-1 text-sm text-red-600">{errors.insurance_expiration_date}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Link href={route('units.index')}>
                                        <Button type="button" variant="outline">
                                            Cancel
                                        </Button>
                                    </Link>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Creating...' : 'Create Unit'}
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
