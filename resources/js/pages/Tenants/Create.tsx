// resources/js/Pages/Tenants/Create.tsx

import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/app-layout';
import { TenantFormData, UnitData } from '@/types/tenant';
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
    properties: string[];
    unitsByProperty: Record<string, string[]>;
}

export default function Create({ units, properties, unitsByProperty }: Props) {
    const { data, setData, post, processing, errors } = useForm<TenantFormData>({
        property_name: '',
        unit_number: '',
        first_name: '',
        last_name: '',
        street_address_line: '',
        login_email: '',
        alternate_email: '',
        mobile: '',
        emergency_phone: '',
        cash_or_check: '',
        has_insurance: '',
        sensitive_communication: '',
        has_assistance: '',
        assistance_amount: '',
        assistance_company: '',
    });

    const [availableUnits, setAvailableUnits] = useState<string[]>([]);

    // Handle property selection
    const handlePropertyChange = (property: string) => {
        setData('property_name', property);
        setData('unit_number', ''); // Reset unit

        if (property && unitsByProperty[property]) {
            setAvailableUnits(unitsByProperty[property]);
        } else {
            setAvailableUnits([]);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('tenants.store'));
    };

    return (
        <AppLayout>
            <Head title="Create Tenant" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">Create New Tenant</CardTitle>
                                <Link href={route('tenants.index')}>
                                    <Button variant="outline">Back to List</Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                    {/* Property Name Dropdown */}
                                    <div>
                                        <Label htmlFor="property_name">Property Name *</Label>
                                        <Select onValueChange={handlePropertyChange} value={data.property_name}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select property" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {properties.map((property) => (
                                                    <SelectItem key={property} value={property}>
                                                        {property}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.property_name && (
                                            <p className="text-red-600 text-sm mt-1">{errors.property_name}</p>
                                        )}
                                    </div>

                                    {/* Unit Number Dropdown */}
                                    <div>
                                        <Label htmlFor="unit_number">Unit Number *</Label>
                                        <Select
                                            onValueChange={(value) => setData('unit_number', value)}
                                            value={data.unit_number}
                                            disabled={!data.property_name}
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
                                        {errors.unit_number && (
                                            <p className="text-red-600 text-sm mt-1">{errors.unit_number}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Rest of the form fields remain the same */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="first_name">First Name *</Label>
                                        <Input
                                            id="first_name"
                                            value={data.first_name}
                                            onChange={(e) => setData('first_name', e.target.value)}
                                            error={errors.first_name}
                                        />
                                        {errors.first_name && (
                                            <p className="text-red-600 text-sm mt-1">{errors.first_name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="last_name">Last Name *</Label>
                                        <Input
                                            id="last_name"
                                            value={data.last_name}
                                            onChange={(e) => setData('last_name', e.target.value)}
                                            error={errors.last_name}
                                        />
                                        {errors.last_name && (
                                            <p className="text-red-600 text-sm mt-1">{errors.last_name}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="street_address_line">Street Address</Label>
                                    <Input
                                        id="street_address_line"
                                        value={data.street_address_line}
                                        onChange={(e) => setData('street_address_line', e.target.value)}
                                        error={errors.street_address_line}
                                    />
                                    {errors.street_address_line && (
                                        <p className="text-red-600 text-sm mt-1">{errors.street_address_line}</p>
                                    )}
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="login_email">Login Email</Label>
                                        <Input
                                            id="login_email"
                                            type="email"
                                            value={data.login_email}
                                            onChange={(e) => setData('login_email', e.target.value)}
                                            error={errors.login_email}
                                        />
                                        {errors.login_email && (
                                            <p className="text-red-600 text-sm mt-1">{errors.login_email}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="alternate_email">Alternate Email</Label>
                                        <Input
                                            id="alternate_email"
                                            type="email"
                                            value={data.alternate_email}
                                            onChange={(e) => setData('alternate_email', e.target.value)}
                                            error={errors.alternate_email}
                                        />
                                        {errors.alternate_email && (
                                            <p className="text-red-600 text-sm mt-1">{errors.alternate_email}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="mobile">Mobile</Label>
                                        <Input
                                            id="mobile"
                                            value={data.mobile}
                                            onChange={(e) => setData('mobile', e.target.value)}
                                            error={errors.mobile}
                                        />
                                        {errors.mobile && (
                                            <p className="text-red-600 text-sm mt-1">{errors.mobile}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="emergency_phone">Emergency Phone</Label>
                                        <Input
                                            id="emergency_phone"
                                            value={data.emergency_phone}
                                            onChange={(e) => setData('emergency_phone', e.target.value)}
                                            error={errors.emergency_phone}
                                        />
                                        {errors.emergency_phone && (
                                            <p className="text-red-600 text-sm mt-1">{errors.emergency_phone}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="cash_or_check">Payment Method</Label>
                                        <Select onValueChange={(value) => setData('cash_or_check', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select payment method" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Cash">Cash</SelectItem>
                                                <SelectItem value="Check">Check</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.cash_or_check && (
                                            <p className="text-red-600 text-sm mt-1">{errors.cash_or_check}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="has_insurance">Has Insurance</Label>
                                        <Select onValueChange={(value) => setData('has_insurance', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select insurance status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Yes">Yes</SelectItem>
                                                <SelectItem value="No">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.has_insurance && (
                                            <p className="text-red-600 text-sm mt-1">{errors.has_insurance}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="sensitive_communication">Sensitive Communication</Label>
                                        <Select onValueChange={(value) => setData('sensitive_communication', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select communication preference" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Yes">Yes</SelectItem>
                                                <SelectItem value="No">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.sensitive_communication && (
                                            <p className="text-red-600 text-sm mt-1">{errors.sensitive_communication}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="has_assistance">Has Assistance</Label>
                                        <Select onValueChange={(value) => setData('has_assistance', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select assistance status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Yes">Yes</SelectItem>
                                                <SelectItem value="No">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.has_assistance && (
                                            <p className="text-red-600 text-sm mt-1">{errors.has_assistance}</p>
                                        )}
                                    </div>
                                </div>

                                {data.has_assistance === 'Yes' && (
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="assistance_amount">Assistance Amount</Label>
                                            <Input
                                                id="assistance_amount"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.assistance_amount}
                                                onChange={(e) => setData('assistance_amount', e.target.value)}
                                                error={errors.assistance_amount}
                                            />
                                            {errors.assistance_amount && (
                                                <p className="text-red-600 text-sm mt-1">{errors.assistance_amount}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="assistance_company">Assistance Company</Label>
                                            <Input
                                                id="assistance_company"
                                                value={data.assistance_company}
                                                onChange={(e) => setData('assistance_company', e.target.value)}
                                                error={errors.assistance_company}
                                            />
                                            {errors.assistance_company && (
                                                <p className="text-red-600 text-sm mt-1">{errors.assistance_company}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end gap-2">
                                    <Link href={route('tenants.index')}>
                                        <Button type="button" variant="outline">
                                            Cancel
                                        </Button>
                                    </Link>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Creating...' : 'Create Tenant'}
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
