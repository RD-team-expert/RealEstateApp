import React, { useState, useEffect } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/app-layout';
import { ApplicationFormData, UnitData } from '@/types/application';
import { PageProps } from '@/types/application';
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
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import { type BreadcrumbItem } from '@/types';
interface Props extends PageProps {
    units: UnitData[];
    cities: string[];
    properties: Record<string, string[]>;
    unitsByProperty: Record<string, Record<string, string[]>>;
}

export default function Create({ auth, units, cities, properties, unitsByProperty }: Props) {
    const { data, setData, post, processing, errors } = useForm<ApplicationFormData>({
        city: '',
        property: '',
        name: '',
        co_signer: '',
        unit: '',
        status: '',
        date: '',
        stage_in_progress: '',
        notes: '',
        attachment: null,
    });

    const [selectedCity, setSelectedCity] = useState('');
    const [availableProperties, setAvailableProperties] = useState<string[]>([]);
    const [availableUnits, setAvailableUnits] = useState<string[]>([]);

    // Handle city selection
    const handleCityChange = (city: string) => {
        setSelectedCity(city);
        setData('city', city);
        setData('property', '');
        setData('unit', '');

        if (city && properties[city]) {
            setAvailableProperties(properties[city]);
        } else {
            setAvailableProperties([]);
        }
        setAvailableUnits([]);
    };

    // Handle property selection
    const handlePropertyChange = (property: string) => {
        setData('property', property);
        setData('unit', ''); // Reset unit

        if (selectedCity && property && unitsByProperty[selectedCity]?.[property]) {
            setAvailableUnits(unitsByProperty[selectedCity][property]);
        } else {
            setAvailableUnits([]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('applications.store'));
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Applications',
            href: '/applications',
        },
        {
            title: 'Create',
            href: '/applications/create',
        },
    ];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Application" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">Create New Application</CardTitle>
                                <Link href={route('applications.index')}>
                                    <Button variant="outline">Back to List</Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                    {/* City Selection */}
                                    <div>
                                        <Label htmlFor="city">City *</Label>
                                        <Select onValueChange={handleCityChange} value={selectedCity}>
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
                                        {errors.city && (
                                            <p className="text-red-600 text-sm mt-1">{errors.city}</p>
                                        )}
                                    </div>

                                    {/* Property Selection */}
                                    <div>
                                        <Label htmlFor="property">Property *</Label>
                                        <Select
                                            onValueChange={handlePropertyChange}
                                            value={data.property}
                                            disabled={!selectedCity}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select property" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableProperties.map((property) => (
                                                    <SelectItem key={property} value={property}>
                                                        {property}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.property && (
                                            <p className="text-red-600 text-sm mt-1">{errors.property}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    {/* Unit Selection */}
                                    <div>
                                        <Label htmlFor="unit">Unit *</Label>
                                        <Select
                                            onValueChange={(value) => setData('unit', value)}
                                            value={data.unit}
                                            disabled={!data.property}
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
                                        {errors.unit && (
                                            <p className="text-red-600 text-sm mt-1">{errors.unit}</p>
                                        )}
                                    </div>

                                    {/* Name */}
                                    <div>
                                        <Label htmlFor="name">Name *</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            error={errors.name}
                                        />
                                        {errors.name && (
                                            <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    {/* Co-signer */}
                                    <div>
                                        <Label htmlFor="co_signer">Co-signer *</Label>
                                        <Input
                                            id="co_signer"
                                            value={data.co_signer}
                                            onChange={(e) => setData('co_signer', e.target.value)}
                                            error={errors.co_signer}
                                        />
                                        {errors.co_signer && (
                                            <p className="text-red-600 text-sm mt-1">{errors.co_signer}</p>
                                        )}
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <Label htmlFor="status">Status *</Label>
                                        <Select onValueChange={(value) => setData('status', value)} value={data.status}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="New">New</SelectItem>
                                                <SelectItem value="Approved">Approved</SelectItem>
                                                <SelectItem value="Undecided">Undecided</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.status && (
                                            <p className="text-red-600 text-sm mt-1">{errors.status}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    {/* Date */}
                                    <div>
                                        <Label htmlFor="date">Date</Label>
                                        <Input
                                            id="date"
                                            type="date"
                                            value={data.date}
                                            onChange={(e) => setData('date', e.target.value)}
                                            error={errors.date}
                                        />
                                        {errors.date && (
                                            <p className="text-red-600 text-sm mt-1">{errors.date}</p>
                                        )}
                                    </div>

                                    {/* Stage in Progress */}
                                    <div>
                                        <Label htmlFor="stage_in_progress">Stage in Progress</Label>
                                        <Input
                                            id="stage_in_progress"
                                            value={data.stage_in_progress}
                                            onChange={(e) => setData('stage_in_progress', e.target.value)}
                                            placeholder="e.g., Document Review, Background Check, etc."
                                            error={errors.stage_in_progress}
                                        />
                                        {errors.stage_in_progress && (
                                            <p className="text-red-600 text-sm mt-1">{errors.stage_in_progress}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <Label htmlFor="notes">Notes</Label>
                                    <textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        rows={4}
                                        placeholder="Add any additional notes..."
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-vertical"
                                    />
                                    {errors.notes && (
                                        <p className="text-red-600 text-sm mt-1">{errors.notes}</p>
                                    )}
                                </div>

                                {/* Attachment */}
                                <div>
                                    <Label htmlFor="attachment">Attachment</Label>
                                    <Input
                                        id="attachment"
                                        type="file"
                                        accept="*"
                                        onChange={(e) => setData('attachment', e.target.files?.[0] || null)}
                                        className="cursor-pointer file:cursor-pointer file:border-0 file:bg-transparent file:text-sm file:font-medium"
                                    />
                                    {errors.attachment && (
                                        <p className="text-red-600 text-sm mt-1">{errors.attachment}</p>
                                    )}
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Link href={route('applications.index')}>
                                        <Button type="button" variant="outline">
                                            Cancel
                                        </Button>
                                    </Link>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Creating...' : 'Create Application'}
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
