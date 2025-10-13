import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePermissions } from '@/hooks/usePermissions';
import AppLayout from '@/layouts/app-layout';
import { VendorTaskTracker } from '@/types/vendor-task-tracker';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { ChevronDown, Download, Edit, Eye, Plus, Search, Trash2, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import VendorTaskTrackerCreateDrawer from './VendorTaskTrackerCreateDrawer';
import VendorTaskTrackerEditDrawer from './VendorTaskTrackerEditDrawer';

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

// Export utility functions
const exportToCSV = (
    data: VendorTaskTracker[],
    filename: string = 'vendor-tasks.csv',
) => {
    const headers = [
        'ID',
        'City',
        'Property',
        'Unit Name',
        'Vendor Name',
        'Submission Date',
        'Assigned Tasks',
        'Scheduled Visits',
        'Task End Date',
        'Notes',
        'Status',
        'Urgent',
    ];

    const csvData = [
        headers.join(','),
        ...data.map((task) => {
            return [
                task.id,
                `"${task.city || ''}"`,
                `"${task.property_name || ''}"`,
                `"${task.unit_name || ''}"`,
                `"${task.vendor_name || ''}"`,
                `"${formatDateOnly(task.task_submission_date, '')}"`,
                `"${(task.assigned_tasks || '').replace(/"/g, '""')}"`,
                `"${formatDateOnly(task.any_scheduled_visits, '')}"`,
                `"${formatDateOnly(task.task_ending_date, '')}"`,
                `"${(task.notes || '').replace(/"/g, '""')}"`,
                `"${task.status || ''}"`,
                `"${task.urgent}"`,
            ].join(',');
        }),
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
};

// interface DropdownOption {
//     id: number;
//     name: string;
//     city?: string;
//     property_name?: string;
// }

interface CityOption {
    id: number;
    city: string;
}

interface PropertyOption {
    id: number;
    property_name: string;
    city?: string;
}

interface UnitOption {
    id: number;
    unit_name: string;
    property_name?: string;
    city?: string;
}

interface VendorOption {
    id: number;
    vendor_name: string;
    city?: string;
}

interface Props {
    tasks: {
        data: VendorTaskTracker[];
        links: any[];
        meta: any;
    };
    filters: {
        search?: string;
        city?: string;
        property?: string;
        unit_name?: string;
        vendor_name?: string;
    };
    cities: CityOption[];
    properties: PropertyOption[];
    units: UnitOption[];
    vendors: VendorOption[];
    unitsByCity: Record<string, UnitOption[]>;
    propertiesByCity: Record<string, PropertyOption[]>;
    unitsByProperty: Record<string, Record<string, UnitOption[]>>;
    vendorsByCity: Record<string, VendorOption[]>;
}

export default function Index({
    tasks,
    filters,
    units,
    cities,
    properties,
    unitsByCity,
    propertiesByCity,
    unitsByProperty,
    vendorsByCity,
    vendors,
}: Props) {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

    // Filter states
    const [tempFilters, setTempFilters] = useState(filters);
    const [isExporting, setIsExporting] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<VendorTaskTracker | null>(null);

    // City autocomplete states
    const [cityInput, setCityInput] = useState(filters.city || '');
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [filteredCities, setFilteredCities] = useState<CityOption[]>([]);
    const cityInputRef = useRef<HTMLInputElement>(null);
    const cityDropdownRef = useRef<HTMLDivElement>(null);

    // Property autocomplete states
    const [propertyInput, setPropertyInput] = useState(filters.property || '');
    const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
    const propertyInputRef = useRef<HTMLInputElement>(null);
    const propertyDropdownRef = useRef<HTMLDivElement>(null);

    // Vendor autocomplete states
    const [vendorInput, setVendorInput] = useState(filters.vendor_name || '');
    const [showVendorDropdown, setShowVendorDropdown] = useState(false);
    const vendorInputRef = useRef<HTMLInputElement>(null);
    const vendorDropdownRef = useRef<HTMLDivElement>(null);

    // Filter cities based on input
    useEffect(() => {
        if (!cities) return;

        if (cityInput.trim() === '') {
            setFilteredCities(cities);
        } else {
            const filtered = cities.filter((city) => 
                city.city.toLowerCase().includes(cityInput.toLowerCase())
            );
            setFilteredCities(filtered);
        }
    }, [cityInput, cities]);

    // Filter properties based on input
    const filteredProperties = properties?.filter((property) => 
        property.property_name.toLowerCase().includes(propertyInput.toLowerCase())
    ) || [];

    // Filter vendors based on input
    const filteredVendors = vendors?.filter((vendor) => 
        vendor.vendor_name.toLowerCase().includes(vendorInput.toLowerCase())
    ) || [];

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
                vendorDropdownRef.current &&
                !vendorDropdownRef.current.contains(event.target as Node) &&
                vendorInputRef.current &&
                !vendorInputRef.current.contains(event.target as Node)
            ) {
                setShowVendorDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDrawerSuccess = () => {
        // Refresh the page data after successful creation
        router.reload();
        setIsDrawerOpen(false);
    };

    const handleEditDrawerSuccess = () => {
        // Refresh the page data after successful edit
        router.reload();
        setIsEditDrawerOpen(false);
        setSelectedTask(null);
    };

    const handleEditTask = (task: VendorTaskTracker) => {
        setSelectedTask(task);
        setIsEditDrawerOpen(true);
    };

    const handleTempFilterChange = (key: keyof typeof tempFilters, value: string) => {
        setTempFilters({ ...tempFilters, [key]: value });
    };

    const handleCitySelect = (city: string) => {
        setCityInput(city);
        handleTempFilterChange('city', city);
        setShowCityDropdown(false);
    };

    const handleCityInputChange = (value: string) => {
        setCityInput(value);
        handleTempFilterChange('city', value);
        setShowCityDropdown(true);
    };

    const handlePropertyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPropertyInput(value);
        handleTempFilterChange('property', value);
        setShowPropertyDropdown(value.length > 0);
    };

    const handlePropertySelect = (property: PropertyOption) => {
        setPropertyInput(property.property_name);
        handleTempFilterChange('property', property.property_name);
        setShowPropertyDropdown(false);
    };

    const handleVendorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setVendorInput(value);
        handleTempFilterChange('vendor_name', value);
        setShowVendorDropdown(value.length > 0);
    };

    const handleVendorSelect = (vendor: VendorOption) => {
        setVendorInput(vendor.vendor_name);
        handleTempFilterChange('vendor_name', vendor.vendor_name);
        setShowVendorDropdown(false);
    };

    const handleSearchClick = () => {
        // Convert filters to a plain object
        const filterParams: Record<string, string> = {};
        Object.entries(tempFilters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                filterParams[key] = String(value);
            }
        });

        router.get(route('vendor-task-tracker.index'), filterParams, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        // Clear all filter states
        setTempFilters({});
        setCityInput('');
        setPropertyInput('');
        setVendorInput('');
        
        // Close all dropdowns
        setShowCityDropdown(false);
        setShowPropertyDropdown(false);
        setShowVendorDropdown(false);

        // Navigate to the page with no filters
        router.get(route('vendor-task-tracker.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // const handleSearch = (e: React.FormEvent) => {
    //     e.preventDefault();
    //     handleSearchClick();
    // };

    const handleDelete = (task: VendorTaskTracker) => {
        if (confirm('Are you sure you want to archive this task?')) {
            router.delete(route('vendor-task-tracker.destroy', task.id));
        }
    };

    const handleCSVExport = () => {
        if (tasks.data.length === 0) {
            alert('No data to export');
            return;
        }

        setIsExporting(true);
        try {
            const filename = `vendor-tasks-${new Date().toISOString().split('T')[0]}.csv`;
            exportToCSV(tasks.data, filename);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    const getUrgentBadge = (urgent: 'Yes' | 'No') => {
        return <Badge variant={urgent === 'Yes' ? 'destructive' : 'secondary'}>{urgent}</Badge>;
    };

    // Fixed: Handle undefined values by converting to null
    const getStatusBadge = (status: string | null | undefined) => {
        const normalizedStatus = status ?? null; // Convert undefined to null
        
        if (!normalizedStatus) return <Badge variant="outline">No Status</Badge>;

        const variant = normalizedStatus.toLowerCase().includes('completed') 
            ? 'default' 
            : normalizedStatus.toLowerCase().includes('pending') 
            ? 'secondary' 
            : 'outline';

        return <Badge variant={variant}>{normalizedStatus}</Badge>;
    };

    return (
        <AppLayout>
            <Head title="Vendor Task Tracker" />

            <div className="min-h-screen bg-background py-12 text-foreground transition-colors">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Title and Buttons Section */}
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-foreground">Vendor Task Tracker</h1>
                        <div className="flex items-center gap-2">
                            {/* Export Button */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCSVExport}
                                disabled={isExporting || tasks.data.length === 0}
                                className="flex items-center"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                {isExporting ? 'Exporting...' : 'Export CSV'}
                            </Button>

                            {hasAllPermissions(['vendor-task-tracker.create', 'vendor-task-tracker.store']) && (
                                <Button onClick={() => setIsDrawerOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Task
                                </Button>
                            )}
                        </div>
                    </div>

                    <Card className="bg-card text-card-foreground shadow-lg">
                        <CardHeader>
                            {/* Filters */}
                            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-6">
                                {/* City Filter with Autocomplete */}
                                <div className="relative">
                                    <Input
                                        ref={cityInputRef}
                                        type="text"
                                        placeholder="Filter by City"
                                        value={cityInput}
                                        onChange={(e) => handleCityInputChange(e.target.value)}
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
                                                    onClick={() => handleCitySelect(city.city)}
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
                                        placeholder="Filter by Property"
                                        value={propertyInput}
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
                                                    {property.city && (
                                                        <span className="ml-2 text-xs text-muted-foreground">
                                                            ({property.city})
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Unit Name Filter */}
                                <Input
                                    type="text"
                                    placeholder="Filter by Unit"
                                    value={tempFilters.unit_name || ''}
                                    onChange={(e) => handleTempFilterChange('unit_name', e.target.value)}
                                    className="text-input-foreground bg-input"
                                />

                                {/* Vendor Filter with Autocomplete */}
                                <div className="relative">
                                    <Input
                                        ref={vendorInputRef}
                                        type="text"
                                        placeholder="Filter by Vendor"
                                        value={vendorInput}
                                        onChange={handleVendorInputChange}
                                        onFocus={() => setShowVendorDropdown(true)}
                                        className="text-input-foreground bg-input pr-8"
                                    />
                                    <ChevronDown className="absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                                    {showVendorDropdown && filteredVendors.length > 0 && (
                                        <div
                                            ref={vendorDropdownRef}
                                            className="absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-input bg-popover shadow-lg"
                                        >
                                            {filteredVendors.map((vendor) => (
                                                <div
                                                    key={vendor.id}
                                                    className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                                    onClick={() => handleVendorSelect(vendor)}
                                                >
                                                    {vendor.vendor_name}
                                                    {vendor.city && (
                                                        <span className="ml-2 text-xs text-muted-foreground">
                                                            ({vendor.city})
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* General Search Filter */}
                                {/* <Input
                                    type="text"
                                    placeholder="Search all fields"
                                    value={tempFilters.search || ''}
                                    onChange={(e) => handleTempFilterChange('search', e.target.value)}
                                    className="text-input-foreground bg-input"
                                /> */}

                                {/* Search Button */}
                                <Button onClick={handleSearchClick} variant="default" className="flex items-center">
                                    <Search className="mr-2 h-4 w-4" />
                                    Search
                                </Button>

                                {/* Clear Filters Button */}
                                <Button onClick={handleClearFilters} variant="outline" className="flex items-center">
                                    <X className="mr-2 h-4 w-4" />
                                    Clear
                                </Button>
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
                                                Unit Name
                                            </TableHead>
                                            <TableHead className="sticky left-[390px] z-10 min-w-[120px] border border-border bg-muted text-muted-foreground">
                                                Vendor Name
                                            </TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Submission Date</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Assigned Tasks</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Scheduled Visits</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Task End Date</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Notes</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Status</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Urgent</TableHead>
                                            {hasAnyPermission([
                                                'vendor-task-tracker.show',
                                                'vendor-task-tracker.edit',
                                                'vendor-task-tracker.update',
                                                'vendor-task-tracker.destroy',
                                            ]) && <TableHead className="border border-border bg-muted text-muted-foreground">Actions</TableHead>}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tasks.data.map((task) => (
                                            <TableRow key={task.id} className="border-border hover:bg-muted/50">
                                                <TableCell className="sticky left-0 z-10 border border-border bg-muted text-center font-medium text-foreground">
                                                    {task.city || '-'}
                                                </TableCell>
                                                <TableCell className="sticky left-[120px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                                                    {task.property_name || '-'}
                                                </TableCell>
                                                <TableCell className="sticky left-[270px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                                                    {task.unit_name || '-'}
                                                </TableCell>
                                                <TableCell className="sticky left-[390px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                                                    {task.vendor_name || '-'}
                                                </TableCell>
                                                <TableCell className="border border-border text-center text-foreground">
                                                    {formatDateOnly(task.task_submission_date)}
                                                </TableCell>
                                                <TableCell className="border border-border text-center text-foreground">
                                                    <div className="max-w-32 truncate" title={task.assigned_tasks || ''}>
                                                        {task.assigned_tasks || '-'}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="border border-border text-center text-foreground">
                                                    {formatDateOnly(task.any_scheduled_visits)}
                                                </TableCell>
                                                <TableCell className="border border-border text-center text-foreground">
                                                    {formatDateOnly(task.task_ending_date)}
                                                </TableCell>
                                                <TableCell className="border border-border text-center text-foreground">
                                                    <div className="max-w-24 truncate" title={task.notes || ''}>
                                                        {task.notes || '-'}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="border border-border text-center">{getStatusBadge(task.status)}</TableCell>
                                                <TableCell className="border border-border text-center">{getUrgentBadge(task.urgent)}</TableCell>
                                                {hasAnyPermission([
                                                    'vendor-task-tracker.show',
                                                    'vendor-task-tracker.edit',
                                                    'vendor-task-tracker.update',
                                                    'vendor-task-tracker.destroy',
                                                ]) && (
                                                    <TableCell className="border border-border text-center">
                                                        <div className="flex gap-1">
                                                            {hasPermission('vendor-task-tracker.show') && (
                                                                <Link href={route('vendor-task-tracker.show', task.id)}>
                                                                    <Button variant="outline" size="sm">
                                                                        <Eye className="h-4 w-4" />
                                                                    </Button>
                                                                </Link>
                                                            )}
                                                            {hasAllPermissions(['vendor-task-tracker.edit', 'vendor-task-tracker.update']) && (
                                                                <Button variant="outline" size="sm" onClick={() => handleEditTask(task)}>
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            {hasPermission('vendor-task-tracker.destroy') && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleDelete(task)}
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

                            {tasks.data.length === 0 && (
                                <div className="py-8 text-center text-muted-foreground">
                                    <p className="text-lg">No tasks found matching your criteria.</p>
                                    <p className="text-sm">Try adjusting your search filters or clearing them to see all tasks.</p>
                                </div>
                            )}

                            {/* Pagination info */}
                            {tasks.meta && (
                                <div className="mt-4 text-center text-sm text-muted-foreground">
                                    Showing {tasks.meta.from || 0} to {tasks.meta.to || 0} of {tasks.meta.total || 0} results
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Vendor Task Tracker Create Drawer */}
            <VendorTaskTrackerCreateDrawer
                cities={cities}
                properties={properties}
                units={units}
                vendors={vendors}
                unitsByCity={unitsByCity}
                propertiesByCity={propertiesByCity}
                unitsByProperty={unitsByProperty}
                vendorsByCity={vendorsByCity}
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                onSuccess={handleDrawerSuccess}
            />

            {/* Vendor Task Tracker Edit Drawer */}
            {selectedTask && (
                <VendorTaskTrackerEditDrawer
                    task={selectedTask}
                    cities={cities}
                    properties={properties}
                    units={units}
                    vendors={vendors}
                    unitsByCity={unitsByCity}
                    propertiesByCity={propertiesByCity}
                    unitsByProperty={unitsByProperty}
                    vendorsByCity={vendorsByCity}
                    open={isEditDrawerOpen}
                    onOpenChange={setIsEditDrawerOpen}
                    onSuccess={handleEditDrawerSuccess}
                />
            )}
        </AppLayout>
    );
}
