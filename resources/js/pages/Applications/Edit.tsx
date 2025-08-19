import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/app-layout';
import { Application, ApplicationFormData, UnitData } from '@/types/application';
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


interface Props extends PageProps {
    application: Application;
    units: UnitData[];
    cities: string[];
    properties: Record<string, string[]>;
    unitsByProperty: Record<string, Record<string, string[]>>;
}

export default function Edit({ auth, application, units, cities, properties, unitsByProperty }: Props) {
    const { data, setData, put, processing, errors } = useForm<ApplicationFormData>({
        city: application.city,
        property: application.property,
        name: application.name,
        co_signer: application.co_signer,
        unit: application.unit,
        status: application.status || '',
        date: application.date || '',
        stage_in_progress: application.stage_in_progress || '',
        notes: application.notes || '',
    });

    // Find the city for the current property - Use application.city first
    const currentUnit = units.find(u => u.property === application.property && u.unit_name === application.unit);
    const [selectedCity, setSelectedCity] = useState(application.city || currentUnit?.city || '');
    const [availableProperties, setAvailableProperties] = useState<string[]>(
        selectedCity && properties[selectedCity] ? properties[selectedCity] : []
    );
    const [availableUnits, setAvailableUnits] = useState<string[]>(
        selectedCity && application.property && unitsByProperty[selectedCity]?.[application.property]
            ? unitsByProperty[selectedCity][application.property]
            : []
    );

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
        setData('unit', '');

        if (selectedCity && property && unitsByProperty[selectedCity]?.[property]) {
            setAvailableUnits(unitsByProperty[selectedCity][property]);
        } else {
            setAvailableUnits([]);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('applications.update', application.id));
    };

    return (
        <AppLayout>
            <Head title={`Edit Application - ${application.name}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">
                                    Edit Application - {application.name}
                                </CardTitle>
                                <Link href={route('applications.index')}>
                                    <Button variant="outline">Back to List</Button>
                                </Link>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                {/* --- City / Property / Unit --- */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    {/* City Selection */}
                                    <div>
                                        <Label htmlFor="city">City *</Label>
                                        <Select
                                            onValueChange={handleCityChange}
                                            value={selectedCity}
                                        >
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

                                    {/* Status */}
                                    <div>
                                        <Label htmlFor="status">Status *</Label>
                                        <Select
                                            value={data.status}
                                            onValueChange={(value) => setData('status', value)}
                                        >
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

                                {/* --- Applicant Details --- */}
                                <div className="grid md:grid-cols-2 gap-4">
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
                                </div>

                                {/* --- Application Progress --- */}
                                <div className="grid md:grid-cols-2 gap-4">
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

                                {/* --- Notes --- */}
                                <div>
                                    <Label htmlFor="notes">Notes</Label>
                                    <textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        rows={4}
                                        placeholder="Add any additional notes..."
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                    {errors.notes && (
                                        <p className="text-red-600 text-sm mt-1">{errors.notes}</p>
                                    )}
                                </div>

                                {/* --- Action Buttons --- */}
                                <div className="flex justify-end gap-2">
                                    <Link href={route('applications.index')}>
                                        <Button type="button" variant="outline">
                                            Cancel
                                        </Button>
                                    </Link>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Updating…' : 'Update Application'}
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
