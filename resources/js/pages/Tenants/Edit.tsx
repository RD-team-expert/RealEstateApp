import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/app-layout';
import { Tenant, TenantFormData, UnitData } from '@/types/tenant';
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
import { usePermissions } from '@/hooks/usePermissions';
import { type BreadcrumbItem } from '@/types';
interface Props {
    tenant: Tenant;
    units: UnitData[];
    properties: string[];
    unitsByProperty: Record<string, string[]>;
}

export default function Edit({ tenant, units, properties, unitsByProperty }: Props) {
    const { hasPermission, hasAnyPermission, hasAllPermissions} = usePermissions();
    const { data, setData, put, processing, errors } = useForm<TenantFormData>({
        property_name: tenant.property_name ?? '',
        unit_number: tenant.unit_number ?? '',
        first_name: tenant.first_name ?? '',
        last_name: tenant.last_name ?? '',
        street_address_line: tenant.street_address_line ?? '',
        login_email: tenant.login_email ?? '',
        alternate_email: tenant.alternate_email ?? '',
        mobile: tenant.mobile ?? '',
        emergency_phone: tenant.emergency_phone ?? '',
        cash_or_check: tenant.cash_or_check ?? '',
        has_insurance: tenant.has_insurance ?? '',
        sensitive_communication: tenant.sensitive_communication ?? '',
        has_assistance: tenant.has_assistance ?? '',
        assistance_amount: tenant.assistance_amount?.toString() ?? '',
        assistance_company: tenant.assistance_company ?? '',
    });

    const [availableUnits, setAvailableUnits] = useState<string[]>(
        tenant.property_name && unitsByProperty[tenant.property_name]
            ? unitsByProperty[tenant.property_name]
            : []
    );

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
        put(route('tenants.update', tenant.id));
    };
    const breadcrumbs: BreadcrumbItem[] = [
                {
                    title: 'Tenants',
                    href: '/tenants',
                },
                {
                    title: 'Edit',
                    href: '/tenants/{tenant}/edit',
                },
            ];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${tenant.first_name} ${tenant.last_name}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">
                                    Edit {tenant.first_name} {tenant.last_name}
                                </CardTitle>
                                <Link href={route('tenants.index')}>
                                    <Button variant="outline">Back to List</Button>
                                </Link>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                {/* --- Property / Unit with Dropdowns --- */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    {/* Property Name Dropdown */}
                                    <div>
                                        <Label htmlFor="property_name">Property Name *</Label>
                                        <Select
                                            onValueChange={handlePropertyChange}
                                            value={data.property_name}
                                        >
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

                                {/* --- Name --- */}
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

                                {/* --- Address --- */}
                                <div>
                                    <Label htmlFor="street_address_line">Street Address</Label>
                                    <Input
                                        id="street_address_line"
                                        value={data.street_address_line}
                                        onChange={(e) =>
                                            setData('street_address_line', e.target.value)
                                        }
                                        error={errors.street_address_line}
                                    />
                                    {errors.street_address_line && (
                                        <p className="text-red-600 text-sm mt-1">
                                            {errors.street_address_line}
                                        </p>
                                    )}
                                </div>

                                {/* --- Emails --- */}
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

                                {/* --- Phones --- */}
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

                                {/* --- Selects --- */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    {/* Payment Method */}
                                    <div>
                                        <Label>Payment Method</Label>
                                        <Select
                                            value={data.cash_or_check}
                                            onValueChange={(v) => setData('cash_or_check', v)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select payment method" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Cash">Cash</SelectItem>
                                                <SelectItem value="Check">Check</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.cash_or_check && (
                                            <p className="text-red-600 text-sm mt-1">
                                                {errors.cash_or_check}
                                            </p>
                                        )}
                                    </div>

                                    {/* Has Insurance */}
                                    <div>
                                        <Label>Has Insurance</Label>
                                        <Select
                                            value={data.has_insurance}
                                            onValueChange={(v) => setData('has_insurance', v)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select insurance status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Yes">Yes</SelectItem>
                                                <SelectItem value="No">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.has_insurance && (
                                            <p className="text-red-600 text-sm mt-1">
                                                {errors.has_insurance}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    {/* Sensitive Communication */}
                                    <div>
                                        <Label>Sensitive Communication</Label>
                                        <Select
                                            value={data.sensitive_communication}
                                            onValueChange={(v) => setData('sensitive_communication', v)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select preference" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Yes">Yes</SelectItem>
                                                <SelectItem value="No">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.sensitive_communication && (
                                            <p className="text-red-600 text-sm mt-1">
                                                {errors.sensitive_communication}
                                            </p>
                                        )}
                                    </div>

                                    {/* Has Assistance */}
                                    <div>
                                        <Label>Has Assistance</Label>
                                        <Select
                                            value={data.has_assistance}
                                            onValueChange={(v) => setData('has_assistance', v)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select assistance status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Yes">Yes</SelectItem>
                                                <SelectItem value="No">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.has_assistance && (
                                            <p className="text-red-600 text-sm mt-1">
                                                {errors.has_assistance}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* --- Assistance section (conditional) --- */}
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
                                                onChange={(e) =>
                                                    setData('assistance_amount', e.target.value)
                                                }
                                                error={errors.assistance_amount}
                                            />
                                            {errors.assistance_amount && (
                                                <p className="text-red-600 text-sm mt-1">
                                                    {errors.assistance_amount}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="assistance_company">Assistance Company</Label>
                                            <Input
                                                id="assistance_company"
                                                value={data.assistance_company}
                                                onChange={(e) =>
                                                    setData('assistance_company', e.target.value)
                                                }
                                                error={errors.assistance_company}
                                            />
                                            {errors.assistance_company && (
                                                <p className="text-red-600 text-sm mt-1">
                                                    {errors.assistance_company}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* --- Action Buttons --- */}
                                <div className="flex justify-end gap-2">
                                    <Link href={route('tenants.index', tenant.id)}>
                                        <Button type="button" variant="outline">
                                            Cancel
                                        </Button>
                                    </Link>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Updating…' : 'Update Tenant'}
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
