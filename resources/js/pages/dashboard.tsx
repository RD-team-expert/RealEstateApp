// resources/js/Pages/Dashboard/Index.tsx

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { City, Property, Unit } from '@/types/dashboard';
import { Head, router } from '@inertiajs/react';
import { useCallback } from 'react';

interface Props {
    cities: City[];
    properties: Property[];
    units: Unit[];
    unitInfo: Unit | null;
    selectedCityId: number | null;
    selectedPropertyId: number | null;
    selectedUnitId: number | null;
}

export default function DashboardIndex({ cities, properties, units, unitInfo, selectedCityId, selectedPropertyId, selectedUnitId }: Props) {
    // Define breadcrumbs based on current selection
    const getBreadcrumbs = useCallback((): BreadcrumbItem[] => {
        const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

        if (selectedCityId) {
            const selectedCity = cities.find((city) => city.id === selectedCityId);
            if (selectedCity) {
                breadcrumbs.push({
                    title: selectedCity.city,
                    href: `/dashboard?city_id=${selectedCityId}`,
                });
            }
        }

        if (selectedPropertyId) {
            const selectedProperty = properties.find((property) => property.id === selectedPropertyId);
            if (selectedProperty) {
                breadcrumbs.push({
                    title: selectedProperty.property_name,
                    href: `/dashboard?city_id=${selectedCityId}&property_id=${selectedPropertyId}`,
                });
            }
        }

        if (selectedUnitId) {
            const selectedUnit = units.find((unit) => unit.id === selectedUnitId);
            if (selectedUnit) {
                breadcrumbs.push({
                    title: selectedUnit.unit_name,
                    href: `/dashboard?city_id=${selectedCityId}&property_id=${selectedPropertyId}&unit_id=${selectedUnitId}`,
                });
            }
        }

        return breadcrumbs;
    }, [selectedCityId, selectedPropertyId, selectedUnitId, cities, properties, units]);

    const handleCityChange = useCallback((cityId: number | null) => {
        if (!cityId) {
            router.get('/dashboard');
            return;
        }

        router.get(
            '/dashboard',
            { city_id: cityId },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    }, []);

    const handlePropertyChange = useCallback(
        (propertyId: number | null) => {
            if (!propertyId || !selectedCityId) {
                router.get('/dashboard', { city_id: selectedCityId });
                return;
            }

            router.get(
                '/dashboard',
                {
                    city_id: selectedCityId,
                    property_id: propertyId,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        },
        [selectedCityId],
    );

    const handleUnitChange = useCallback(
        (unitId: number | null) => {
            if (!unitId || !selectedCityId || !selectedPropertyId) {
                router.get('/dashboard', {
                    city_id: selectedCityId,
                    property_id: selectedPropertyId,
                });
                return;
            }

            router.get(
                '/dashboard',
                {
                    city_id: selectedCityId,
                    property_id: selectedPropertyId,
                    unit_id: unitId,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        },
        [selectedCityId, selectedPropertyId],
    );

    return (
        <AppLayout breadcrumbs={getBreadcrumbs()}>
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="rounded-lg bg-white shadow">
                    <div className="px-4 py-5 sm:p-6">
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                        <p className="mt-1 text-sm text-gray-600">Select a city, property, and unit to view detailed information.</p>
                    </div>
                </div>

                {/* Selection Controls */}
                <div className="rounded-lg bg-white shadow">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            {/* City Selection */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Select City</label>
                                <select
                                    value={selectedCityId || ''}
                                    onChange={(e) => handleCityChange(e.target.value ? parseInt(e.target.value) : null)}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                >
                                    <option value="">Choose a city...</option>
                                    {cities.map((city) => (
                                        <option key={city.id} value={city.id}>
                                            {city.city}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Property Selection */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Select Property</label>
                                <select
                                    value={selectedPropertyId || ''}
                                    onChange={(e) => handlePropertyChange(e.target.value ? parseInt(e.target.value) : null)}
                                    disabled={!selectedCityId}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
                                >
                                    <option value="">Choose a property...</option>
                                    {properties.map((property) => (
                                        <option key={property.id} value={property.id}>
                                            {property.property_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Unit Selection */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Select Unit</label>
                                <select
                                    value={selectedUnitId || ''}
                                    onChange={(e) => handleUnitChange(e.target.value ? parseInt(e.target.value) : null)}
                                    disabled={!selectedPropertyId}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
                                >
                                    <option value="">Choose a unit...</option>
                                    {units.map((unit) => (
                                        <option key={unit.id} value={unit.id}>
                                            {unit.unit_name} - {unit.vacant === 'Yes' ? 'Vacant' : 'Occupied'}
                                            {unit.monthly_rent && ` - $${unit.monthly_rent}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Unit Information Display */}
                {unitInfo && (
                    <div className="rounded-lg bg-white shadow">
                        <div className="px-4 py-5 sm:p-6">
                            <h2 className="mb-6 text-xl font-semibold text-gray-900">Unit Information</h2>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {/* Basic Information */}
                                <div className="space-y-3">
                                    <h3 className="border-b border-gray-200 pb-2 font-medium text-gray-900">Basic Information</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Status:</span>
                                            <span
                                                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                                    unitInfo.vacant === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}
                                            >
                                                {unitInfo.vacant === 'Yes' ? 'Vacant' : 'Occupied'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Unit Details */}
                                <div className="space-y-3">
                                    <h3 className="border-b border-gray-200 pb-2 font-medium text-gray-900">Unit Details</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Bedrooms:</span>
                                            <span className="font-medium">{unitInfo.count_beds || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Bathrooms:</span>
                                            <span className="font-medium">{unitInfo.count_baths || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Monthly Rent:</span>
                                            <span className="font-medium text-green-600">{unitInfo.formatted_monthly_rent || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Applications:</span>
                                            <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                                                {unitInfo.total_applications || 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Lease Information */}
                                <div className="space-y-3">
                                    <h3 className="border-b border-gray-200 pb-2 font-medium text-gray-900">Lease Information</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Lease Status:</span>
                                            <span className="font-medium">{unitInfo.lease_status || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Lease Start:</span>
                                            <span className="font-medium">{unitInfo.lease_start || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Lease End:</span>
                                            <span className="font-medium">{unitInfo.lease_end || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Insurance Information */}
                            {unitInfo.insurance && (
                                <div className="mt-6 border-t border-gray-200 pt-6">
                                    <h3 className="mb-3 font-medium text-gray-900">Insurance Information</h3>
                                    <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Insurance:</span>
                                            <span
                                                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                                    unitInfo.insurance === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}
                                            >
                                                {unitInfo.insurance}
                                            </span>
                                        </div>
                                        {unitInfo.insurance_expiration_date && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Expiration Date:</span>
                                                <span className="font-medium">{unitInfo.insurance_expiration_date}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
