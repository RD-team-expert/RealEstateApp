import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePermissions } from '@/hooks/usePermissions';
import AppLayout from '@/layouts/app-layout';
import { City, Notice, NoticeAndEviction, PropertyInfoWithoutInsurance, Tenant } from '@/types/NoticeAndEviction';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { ChevronDown, Download, Edit, Eye, Plus, Search, Trash2, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import NoticeAndEvictionsCreateDrawer from './NoticeAndEvictionsCreateDrawer';
import NoticeAndEvictionsEditDrawer from './NoticeAndEvictionsEditDrawer';

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

/**
 * Format date for HTML date input fields (YYYY-MM-DD format).
 * Always treat as date-only to avoid timezone issues.
 */
const formatDateForInput = (value?: string | null): string => {
    if (!value) return '';

    // Grab YYYY-MM-DD from the front (works for "2025-10-01" and "2025-10-01T00:00:00Z")
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (!m) return '';

    const [, y, mo, d] = m;
    return `${y}-${mo}-${d}`;
};

// Define types for our data structures
interface Unit {
    id: number;
    property_id: number;
    unit_name: string;
    property_name: string;
    city_name: string;
}

interface ExtendedTenant extends Tenant {
    unit_id: number;
    full_name: string;
    unit_name: string;
    property_name: string;
    city_name: string;
}

interface ExtendedProperty extends PropertyInfoWithoutInsurance {
    city_id: number;
    city_name: string;
}

// CSV Export utility function
const exportToCSV = (data: NoticeAndEviction[], filename: string = 'notice-evictions.csv') => {
    try {
        const formatString = (value: string | null | undefined) => {
            if (value === null || value === undefined) return '';
            return String(value).replace(/"/g, '""');
        };

        const headers = [
            'ID',
            'Unit Name',
            'City Name',
            'Property Name',
            'Tenants Name',
            'Status',
            'Date',
            'Type of Notice',
            'Have An Exception',
            'Note',
            'Evictions',
            'Sent to Attorney',
            'Hearing Dates',
            'Evicted/Payment Plan',
            'If Left',
            'Writ Date',
        ];

        const csvData = [
            headers.join(','),
            ...data
                .map((record) => {
                    try {
                        return [
                            record.id || '',
                            `"${formatString(record.unit_name)}"`,
                            `"${formatString(record.city_name)}"`,
                            `"${formatString(record.property_name)}"`,
                            `"${formatString(record.tenants_name)}"`,
                            `"${formatString(record.status)}"`,
                            `"${formatDateOnly(record.date, '')}"`,
                            `"${formatString(record.type_of_notice)}"`,
                            `"${formatString(record.have_an_exception)}"`,
                            `"${formatString(record.note)}"`,
                            `"${formatString(record.evictions)}"`,
                            `"${formatString(record.sent_to_atorney)}"`,
                            `"${formatDateOnly(record.hearing_dates, '')}"`,
                            `"${formatString(record.evected_or_payment_plan)}"`,
                            `"${formatString(record.if_left)}"`,
                            `"${formatDateOnly(record.writ_date, '')}"`,
                        ].join(',');
                    } catch (rowError) {
                        console.error('Error processing record row:', record, rowError);
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

interface Props {
    records: NoticeAndEviction[];
    search?: string;
    cities: City[];
    properties: ExtendedProperty[];
    units: Unit[];
    tenants: ExtendedTenant[];
    notices: Notice[];
}

const Index = ({ records, search, cities = [], properties = [], units = [], tenants = [], notices = [] }: Props) => {
    const [isExporting, setIsExporting] = useState(false);
    const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<NoticeAndEviction | null>(null);

    // Filter states - these work with names (what users see)
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

    // Filter change handlers - these work with names
    const handleTempFilterChange = (key: string, value: string) => {
        setTempFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleCitySelect = (city: City) => {
        handleTempFilterChange('city', city.city); // Keep using city name for display
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

    const handlePropertySelect = (property: ExtendedProperty) => {
        handleTempFilterChange('property', property.property_name); // Keep using property name for display
        setShowPropertyDropdown(false);
    };

    const handleUnitInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        handleTempFilterChange('unit', value);
        setShowUnitDropdown(value.length > 0);
    };

    const handleUnitSelect = (unit: Unit) => {
        handleTempFilterChange('unit', unit.unit_name);
        setShowUnitDropdown(false);
    };

    const handleTenantInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        handleTempFilterChange('tenant', value);
        setShowTenantDropdown(value.length > 0);
    };

    const handleTenantSelect = (tenant: ExtendedTenant) => {
        handleTempFilterChange('tenant', tenant.full_name);
        setShowTenantDropdown(false);
    };

    // Search functionality - supports both ID-based and name-based filtering
    const handleSearchClick = () => {
        setFilters(tempFilters);
        
        // Find city, property, unit, and tenant IDs based on selected names
        const selectedCity = cities.find(city => city.city === tempFilters.city);
        const selectedProperty = properties.find(property => property.property_name === tempFilters.property);
        const selectedUnit = units.find(unit => unit.unit_name === tempFilters.unit);
        const selectedTenant = tenants.find(tenant => tenant.full_name === tempFilters.tenant);
        
        // Build search parameters, only including non-empty values
        const searchParams: Record<string, any> = {};
        
        // If exact matches are found, use ID-based filtering for better performance
        if (selectedCity?.id) {
            searchParams.city_id = selectedCity.id;
        } else if (tempFilters.city.trim()) {
            // If no exact match but there's a search term, use name-based filtering
            searchParams.city_name = tempFilters.city.trim();
        }
        
        if (selectedProperty?.id) {
            searchParams.property_id = selectedProperty.id;
        } else if (tempFilters.property.trim()) {
            searchParams.property_name = tempFilters.property.trim();
        }
        
        if (selectedUnit?.id) {
            searchParams.unit_id = selectedUnit.id;
        } else if (tempFilters.unit.trim()) {
            searchParams.unit_name = tempFilters.unit.trim();
        }
        
        if (selectedTenant?.id) {
            searchParams.tenant_id = selectedTenant.id;
        } else if (tempFilters.tenant.trim()) {
            searchParams.tenant_name = tempFilters.tenant.trim();
        }
        
        router.get(
            route('notice_and_evictions.index'),
            searchParams,
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
        
        // Close all dropdowns
        setShowCityDropdown(false);
        setShowPropertyDropdown(false);
        setShowUnitDropdown(false);
        setShowTenantDropdown(false);
        
        // Navigate to the page without any filter parameters
        router.get(route('notice_and_evictions.index'), {}, { preserveState: false });
    };

    const handleDelete = (record: NoticeAndEviction) => {
        if (window.confirm('Delete this record? This cannot be undone.')) {
            router.delete(`/notice_and_evictions/${record.id}`);
        }
    };

    const handleEdit = (record: NoticeAndEviction) => {
        setSelectedRecord(record);
        setIsEditDrawerOpen(true);
    };

    const handleEditSuccess = () => {
        setIsEditDrawerOpen(false);
        setSelectedRecord(null);
        // Refresh the page to get updated data
        router.reload();
    };

    const handleCreateSuccess = () => {
        setIsCreateDrawerOpen(false);
        // Refresh the page to get updated data
        router.reload();
    };

    const handleCSVExport = () => {
        if (!records || records.length === 0) {
            alert('No data to export');
            return;
        }

        setIsExporting(true);

        try {
            console.log('Exporting notice and evictions data:', records); // Debug log
            const filename = `notice-evictions-${new Date().toISOString().split('T')[0]}.csv`;
            exportToCSV(records, filename);

            // Success feedback
            console.log('Export completed successfully');
        } catch (error) {
            console.error('Export failed:', error);
            alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the console for details.`);
        } finally {
            setIsExporting(false);
        }
    };

    const getStatusBadge = (status: string | null) => {
        if (!status) return <Badge variant="outline">N/A</Badge>;

        // Use theme-aware status colors
        switch (status.toLowerCase()) {
            case 'active':
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        {status}
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                        {status}
                    </Badge>
                );
            case 'closed':
                return (
                    <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                        {status}
                    </Badge>
                );
            default:
                return <Badge variant="default">{status}</Badge>;
        }
    };

    const getYesNoBadge = (value: string | null) => {
        if (!value || value === '-') return <Badge variant="outline">N/A</Badge>;
        return (
            <Badge
                variant={value === 'Yes' ? 'default' : 'secondary'}
                className={
                    value === 'Yes'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                }
            >
                {value}
            </Badge>
        );
    };

    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

    // Filter cities based on input - works with city names
    const filteredCities = cities.filter((city) => 
        city.city.toLowerCase().includes(tempFilters.city.toLowerCase())
    );

    // Filter properties based on input - works with property names
    const filteredProperties = properties.filter((property) => 
        property.property_name.toLowerCase().includes(tempFilters.property.toLowerCase())
    );

    const filteredUnits = units.filter(unit =>
        unit.unit_name.toLowerCase().includes(tempFilters.unit.toLowerCase())
    );

    const filteredTenants = tenants.filter(tenant =>
        tenant.full_name.toLowerCase().includes(tempFilters.tenant.toLowerCase())
    );

    return (
        <AppLayout>
            <Head title="Notice & Evictions" />

            <div className="min-h-screen bg-background py-12 text-foreground transition-colors">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Title and Buttons Section - Outside of Card */}
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-foreground">Notice & Evictions</h1>
                        <div className="flex items-center gap-2">
                            {/* Export Button */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCSVExport}
                                disabled={isExporting || !records || records.length === 0}
                                className="flex items-center"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                {isExporting ? 'Exporting...' : 'Export CSV'}
                            </Button>

                            {hasAllPermissions(['notice-and-evictions.create', 'notice-and-evictions.store']) && (
                                <Button onClick={() => setIsCreateDrawerOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Record
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Card with Filters and Table */}
                    <Card className="bg-card text-card-foreground shadow-lg">
                        <CardHeader>
                            {/* Filters - All work with names for user-friendly experience */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
                                {/* City Filter with Autocomplete - Shows city names */}
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

                                {/* Property Filter with Autocomplete - Shows property names */}
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

                                {/* Unit Filter with Autocomplete - Shows unit names */}
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

                                {/* Tenant Filter with Autocomplete - Shows tenant names */}
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
                                            {/* <TableHead className="text-muted-foreground border border-border bg-muted">ID</TableHead> */}
                                            <TableHead className="sticky left-0 z-10 min-w-[120px] border border-border bg-muted text-muted-foreground">
                                                City Name
                                            </TableHead>
                                            <TableHead className="sticky left-[120px] z-10 min-w-[150px] border border-border bg-muted text-muted-foreground">
                                                Property Name
                                            </TableHead>
                                            <TableHead className="sticky left-[270px] z-10 min-w-[120px] border border-border bg-muted text-muted-foreground">
                                                Unit Name
                                            </TableHead>
                                            <TableHead className="sticky left-[390px] z-10 min-w-[120px] border border-border bg-muted text-muted-foreground">
                                                Tenants Name
                                            </TableHead>
                                            <TableHead className="text-muted-foreground border border-border bg-muted">Status</TableHead>
                                            <TableHead className="text-muted-foreground border border-border bg-muted">Date</TableHead>
                                            <TableHead className="text-muted-foreground border border-border bg-muted">Type of Notice</TableHead>
                                            <TableHead className="text-muted-foreground border border-border bg-muted">Have An Exception?</TableHead>
                                            <TableHead className="text-muted-foreground border border-border bg-muted">Note</TableHead>
                                            <TableHead className="text-muted-foreground border border-border bg-muted">Evictions</TableHead>
                                            <TableHead className="text-muted-foreground border border-border bg-muted">Sent to Attorney</TableHead>
                                            <TableHead className="text-muted-foreground border border-border bg-muted">Hearing Dates</TableHead>
                                            <TableHead className="text-muted-foreground border border-border bg-muted">Evicted/Payment Plan</TableHead>
                                            <TableHead className="text-muted-foreground border border-border bg-muted">If Left?</TableHead>
                                            <TableHead className="text-muted-foreground border border-border bg-muted">Writ Date</TableHead>
                                            {hasAnyPermission([
                                                'notice-and-evictions.show',
                                                'notice-and-evictions.edit',
                                                'notice-and-evictions.update',
                                                'notice-and-evictions.destroy',
                                            ]) && <TableHead className="text-muted-foreground border border-border bg-muted">Actions</TableHead>}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {records.map((record) => (
                                            <TableRow key={record.id} className="border-border hover:bg-muted/50">
                                                {/* <TableCell className="font-medium text-foreground border border-border text-center">
                                                    {record.id}
                                                </TableCell> */}
                                                <TableCell className="sticky left-0 z-10 border border-border bg-muted text-center font-medium text-foreground">
                                                    {record.city_name || 'N/A'}
                                                </TableCell>
                                                <TableCell className="sticky left-[120px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                                                    {record.property_name || 'N/A'}
                                                </TableCell>
                                                <TableCell className="sticky left-[270px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                                                    {record.unit_name || 'N/A'}
                                                </TableCell>
                                                <TableCell className="sticky left-[390px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                                                    {record.tenants_name || 'N/A'}
                                                </TableCell>
                                                <TableCell className="border border-border text-center">
                                                    {getStatusBadge(record.status ?? null)}
                                                </TableCell>
                                                <TableCell className="text-foreground border border-border text-center">
                                                    {formatDateOnly(record.date)}
                                                </TableCell>
                                                <TableCell className="text-foreground border border-border text-center">
                                                    {record.type_of_notice || <span className="text-muted-foreground">N/A</span>}
                                                </TableCell>
                                                <TableCell className="border border-border text-center">
                                                    {getYesNoBadge(record.have_an_exception ?? null)}
                                                </TableCell>
                                                <TableCell className="text-foreground border border-border text-center">
                                                    {record.note ? (
                                                        <div className="max-w-24 truncate" title={record.note}>
                                                            {record.note}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">N/A</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-foreground border border-border text-center">
                                                    {record.evictions || <span className="text-muted-foreground">N/A</span>}
                                                </TableCell>
                                                <TableCell className="border border-border text-center">
                                                    {getYesNoBadge(record.sent_to_atorney ?? null)}
                                                </TableCell>
                                                <TableCell className="text-foreground border border-border text-center">
                                                    {formatDateOnly(record.hearing_dates)}
                                                </TableCell>
                                                <TableCell className="text-foreground border border-border text-center">
                                                    {record.evected_or_payment_plan || <span className="text-muted-foreground">N/A</span>}
                                                </TableCell>
                                                <TableCell className="border border-border text-center">
                                                    {getYesNoBadge(record.if_left ?? null)}
                                                </TableCell>
                                                <TableCell className="text-foreground border border-border text-center">
                                                    {formatDateOnly(record.writ_date)}
                                                </TableCell>
                                                {hasAnyPermission([
                                                    'notice-and-evictions.show',
                                                    'notice-and-evictions.edit',
                                                    'notice-and-evictions.update',
                                                    'notice-and-evictions.destroy',
                                                ]) && (
                                                    <TableCell className="border border-border text-center">
                                                        <div className="flex gap-1">
                                                            {hasPermission('notice-and-evictions.show') && (
                                                                <Link href={`/notice_and_evictions/${record.id}`}>
                                                                    <Button variant="outline" size="sm">
                                                                        <Eye className="h-4 w-4" />
                                                                    </Button>
                                                                </Link>
                                                            )}
                                                            {hasAllPermissions(['notice-and-evictions.edit', 'notice-and-evictions.update']) && (
                                                                <Button variant="outline" size="sm" onClick={() => handleEdit(record)}>
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            {hasPermission('notice-and-evictions.destroy') && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleDelete(record)}
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

                            {records.length === 0 && (
                                <div className="py-8 text-center text-muted-foreground">
                                    <p className="text-lg">No records found.</p>
                                    <p className="text-sm">Try adjusting your search criteria.</p>
                                </div>
                            )}

                            {/* Records count info */}
                            <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                                <div className="text-sm text-muted-foreground">Showing {records.length} records</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Create Drawer */}
            <NoticeAndEvictionsCreateDrawer
                open={isCreateDrawerOpen}
                onOpenChange={setIsCreateDrawerOpen}
                cities={cities}
                properties={properties}
                units={units}
                tenants={tenants}
                notices={notices}
                onSuccess={handleCreateSuccess}
            />

            {/* Edit Drawer */}
            {selectedRecord && (
                <NoticeAndEvictionsEditDrawer
                    record={{
                        ...selectedRecord,
                        date: formatDateForInput(selectedRecord.date),
                        hearing_dates: formatDateForInput(selectedRecord.hearing_dates),
                        writ_date: formatDateForInput(selectedRecord.writ_date),
                    }}
                    cities={cities}
                    properties={properties}
                    units={units}
                    tenants={tenants}
                    notices={notices}
                    open={isEditDrawerOpen}
                    onOpenChange={setIsEditDrawerOpen}
                    onSuccess={handleEditSuccess}
                />
            )}
        </AppLayout>
    );
};

export default Index;
