import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/app-layout';
import { Property, PropertyFormData } from '@/types/property';
import type { PageProps } from '@/types/property';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props extends PageProps {
    property: Property;
}

export default function Edit({ auth, property }: Props) {
    const { data, setData, put, processing, errors } = useForm<PropertyFormData>({
        property_name: property.property_name,
        insurance_company_name: property.insurance_company_name,
        amount: property.amount.toString(),
        policy_number: property.policy_number,
        effective_date: property.effective_date,
        expiration_date: property.expiration_date,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('properties-info.update', property.id));
    };

    return (
        <AppLayout>
            <Head title={`Edit Property - ${property.property_name}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">
                                    Edit Property - {property.property_name}
                                </CardTitle>
                                <Link href={route('properties-info.index')}>
                                    <Button variant="outline">Back to List</Button>
                                </Link>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                {/* --- Property Information --- */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="property_name">Property Name *</Label>
                                        <Input
                                            id="property_name"
                                            value={data.property_name}
                                            onChange={(e) => setData('property_name', e.target.value)}
                                            error={errors.property_name}
                                        />
                                        {errors.property_name && (
                                            <p className="text-red-600 text-sm mt-1">{errors.property_name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="insurance_company_name">Insurance Company *</Label>
                                        <Input
                                            id="insurance_company_name"
                                            value={data.insurance_company_name}
                                            onChange={(e) => setData('insurance_company_name', e.target.value)}
                                            error={errors.insurance_company_name}
                                        />
                                        {errors.insurance_company_name && (
                                            <p className="text-red-600 text-sm mt-1">{errors.insurance_company_name}</p>
                                        )}
                                    </div>
                                </div>

                                {/* --- Insurance Details --- */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="amount">Amount *</Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.amount}
                                            onChange={(e) => setData('amount', e.target.value)}
                                            error={errors.amount}
                                        />
                                        {errors.amount && (
                                            <p className="text-red-600 text-sm mt-1">{errors.amount}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="policy_number">Policy Number *</Label>
                                        <Input
                                            id="policy_number"
                                            value={data.policy_number}
                                            onChange={(e) => setData('policy_number', e.target.value)}
                                            error={errors.policy_number}
                                        />
                                        {errors.policy_number && (
                                            <p className="text-red-600 text-sm mt-1">{errors.policy_number}</p>
                                        )}
                                    </div>
                                </div>

                                {/* --- Policy Dates --- */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="effective_date">Effective Date *</Label>
                                        <Input
                                            id="effective_date"
                                            type="date"
                                            value={data.effective_date}
                                            onChange={(e) => setData('effective_date', e.target.value)}
                                            error={errors.effective_date}
                                        />
                                        {errors.effective_date && (
                                            <p className="text-red-600 text-sm mt-1">{errors.effective_date}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="expiration_date">Expiration Date *</Label>
                                        <Input
                                            id="expiration_date"
                                            type="date"
                                            value={data.expiration_date}
                                            onChange={(e) => setData('expiration_date', e.target.value)}
                                            error={errors.expiration_date}
                                        />
                                        {errors.expiration_date && (
                                            <p className="text-red-600 text-sm mt-1">{errors.expiration_date}</p>
                                        )}
                                    </div>
                                </div>

                                {/* --- Action Buttons --- */}
                                <div className="flex justify-end gap-2">
                                    <Link href={route('properties-info.index')}>
                                        <Button type="button" variant="outline">
                                            Cancel
                                        </Button>
                                    </Link>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Updating…' : 'Update Property'}
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
