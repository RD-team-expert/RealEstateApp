// resources/js/Pages/Applications/Edit.tsx

import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/app-layout';
import { Application, ApplicationFormData, UnitData } from '@/types/application';
import { PageProps } from '@/types/application';

interface Props extends PageProps {
    application: Application;
    units: UnitData[];
    cities: string[];
    properties: Record<string, string[]>;
    unitsByProperty: Record<string, Record<string, string[]>>;
}

export default function Edit({ auth, application, units, cities, properties, unitsByProperty }: Props) {
    const { data, setData, put, processing, errors } = useForm<ApplicationFormData>({
        property: application.property,
        name: application.name,
        co_signer: application.co_signer,
        unit: application.unit,
        status: application.status || '',
        date: application.date || '',
        stage_in_progress: application.stage_in_progress || '',
        notes: application.notes || '',
    });

    // Find the city for the current property
    const currentUnit = units.find(u => u.property === application.property && u.unit_name === application.unit);
    const [selectedCity, setSelectedCity] = useState(currentUnit?.city || '');
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
        setData('property', ''); // Reset property
        setData('unit', ''); // Reset unit

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
        put(route('applications.update', application.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Edit Application</h2>}
        >
            <Head title="Edit Application" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* City Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            City *
                                        </label>
                                        <select
                                            value={selectedCity}
                                            onChange={(e) => handleCityChange(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">Select City</option>
                                            {cities.map((city) => (
                                                <option key={city} value={city}>
                                                    {city}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.property && (
                                            <p className="text-red-600 text-sm mt-1">Please select a valid city and property</p>
                                        )}
                                    </div>

                                    {/* Property Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Property *
                                        </label>
                                        <select
                                            value={data.property}
                                            onChange={(e) => handlePropertyChange(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                            disabled={!selectedCity}
                                        >
                                            <option value="">Select Property</option>
                                            {availableProperties.map((property) => (
                                                <option key={property} value={property}>
                                                    {property}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.property && (
                                            <p className="text-red-600 text-sm mt-1">{errors.property}</p>
                                        )}
                                    </div>

                                    {/* Unit Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Unit *
                                        </label>
                                        <select
                                            value={data.unit}
                                            onChange={(e) => setData('unit', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                            disabled={!data.property}
                                        >
                                            <option value="">Select Unit</option>
                                            {availableUnits.map((unit) => (
                                                <option key={unit} value={unit}>
                                                    {unit}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.unit && (
                                            <p className="text-red-600 text-sm mt-1">{errors.unit}</p>
                                        )}
                                    </div>

                                    {/* Rest of the form fields remain the same as Create component */}
                                    {/* Name, Co-signer, Status, Date, Stage in Progress */}
                                    {/* ... (copy from Create component) ... */}
                                </div>

                                {/* Notes section */}
                                {/* ... (copy from Create component) ... */}

                                <div className="mt-6 flex justify-end space-x-3">
                                    <a
                                        href={route('applications.index')}
                                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                                    >
                                        Cancel
                                    </a>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                                    >
                                        {processing ? 'Updating...' : 'Update Application'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
