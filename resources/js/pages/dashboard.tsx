// resources/js/Pages/Dashboard/Index.tsx

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { City, Property, Tenant, Unit, MoveIn, MoveOut, VendorTask, Payment, PaymentPlan, Application, OffersAndRenewal, NoticeAndEviction } from '@/types/dashboard';
import { Head, router } from '@inertiajs/react';
import { useCallback } from 'react';

interface Props {
    cities: City[];
    properties: Property[];
    units: Unit[];
    unitInfo: Unit | null;
    tenants: Tenant[];
    moveIns: MoveIn[];
    moveOuts: MoveOut[];
    vendorTasks: VendorTask[];
    payments: Payment[];
    paymentPlans: PaymentPlan[];
    applications: Application[];
    offersAndRenewals: OffersAndRenewal[];
    noticesAndEvictions: NoticeAndEviction[];
    selectedCityId: number | null;
    selectedPropertyId: number | null;
    selectedUnitId: number | null;
}

export default function DashboardIndex({ cities, properties, units, unitInfo, tenants, moveIns, moveOuts, vendorTasks, payments, paymentPlans, applications, offersAndRenewals, noticesAndEvictions, selectedCityId, selectedPropertyId, selectedUnitId }: Props) {
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

    const formatPhoneNumber = (phone: string) => {
        if (!phone) return '';
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }
        return phone;
    };

    return (
        <AppLayout breadcrumbs={getBreadcrumbs()}>
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="rounded-lg bg-white shadow">
                    <div className="px-4 py-5 sm:p-6">
                        <h1 className="text-2xl font-bold text-gray-900">Property Management Dashboard</h1>
                        <p className="mt-1 text-sm text-gray-600">Select a city, property, and unit to view comprehensive tenant information.</p>
                    </div>
                </div>

                {/* Selection Controls */}
                <div className="rounded-lg bg-white shadow">
                    <div className="px-4 py-5 sm:p-6">
                        <h2 className="mb-4 text-lg font-medium text-gray-900">Property Selection</h2>
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

                {/* Complete Tenant Information Display */}
                {selectedUnitId && (
                    <div className="rounded-lg bg-white shadow">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-900">Complete Tenant Information ({tenants.length})</h2>
                                {tenants.length === 0 && (
                                    <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
                                        No tenants found
                                    </span>
                                )}
                            </div>

                            {tenants.length > 0 && (
                                <div className="space-y-8">
                                    {tenants.map((tenant, index) => (
                                        <div
                                            key={tenant.id}
                                            className={`rounded-lg border-2 border-gray-200 bg-gray-50 p-6 ${index !== 0 ? 'mt-8' : ''}`}
                                        >
                                            {/* Tenant Header */}
                                            <div className="mb-6 border-b-2 border-gray-300 pb-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="text-2xl font-bold text-gray-900">{tenant.full_name}</h3>
                                                        <p className="mt-1 text-sm text-gray-500">Tenant ID #{tenant.id}</p>
                                                        <p className="text-sm text-gray-500">Account Created: {tenant.created_at_formatted}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span
                                                            className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                                                                tenant.is_archived ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                            }`}
                                                        >
                                                            {tenant.is_archived ? 'Archived' : 'Active'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                                                {/* Personal Information */}
                                                <div className="space-y-4">
                                                    <h4 className="border-b border-gray-300 pb-2 text-lg font-semibold text-gray-800">
                                                        Personal Information
                                                    </h4>
                                                    <div className="space-y-3 text-sm">
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">First Name:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{tenant.first_name}</p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Last Name:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{tenant.last_name}</p>
                                                        </div>
                                                        {tenant.street_address_line && (
                                                            <div className="rounded border bg-white p-3">
                                                                <label className="font-medium text-gray-600">Address:</label>
                                                                <p className="mt-1 font-medium text-gray-900">{tenant.street_address_line}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Contact Information */}
                                                <div className="space-y-4">
                                                    <h4 className="border-b border-gray-300 pb-2 text-lg font-semibold text-gray-800">
                                                        Contact Information
                                                    </h4>
                                                    <div className="space-y-3 text-sm">
                                                        {tenant.login_email && (
                                                            <div className="rounded border bg-white p-3">
                                                                <label className="font-medium text-gray-600">Primary Email:</label>
                                                                <p className="mt-1 font-medium break-all text-blue-600">{tenant.login_email}</p>
                                                            </div>
                                                        )}
                                                        {tenant.alternate_email && (
                                                            <div className="rounded border bg-white p-3">
                                                                <label className="font-medium text-gray-600">Alternate Email:</label>
                                                                <p className="mt-1 font-medium break-all text-blue-600">{tenant.alternate_email}</p>
                                                            </div>
                                                        )}
                                                        {tenant.mobile && (
                                                            <div className="rounded border bg-white p-3">
                                                                <label className="font-medium text-gray-600">Mobile Phone:</label>
                                                                <p className="mt-1 font-medium text-gray-900">{formatPhoneNumber(tenant.mobile)}</p>
                                                            </div>
                                                        )}
                                                        {tenant.emergency_phone && (
                                                            <div className="rounded border bg-white p-3">
                                                                <label className="font-medium text-gray-600">Emergency Contact:</label>
                                                                <p className="mt-1 font-medium text-red-600">
                                                                    {formatPhoneNumber(tenant.emergency_phone)}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Property Information */}
                                                <div className="space-y-4">
                                                    <h4 className="border-b border-gray-300 pb-2 text-lg font-semibold text-gray-800">
                                                        Property Details
                                                    </h4>
                                                    <div className="space-y-3 text-sm">
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">City:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{tenant.city_name || 'N/A'}</p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Property:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{tenant.property_name || 'N/A'}</p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Unit:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{tenant.unit_name || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Payment & Insurance Information */}
                                                <div className="space-y-4">
                                                    <h4 className="border-b border-gray-300 pb-2 text-lg font-semibold text-gray-800">
                                                        Payment & Insurance
                                                    </h4>
                                                    <div className="space-y-3 text-sm">
                                                        {tenant.cash_or_check && (
                                                            <div className="rounded border bg-white p-3">
                                                                <label className="font-medium text-gray-600">Payment Method:</label>
                                                                <span className="mt-1 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                                                                    {tenant.cash_or_check}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Has Insurance:</label>
                                                            <span
                                                                className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                                    tenant.has_insurance === 'Yes'
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : 'bg-red-100 text-red-800'
                                                                }`}
                                                            >
                                                                {tenant.has_insurance || 'Not Specified'}
                                                            </span>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Sensitive Communication:</label>
                                                            <span
                                                                className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                                    tenant.sensitive_communication === 'Yes'
                                                                        ? 'bg-yellow-100 text-yellow-800'
                                                                        : 'bg-gray-100 text-gray-800'
                                                                }`}
                                                            >
                                                                {tenant.sensitive_communication || 'No'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Assistance Information */}
                                                <div className="space-y-4">
                                                    <h4 className="border-b border-gray-300 pb-2 text-lg font-semibold text-gray-800">
                                                        Assistance Program
                                                    </h4>
                                                    <div className="space-y-3 text-sm">
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Has Assistance:</label>
                                                            <span
                                                                className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                                    tenant.has_assistance === 'Yes'
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : 'bg-gray-100 text-gray-800'
                                                                }`}
                                                            >
                                                                {tenant.has_assistance || 'No'}
                                                            </span>
                                                        </div>
                                                        {tenant.has_assistance === 'Yes' && (
                                                            <>
                                                                {tenant.formatted_assistance_amount && (
                                                                    <div className="rounded border bg-white p-3">
                                                                        <label className="font-medium text-gray-600">Assistance Amount:</label>
                                                                        <p className="mt-1 text-lg font-bold text-green-600">
                                                                            {tenant.formatted_assistance_amount}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                                {tenant.assistance_company && (
                                                                    <div className="rounded border bg-white p-3">
                                                                        <label className="font-medium text-gray-600">Assistance Company:</label>
                                                                        <p className="mt-1 font-medium text-gray-900">{tenant.assistance_company}</p>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* System Information */}
                                                <div className="space-y-4">
                                                    <h4 className="border-b border-gray-300 pb-2 text-lg font-semibold text-gray-800">
                                                        System Information
                                                    </h4>
                                                    <div className="space-y-3 text-sm">
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Created:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{tenant.created_at_formatted}</p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Last Updated:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{tenant.updated_at_formatted}</p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Status:</label>
                                                            <span
                                                                className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                                    tenant.is_archived ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                                }`}
                                                            >
                                                                {tenant.is_archived ? 'Archived' : 'Active'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Related Records */}
                                            {((tenant.notices_and_evictions?.length ?? 0) || (tenant.offers_and_renewals?.length ?? 0)) && (
                                                <div className="mt-8 border-t-2 border-gray-300 pt-6">
                                                    <h4 className="mb-4 text-lg font-semibold text-gray-800">Related Records</h4>
                                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                        {tenant.notices_and_evictions && tenant.notices_and_evictions.length > 0 && (
                                                            <div className="rounded border bg-white p-4">
                                                                <h5 className="mb-2 font-medium text-gray-900">
                                                                    Notices & Evictions ({tenant.notices_and_evictions.length})
                                                                </h5>
                                                                <p className="text-sm text-gray-600">Recent activity records available</p>
                                                            </div>
                                                        )}
                                                        {tenant.offers_and_renewals && tenant.offers_and_renewals.length > 0 && (
                                                            <div className="rounded border bg-white p-4">
                                                                <h5 className="mb-2 font-medium text-gray-900">
                                                                    Offers & Renewals ({tenant.offers_and_renewals.length})
                                                                </h5>
                                                                <p className="text-sm text-gray-600">Recent offer/renewal records available</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Move-In Information Display */}
                {selectedUnitId && (
                    <div className="rounded-lg bg-white shadow">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-900">Move-In Information ({moveIns.length})</h2>
                                {moveIns.length === 0 && (
                                    <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
                                        No move-in records found
                                    </span>
                                )}
                            </div>

                            {moveIns.length > 0 && (
                                <div className="space-y-8">
                                    {moveIns.map((moveIn, index) => (
                                        <div
                                            key={moveIn.id}
                                            className={`rounded-lg border-2 border-gray-200 bg-gray-50 p-6 ${index !== 0 ? 'mt-8' : ''}`}
                                        >
                                            {/* Move-In Header */}
                                            <div className="mb-6 border-b-2 border-gray-300 pb-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="text-2xl font-bold text-gray-900">Move-In Record #{moveIn.id}</h3>
                                                        <p className="mt-1 text-sm text-gray-500">Unit: {moveIn.unit_name}</p>
                                                        <p className="text-sm text-gray-500">Created: {moveIn.created_at_formatted}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span
                                                            className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                                                                moveIn.is_archived ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                            }`}
                                                        >
                                                            {moveIn.is_archived ? 'Archived' : 'Active'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                                                {/* Lease Information */}
                                                <div className="space-y-4">
                                                    <h4 className="border-b border-gray-300 pb-2 text-lg font-semibold text-gray-800">
                                                        Lease Information
                                                    </h4>
                                                    <div className="space-y-3 text-sm">
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Signed Lease:</label>
                                                            <p className="mt-1 font-medium text-gray-900">
                                                                {moveIn.signed_lease || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Lease Signing Date:</label>
                                                            <p className="mt-1 font-medium text-gray-900">
                                                                {moveIn.lease_signing_date_formatted || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Move-In Date:</label>
                                                            <p className="mt-1 font-medium text-gray-900">
                                                                {moveIn.move_in_date_formatted || 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Payment Information */}
                                                <div className="space-y-4">
                                                    <h4 className="border-b border-gray-300 pb-2 text-lg font-semibold text-gray-800">
                                                        Payment Information
                                                    </h4>
                                                    <div className="space-y-3 text-sm">
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Security Deposit & First Month:</label>
                                                            <p className="mt-1 font-medium text-gray-900">
                                                                {moveIn.paid_security_deposit_first_month_rent || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Scheduled Payment Time:</label>
                                                            <p className="mt-1 font-medium text-gray-900">
                                                                {moveIn.scheduled_paid_time_formatted || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Keys Handled:</label>
                                                            <p className="mt-1 font-medium text-gray-900">
                                                                {moveIn.handled_keys || 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Forms & Documentation */}
                                                <div className="space-y-4">
                                                    <h4 className="border-b border-gray-300 pb-2 text-lg font-semibold text-gray-800">
                                                        Forms & Documentation
                                                    </h4>
                                                    <div className="space-y-3 text-sm">
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Move-In Form Sent:</label>
                                                            <p className="mt-1 font-medium text-gray-900">
                                                                {moveIn.move_in_form_sent_date_formatted || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Form Filled:</label>
                                                            <p className="mt-1 font-medium text-gray-900">
                                                                {moveIn.filled_move_in_form || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Date Form Filled:</label>
                                                            <p className="mt-1 font-medium text-gray-900">
                                                                {moveIn.date_of_move_in_form_filled_formatted || 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Insurance Information */}
                                            <div className="mt-6 border-t border-gray-200 pt-6">
                                                <h4 className="mb-3 text-lg font-semibold text-gray-800">Insurance Information</h4>
                                                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                                                    <div className="rounded border bg-white p-3">
                                                        <label className="font-medium text-gray-600">Insurance Submitted:</label>
                                                        <p className="mt-1 font-medium text-gray-900">
                                                            {moveIn.submitted_insurance || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div className="rounded border bg-white p-3">
                                                        <label className="font-medium text-gray-600">Insurance Expiration:</label>
                                                        <p className="mt-1 font-medium text-gray-900">
                                                            {moveIn.date_of_insurance_expiration_formatted || 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Move-Outs Information Display */}
                {selectedUnitId && (
                    <div className="rounded-lg bg-white shadow">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-900">Move-Out Information ({moveOuts.length})</h2>
                                {moveOuts.length === 0 && (
                                    <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
                                        No move-outs found
                                    </span>
                                )}
                            </div>

                            {moveOuts.length > 0 && (
                                <div className="space-y-6">
                                    {moveOuts.map((moveOut, index) => (
                                        <div
                                            key={moveOut.id}
                                            className={`rounded-lg border-2 border-gray-200 bg-gray-50 p-6 ${index !== 0 ? 'mt-6' : ''}`}
                                        >
                                            {/* Move-Out Header */}
                                            <div className="mb-6 border-b-2 border-gray-300 pb-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-gray-900">
                                                            Move-Out #{moveOut.id}
                                                            {moveOut.tenant_name && ` - ${moveOut.tenant_name}`}
                                                        </h3>
                                                        <p className="mt-1 text-sm text-gray-500">Created: {moveOut.created_at_formatted}</p>
                                                        {moveOut.updated_at_formatted && (
                                                            <p className="text-sm text-gray-500">Updated: {moveOut.updated_at_formatted}</p>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <span
                                                            className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                                                                moveOut.is_archived ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                            }`}
                                                        >
                                                            {moveOut.is_archived ? 'Archived' : 'Active'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                                {/* Move-Out Details */}
                                                <div className="space-y-4">
                                                    <h4 className="border-b border-gray-300 pb-2 text-lg font-semibold text-gray-800">
                                                        Move-Out Details
                                                    </h4>
                                                    <div className="space-y-3 text-sm">
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Move-Out Date:</label>
                                                            <p className="mt-1 font-medium text-gray-900">
                                                                {moveOut.move_out_date_formatted || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Lease Status:</label>
                                                            <p className="mt-1 font-medium text-gray-900">
                                                                {moveOut.lease_status || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Lease Ending Date (Buildium):</label>
                                                            <p className="mt-1 font-medium text-gray-900">
                                                                {moveOut.date_lease_ending_on_buildium_formatted || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Keys Location:</label>
                                                            <p className="mt-1 font-medium text-gray-900">
                                                                {moveOut.keys_location || 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Utilities & Services */}
                                                <div className="space-y-4">
                                                    <h4 className="border-b border-gray-300 pb-2 text-lg font-semibold text-gray-800">
                                                        Utilities & Services
                                                    </h4>
                                                    <div className="space-y-3 text-sm">
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Utilities Under Our Name:</label>
                                                            <p className="mt-1 font-medium text-gray-900">
                                                                <span
                                                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                                                        moveOut.utilities_under_our_name === 'Yes' 
                                                                            ? 'bg-green-100 text-green-800' 
                                                                            : 'bg-red-100 text-red-800'
                                                                    }`}
                                                                >
                                                                    {moveOut.utilities_under_our_name || 'N/A'}
                                                                </span>
                                                            </p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Utility Transfer Date:</label>
                                                            <p className="mt-1 font-medium text-gray-900">
                                                                {moveOut.date_utility_put_under_our_name_formatted || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Walkthrough:</label>
                                                            <p className="mt-1 font-medium text-gray-900">
                                                                {moveOut.walkthrough || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Cleaning Status:</label>
                                                            <p className="mt-1 font-medium text-gray-900">
                                                                <span
                                                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                                                        moveOut.cleaning === 'cleaned' 
                                                                            ? 'bg-green-100 text-green-800' 
                                                                            : moveOut.cleaning === 'uncleaned'
                                                                            ? 'bg-red-100 text-red-800'
                                                                            : 'bg-gray-100 text-gray-800'
                                                                    }`}
                                                                >
                                                                    {moveOut.cleaning ? moveOut.cleaning.charAt(0).toUpperCase() + moveOut.cleaning.slice(1) : 'N/A'}
                                                                </span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Administrative Tasks */}
                                                <div className="space-y-4">
                                                    <h4 className="border-b border-gray-300 pb-2 text-lg font-semibold text-gray-800">
                                                        Administrative Tasks
                                                    </h4>
                                                    <div className="space-y-3 text-sm">
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Repairs:</label>
                                                            <p className="mt-1 font-medium text-gray-900">
                                                                {moveOut.repairs || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Security Deposit Return:</label>
                                                            <p className="mt-1 font-medium text-gray-900">
                                                                {moveOut.send_back_security_deposit || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">List the Unit:</label>
                                                            <p className="mt-1 font-medium text-gray-900">
                                                                {moveOut.list_the_unit || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Move-Out Form:</label>
                                                            <p className="mt-1 font-medium text-gray-900">
                                                                <span
                                                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                                                        moveOut.move_out_form === 'filled' 
                                                                            ? 'bg-green-100 text-green-800' 
                                                                            : moveOut.move_out_form === 'not filled'
                                                                            ? 'bg-red-100 text-red-800'
                                                                            : 'bg-gray-100 text-gray-800'
                                                                    }`}
                                                                >
                                                                    {moveOut.move_out_form ? moveOut.move_out_form.charAt(0).toUpperCase() + moveOut.move_out_form.slice(1) : 'N/A'}
                                                                </span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Notes Section */}
                                            {moveOut.notes && (
                                                <div className="mt-6 border-t border-gray-200 pt-6">
                                                    <h4 className="mb-3 font-medium text-gray-900">Notes</h4>
                                                    <div className="rounded border bg-white p-3 text-sm">
                                                        <p className="text-gray-900">{moveOut.notes}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Property Information */}
                                            <div className="mt-6 border-t border-gray-200 pt-6">
                                                <h4 className="mb-3 font-medium text-gray-900">Property Information</h4>
                                                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                                                    <div className="rounded border bg-white p-3">
                                                        <label className="font-medium text-gray-600">City:</label>
                                                        <p className="mt-1 font-medium text-gray-900">{moveOut.city_name || 'N/A'}</p>
                                                    </div>
                                                    <div className="rounded border bg-white p-3">
                                                        <label className="font-medium text-gray-600">Property:</label>
                                                        <p className="mt-1 font-medium text-gray-900">{moveOut.property_name || 'N/A'}</p>
                                                    </div>
                                                    <div className="rounded border bg-white p-3">
                                                        <label className="font-medium text-gray-600">Unit:</label>
                                                        <p className="mt-1 font-medium text-gray-900">{moveOut.unit_name || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Vendor Tasks Information Display */}
                {selectedUnitId && (
                    <div className="rounded-lg bg-white shadow">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-900">Vendor Tasks Information ({vendorTasks.length})</h2>
                                {vendorTasks.length === 0 && (
                                    <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
                                        No vendor tasks found
                                    </span>
                                )}
                            </div>

                            {vendorTasks.length > 0 && (
                                <div className="space-y-8">
                                    {vendorTasks.map((vendorTask, index) => (
                                        <div
                                            key={vendorTask.id}
                                            className={`rounded-lg border-2 border-gray-200 bg-gray-50 p-6 ${index !== 0 ? 'mt-8' : ''}`}
                                        >
                                            {/* Vendor Task Header */}
                                            <div className="mb-6 border-b-2 border-gray-300 pb-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="text-2xl font-bold text-gray-900">Task #{vendorTask.id}</h3>
                                                        <p className="mt-1 text-sm text-gray-500">Submitted: {vendorTask.task_submission_date_formatted}</p>
                                                        <p className="text-sm text-gray-500">Created: {vendorTask.created_at_formatted}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span
                                                            className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                                                                vendorTask.urgent === 'Yes' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                            }`}
                                                        >
                                                            {vendorTask.urgent === 'Yes' ? 'Urgent' : 'Normal'}
                                                        </span>
                                                        {vendorTask.status && (
                                                            <span className="ml-2 inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
                                                                {vendorTask.status}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                                                {/* Task Information */}
                                                <div className="space-y-4">
                                                    <h4 className="border-b border-gray-300 pb-2 text-lg font-semibold text-gray-800">
                                                        Task Information
                                                    </h4>
                                                    <div className="space-y-3 text-sm">
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Assigned Tasks:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{vendorTask.assigned_tasks}</p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Submission Date:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{vendorTask.task_submission_date_formatted || 'N/A'}</p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Scheduled Visits:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{vendorTask.any_scheduled_visits_formatted || 'N/A'}</p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Task End Date:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{vendorTask.task_ending_date_formatted || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Vendor Information */}
                                                <div className="space-y-4">
                                                    <h4 className="border-b border-gray-300 pb-2 text-lg font-semibold text-gray-800">
                                                        Vendor Information
                                                    </h4>
                                                    <div className="space-y-3 text-sm">
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Vendor Name:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{vendorTask.vendor_name || 'N/A'}</p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Service Type:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{vendorTask.vendor_service_type || 'N/A'}</p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Phone Number:</label>
                                                            <p className="mt-1 font-medium text-gray-900">
                                                                {vendorTask.vendor_number ? formatPhoneNumber(vendorTask.vendor_number) : 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Email:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{vendorTask.vendor_email || 'N/A'}</p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Vendor City:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{vendorTask.vendor_city_name || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Property Information */}
                                                <div className="space-y-4">
                                                    <h4 className="border-b border-gray-300 pb-2 text-lg font-semibold text-gray-800">
                                                        Property Information
                                                    </h4>
                                                    <div className="space-y-3 text-sm">
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">City:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{vendorTask.unit_city_name || 'N/A'}</p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Property:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{vendorTask.property_name || 'N/A'}</p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Unit:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{vendorTask.unit_name || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Notes Section */}
                                            {vendorTask.notes && (
                                                <div className="mt-6 border-t border-gray-200 pt-6">
                                                    <h4 className="mb-3 font-medium text-gray-900">Notes</h4>
                                                    <div className="rounded border bg-white p-3 text-sm">
                                                        <p className="text-gray-900">{vendorTask.notes}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Timestamps */}
                                            <div className="mt-6 border-t border-gray-200 pt-6">
                                                <h4 className="mb-3 font-medium text-gray-900">Record Information</h4>
                                                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                                                    <div className="rounded border bg-white p-3">
                                                        <label className="font-medium text-gray-600">Created:</label>
                                                        <p className="mt-1 font-medium text-gray-900">{vendorTask.created_at_formatted || 'N/A'}</p>
                                                    </div>
                                                    <div className="rounded border bg-white p-3">
                                                        <label className="font-medium text-gray-600">Last Updated:</label>
                                                        <p className="mt-1 font-medium text-gray-900">{vendorTask.updated_at_formatted || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Complete Payment Information Display */}
                {selectedUnitId && (
                    <div className="rounded-lg bg-white shadow">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-900">Payment Information ({payments.length})</h2>
                                {payments.length === 0 && (
                                    <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
                                        No payments found
                                    </span>
                                )}
                            </div>

                            {payments.length > 0 && (
                                <div className="space-y-8">
                                    {payments.map((payment, index) => (
                                        <div
                                            key={payment.id}
                                            className={`rounded-lg border-2 border-gray-200 bg-gray-50 p-6 ${index !== 0 ? 'mt-8' : ''}`}
                                        >
                                            {/* Payment Header */}
                                            <div className="mb-6 border-b-2 border-gray-300 pb-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="text-2xl font-bold text-gray-900">Payment #{payment.id}</h3>
                                                        <p className="mt-1 text-sm text-gray-500">Date: {payment.date_formatted}</p>
                                                        <p className="text-sm text-gray-500">
                                                            {payment.unit_name} - {payment.property_name}, {payment.city_name}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span
                                                            className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                                                                payment.status === 'Paid' 
                                                                    ? 'bg-green-100 text-green-800' 
                                                                    : payment.status === 'Partial'
                                                                    ? 'bg-yellow-100 text-yellow-800'
                                                                    : 'bg-red-100 text-red-800'
                                                            }`}
                                                        >
                                                            {payment.status}
                                                        </span>
                                                        {payment.permanent === 'Yes' && (
                                                            <span className="ml-2 inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                                                                Permanent
                                                            </span>
                                                        )}
                                                        {payment.is_archived && (
                                                            <span className="ml-2 inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800">
                                                                Archived
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                                                {/* Payment Amounts */}
                                                <div className="space-y-4">
                                                    <h4 className="border-b border-gray-300 pb-2 text-lg font-semibold text-gray-800">
                                                        Payment Details
                                                    </h4>
                                                    <div className="space-y-3 text-sm">
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Amount Owed:</label>
                                                            <p className="mt-1 text-lg font-bold text-red-600">{payment.formatted_owes || `$${payment.owes.toFixed(2)}`}</p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Amount Paid:</label>
                                                            <p className="mt-1 text-lg font-bold text-green-600">{payment.formatted_paid || (payment.paid ? `$${payment.paid.toFixed(2)}` : '$0.00')}</p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Left to Pay:</label>
                                                            <p className="mt-1 text-lg font-bold text-orange-600">{payment.formatted_left_to_pay || `$${payment.left_to_pay.toFixed(2)}`}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Payment Status & Info */}
                                                <div className="space-y-4">
                                                    <h4 className="border-b border-gray-300 pb-2 text-lg font-semibold text-gray-800">
                                                        Status Information
                                                    </h4>
                                                    <div className="space-y-3 text-sm">
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Payment Status:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{payment.status}</p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Permanent Record:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{payment.permanent}</p>
                                                        </div>
                                                        {payment.reversed_payments && (
                                                            <div className="rounded border bg-white p-3">
                                                                <label className="font-medium text-gray-600">Reversed Payments:</label>
                                                                <p className="mt-1 font-medium text-gray-900">{payment.reversed_payments}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Property Information */}
                                                <div className="space-y-4">
                                                    <h4 className="border-b border-gray-300 pb-2 text-lg font-semibold text-gray-800">
                                                        Property Information
                                                    </h4>
                                                    <div className="space-y-3 text-sm">
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Unit:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{payment.unit_name || 'N/A'}</p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Property:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{payment.property_name || 'N/A'}</p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">City:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{payment.city_name || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Notes */}
                                            {payment.notes && (
                                                <div className="mt-6 border-t border-gray-200 pt-6">
                                                    <h4 className="mb-3 font-medium text-gray-900">Notes</h4>
                                                    <div className="rounded border bg-white p-3 text-sm">
                                                        <p className="text-gray-900">{payment.notes}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Timestamps */}
                                            <div className="mt-6 border-t border-gray-200 pt-6">
                                                <h4 className="mb-3 font-medium text-gray-900">Record Information</h4>
                                                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                                                    <div className="rounded border bg-white p-3">
                                                        <label className="font-medium text-gray-600">Created:</label>
                                                        <p className="mt-1 font-medium text-gray-900">{payment.created_at_formatted || 'N/A'}</p>
                                                    </div>
                                                    <div className="rounded border bg-white p-3">
                                                        <label className="font-medium text-gray-600">Last Updated:</label>
                                                        <p className="mt-1 font-medium text-gray-900">{payment.updated_at_formatted || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Payment Plans Information Display */}
                {selectedUnitId && (
                    <div className="rounded-lg bg-white shadow">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-900">Payment Plans ({paymentPlans.length})</h2>
                                {paymentPlans.length === 0 && (
                                    <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
                                        No payment plans found
                                    </span>
                                )}
                            </div>

                            {paymentPlans.length > 0 && (
                                <div className="space-y-8">
                                    {paymentPlans.map((paymentPlan, index) => (
                                        <div
                                            key={paymentPlan.id}
                                            className={`rounded-lg border-2 border-gray-200 bg-gray-50 p-6 ${index !== 0 ? 'mt-8' : ''}`}
                                        >
                                            {/* Payment Plan Header */}
                                            <div className="mb-6 border-b-2 border-gray-300 pb-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="text-2xl font-bold text-gray-900">Payment Plan #{paymentPlan.id}</h3>
                                                        <p className="mt-1 text-sm text-gray-500">
                                                            Tenant: {paymentPlan.tenant_name || 'N/A'}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            Due Date: {paymentPlan.dates_formatted || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span
                                                            className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                                                                paymentPlan.is_archived ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                            }`}
                                                        >
                                                            {paymentPlan.is_archived ? 'Archived' : 'Active'}
                                                        </span>
                                                        {paymentPlan.status && (
                                                            <div className="mt-2">
                                                                <span
                                                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                                                        paymentPlan.status === 'Paid' 
                                                                            ? 'bg-green-100 text-green-800' 
                                                                            : paymentPlan.status === 'Partial'
                                                                            ? 'bg-yellow-100 text-yellow-800'
                                                                            : 'bg-red-100 text-red-800'
                                                                    }`}
                                                                >
                                                                    {paymentPlan.status}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                                                {/* Payment Information */}
                                                <div className="space-y-4">
                                                    <h4 className="border-b border-gray-300 pb-2 text-lg font-semibold text-gray-800">
                                                        Payment Details
                                                    </h4>
                                                    <div className="space-y-3 text-sm">
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Total Amount:</label>
                                                            <p className="mt-1 text-lg font-bold text-green-600">
                                                                {paymentPlan.formatted_amount || '$0.00'}
                                                            </p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Amount Paid:</label>
                                                            <p className="mt-1 text-lg font-bold text-blue-600">
                                                                {paymentPlan.formatted_paid || '$0.00'}
                                                            </p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Remaining Balance:</label>
                                                            <p className="mt-1 text-lg font-bold text-red-600">
                                                                {paymentPlan.formatted_left_to_pay || '$0.00'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Tenant Information */}
                                                <div className="space-y-4">
                                                    <h4 className="border-b border-gray-300 pb-2 text-lg font-semibold text-gray-800">
                                                        Tenant Information
                                                    </h4>
                                                    <div className="space-y-3 text-sm">
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Tenant Name:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{paymentPlan.tenant_name || 'N/A'}</p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Unit:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{paymentPlan.unit_name || 'N/A'}</p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Property:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{paymentPlan.property_name || 'N/A'}</p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">City:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{paymentPlan.city_name || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Schedule Information */}
                                                <div className="space-y-4">
                                                    <h4 className="border-b border-gray-300 pb-2 text-lg font-semibold text-gray-800">
                                                        Schedule Information
                                                    </h4>
                                                    <div className="space-y-3 text-sm">
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Due Date:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{paymentPlan.dates_formatted || 'N/A'}</p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Created:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{paymentPlan.created_at_formatted || 'N/A'}</p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Last Updated:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{paymentPlan.updated_at_formatted || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Notes */}
                                            {paymentPlan.notes && (
                                                <div className="mt-6 border-t border-gray-200 pt-6">
                                                    <h4 className="mb-3 font-medium text-gray-900">Notes</h4>
                                                    <div className="rounded border bg-white p-3 text-sm">
                                                        <p className="text-gray-900">{paymentPlan.notes}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Applications Information Display */}
                {selectedUnitId && (
                    <div className="rounded-lg bg-white shadow">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-900">Applications ({applications.length})</h2>
                                {applications.length === 0 && (
                                    <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
                                        No applications found
                                    </span>
                                )}
                            </div>

                            {applications.length > 0 && (
                                <div className="space-y-8">
                                    {applications.map((application, index) => (
                                        <div
                                            key={application.id}
                                            className={`rounded-lg border-2 border-gray-200 bg-gray-50 p-6 ${index !== 0 ? 'mt-8' : ''}`}
                                        >
                                            {/* Application Header */}
                                            <div className="mb-6 border-b-2 border-gray-300 pb-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="text-2xl font-bold text-gray-900">{application.name}</h3>
                                                        <p className="mt-1 text-sm text-gray-500">Application ID #{application.id}</p>
                                                        <p className="text-sm text-gray-500">
                                                            Application Date: {application.date_formatted || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span
                                                            className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                                                                application.is_archived ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                            }`}
                                                        >
                                                            {application.is_archived ? 'Archived' : 'Active'}
                                                        </span>
                                                        {application.status && (
                                                            <div className="mt-2">
                                                                <span
                                                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                                                        application.status === 'Approved' 
                                                                            ? 'bg-green-100 text-green-800' 
                                                                            : application.status === 'Pending'
                                                                            ? 'bg-yellow-100 text-yellow-800'
                                                                            : application.status === 'Under Review'
                                                                            ? 'bg-blue-100 text-blue-800'
                                                                            : 'bg-red-100 text-red-800'
                                                                    }`}
                                                                >
                                                                    {application.status}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                                                {/* Applicant Information */}
                                                <div className="space-y-4">
                                                    <h4 className="border-b border-gray-300 pb-2 text-lg font-semibold text-gray-800">
                                                        Applicant Information
                                                    </h4>
                                                    <div className="space-y-3 text-sm">
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Applicant Name:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{application.name || 'N/A'}</p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Co-Signer:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{application.co_signer || 'N/A'}</p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Application Status:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{application.status || 'N/A'}</p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Stage in Progress:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{application.stage_in_progress || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Property Information */}
                                                <div className="space-y-4">
                                                    <h4 className="border-b border-gray-300 pb-2 text-lg font-semibold text-gray-800">
                                                        Property Information
                                                    </h4>
                                                    <div className="space-y-3 text-sm">
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Unit:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{application.unit_name || 'N/A'}</p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Property:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{application.property_name || 'N/A'}</p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">City:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{application.city_name || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Application Details */}
                                                <div className="space-y-4">
                                                    <h4 className="border-b border-gray-300 pb-2 text-lg font-semibold text-gray-800">
                                                        Application Details
                                                    </h4>
                                                    <div className="space-y-3 text-sm">
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Application Date:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{application.date_formatted || 'N/A'}</p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Created:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{application.created_at_formatted || 'N/A'}</p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Last Updated:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{application.updated_at_formatted || 'N/A'}</p>
                                                        </div>
                                                        {application.has_attachment && (
                                                            <div className="rounded border bg-white p-3">
                                                                <label className="font-medium text-gray-600">Attachment:</label>
                                                                <div className="mt-1">
                                                                    {application.attachment_url ? (
                                                                        <a
                                                                            href={application.attachment_url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="inline-flex items-center text-blue-600 hover:text-blue-800"
                                                                        >
                                                                            <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                                            </svg>
                                                                            {application.attachment_name || 'View Attachment'}
                                                                        </a>
                                                                    ) : (
                                                                        <span className="text-gray-500">Attachment available</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Notes */}
                                            {application.notes && (
                                                <div className="mt-6 border-t border-gray-200 pt-6">
                                                    <h4 className="mb-3 font-medium text-gray-900">Notes</h4>
                                                    <div className="rounded border bg-white p-3 text-sm">
                                                        <p className="text-gray-900">{application.notes}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Offers and Renewals Information Display */}
                {selectedUnitId && (
                    <div className="rounded-lg bg-white shadow">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-900">Offers and Renewals ({offersAndRenewals.length})</h2>
                                {offersAndRenewals.length === 0 && (
                                    <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
                                        No offers and renewals found
                                    </span>
                                )}
                            </div>

                            {offersAndRenewals.length > 0 && (
                                <div className="space-y-8">
                                    {offersAndRenewals.map((offerRenewal, index) => (
                                        <div
                                            key={offerRenewal.id}
                                            className={`rounded-lg border-2 border-gray-200 bg-gray-50 p-6 ${index !== 0 ? 'mt-8' : ''}`}
                                        >
                                            {/* Offer/Renewal Header */}
                                            <div className="mb-6 border-b-2 border-gray-300 pb-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="text-2xl font-bold text-gray-900">
                                                            {offerRenewal.tenant_name || 'Unknown Tenant'}
                                                        </h3>
                                                        <p className="mt-1 text-sm text-gray-500">Offer/Renewal ID #{offerRenewal.id}</p>
                                                        <p className="text-sm text-gray-500">Created: {offerRenewal.created_at_formatted}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span
                                                            className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                                                                offerRenewal.is_archived ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                            }`}
                                                        >
                                                            {offerRenewal.is_archived ? 'Archived' : 'Active'}
                                                        </span>
                                                        {offerRenewal.status && (
                                                            <div className="mt-2">
                                                                <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                                                                    {offerRenewal.status}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                                                {/* Offer Information */}
                                                <div className="space-y-4">
                                                    <h4 className="border-b border-gray-300 pb-2 text-lg font-semibold text-gray-800">
                                                        Offer Information
                                                    </h4>
                                                    <div className="space-y-3 text-sm">
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Date Sent Offer:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{offerRenewal.date_sent_offer_formatted || 'N/A'}</p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Offer Expires:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{offerRenewal.date_offer_expires_formatted || 'N/A'}</p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Date of Acceptance:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{offerRenewal.date_of_acceptance_formatted || 'N/A'}</p>
                                                        </div>
                                                        {offerRenewal.how_many_days_left !== undefined && (
                                                            <div className="rounded border bg-white p-3">
                                                                <label className="font-medium text-gray-600">Days Left:</label>
                                                                <p className={`mt-1 font-medium ${offerRenewal.how_many_days_left <= 7 ? 'text-red-600' : 'text-gray-900'}`}>
                                                                    {offerRenewal.how_many_days_left} days
                                                                </p>
                                                            </div>
                                                        )}
                                                        {offerRenewal.expired && (
                                                            <div className="rounded border bg-white p-3">
                                                                <label className="font-medium text-gray-600">Expired:</label>
                                                                <span className={`mt-1 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                                                    offerRenewal.expired === 'Yes' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                                }`}>
                                                                    {offerRenewal.expired}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Notice Information */}
                                                <div className="space-y-4">
                                                    <h4 className="border-b border-gray-300 pb-2 text-lg font-semibold text-gray-800">
                                                        Notice Information
                                                    </h4>
                                                    <div className="space-y-3 text-sm">
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Last Notice Sent:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{offerRenewal.last_notice_sent_formatted || 'N/A'}</p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Notice Kind:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{offerRenewal.notice_kind || 'N/A'}</p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Last Notice Sent 2:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{offerRenewal.last_notice_sent_2_formatted || 'N/A'}</p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Notice Kind 2:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{offerRenewal.notice_kind_2 || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Lease Information */}
                                                <div className="space-y-4">
                                                    <h4 className="border-b border-gray-300 pb-2 text-lg font-semibold text-gray-800">
                                                        Lease Information
                                                    </h4>
                                                    <div className="space-y-3 text-sm">
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Lease Sent:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{offerRenewal.lease_sent || 'N/A'}</p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Date Sent Lease:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{offerRenewal.date_sent_lease_formatted || 'N/A'}</p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Lease Expires:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{offerRenewal.lease_expires_formatted || 'N/A'}</p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Lease Signed:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{offerRenewal.lease_signed || 'N/A'}</p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Date Signed:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{offerRenewal.date_signed_formatted || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Property Information */}
                                            <div className="mt-6 border-t border-gray-200 pt-6">
                                                <h4 className="mb-3 font-medium text-gray-900">Property Information</h4>
                                                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                                                    <div className="rounded border bg-white p-3">
                                                        <label className="font-medium text-gray-600">Unit:</label>
                                                        <p className="mt-1 font-medium text-gray-900">{offerRenewal.unit_name || 'N/A'}</p>
                                                    </div>
                                                    <div className="rounded border bg-white p-3">
                                                        <label className="font-medium text-gray-600">Property:</label>
                                                        <p className="mt-1 font-medium text-gray-900">{offerRenewal.property_name || 'N/A'}</p>
                                                    </div>
                                                    <div className="rounded border bg-white p-3">
                                                        <label className="font-medium text-gray-600">City:</label>
                                                        <p className="mt-1 font-medium text-gray-900">{offerRenewal.city_name || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Notes */}
                                            {offerRenewal.notes && (
                                                <div className="mt-6 border-t border-gray-200 pt-6">
                                                    <h4 className="mb-3 font-medium text-gray-900">Notes</h4>
                                                    <div className="rounded border bg-white p-3 text-sm">
                                                        <p className="text-gray-900">{offerRenewal.notes}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Timestamps */}
                                            <div className="mt-6 border-t border-gray-200 pt-6">
                                                <h4 className="mb-3 font-medium text-gray-900">Record Information</h4>
                                                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                                                    <div className="rounded border bg-white p-3">
                                                        <label className="font-medium text-gray-600">Created:</label>
                                                        <p className="mt-1 font-medium text-gray-900">{offerRenewal.created_at_formatted || 'N/A'}</p>
                                                    </div>
                                                    <div className="rounded border bg-white p-3">
                                                        <label className="font-medium text-gray-600">Last Updated:</label>
                                                        <p className="mt-1 font-medium text-gray-900">{offerRenewal.updated_at_formatted || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Notices and Evictions Information Display */}
                {selectedUnitId && (
                    <div className="rounded-lg bg-white shadow">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-900">Notices and Evictions Information ({noticesAndEvictions.length})</h2>
                                {noticesAndEvictions.length === 0 && (
                                    <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
                                        No notices or evictions found
                                    </span>
                                )}
                            </div>

                            {noticesAndEvictions.length > 0 && (
                                <div className="space-y-8">
                                    {noticesAndEvictions.map((noticeEviction, index) => (
                                        <div
                                            key={noticeEviction.id}
                                            className={`rounded-lg border-2 border-gray-200 bg-gray-50 p-6 ${index !== 0 ? 'mt-8' : ''}`}
                                        >
                                            {/* Notice/Eviction Header */}
                                            <div className="mb-6 border-b-2 border-gray-300 pb-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="text-2xl font-bold text-gray-900">
                                                            {noticeEviction.type_of_notice || 'Notice/Eviction'} #{noticeEviction.id}
                                                        </h3>
                                                        <p className="mt-1 text-sm text-gray-500">
                                                            Tenant: {noticeEviction.tenant_name || 'N/A'}
                                                        </p>
                                                        <p className="text-sm text-gray-500">Date: {noticeEviction.date_formatted || 'N/A'}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span
                                                            className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                                                                noticeEviction.status === 'Active' 
                                                                    ? 'bg-red-100 text-red-800' 
                                                                    : noticeEviction.status === 'Resolved'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-yellow-100 text-yellow-800'
                                                            }`}
                                                        >
                                                            {noticeEviction.status || 'Pending'}
                                                        </span>
                                                        {noticeEviction.is_archived && (
                                                            <span className="ml-2 inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                                                                Archived
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                                                {/* Notice Information */}
                                                <div className="space-y-4">
                                                    <h4 className="border-b border-gray-300 pb-2 text-lg font-semibold text-gray-800">
                                                        Notice Information
                                                    </h4>
                                                    <div className="space-y-3 text-sm">
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Type of Notice:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{noticeEviction.type_of_notice || 'N/A'}</p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Date:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{noticeEviction.date_formatted || 'N/A'}</p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Status:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{noticeEviction.status || 'N/A'}</p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Have an Exception:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{noticeEviction.have_an_exception || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Eviction Information */}
                                                <div className="space-y-4">
                                                    <h4 className="border-b border-gray-300 pb-2 text-lg font-semibold text-gray-800">
                                                        Eviction Information
                                                    </h4>
                                                    <div className="space-y-3 text-sm">
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Evictions:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{noticeEviction.evictions || 'N/A'}</p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Sent to Attorney:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{noticeEviction.sent_to_atorney || 'N/A'}</p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Hearing Dates:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{noticeEviction.hearing_dates_formatted || 'N/A'}</p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Evicted or Payment Plan:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{noticeEviction.evected_or_payment_plan || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Additional Information */}
                                                <div className="space-y-4">
                                                    <h4 className="border-b border-gray-300 pb-2 text-lg font-semibold text-gray-800">
                                                        Additional Information
                                                    </h4>
                                                    <div className="space-y-3 text-sm">
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">If Left:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{noticeEviction.if_left || 'N/A'}</p>
                                                        </div>
                                                        <div className="rounded border bg-white p-3">
                                                            <label className="font-medium text-gray-600">Writ Date:</label>
                                                            <p className="mt-1 font-medium text-gray-900">{noticeEviction.writ_date_formatted || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Notes */}
                                            {noticeEviction.note && (
                                                <div className="mt-6 border-t border-gray-200 pt-6">
                                                    <h4 className="mb-3 font-medium text-gray-900">Notes</h4>
                                                    <div className="rounded border bg-white p-3 text-sm">
                                                        <p className="text-gray-900">{noticeEviction.note}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Property Information */}
                                            <div className="mt-6 border-t border-gray-200 pt-6">
                                                <h4 className="mb-3 font-medium text-gray-900">Property Information</h4>
                                                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                                                    <div className="rounded border bg-white p-3">
                                                        <label className="font-medium text-gray-600">Unit:</label>
                                                        <p className="mt-1 font-medium text-gray-900">{noticeEviction.unit_name || 'N/A'}</p>
                                                    </div>
                                                    <div className="rounded border bg-white p-3">
                                                        <label className="font-medium text-gray-600">Property:</label>
                                                        <p className="mt-1 font-medium text-gray-900">{noticeEviction.property_name || 'N/A'}</p>
                                                    </div>
                                                    <div className="rounded border bg-white p-3">
                                                        <label className="font-medium text-gray-600">City:</label>
                                                        <p className="mt-1 font-medium text-gray-900">{noticeEviction.city_name || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Timestamps */}
                                            <div className="mt-6 border-t border-gray-200 pt-6">
                                                <h4 className="mb-3 font-medium text-gray-900">Record Information</h4>
                                                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                                                    <div className="rounded border bg-white p-3">
                                                        <label className="font-medium text-gray-600">Created:</label>
                                                        <p className="mt-1 font-medium text-gray-900">{noticeEviction.created_at_formatted || 'N/A'}</p>
                                                    </div>
                                                    <div className="rounded border bg-white p-3">
                                                        <label className="font-medium text-gray-600">Last Updated:</label>
                                                        <p className="mt-1 font-medium text-gray-900">{noticeEviction.updated_at_formatted || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
