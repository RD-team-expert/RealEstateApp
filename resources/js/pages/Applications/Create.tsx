// resources/js/Pages/Applications/Create.tsx

import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/app-layout';
import { ApplicationFormData, UnitData } from '@/types/application';
import { PageProps } from '@/types/application';
import axios from 'axios';

interface Props extends PageProps {
    units: UnitData[];
    cities: string[];
    properties: Record<string, string[]>;
    unitsByProperty: Record<string, Record<string, string[]>>;
}

export default function Create({ auth, units, cities, properties, unitsByProperty }: Props) {
    const { data, setData, post, processing, errors } = useForm<ApplicationFormData>({
        property: '',
        name: '',
        co_signer: '',
        unit: '',
        status: '',
        date: '',
        stage_in_progress: '',
        notes: '',
    });

    const [selectedCity, setSelectedCity] = useState('');
    const [availableProperties, setAvailableProperties] = useState<string[]>([]);
    const [availableUnits, setAvailableUnits] = useState<string[]>([]);

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
        post(route('applications.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Add New Application</h2>}
        >
            <Head title="Add New Application" />

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

                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                        {errors.name && (
                                            <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                                        )}
                                    </div>

                                    {/* Co-signer */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Co-signer *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.co_signer}
                                            onChange={(e) => setData('co_signer', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                        {errors.co_signer && (
                                            <p className="text-red-600 text-sm mt-1">{errors.co_signer}</p>
                                        )}
                                    </div>

                                    {/* Status */}
                                    <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Status <span className="text-red-500">*</span>
  </label>
  <select
    name="status"
    value={data.status}
    onChange={e => setData('status', e.target.value)}
    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    required
  >

    <option value="New">New</option>
    <option value="Approved">Approved</option>
    <option value="Undecided">Undecided</option>
  </select>
  {errors.status && (
    <p className="text-red-600 text-sm mt-1">{errors.status}</p>
  )}
</div>

                                    {/* Date */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Date
                                        </label>
                                        <input
                                            type="date"
                                            value={data.date}
                                            onChange={(e) => setData('date', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {errors.date && (
                                            <p className="text-red-600 text-sm mt-1">{errors.date}</p>
                                        )}
                                    </div>

                                    {/* Stage in Progress */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Stage in Progress
                                        </label>
                                        <input
                                            type="text"
                                            value={data.stage_in_progress}
                                            onChange={(e) => setData('stage_in_progress', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="e.g., Document Review, Background Check, etc."
                                        />
                                        {errors.stage_in_progress && (
                                            <p className="text-red-600 text-sm mt-1">{errors.stage_in_progress}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Notes */}
                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Notes
                                    </label>
                                    <textarea
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        rows={4}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Add any additional notes..."
                                    />
                                    {errors.notes && (
                                        <p className="text-red-600 text-sm mt-1">{errors.notes}</p>
                                    )}
                                </div>

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
                                        {processing ? 'Creating...' : 'Create Application'}
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
