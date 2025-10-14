// resources/js/Pages/Dashboard/Index.tsx

import AppLayout from '@/layouts/app-layout';
import ApplicationInformation from '@/pages/dashboard/ApplicationInformation';
import MoveInInformation from '@/pages/dashboard/MoveInInformation';
import MoveOutInformation from '@/pages/dashboard/MoveOutInformation';
import NoticesAndEvictionsInformation from '@/pages/dashboard/NoticesAndEvictionsInformation';
import OffersAndRenewalsInformation from '@/pages/dashboard/OffersAndRenewalsInformation';
import PaymentInformation from '@/pages/dashboard/PaymentInformation';
import PaymentPlanInformation from '@/pages/dashboard/PaymentPlanInformation';
import TenantInformation from '@/pages/dashboard/TenantInformation';
import VendorTasksInformation from '@/pages/dashboard/VendorTasksInformation';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';
import {
    Application,
    City,
    MoveIn,
    MoveOut,
    NoticeAndEviction,
    OffersAndRenewal,
    Payment,
    PaymentPlan,
    Property,
    Tenant,
    Unit,
    VendorTask,
    
} from '@/types/dashboard';

import { Head, router } from '@inertiajs/react';
import { useCallback, useState } from 'react';

// Import shadcn/ui components
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Building2, Calendar, DollarSign, Hash, Home, MapPin, Shield, Zap, ChevronDown, ChevronUp } from 'lucide-react';

// Import for collapsible section (shadcn/ui)
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';

// Import for date formatting
import { format, parseISO } from 'date-fns';

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

function formatDate(dateStr?: string): string {
    if (!dateStr) return 'N/A';
    try {
        return format(parseISO(dateStr), 'MMM dd, yyyy');
    } catch {
        return dateStr;
    }
}

export default function DashboardIndex({
    cities,
    properties,
    units,
    unitInfo,
    tenants,
    moveIns,
    moveOuts,
    vendorTasks,
    payments,
    paymentPlans,
    applications,
    offersAndRenewals,
    noticesAndEvictions,
    selectedCityId,
    selectedPropertyId,
    selectedUnitId,
}: Props) {
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

    const handleCityChange = useCallback((cityId: string) => {
        if (!cityId) {
            router.get('/dashboard');
            return;
        }
        router.get(
            '/dashboard',
            { city_id: parseInt(cityId) },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    }, []);

    const handlePropertyChange = useCallback(
        (propertyId: string) => {
            if (!propertyId || !selectedCityId) {
                router.get('/dashboard', { city_id: selectedCityId });
                return;
            }
            router.get(
                '/dashboard',
                {
                    city_id: selectedCityId,
                    property_id: parseInt(propertyId),
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
        (unitId: string) => {
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
                    unit_id: parseInt(unitId),
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        },
        [selectedCityId, selectedPropertyId],
    );

    // For Collapsible state
    const [unitInfoOpen, setUnitInfoOpen] = useState(true);

    return (
        <AppLayout breadcrumbs={getBreadcrumbs()}>
            <Head title="Dashboard" />

            <div className="h-screen space-y-6 overflow-y-auto">
                {/* Page Header */}
                <Card className="border-0 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm dark:from-blue-950/20 dark:to-indigo-950/20">
                    <CardHeader className="pb-4">
                        <div className="flex items-center space-x-3">
                            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                                <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Property Management Dashboard</CardTitle>
                                <CardDescription className="mt-1 text-gray-600 dark:text-gray-400">
                                    Select a city, property, and unit to view comprehensive tenant information and analytics.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Sticky Selection Controls */}
                <div className="-mx-2 border-b border-gray-200/50 bg-white/95 px-2 py-1 backdrop-blur-sm supports-[backdrop-filter]:bg-white/80 dark:border-gray-800/50 dark:bg-gray-950/95 dark:supports-[backdrop-filter]:bg-gray-950/80">
                    <Card className="border shadow-lg">
                        <CardHeader className="">
                            <div className="flex items-center space-x-2">
                                <MapPin className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                <CardTitle className="text-lg font-semibold">Property Selection</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                {/* City Selection */}
                                <div className="space-y-1">
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        <MapPin className="h-4 w-4" />
                                        City
                                    </label>
                                    <Select value={selectedCityId?.toString() || ''} onValueChange={handleCityChange}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select a city..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {cities.map((city) => (
                                                <SelectItem key={city.id} value={city.id.toString()}>
                                                    {city.city}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Property Selection */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        <Building2 className="h-4 w-4" />
                                        Property
                                    </label>
                                    <Select
                                        value={selectedPropertyId?.toString() || ''}
                                        onValueChange={handlePropertyChange}
                                        disabled={!selectedCityId}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select a property..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {properties.map((property) => (
                                                <SelectItem key={property.id} value={property.id.toString()}>
                                                    {property.property_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Unit Selection */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        <Home className="h-4 w-4" />
                                        Unit
                                    </label>
                                    <Select value={selectedUnitId?.toString() || ''} onValueChange={handleUnitChange} disabled={!selectedPropertyId}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select a unit..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {units.map((unit) => (
                                                <SelectItem key={unit.id} value={unit.id.toString()}>
                                                    <div className="flex w-full items-center justify-between">
                                                        <span>{unit.unit_name}</span>
                                                        <div className="ml-2 flex items-center gap-2">
                                                            <Badge variant={unit.vacant === 'Yes' ? 'default' : 'secondary'}>
                                                                {unit.vacant === 'Yes' ? 'Vacant' : 'Occupied'}
                                                            </Badge>
                                                            {unit.monthly_rent && <span className="text-sm text-gray-500">${unit.monthly_rent}</span>}
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Unit Information Display (Collapsible) */}
{unitInfo && (
    <Collapsible open={unitInfoOpen} onOpenChange={setUnitInfoOpen}>
        <Card className="transition-all duration-200 hover:shadow-md">
            <CollapsibleTrigger asChild>
                <Button
                    variant="ghost"
                    className="w-full p-0 h-auto hover:bg-transparent"
                >
                    <CardHeader className="w-full">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-full bg-gray-100">
                                    <Home className="h-5 w-5 text-gray-600" />
                                </div>
                                <div className="text-left">
                                    <CardTitle className="text-xl font-semibold">Unit Information</CardTitle>
                                    <CardDescription>Comprehensive details for {unitInfo.unit_name}</CardDescription>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Badge variant={unitInfo.vacant === 'Yes' ? 'default' : 'destructive'} className="px-3 py-1">
                                    {unitInfo.vacant === 'Yes' ? 'Vacant' : 'Occupied'}
                                </Badge>
                                {unitInfoOpen ? (
                                    <ChevronUp className="h-5 w-5 text-gray-500" />
                                ) : (
                                    <ChevronDown className="h-5 w-5 text-gray-500" />
                                )}
                            </div>
                        </div>
                    </CardHeader>
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <CardContent className="pt-0">
                    <Separator className="mb-6" />
                    
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100">
                                <Hash className="h-4 w-4" />
                                Basic Details
                            </h3>
                            <div className="space-y-3">
                                <Card className="bg-gray-50 p-4 dark:bg-gray-900">
                                    <div className="mb-1 text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                        Listed Status
                                    </div>
                                    <Badge variant={unitInfo.listed === 'Yes' ? 'default' : 'secondary'}>{unitInfo.listed || 'No'}</Badge>
                                </Card>
                            </div>
                        </div>
                        {/* Unit Details */}
                        <div className="space-y-4">
                            <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100">
                                <Home className="h-4 w-4" />
                                Unit Specs
                            </h3>
                            <div className="space-y-3">
                                <Card className="bg-blue-50 p-4 dark:bg-blue-950/20">
                                    <div className="mb-1 text-xs font-medium tracking-wide text-blue-600 uppercase dark:text-blue-400">
                                        Bedrooms
                                    </div>
                                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{unitInfo.count_beds || 'N/A'}</div>
                                </Card>
                                <Card className="bg-purple-50 p-4 dark:bg-purple-950/20">
                                    <div className="mb-1 text-xs font-medium tracking-wide text-purple-600 uppercase dark:text-purple-400">
                                        Bathrooms
                                    </div>
                                    <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                                        {unitInfo.count_baths || 'N/A'}
                                    </div>
                                </Card>
                            </div>
                        </div>
                        {/* Financial Information */}
                        <div className="space-y-4">
                            <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100">
                                <DollarSign className="h-4 w-4" />
                                Financial
                            </h3>
                            <div className="space-y-3">
                                <Card className="bg-green-50 p-4 dark:bg-green-950/20">
                                    <div className="mb-1 text-xs font-medium tracking-wide text-green-600 uppercase dark:text-green-400">
                                        Monthly Rent
                                    </div>
                                    <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                                        {unitInfo.formatted_monthly_rent || 'N/A'}
                                    </div>
                                </Card>
                                <Card className="bg-amber-50 p-4 dark:bg-amber-950/20">
                                    <div className="mb-1 text-xs font-medium tracking-wide text-amber-600 uppercase dark:text-amber-400">
                                        Applications
                                    </div>
                                    <Badge variant="outline" className="text-sm">
                                        {unitInfo.total_applications || 0} total
                                    </Badge>
                                </Card>
                            </div>
                        </div>
                        {/* Lease & Utilities */}
                        <div className="space-y-4">
                            <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100">
                                <Calendar className="h-4 w-4" />
                                Lease & Utilities
                            </h3>
                            <div className="space-y-3">
                                <Card className="bg-indigo-50 p-4 dark:bg-indigo-950/20">
                                    <div className="mb-1 text-xs font-medium tracking-wide text-indigo-600 uppercase dark:text-indigo-400">
                                        Lease Status
                                    </div>
                                    <div className="font-semibold text-indigo-900 dark:text-indigo-100">{unitInfo.lease_status || 'N/A'}</div>
                                </Card>
                                <Card className="bg-yellow-50 p-4 dark:bg-yellow-950/20">
                                    <div className="mb-1 flex items-center gap-1 text-xs font-medium tracking-wide text-yellow-600 uppercase dark:text-yellow-400">
                                        <Zap className="h-3 w-3" />
                                        Utilities
                                    </div>
                                    <div className="font-semibold text-yellow-900 dark:text-yellow-100">
                                        {unitInfo.utility_status || 'N/A'}
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>
                    {/* Lease Dates */}
                    {(unitInfo.lease_start || unitInfo.lease_end) && (
                        <>
                            <Separator className="my-6" />
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {unitInfo.lease_start && (
                                    <Card className="bg-blue-50 p-4 dark:bg-blue-950/20">
                                        <div className="mb-2 flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            <div className="text-xs font-medium tracking-wide text-blue-600 uppercase dark:text-blue-400">
                                                Lease Start
                                            </div>
                                        </div>
                                        <div className="font-semibold text-blue-900 dark:text-blue-100">
                                            {formatDate(unitInfo.lease_start)}
                                        </div>
                                    </Card>
                                )}
                                {unitInfo.lease_end && (
                                    <Card className="bg-orange-50 p-4 dark:bg-orange-950/20">
                                        <div className="mb-2 flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                            <div className="text-xs font-medium tracking-wide text-orange-600 uppercase dark:text-orange-400">
                                                Lease End
                                            </div>
                                        </div>
                                        <div className="font-semibold text-orange-900 dark:text-orange-100">
                                            {formatDate(unitInfo.lease_end)}
                                        </div>
                                    </Card>
                                )}
                            </div>
                        </>
                    )}
                    {/* Insurance Information */}
                    {(unitInfo.insurance || unitInfo.insurance_expiration_date) && (
                        <>
                            <Separator className="my-6" />
                            <div className="space-y-4">
                                <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100">
                                    <Shield className="h-4 w-4" />
                                    Insurance Information
                                </h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <Card className="bg-emerald-50 p-4 dark:bg-emerald-950/20">
                                        <div className="mb-2 flex items-center gap-2">
                                            <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                            <div className="text-xs font-medium tracking-wide text-emerald-600 uppercase dark:text-emerald-400">
                                                Coverage Status
                                            </div>
                                        </div>
                                        <Badge variant={unitInfo.insurance === 'Yes' ? 'default' : 'destructive'}>
                                            {unitInfo.insurance || 'No'}
                                        </Badge>
                                    </Card>
                                    {unitInfo.insurance_expiration_date && (
                                        <Card className="bg-amber-50 p-4 dark:bg-amber-950/20">
                                            <div className="mb-2 flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                                <div className="text-xs font-medium tracking-wide text-amber-600 uppercase dark:text-amber-400">
                                                    Expiration Date
                                                </div>
                                            </div>
                                            <div className="font-semibold text-amber-900 dark:text-amber-100">
                                                {formatDate(unitInfo.insurance_expiration_date)}
                                            </div>
                                        </Card>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                    {/* Additional Information */}
                    {(unitInfo.recurring_transaction || unitInfo.account_number) && (
                        <>
                            <Separator className="my-6" />
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {unitInfo.recurring_transaction && (
                                    <Card className="bg-purple-50 p-4 dark:bg-purple-950/20">
                                        <div className="mb-2 text-xs font-medium tracking-wide text-purple-600 uppercase dark:text-purple-400">
                                            Recurring Transaction
                                        </div>
                                        <Badge variant={unitInfo.recurring_transaction === 'Yes' ? 'default' : 'secondary'}>
                                            {unitInfo.recurring_transaction || 'No'}
                                        </Badge>
                                    </Card>
                                )}
                                {unitInfo.account_number && (
                                    <Card className="bg-gray-50 p-4 dark:bg-gray-900">
                                        <div className="mb-2 text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                            Account Number
                                        </div>
                                        <code className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            {unitInfo.account_number}
                                        </code>
                                    </Card>
                                )}
                            </div>
                        </>
                    )}
                </CardContent>
            </CollapsibleContent>
        </Card>
    </Collapsible>
)}


                {/* Complete Tenant Information Display */}
                <TenantInformation tenants={tenants} selectedUnitId={selectedUnitId} />

                {/* Move-In Information Display */}
                <MoveInInformation moveIns={moveIns} selectedUnitId={selectedUnitId} />

                {/* Move-Outs Information Display */}
                <MoveOutInformation moveOuts={moveOuts} selectedUnitId={selectedUnitId} />

                {/* Vendor Tasks Information Display */}
                <VendorTasksInformation vendorTasks={vendorTasks} selectedUnitId={selectedUnitId} />

                {/* Complete Payment Information Display */}
                <PaymentInformation payments={payments} selectedUnitId={selectedUnitId} />
                {/* Payment Plans Information Display */}
                <PaymentPlanInformation paymentPlans={paymentPlans} selectedUnitId={selectedUnitId} />

                {/* Applications Information Display */}
                <ApplicationInformation applications={applications} selectedUnitId={selectedUnitId} />

                {/* Offers and Renewals Information Display */}
                <OffersAndRenewalsInformation offersAndRenewals={offersAndRenewals} selectedUnitId={selectedUnitId} />

                {/* Notices and Evictions Information Display */}
                <NoticesAndEvictionsInformation noticesAndEvictions={noticesAndEvictions} selectedUnitId={selectedUnitId} />
            </div>
        </AppLayout>
    );
}
