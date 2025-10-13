import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePermissions } from '@/hooks/usePermissions';
import AppLayout from '@/layouts/app-layout';
import { MoveOut } from '@/types/move-out';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { ChevronDown, Download, Edit, Eye, Plus, Search, Trash2, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import MoveOutCreateDrawer from './MoveOutCreateDrawer';
import MoveOutEditDrawer from './MoveOutEditDrawer';

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

// CSV Export utility function
const exportToCSV = (data: MoveOut[], filename: string = 'move-outs.csv') => {
    try {
        const formatString = (value: string | null | undefined) => {
            if (value === null || value === undefined) return '';
            return String(value).replace(/"/g, '""');
        };

        const headers = [
            'ID',
            'City Name',
            'Property Name', 
            'Unit Name',
            'Tenant Name',
            'Move Out Date',
            'Lease Status',
            'Lease Ending on Buildium',
            'Keys Location',
            'Utilities Under Our Name',
            'Date Utility Put Under Our Name',
            'Walkthrough',
            'Repairs',
            'Send Back Security Deposit',
            'Notes',
            'Cleaning',
            'List the Unit',
            'Move Out Form',
        ];

        const csvData = [
            headers.join(','),
            ...data
                .map((moveOut) => {
                    try {
                        return [
                            moveOut.id || '',
                            `"${formatString(moveOut.city_name)}"`,
                            `"${formatString(moveOut.property_name)}"`,
                            `"${formatString(moveOut.units_name)}"`,
                            `"${formatString(moveOut.tenants_name)}"`,
                            `"${formatDateOnly(moveOut.move_out_date, '')}"`,
                            `"${formatString(moveOut.lease_status)}"`,
                            `"${formatDateOnly(moveOut.date_lease_ending_on_buildium, '')}"`,
                            `"${formatString(moveOut.keys_location)}"`,
                            `"${formatString(moveOut.utilities_under_our_name)}"`,
                            `"${formatDateOnly(moveOut.date_utility_put_under_our_name, '')}"`,
                            `"${formatString(moveOut.walkthrough)}"`,
                            `"${formatString(moveOut.repairs)}"`,
                            `"${formatString(moveOut.send_back_security_deposit)}"`,
                            `"${formatString(moveOut.notes)}"`,
                            `"${formatString(moveOut.cleaning)}"`,
                            `"${formatString(moveOut.list_the_unit)}"`,
                            `"${formatString(moveOut.move_out_form)}"`,
                        ].join(',');
                    } catch (rowError) {
                        console.error('Error processing move-out row:', moveOut, rowError);
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
    moveOuts: {
        data: MoveOut[];
        links: any[];
        meta: any;
    };
    unit_id: string | null;
    tenant_id: string | null;
    cities: any[];
    properties: any[];
    propertiesByCityId: Record<number, any[]>;
    unitsByPropertyId: Record<number, Array<{ id: number; unit_name: string }>>;
    tenantsByUnitId: Record<number, Array<{ id: number; full_name: string; tenant_id: number }>>;
    allUnits: Array<{ id: number; unit_name: string; city_name: string; property_name: string }>;
    tenantsData: Array<{ id: number; full_name: string; unit_name: string; property_name: string; city_name: string }>;
}

export default function Index({ moveOuts,  cities, properties, propertiesByCityId, unitsByPropertyId, tenantsByUnitId, allUnits, tenantsData }: Props) {
    const [isExporting, setIsExporting] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    const [selectedMoveOut, setSelectedMoveOut] = useState<MoveOut | null>(null);

    // Filter states - these work with names (what users see)
    const [tempFilters, setTempFilters] = useState({
        city: '',
        property: '',
        unit: '',
        tenant: '',
    });

    const [, setFilters] = useState({
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

    const handleCitySelect = (city: any) => {
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

    const handlePropertySelect = (property: any) => {
        handleTempFilterChange('property', property.property_name); // Keep using property name for display
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

    // Search functionality - now sends IDs to backend for ID-based filtering
    const handleSearchClick = () => {
        setFilters(tempFilters);
        
        // Find city, property, unit, and tenant IDs based on selected names
        const selectedCity = cities.find(city => city.city === tempFilters.city);
        const selectedProperty = properties.find(property => property.property_name === tempFilters.property);
        const selectedUnit = allUnits.find(unit => unit.unit_name === tempFilters.unit);
        const selectedTenant = tenantsData.find(tenant => tenant.full_name === tempFilters.tenant);
        
        router.get(
            route('move-out.index'),
            {
                city_id: selectedCity?.id || null,
                property_id: selectedProperty?.id || null,
                unit_id: selectedUnit?.id || null,
                tenant_id: selectedTenant?.id || null,
            },
            { preserveState: true },
        );
    };

    // const handleSearch = (e: React.FormEvent) => {
    //     e.preventDefault();
    //     handleSearchClick();
    // };

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
        router.get(route('move-out.index'), {}, { preserveState: false });
    };

    const handleDelete = (moveOut: MoveOut) => {
        if (confirm('Are you sure you want to delete this move-out record?')) {
            // This sends the ID to backend for deletion
            router.delete(route('move-out.destroy', moveOut.id));
        }
    };

    const handleCSVExport = () => {
        if (!moveOuts || !moveOuts.data || moveOuts.data.length === 0) {
            alert('No data to export');
            return;
        }

        setIsExporting(true);

        try {
            console.log('Exporting move-out data:', moveOuts.data); // Debug log
            const filename = `move-outs-${new Date().toISOString().split('T')[0]}.csv`;
            exportToCSV(moveOuts.data, filename);

            // Success feedback
            console.log('Export completed successfully');
        } catch (error) {
            console.error('Export failed:', error);
            alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the console for details.`);
        } finally {
            setIsExporting(false);
        }
    };

    const handleDrawerSuccess = () => {
        // Refresh the page data after successful creation
        router.reload();
    };

    const handleEditDrawerSuccess = () => {
        // Refresh the page data after successful update
        router.reload();
    };

    const handleEditClick = (moveOut: MoveOut) => {
        setSelectedMoveOut(moveOut);
        setIsEditDrawerOpen(true);
    };

    // Badge helper functions
    const getYesNoBadge = (value: 'Yes' | 'No' | null) => {
        if (value === null) return <Badge variant="outline">N/A</Badge>;
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

    const getCleaningBadge = (value: 'cleaned' | 'uncleaned' | null) => {
        if (value === null) return <Badge variant="outline">N/A</Badge>;
        return (
            <Badge
                variant={value === 'cleaned' ? 'default' : 'secondary'}
                className={
                    value === 'cleaned'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                }
            >
                {value}
            </Badge>
        );
    };

    const getFormBadge = (value: 'filled' | 'not filled' | null) => {
        if (value === null) return <Badge variant="outline">N/A</Badge>;
        return (
            <Badge
                variant={value === 'filled' ? 'default' : 'secondary'}
                className={
                    value === 'filled'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
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

    const filteredUnits = allUnits.filter(unit =>
        unit.unit_name.toLowerCase().includes(tempFilters.unit.toLowerCase())
    );

    const filteredTenants = tenantsData.filter(tenant =>
        tenant.full_name.toLowerCase().includes(tempFilters.tenant.toLowerCase())
    );

    return (
        <AppLayout>
            <Head title="Move-Out Management" />

            <div className="min-h-screen bg-background py-12 text-foreground transition-colors">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Title and Buttons Section - Outside of Card */}
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-foreground">Move-Out Management</h1>
                        <div className="flex items-center gap-2">
                            {/* Export Button */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCSVExport}
                                disabled={isExporting || !moveOuts?.data || moveOuts.data.length === 0}
                                className="flex items-center"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                {isExporting ? 'Exporting...' : 'Export CSV'}
                            </Button>

                            {hasAllPermissions(['move-out.create', 'move-out.store']) && (
                                <Button onClick={() => setIsDrawerOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Move-Out Record
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

                                {/* Placeholder columns for responsive grid */}
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
                                                Property Name
                                            </TableHead>
                                            <TableHead className="sticky left-[270px] z-10 min-w-[120px] border border-border bg-muted text-muted-foreground">
                                                Unit Name
                                            </TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Tenant Name</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Move Out Date</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Lease Status</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">
                                                Lease Ending on Buildium
                                            </TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Keys Location</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">
                                                Utilities Under Our Name
                                            </TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">
                                                Date Utility Put Under Our Name
                                            </TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Walkthrough</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Repairs</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">
                                                Send Back Security Deposit
                                            </TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Notes</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Cleaning</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">List the Unit</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Move Out Form</TableHead>
                                            {hasAnyPermission(['move-out.show', 'move-out.edit', 'move-out.update', 'move-out.destroy']) && (
                                                <TableHead className="border border-border bg-muted text-muted-foreground">Actions</TableHead>
                                            )}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {/* Display data using names - backend provides names via relationships */}
                                        {moveOuts.data.map((moveOut) => (
                                            <TableRow key={moveOut.id} className="border-border hover:bg-muted/50">
                                                <TableCell className="sticky left-0 z-10 border border-border bg-muted text-center font-medium text-foreground">
                                                    {moveOut.city_name || 'N/A'}
                                                </TableCell>
                                                <TableCell className="sticky left-[120px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                                                    {moveOut.property_name || 'N/A'}
                                                </TableCell>
                                                <TableCell className="sticky left-[270px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                                                    {moveOut.units_name || 'N/A'}
                                                </TableCell>
                                                <TableCell className="border border-border text-center text-foreground">
                                                    {moveOut.tenants_name || 'N/A'}
                                                </TableCell>
                                                <TableCell className="border border-border text-center text-foreground">
                                                    {formatDateOnly(moveOut.move_out_date)}
                                                </TableCell>
                                                <TableCell className="border border-border text-center">
                                                    {moveOut.lease_status ? (
                                                        <Badge variant="outline">{moveOut.lease_status}</Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground">N/A</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="border border-border text-center text-foreground">
                                                    {formatDateOnly(moveOut.date_lease_ending_on_buildium)}
                                                </TableCell>
                                                <TableCell className="border border-border text-center text-foreground">
                                                    {moveOut.keys_location || <span className="text-muted-foreground">N/A</span>}
                                                </TableCell>
                                                <TableCell className="border border-border text-center">
                                                    {getYesNoBadge(moveOut.utilities_under_our_name)}
                                                </TableCell>
                                                <TableCell className="border border-border text-center text-foreground">
                                                    {formatDateOnly(moveOut.date_utility_put_under_our_name)}
                                                </TableCell>
                                                <TableCell className="border border-border text-center">
                                                    {moveOut.walkthrough ? (
                                                        <div className="max-w-32 truncate" title={moveOut.walkthrough}>
                                                            {moveOut.walkthrough}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">N/A</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="border border-border text-center">
                                                    {moveOut.repairs ? (
                                                        <div className="max-w-24 truncate" title={moveOut.repairs}>
                                                            {moveOut.repairs}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">N/A</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="border border-border text-center text-foreground">
                                                    {moveOut.send_back_security_deposit || <span className="text-muted-foreground">N/A</span>}
                                                </TableCell>
                                                <TableCell className="border border-border text-center">
                                                    {moveOut.notes ? (
                                                        <div className="max-w-24 truncate" title={moveOut.notes}>
                                                            {moveOut.notes}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">N/A</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="border border-border text-center">
                                                    {getCleaningBadge(moveOut.cleaning)}
                                                </TableCell>
                                                <TableCell className="border border-border text-center text-foreground">
                                                    {moveOut.list_the_unit || <span className="text-muted-foreground">N/A</span>}
                                                </TableCell>
                                                <TableCell className="border border-border text-center">
                                                    {getFormBadge(moveOut.move_out_form)}
                                                </TableCell>
                                                {hasAnyPermission(['move-out.show', 'move-out.edit', 'move-out.update', 'move-out.destroy']) && (
                                                    <TableCell className="border border-border text-center">
                                                        <div className="flex gap-1">
                                                            {hasPermission('move-out.show') && (
                                                                <Link href={route('move-out.show', moveOut.id)}>
                                                                    <Button variant="outline" size="sm">
                                                                        <Eye className="h-4 w-4" />
                                                                    </Button>
                                                                </Link>
                                                            )}
                                                            {hasAllPermissions(['move-out.edit', 'move-out.update']) && (
                                                                <Button variant="outline" size="sm" onClick={() => handleEditClick(moveOut)}>
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            {hasPermission('move-out.destroy') && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleDelete(moveOut)}
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

                            {moveOuts.data.length === 0 && (
                                <div className="py-8 text-center text-muted-foreground">
                                    <p className="text-lg">No move-out records found.</p>
                                    <p className="text-sm">Try adjusting your search criteria.</p>
                                </div>
                            )}

                            {/* Pagination info */}
                            {moveOuts.meta && (
                                <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {moveOuts.meta.from || 0} to {moveOuts.meta.to || 0} of {moveOuts.meta.total || 0} results
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Move-Out Create Drawer - Now uses ID-based lookup maps */}
            <MoveOutCreateDrawer
                cities={cities}
                properties={properties}
                propertiesByCityId={propertiesByCityId}
                unitsByPropertyId={unitsByPropertyId}
                tenantsByUnitId={tenantsByUnitId}
                tenantsData={tenantsData}
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                onSuccess={handleDrawerSuccess}
            />

            {/* Move-Out Edit Drawer - Now uses ID-based lookup maps */}
            {selectedMoveOut && (
                <MoveOutEditDrawer
                    cities={cities}
                    properties={properties}
                    propertiesByCityId={propertiesByCityId}
                    unitsByPropertyId={unitsByPropertyId}
                    tenantsByUnitId={tenantsByUnitId}
                    allUnits={allUnits}
                    tenantsData={tenantsData}
                    moveOut={{
                        ...selectedMoveOut,
                        move_out_date: formatDateForInput(selectedMoveOut.move_out_date),
                        date_lease_ending_on_buildium: formatDateForInput(selectedMoveOut.date_lease_ending_on_buildium),
                        date_utility_put_under_our_name: formatDateForInput(selectedMoveOut.date_utility_put_under_our_name),
                    }}
                    open={isEditDrawerOpen}
                    onOpenChange={setIsEditDrawerOpen}
                    onSuccess={handleEditDrawerSuccess}
                />
            )}
        </AppLayout>
    );
}
