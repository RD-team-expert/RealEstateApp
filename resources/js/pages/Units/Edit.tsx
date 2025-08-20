// resources/js/Pages/Units/Edit.tsx
import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/app-layout';
import { Unit, UnitFormData, PageProps } from '@/types/unit';
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

interface EditPageProps extends PageProps {
    unit: Unit;
    cities: Array<{ id: number; city: string }>;
}

export default function Edit({ auth, unit, cities }: EditPageProps) {
    const { data, setData, put, processing, errors } = useForm<UnitFormData>({
        city: unit.city,
        property: unit.property,
        unit_name: unit.unit_name,
        tenants: unit.tenants || '',
        lease_start: unit.lease_start || '',
        lease_end: unit.lease_end || '',
        count_beds: unit.count_beds?.toString() || '',
        count_baths: unit.count_baths?.toString() || '',
        lease_status: unit.lease_status || '',
        monthly_rent: unit.monthly_rent?.toString() || '',
        recurring_transaction: unit.recurring_transaction || '',
        utility_status: unit.utility_status || '',
        account_number: unit.account_number || '',
        insurance: unit.insurance || '',
        insurance_expiration_date: unit.insurance_expiration_date || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('units.update', unit.id));
    };

    return (
        <AppLayout>
            <Head title={`Edit Unit - ${unit.unit_name}`} />
            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">
                                    Edit Unit - {unit.unit_name}
                                </CardTitle>
                                <div className="flex justify-between items-center gap-2">
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
                            {/* Note about calculated fields */}
                            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <strong>Note:</strong> Vacant, Listed, and Total Applications are automatically calculated based on your inputs.
                                </p>
                            </div>
                            <form onSubmit={submit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-4">
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
                                        {errors.city && (
                                            <p className="text-red-600 text-sm mt-1">{errors.city}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="property">Property *</Label>
                                        <Input
                                            id="property"
                                            value={data.property}
                                            onChange={(e) => setData('property', e.target.value)}
                                            error={errors.property}
                                        />
                                        {errors.property && (
                                            <p className="text-red-600 text-sm mt-1">{errors.property}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="unit_name">Unit Name *</Label>
                                        <Input
                                            id="unit_name"
                                            value={data.unit_name}
                                            onChange={(e) => setData('unit_name', e.target.value)}
                                            error={errors.unit_name}
                                        />
                                        {errors.unit_name && (
                                            <p className="text-red-600 text-sm mt-1">{errors.unit_name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="tenants">Tenants</Label>
                                        <Input
                                            id="tenants"
                                            value={data.tenants}
                                            onChange={(e) => setData('tenants', e.target.value)}
                                            placeholder="Enter tenant name(s)"
                                            error={errors.tenants}
                                        />
                                        {errors.tenants && (
                                            <p className="text-red-600 text-sm mt-1">{errors.tenants}</p>
                                        )}
                                    </div>
                                </div>

                                {/* --- Lease Information --- */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="lease_start">Lease Start</Label>
                                        <Input
                                            id="lease_start"
                                            type="date"
                                            value={data.lease_start}
                                            onChange={(e) => setData('lease_start', e.target.value)}
                                            error={errors.lease_start}
                                        />
                                        {errors.lease_start && (
                                            <p className="text-red-600 text-sm mt-1">{errors.lease_start}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="lease_end">Lease End</Label>
                                        <Input
                                            id="lease_end"
                                            type="date"
                                            value={data.lease_end}
                                            onChange={(e) => setData('lease_end', e.target.value)}
                                            error={errors.lease_end}
                                        />
                                        {errors.lease_end && (
                                            <p className="text-red-600 text-sm mt-1">{errors.lease_end}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="lease_status">Lease Status</Label>
                                        <Input
                                            id="lease_status"
                                            value={data.lease_status}
                                            onChange={(e) => setData('lease_status', e.target.value)}
                                            placeholder="e.g., Active, Expired, Pending"
                                            error={errors.lease_status}
                                        />
                                        {errors.lease_status && (
                                            <p className="text-red-600 text-sm mt-1">{errors.lease_status}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="monthly_rent">Monthly Rent</Label>
                                        <Input
                                            id="monthly_rent"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.monthly_rent}
                                            onChange={(e) => setData('monthly_rent', e.target.value)}
                                            placeholder="0.00"
                                            error={errors.monthly_rent}
                                        />
                                        {errors.monthly_rent && (
                                            <p className="text-red-600 text-sm mt-1">{errors.monthly_rent}</p>
                                        )}
                                    </div>
                                </div>

                                {/* --- Unit Details --- */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="count_beds">Count Beds</Label>
                                        <Input
                                            id="count_beds"
                                            type="number"
                                            min="0"
                                            value={data.count_beds}
                                            onChange={(e) => setData('count_beds', e.target.value)}
                                            placeholder="Number of bedrooms"
                                            error={errors.count_beds}
                                        />
                                        {errors.count_beds && (
                                            <p className="text-red-600 text-sm mt-1">{errors.count_beds}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="count_baths">Count Baths</Label>
                                        <Input
                                            id="count_baths"
                                            type="number"
                                            min="0"
                                            step="0.5"
                                            value={data.count_baths}
                                            onChange={(e) => setData('count_baths', e.target.value)}
                                            placeholder="Number of bathrooms"
                                            error={errors.count_baths}
                                        />
                                        {errors.count_baths && (
                                            <p className="text-red-600 text-sm mt-1">{errors.count_baths}</p>
                                        )}
                                    </div>
                                </div>

                                {/* --- Financial & Transaction --- */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="recurring_transaction">Recurring Transaction</Label>
                                        <Input
                                            id="recurring_transaction"
                                            value={data.recurring_transaction}
                                            onChange={(e) => setData('recurring_transaction', e.target.value)}
                                            placeholder="Transaction details"
                                            error={errors.recurring_transaction}
                                        />
                                        {errors.recurring_transaction && (
                                            <p className="text-red-600 text-sm mt-1">{errors.recurring_transaction}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="account_number">Account Number</Label>
                                        <Input
                                            id="account_number"
                                            value={data.account_number}
                                            onChange={(e) => setData('account_number', e.target.value)}
                                            placeholder="Account or reference number"
                                            error={errors.account_number}
                                        />
                                        {errors.account_number && (
                                            <p className="text-red-600 text-sm mt-1">{errors.account_number}</p>
                                        )}
                                    </div>
                                </div>

                                {/* --- Utilities & Services --- */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="utility_status">Utility Status</Label>
                                        <Input
                                            id="utility_status"
                                            value={data.utility_status}
                                            onChange={(e) => setData('utility_status', e.target.value)}
                                            placeholder="e.g., Included, Tenant Responsible"
                                            error={errors.utility_status}
                                        />
                                        {errors.utility_status && (
                                            <p className="text-red-600 text-sm mt-1">{errors.utility_status}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="insurance">Insurance</Label>
                                        <Select
                                            onValueChange={(value) => setData('insurance', value)}
                                            value={data.insurance || undefined}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Insurance Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Yes">Yes</SelectItem>
                                                <SelectItem value="No">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.insurance && (
                                            <p className="text-red-600 text-sm mt-1">{errors.insurance}</p>
                                        )}
                                    </div>
                                </div>

                                {/* --- Insurance Expiration --- */}
                                <div className="grid md:grid-cols-2 gap-4">
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
                                            <p className="text-red-600 text-sm mt-1">{errors.insurance_expiration_date}</p>
                                        )}
                                    </div>
                                    {/* Empty div for grid alignment */}
                                    <div></div>
                                </div>

                                {/* Current calculated values display */}
                                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">Current Calculated Values:</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium text-gray-700">Vacant:</span>
                                            <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                                                unit.vacant === 'Yes' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                                {unit.vacant}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Listed:</span>
                                            <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                                                unit.listed === 'Yes' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {unit.listed}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Total Applications:</span>
                                            <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                                                {unit.total_applications}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* --- Action Buttons --- */}
                                <div className="flex justify-end gap-2">
                                    <Link href={route('units.index')}>
                                        <Button type="button" variant="outline">
                                            Cancel
                                        </Button>
                                    </Link>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Updating…' : 'Update Unit'}
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
