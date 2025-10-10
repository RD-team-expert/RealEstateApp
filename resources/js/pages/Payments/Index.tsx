import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePermissions } from '@/hooks/usePermissions';
import AppLayout from '@/layouts/app-layout';
import { Payment } from '@/types/payments';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { ChevronDown, Download, Edit, Eye, Plus, Search, Trash2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import PaymentCreateDrawer from './PaymentCreateDrawer';
import PaymentEditDrawer from './PaymentEditDrawer';

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

// Updated CSV Export utility function with better error handling
const exportToCSV = (data: Payment[], filename: string = 'payments.csv') => {
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
            if (!dateStr) return '';
            try {
                return formatDateOnly(dateStr, '');
            } catch (error) {
                return dateStr || '';
            }
        };

        const headers = [
            'ID',
            'Date',
            'City',
            'Property Name',
            'Unit Name',
            'Owes',
            'Paid',
            'Left to Pay',
            'Status',
            'Notes',
            'Reversed Payments',
            'Permanent',
        ];

        const csvData = [
            headers.join(','),
            ...data
                .map((payment) => {
                    try {
                        return [
                            payment.id || '',
                            `"${formatDate(payment.date)}"`,
                            `"${formatString(payment.city)}"`,
                            `"${formatString(payment.property_name)}"`,
                            `"${formatString(payment.unit_name)}"`,
                            formatCurrency(payment.owes),
                            formatCurrency(payment.paid),
                            formatCurrency(payment.left_to_pay),
                            `"${formatString(payment.status)}"`,
                            `"${formatString(payment.notes)}"`,
                            `"${formatString(payment.reversed_payments)}"`,
                            `"${formatString(payment.permanent)}"`,
                        ].join(',');
                    } catch (rowError) {
                        console.error('Error processing payment row:', payment, rowError);
                        return ''; // Skip problematic rows
                    }
                })
                .filter((row) => row !== ''), // Remove empty rows
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

interface UnitData {
    id: number;
    unit_name: string;
    property_name: string;
    city: string;
}

interface Props {
    payments: {
        data: Payment[];
        links: any[];
        meta: any;
    };
    search: string | null;
    filters: {
        city?: string;
        property?: string;
        unit?: string;
    };
    units: UnitData[];
    cities: string[];
    properties: string[];
    unitsByCity: Record<string, string[]>;
    unitsByProperty: Record<string, string[]>;
    propertiesByCity: Record<string, string[]>;
    allCities: string[];
    allProperties: string[];
}

export default function Index({ 
    payments, 
    search, 
    filters, 
    units, 
    cities, 
    properties,
    unitsByCity, 
    unitsByProperty,
    propertiesByCity,
    allCities, 
    allProperties 
}: Props) {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
    const [isExporting, setIsExporting] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editDrawerOpen, setEditDrawerOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

    // Filter states - initialize from props to maintain filter state on page load
    const [cityFilter, setCityFilter] = useState(filters?.city || '');
    const [propertyFilter, setPropertyFilter] = useState(filters?.property || '');
    const [unitFilter, setUnitFilter] = useState(filters?.unit || '');

    // Dropdown states
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
    const [showUnitDropdown, setShowUnitDropdown] = useState(false);

    // Refs for dropdowns
    const cityDropdownRef = useRef<HTMLDivElement>(null);
    const propertyDropdownRef = useRef<HTMLDivElement>(null);
    const unitDropdownRef = useRef<HTMLDivElement>(null);

    // Get unique values for filters
    const uniqueCities = allCities || [];
    const uniqueProperties = allProperties || [];
    
    // Get filtered units based on current city and property selection
    const getFilteredUnits = (): string[] => {
        let filteredUnits = units;

        if (cityFilter) {
            filteredUnits = filteredUnits.filter(unit => unit.city === cityFilter);
        }

        if (propertyFilter) {
            filteredUnits = filteredUnits.filter(unit => unit.property_name === propertyFilter);
        }

        return [...new Set(filteredUnits.map(unit => unit.unit_name))].sort();
    };

    // Get filtered properties based on current city selection
    const getFilteredProperties = (): string[] => {
        if (!cityFilter) {
            return uniqueProperties;
        }
        return propertiesByCity[cityFilter] || [];
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
                setShowCityDropdown(false);
            }
            if (propertyDropdownRef.current && !propertyDropdownRef.current.contains(event.target as Node)) {
                setShowPropertyDropdown(false);
            }
            if (unitDropdownRef.current && !unitDropdownRef.current.contains(event.target as Node)) {
                setShowUnitDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Reset dependent filters when parent filter changes
    useEffect(() => {
        if (cityFilter && propertyFilter) {
            const availableProperties = getFilteredProperties();
            if (!availableProperties.includes(propertyFilter)) {
                setPropertyFilter('');
                setUnitFilter('');
            }
        }
    }, [cityFilter]);

    useEffect(() => {
        if (propertyFilter && unitFilter) {
            const availableUnits = getFilteredUnits();
            if (!availableUnits.includes(unitFilter)) {
                setUnitFilter('');
            }
        }
    }, [cityFilter, propertyFilter]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params: any = {};

        if (cityFilter) params.city = cityFilter;
        if (propertyFilter) params.property = propertyFilter;
        if (unitFilter) params.unit = unitFilter;

        router.get(route('payments.index'), params, { 
            preserveState: true,
            preserveScroll: true 
        });
    };

    const clearFilters = () => {
        setCityFilter('');
        setPropertyFilter('');
        setUnitFilter('');
        
        router.get(route('payments.index'), {}, { 
            preserveState: true,
            preserveScroll: true 
        });
    };

    const handleDelete = (payment: Payment) => {
        if (confirm('Are you sure you want to delete this payment?')) {
            router.delete(route('payments.destroy', payment.id));
        }
    };

    const handleEdit = (payment: Payment) => {
        setSelectedPayment(payment);
        setEditDrawerOpen(true);
    };

    const handleEditSuccess = () => {
        // Refresh the page to show updated data
        router.reload();
    };

    const handleCSVExport = () => {
        if (!payments || !payments.data || payments.data.length === 0) {
            alert('No data to export');
            return;
        }

        setIsExporting(true);

        try {
            console.log('Exporting payments data:', payments.data); // Debug log
            const filename = `payments-${new Date().toISOString().split('T')[0]}.csv`;
            exportToCSV(payments.data, filename);

            // Success feedback
            console.log('Export completed successfully');
        } catch (error) {
            console.error('Export failed:', error);
            alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the console for details.`);
        } finally {
            setIsExporting(false);
        }
    };

    const formatCurrency = (amount: number | null) => {
        if (amount === null || amount === undefined || isNaN(amount)) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const getStatusBadge = (status: string | null) => {
        if (!status) return <Badge variant="outline">N/A</Badge>;

        if (status.toLowerCase().includes('paid')) {
            return (
                <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    {status}
                </Badge>
            );
        } else if (status.toLowerCase().includes('pending')) {
            return (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                    {status}
                </Badge>
            );
        } else {
            return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getPermanentBadge = (permanent: string | null) => {
        if (!permanent) return <Badge variant="outline">N/A</Badge>;

        return (
            <Badge
                variant={permanent === 'Yes' ? 'default' : 'secondary'}
                className={
                    permanent === 'Yes'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                }
            >
                {permanent}
            </Badge>
        );
    };

    // removed hasActiveFilters; Clear button will always show and Active Filters UI removed

    return (
        <AppLayout>
            <Head title="Payments" />

            <div className="min-h-screen bg-background py-12 text-foreground transition-colors">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Title and Buttons Section - Outside Card */}
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-foreground">Payments Management</h1>
                        <div className="flex items-center gap-2">
                            {/* Export Button */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCSVExport}
                                disabled={isExporting || !payments?.data || payments.data.length === 0}
                                className="flex items-center"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                {isExporting ? 'Exporting...' : 'Export CSV'}
                            </Button>

                            {hasAllPermissions(['payments.create', 'payments.store']) && (
                                <Button onClick={() => setDrawerOpen(true)} className="bg-primary text-background">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Payment
                                </Button>
                            )}
                        </div>
                    </div>

                    <Card className="bg-card text-card-foreground shadow-lg">
                        <CardHeader>
                            {/* Filters */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                                {/* City Filter */}
                                <div className="relative" ref={cityDropdownRef}>
                                    <div className="relative">
                                        <Input
                                            type="text"
                                            placeholder="Filter by city..."
                                            value={cityFilter}
                                            onChange={(e) => setCityFilter(e.target.value)}
                                            onFocus={() => setShowCityDropdown(true)}
                                            className="text-input-foreground bg-input pr-8"
                                        />
                                        <ChevronDown className="absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                                    </div>
                                    {showCityDropdown && uniqueCities.length > 0 && (
                                        <div className="absolute top-full right-0 left-0 z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-input bg-popover shadow-lg">
                                            {uniqueCities.map((city) => (
                                                <div
                                                    key={city}
                                                    className="cursor-pointer px-3 py-2 text-sm hover:bg-accent"
                                                    onClick={() => {
                                                        setCityFilter(city);
                                                        setShowCityDropdown(false);
                                                    }}
                                                >
                                                    {city}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Property Filter */}
                                <div className="relative" ref={propertyDropdownRef}>
                                    <div className="relative">
                                        <Input
                                            type="text"
                                            placeholder="Filter by property..."
                                            value={propertyFilter}
                                            onChange={(e) => setPropertyFilter(e.target.value)}
                                            onFocus={() => setShowPropertyDropdown(true)}
                                            className="text-input-foreground bg-input pr-8"
                                        />
                                        <ChevronDown className="absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                                    </div>
                                    {showPropertyDropdown && getFilteredProperties().length > 0 && (
                                        <div className="absolute top-full right-0 left-0 z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-input bg-popover shadow-lg">
                                            {getFilteredProperties().map((property) => (
                                                <div
                                                    key={property}
                                                    className="cursor-pointer px-3 py-2 text-sm hover:bg-accent"
                                                    onClick={() => {
                                                        setPropertyFilter(property);
                                                        setShowPropertyDropdown(false);
                                                    }}
                                                >
                                                    {property}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Unit Filter */}
                                <div className="relative" ref={unitDropdownRef}>
                                    <div className="relative">
                                        <Input
                                            type="text"
                                            placeholder="Filter by unit..."
                                            value={unitFilter}
                                            onChange={(e) => setUnitFilter(e.target.value)}
                                            onFocus={() => setShowUnitDropdown(true)}
                                            className="text-input-foreground bg-input pr-8"
                                        />
                                        <ChevronDown className="absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                                    </div>
                                    {showUnitDropdown && getFilteredUnits().length > 0 && (
                                        <div className="absolute top-full right-0 left-0 z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-input bg-popover shadow-lg">
                                            {getFilteredUnits().map((unit) => (
                                                <div
                                                    key={unit}
                                                    className="cursor-pointer px-3 py-2 text-sm hover:bg-accent"
                                                    onClick={() => {
                                                        setUnitFilter(unit);
                                                        setShowUnitDropdown(false);
                                                    }}
                                                >
                                                    {unit}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <Button onClick={handleSearch} variant="default" className="flex-1">
                                        <Search className="mr-2 h-4 w-4" />
                                        Search
                                    </Button>
                                    
                                    <Button 
                                        onClick={clearFilters} 
                                        variant="outline" 
                                        size="sm"
                                        className="whitespace-nowrap"
                                    >
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
                                            <TableHead className="sticky left-0 z-10 min-w-[120px] border border-border bg-muted text-muted-foreground">City</TableHead>
                                            <TableHead className="sticky left-[120px] z-10 min-w-[120px] border border-border bg-muted text-muted-foreground">Property Name</TableHead>
                                            <TableHead className="sticky left-[240px] z-10 min-w-[120px] border border-border bg-muted text-muted-foreground">Unit Name</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Date</TableHead>
                                            <TableHead className="border border-border bg-muted text-right text-muted-foreground">Owes</TableHead>
                                            <TableHead className="border border-border bg-muted text-right text-muted-foreground">Paid</TableHead>
                                            <TableHead className="border border-border bg-muted text-right text-muted-foreground">Left to Pay</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Status</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Note</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Reversed Payments</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Permanent</TableHead>
                                            {hasAnyPermission(['payments.show', 'payments.edit', 'payments.update', 'payments.destroy']) && (
                                                <TableHead className="border border-border bg-muted text-muted-foreground">Actions</TableHead>
                                            )}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {payments.data.map((payment) => (
                                            <TableRow key={payment.id} className="border-border hover:bg-muted/50">
                                                <TableCell className="sticky left-0 z-10 min-w-[120px] border border-border bg-card text-center font-medium text-foreground">{payment.city}</TableCell>
                                                <TableCell className="sticky left-[120px] z-10 min-w-[120px] border border-border bg-card text-center font-medium text-foreground">{payment.property_name || 'N/A'}</TableCell>
                                                <TableCell className="sticky left-[240px] z-10 min-w-[120px] border border-border bg-card text-center font-medium text-foreground">{payment.unit_name}</TableCell>
                                                <TableCell className="border border-border text-center text-foreground">{formatDateOnly(payment.date)}</TableCell>
                                                <TableCell className="border border-border text-center font-medium text-red-600 dark:text-red-400">
                                                    {formatCurrency(payment.owes)}
                                                </TableCell>
                                                <TableCell className="border border-border text-center text-green-600 dark:text-green-400">
                                                    {formatCurrency(payment.paid)}
                                                </TableCell>
                                                <TableCell className="border border-border text-center font-medium text-blue-600 dark:text-blue-400">
                                                    {formatCurrency(payment.left_to_pay)}
                                                </TableCell>
                                                <TableCell className="border border-border text-center">{getStatusBadge(payment.status)}</TableCell>
                                                <TableCell className="border border-border text-center text-foreground max-w-32 truncate">{payment.notes}</TableCell>
                                                <TableCell className="border border-border text-center text-foreground">{payment.reversed_payments}</TableCell>
                                                <TableCell className="border border-border text-center">{getPermanentBadge(payment.permanent)}</TableCell>
                                                {hasAnyPermission(['payments.show', 'payments.edit', 'payments.update', 'payments.destroy']) && (
                                                    <TableCell className="border border-border text-center">
                                                        <div className="flex gap-1 justify-center">
                                                            {hasPermission('payments.show') && (
                                                                <Link href={route('payments.show', payment.id)}>
                                                                    <Button variant="outline" size="sm">
                                                                        <Eye className="h-4 w-4" />
                                                                    </Button>
                                                                </Link>
                                                            )}
                                                            {hasAllPermissions(['payments.edit', 'payments.update']) && (
                                                                <Button variant="outline" size="sm" onClick={() => handleEdit(payment)}>
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            {hasPermission('payments.destroy') && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleDelete(payment)}
                                                                    className="border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {payments.data.length === 0 && (
                                <div className="py-8 text-center text-muted-foreground">
                                    <p className="text-lg">No payments found.</p>
                                    <p className="text-sm">Try adjusting your search criteria.</p>
                                </div>
                            )}

                            {/* Pagination info */}
                            {payments.meta && (
                                <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {payments.meta.from || 0} to {payments.meta.to || 0} of {payments.meta.total || 0} results
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <PaymentCreateDrawer 
                open={drawerOpen} 
                onOpenChange={setDrawerOpen} 
                units={units} 
                cities={cities}
                properties={properties}
                unitsByCity={unitsByCity} 
                unitsByProperty={unitsByProperty}
                propertiesByCity={propertiesByCity}
            />

            {selectedPayment && (
                <PaymentEditDrawer
                    payment={selectedPayment}
                    units={units}
                    cities={cities}
                    properties={properties}
                    unitsByCity={unitsByCity}
                    unitsByProperty={unitsByProperty}
                    propertiesByCity={propertiesByCity}
                    open={editDrawerOpen}
                    onOpenChange={setEditDrawerOpen}
                    onSuccess={handleEditSuccess}
                />
            )}
        </AppLayout>
    );
}
