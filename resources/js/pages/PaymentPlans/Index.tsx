import React, { useState, useRef, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { PaymentPlanIndexProps, PaymentPlan, DropdownData } from '@/types/PaymentPlan';
import { PropertyInfoWithoutInsurance } from '@/types/PropertyInfoWithoutInsurance';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Eye, Plus, Search, Download, X, ChevronDown } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { format } from 'date-fns';
import PaymentPlanCreateDrawer from './PaymentPlanCreateDrawer';
import PaymentPlanEditDrawer from './PaymentPlanEditDrawer';

/**
 * Always treat the value as a date-only (no time, no TZ).
 * Works for "YYYY-MM-DD" and for ISO strings by grabbing the first 10 chars.
 */
const formatDateOnly = (value?: string | null, fallback = '-'): string => {
    if (!value) return fallback;

    // Grab YYYY-MM-DD from the front (works for "2025-10-01" and "2025-10-01T00:00:00Z")
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (!m) return fallback;

    const [, y, mo, d] = m;
    // Construct a local calendar date (no timezone shifting)
    const date = new Date(Number(y), Number(mo) - 1, Number(d));
    return format(date, 'P'); // localized short date (or use 'MM/dd/yyyy' if you want fixed format)
};

// CSV Export utility function
const exportToCSV = (data: PaymentPlan[], filename: string = 'payment-plans.csv') => {
    try {
        const formatCurrency = (amount: number | null | undefined) => {
            if (amount === null || amount === undefined || isNaN(amount)) return '0.00';
            return Number(amount).toFixed(2);
        };

        const formatString = (value: string | null | undefined) => {
            if (value === null || value === undefined) return '';
            return String(value).replace(/"/g, '""');
        };

        const formatDate = (dateStr: string | null | undefined) => {
            return formatDateOnly(dateStr, '');
        };

        const headers = [
            'ID',
            'City',
            'Property',
            'Unit',
            'Tenant',
            'Amount',
            'Paid',
            'Left to Pay',
            'Status',
            'Date',
            'Notes'
        ];

        const csvData = [
            headers.join(','),
            ...data.map(plan => {
                try {
                    return [
                        plan.id || '',
                        `"${formatString(plan.city_name)}"`,
                        `"${formatString(plan.property)}"`,
                        `"${formatString(plan.unit)}"`,
                        `"${formatString(plan.tenant)}"`,
                        formatCurrency(plan.amount),
                        formatCurrency(plan.paid),
                        formatCurrency(plan.left_to_pay),
                        `"${formatString(plan.status)}"`,
                        `"${formatDate(plan.dates)}"`,
                        `"${formatString(plan.notes)}"`
                    ].join(',');
                } catch (rowError) {
                    console.error('Error processing payment plan row:', plan, rowError);
                    return ''; // Skip problematic rows
                }
            }).filter(row => row !== '') // Remove empty rows
        ].join('\n');

        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return true;
    } catch (error) {
        console.error('CSV Export Error:', error);
        throw error;
    }
};

interface TenantData {
    id: number;
    full_name: string;
    tenant_id: number;
}

interface Props extends PaymentPlanIndexProps {
  search?: string | null;
  cities: Array<{ id: number; city: string }>;
  properties: PropertyInfoWithoutInsurance[];
  propertiesByCityId: Record<number, PropertyInfoWithoutInsurance[]>;
  unitsByPropertyId: Record<number, Array<{ id: number; unit_name: string }>>;
  tenantsByUnitId: Record<number, Array<{ id: number; full_name: string; tenant_id: number }>>;
  allUnits: Array<{ id: number; unit_name: string; city_name: string; property_name: string }>;
  tenantsData: TenantData[];
}

export default function Index({ 
  paymentPlans, 
  search, 
  cities,
  properties,
  propertiesByCityId,
  unitsByPropertyId,
  tenantsByUnitId,
  allUnits,
  tenantsData
}: Props) {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
    const [isExporting, setIsExporting] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editDrawerOpen, setEditDrawerOpen] = useState(false);
    const [selectedPaymentPlan, setSelectedPaymentPlan] = useState<PaymentPlan | null>(null);

    // Filter states
    const [tempFilters, setTempFilters] = useState({
        city: '',
        property: '',
        unit: '',
        tenant: '',
    });

    const [filters, setFilters] = useState({
        city: '',
        property: '',
        unit: '',
        tenant: '',
    });

    // Dropdown states
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
    const [showUnitDropdown, setShowUnitDropdown] = useState(false);
    const [showTenantDropdown, setShowTenantDropdown] = useState(false);

    // Refs for dropdowns
    const cityDropdownRef = useRef<HTMLDivElement>(null);
    const propertyDropdownRef = useRef<HTMLDivElement>(null);
    const unitDropdownRef = useRef<HTMLDivElement>(null);
    const tenantDropdownRef = useRef<HTMLDivElement>(null);
    const cityInputRef = useRef<HTMLInputElement>(null);
    const propertyInputRef = useRef<HTMLInputElement>(null);
    const unitInputRef = useRef<HTMLInputElement>(null);
    const tenantInputRef = useRef<HTMLInputElement>(null);

    // Handle clicks outside dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                cityDropdownRef.current &&
                !cityDropdownRef.current.contains(event.target as Node) &&
                cityInputRef.current &&
                !cityInputRef.current.contains(event.target as Node)
            ) {
                setShowCityDropdown(false);
            }
            if (
                propertyDropdownRef.current &&
                !propertyDropdownRef.current.contains(event.target as Node) &&
                propertyInputRef.current &&
                !propertyInputRef.current.contains(event.target as Node)
            ) {
                setShowPropertyDropdown(false);
            }
            if (
                unitDropdownRef.current &&
                !unitDropdownRef.current.contains(event.target as Node) &&
                unitInputRef.current &&
                !unitInputRef.current.contains(event.target as Node)
            ) {
                setShowUnitDropdown(false);
            }
            if (
                tenantDropdownRef.current &&
                !tenantDropdownRef.current.contains(event.target as Node) &&
                tenantInputRef.current &&
                !tenantInputRef.current.contains(event.target as Node)
            ) {
                setShowTenantDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter change handlers
    const handleTempFilterChange = (key: string, value: string) => {
        setTempFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleCitySelect = (city: any) => {
        handleTempFilterChange('city', city.city);
        setShowCityDropdown(false);
    };

    const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        handleTempFilterChange('city', value);
        setShowCityDropdown(value.length > 0);
    };

    const handlePropertyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        handleTempFilterChange('property', value);
        setShowPropertyDropdown(value.length > 0);
    };

    const handlePropertySelect = (property: any) => {
        handleTempFilterChange('property', property.property_name);
        setShowPropertyDropdown(false);
    };

    const handleUnitInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        handleTempFilterChange('unit', value);
        setShowUnitDropdown(value.length > 0);
    };

    const handleUnitSelect = (unit: any) => {
        handleTempFilterChange('unit', unit.unit_name);
        setShowUnitDropdown(false);
    };

    const handleTenantInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        handleTempFilterChange('tenant', value);
        setShowTenantDropdown(value.length > 0);
    };

    const handleTenantSelect = (tenant: any) => {
        handleTempFilterChange('tenant', tenant.full_name);
        setShowTenantDropdown(false);
    };

    // Search functionality
    const handleSearchClick = () => {
        setFilters(tempFilters);
        
        // Find IDs based on selected names
        const selectedCity = cities.find(city => city.city === tempFilters.city);
        const selectedProperty = properties.find(property => property.property_name === tempFilters.property);
        const selectedUnit = allUnits.find(unit => unit.unit_name === tempFilters.unit);
        const selectedTenant = tenantsData.find(tenant => tenant.full_name === tempFilters.tenant);
        
        router.get(
            route('payment-plans.index'),
            {
                city_id: selectedCity?.id || null,
                property_id: selectedProperty?.id || null,
                unit_id: selectedUnit?.id || null,
                tenant_id: selectedTenant?.id || null,
            },
            { preserveState: true },
        );
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearchClick();
    };

    const handleClearFilters = () => {
        // Reset all filter states
        setTempFilters({
            city: '',
            property: '',
            unit: '',
            tenant: '',
        });
        setFilters({
            city: '',
            property: '',
            unit: '',
            tenant: '',
        });
        
        // Navigate to the page without any filter parameters
        router.get(route('payment-plans.index'), {}, { preserveState: false });
    };

    const handleDelete = (paymentPlan: PaymentPlan) => {
        if (confirm('Are you sure you want to delete this payment plan?')) {
            router.delete(`/payment-plans/${paymentPlan.id}`);
        }
    };

    const handleEdit = (paymentPlan: PaymentPlan) => {
        setSelectedPaymentPlan(paymentPlan);
        setEditDrawerOpen(true);
    };

    const handleCSVExport = () => {
        if (!paymentPlans || !paymentPlans.data || paymentPlans.data.length === 0) {
            alert('No data to export');
            return;
        }

        setIsExporting(true);

        try {
            console.log('Exporting payment plans data:', paymentPlans.data);
            const filename = `payment-plans-${new Date().toISOString().split('T')[0]}.csv`;
            exportToCSV(paymentPlans.data, filename);

            console.log('Export completed successfully');
        } catch (error) {
            console.error('Export failed:', error);
            alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the console for details.`);
        } finally {
            setIsExporting(false);
        }
    };

    const formatCurrency = (amount: number | null) => {
        if (amount === null) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(Number(amount));
    };

    const getStatusBadge = (status: string | null) => {
        if (!status) return <Badge variant="outline">N/A</Badge>;

        switch (status) {
            case 'Paid':
                return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Paid</Badge>;
            case 'Paid Partly':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Paid Partly</Badge>;
            case "Didn't Pay":
                return <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Didn't Pay</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    // Filter options based on input
    const filteredCities = cities.filter((city) => 
        city.city.toLowerCase().includes(tempFilters.city.toLowerCase())
    );

    const filteredProperties = properties.filter((property) => 
        property.property_name.toLowerCase().includes(tempFilters.property.toLowerCase())
    );

    const filteredUnits = allUnits.filter(unit =>
        unit.unit_name.toLowerCase().includes(tempFilters.unit.toLowerCase())
    );

    const filteredTenants = tenantsData.filter(tenant =>
        tenant.full_name.toLowerCase().includes(tempFilters.tenant.toLowerCase())
    );

    return (
        <AppLayout>
            <Head title="Payment Plans" />

            <div className="min-h-screen bg-background py-12 text-foreground transition-colors">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Title and Buttons Section - Outside of Card */}
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-foreground">Payment Plans Management</h1>
                        <div className="flex items-center gap-2">
                            {/* Export Button */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCSVExport}
                                disabled={isExporting || !paymentPlans?.data || paymentPlans.data.length === 0}
                                className="flex items-center"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                {isExporting ? 'Exporting...' : 'Export CSV'}
                            </Button>

                            {hasAllPermissions(['payment-plans.create','payment-plans.store']) && (
                                <Button onClick={() => setDrawerOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Payment Plan
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Card with Filters and Table */}
                    <Card className="bg-card text-card-foreground shadow-lg">
                        <CardHeader>
                            {/* Filters */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
                                {/* City Filter with Autocomplete */}
                                <div className="relative">
                                    <Input
                                        ref={cityInputRef}
                                        type="text"
                                        placeholder="City"
                                        value={tempFilters.city}
                                        onChange={handleCityInputChange}
                                        onFocus={() => setShowCityDropdown(true)}
                                        className="text-input-foreground bg-input pr-8"
                                    />
                                    <ChevronDown className="absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                                    {showCityDropdown && filteredCities.length > 0 && (
                                        <div
                                            ref={cityDropdownRef}
                                            className="absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-input bg-popover shadow-lg"
                                        >
                                            {filteredCities.map((city) => (
                                                <div
                                                    key={city.id}
                                                    className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                                    onClick={() => handleCitySelect(city)}
                                                >
                                                    {city.city}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Property Filter with Autocomplete */}
                                <div className="relative">
                                    <Input
                                        ref={propertyInputRef}
                                        type="text"
                                        placeholder="Property"
                                        value={tempFilters.property}
                                        onChange={handlePropertyInputChange}
                                        onFocus={() => setShowPropertyDropdown(true)}
                                        className="text-input-foreground bg-input pr-8"
                                    />
                                    <ChevronDown className="absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                                    {showPropertyDropdown && filteredProperties.length > 0 && (
                                        <div
                                            ref={propertyDropdownRef}
                                            className="absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-input bg-popover shadow-lg"
                                        >
                                            {filteredProperties.map((property) => (
                                                <div
                                                    key={property.id}
                                                    className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                                    onClick={() => handlePropertySelect(property)}
                                                >
                                                    {property.property_name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Unit Filter with Autocomplete */}
                                <div className="relative">
                                    <Input
                                        ref={unitInputRef}
                                        type="text"
                                        placeholder="Unit"
                                        value={tempFilters.unit}
                                        onChange={handleUnitInputChange}
                                        onFocus={() => setShowUnitDropdown(true)}
                                        className="text-input-foreground bg-input pr-8"
                                    />
                                    <ChevronDown className="absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                                    {showUnitDropdown && filteredUnits.length > 0 && (
                                        <div
                                            ref={unitDropdownRef}
                                            className="absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-input bg-popover shadow-lg"
                                        >
                                            {filteredUnits.map((unit) => (
                                                <div
                                                    key={unit.id}
                                                    className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                                    onClick={() => handleUnitSelect(unit)}
                                                >
                                                    {unit.unit_name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Tenant Filter with Autocomplete */}
                                <div className="relative">
                                    <Input
                                        ref={tenantInputRef}
                                        type="text"
                                        placeholder="Tenant"
                                        value={tempFilters.tenant}
                                        onChange={handleTenantInputChange}
                                        onFocus={() => setShowTenantDropdown(true)}
                                        className="text-input-foreground bg-input pr-8"
                                    />
                                    <ChevronDown className="absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                                    {showTenantDropdown && filteredTenants.length > 0 && (
                                        <div
                                            ref={tenantDropdownRef}
                                            className="absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-input bg-popover shadow-lg"
                                        >
                                            {filteredTenants.map((tenant) => (
                                                <div
                                                    key={tenant.id}
                                                    className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                                    onClick={() => handleTenantSelect(tenant)}
                                                >
                                                    {tenant.full_name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Placeholder column for responsive grid */}
                                <div className="hidden md:block"></div>

                                {/* Search and Clear Buttons */}
                                <div className="flex gap-2">
                                    <Button onClick={handleSearchClick} variant="default" className="flex items-center">
                                        <Search className="mr-2 h-4 w-4" />
                                        Search
                                    </Button>
                                    <Button onClick={handleClearFilters} variant="outline" className="flex items-center">
                                        <X className="mr-2 h-4 w-4" />
                                        Clear
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="relative overflow-x-auto">
                                <Table className="border-collapse rounded-md border border-border">
                                    <TableHeader>
                                        <TableRow className="border-border">
                                            <TableHead className="sticky left-0 z-10 min-w-[120px] border border-border bg-muted text-muted-foreground">
                                                City
                                            </TableHead>
                                            <TableHead className="sticky left-[120px] z-10 min-w-[150px] border border-border bg-muted text-muted-foreground">
                                                Property
                                            </TableHead>
                                            <TableHead className="sticky left-[270px] z-10 min-w-[120px] border border-border bg-muted text-muted-foreground">
                                                Unit
                                            </TableHead>
                                            <TableHead className="sticky left-[390px] z-10 min-w-[150px] border border-border bg-muted text-muted-foreground">
                                                Tenant
                                            </TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground text-right">Amount</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground text-right">Paid</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground text-right">Left to Pay</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Status</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Date</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Note</TableHead>
                                            {hasAnyPermission(['payment-plans.show','payment-plans.edit','payment-plans.update','payment-plans.destroy']) && (
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Actions</TableHead>)}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paymentPlans.data.map((plan: PaymentPlan) => (
                                            <TableRow key={plan.id} className="border-border hover:bg-muted/50">
                                                <TableCell className="sticky left-0 z-10 border border-border bg-muted text-center font-medium text-foreground">
                                                    {plan.city_name || 'N/A'}
                                                </TableCell>
                                                <TableCell className="sticky left-[120px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                                                    {plan.property}
                                                </TableCell>
                                                <TableCell className="sticky left-[270px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                                                    {plan.unit}
                                                </TableCell>
                                                <TableCell className="sticky left-[390px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                                                    {plan.tenant}
                                                </TableCell>
                                                <TableCell className="border border-border text-center font-medium text-blue-600 dark:text-blue-400">
                                                    {formatCurrency(plan.amount)}
                                                </TableCell>
                                                <TableCell className="border border-border text-center text-green-600 dark:text-green-400">
                                                    {formatCurrency(plan.paid)}
                                                </TableCell>
                                                <TableCell className="border border-border text-center font-medium text-red-600 dark:text-red-400">
                                                    {formatCurrency(plan.left_to_pay)}
                                                </TableCell>
                                                <TableCell className="border border-border text-center">{getStatusBadge(plan.status)}</TableCell>
                                                <TableCell className="border border-border text-center text-foreground">
                                                    {formatDateOnly(plan.dates) || 'N/A'}
                                                </TableCell>
                                                <TableCell className="border border-border text-center">
                                                    {plan.notes ? (
                                                        <div className="max-w-24 truncate" title={plan.notes}>
                                                            {plan.notes}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">N/A</span>
                                                    )}
                                                </TableCell>
                                                {hasAnyPermission(['payment-plans.show','payment-plans.edit','payment-plans.update','payment-plans.destroy']) && (
                                                <TableCell className="border border-border text-center">
                                                    <div className="flex gap-1">
                                                        {hasPermission('payment-plans.show') && (
                                                        <Link href={route('payment-plans.show', plan.id)}>
                                                            <Button variant="outline" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>)}
                                                        {hasAllPermissions(['payment-plans.update','payment-plans.edit']) && (
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={() => handleEdit(plan)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>)}
                                                        {hasPermission('payment-plans.destroy') && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDelete(plan)}
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>)}
                                                    </div>
                                                </TableCell>)}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {paymentPlans.data.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p className="text-lg">No payment plans found.</p>
                                    <p className="text-sm">Try adjusting your search criteria.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Payment Plan Create Drawer */}
            <PaymentPlanCreateDrawer
                cities={cities}
                properties={properties}
                propertiesByCityId={propertiesByCityId}
                unitsByPropertyId={unitsByPropertyId}
                tenantsByUnitId={tenantsByUnitId}
                tenantsData={tenantsData}
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                onSuccess={() => {
                    router.reload();
                }}
            />

            {/* Payment Plan Edit Drawer */}
            {selectedPaymentPlan && (
                <PaymentPlanEditDrawer
                    paymentPlan={selectedPaymentPlan}
                    cities={cities}
                    properties={properties}
                    propertiesByCityId={propertiesByCityId}
                    unitsByPropertyId={unitsByPropertyId}
                    tenantsByUnitId={tenantsByUnitId}
                    allUnits={allUnits}
                    tenantsData={tenantsData}
                    open={editDrawerOpen}
                    onOpenChange={setEditDrawerOpen}
                    onSuccess={() => {
                        router.reload();
                        setSelectedPaymentPlan(null);
                    }}
                />
            )}
        </AppLayout>
    );
}
