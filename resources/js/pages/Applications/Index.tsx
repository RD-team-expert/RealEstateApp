// resources/js/Pages/Applications/Index.tsx
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePermissions } from '@/hooks/usePermissions';
import AppLayout from '@/layouts/app-layout';
import { Application, ApplicationFilters, PaginatedApplications } from '@/types/application';
import { PageProps } from '@/types/auth';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { ChevronDown, Download, Edit, Eye, Plus, Search, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ApplicationCreateDrawer from './ApplicationCreateDrawer';
import ApplicationEditDrawer from './ApplicationEditDrawer';

// Types for hierarchical data
interface CityData {
    id: number;
    name: string;
}

interface PropertyData {
    id: number;
    name: string;
    city_id: number;
}

interface UnitData {
    id: number;
    name: string;
    property_id: number;
}

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
const exportToCSV = (data: Application[], filename: string = 'applications.csv') => {
    try {
        const formatString = (value: string | null | undefined) => {
            if (value === null || value === undefined) return '';
            return String(value).replace(/"/g, '""');
        };

        const headers = ['ID', 'City', 'Property', 'Unit', 'Name', 'Co-signer', 'Status', 'Date', 'Stage in Progress', 'Notes', 'Attachment Name'];

        const csvData = [
            headers.join(','),
            ...data
                .map((application) => {
                    try {
                        return [
                            application.id || '',
                            `"${formatString(application.city)}"`,
                            `"${formatString(application.property)}"`,
                            `"${formatString(application.unit_name)}"`,
                            `"${formatString(application.name)}"`,
                            `"${formatString(application.co_signer)}"`,
                            `"${formatString(application.status)}"`,
                            `"${formatDateOnly(application.date, '')}"`,
                            `"${formatString(application.stage_in_progress)}"`,
                            `"${formatString(application.notes)}"`,
                            `"${formatString(application.attachment_name)}"`,
                        ].join(',');
                    } catch (rowError) {
                        console.error('Error processing application row:', application, rowError);
                        return '';
                    }
                })
                .filter((row) => row !== ''),
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

interface Props extends PageProps {
    applications: PaginatedApplications;
    filters: ApplicationFilters;
    cities: CityData[];
    properties: Record<string, PropertyData[]>;
    units: Record<string, UnitData[]>;
}

export default function Index({ applications,  cities, properties, units }: Props) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const { flash } = usePage().props;
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

    // Filter states
    const [tempFilters, setTempFilters] = useState({
        city: '',
        property: '',
        unit: '',
        name: '',
    });

    const [searchFilters, setSearchFilters] = useState({
        city: '',
        property: '',
        unit: '',
        name: '',
    });

    // Dropdown states
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
    const [showUnitDropdown, setShowUnitDropdown] = useState(false);

    // Refs for dropdowns
    const cityDropdownRef = useRef<HTMLDivElement>(null);
    const propertyDropdownRef = useRef<HTMLDivElement>(null);
    const unitDropdownRef = useRef<HTMLDivElement>(null);
    const cityInputRef = useRef<HTMLInputElement>(null);
    const propertyInputRef = useRef<HTMLInputElement>(null);
    const unitInputRef = useRef<HTMLInputElement>(null);

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
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleTempFilterChange = (key: string, value: string) => {
        setTempFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleCitySelect = (city: CityData) => {
        handleTempFilterChange('city', city.name);
        setShowCityDropdown(false);
    };

    const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        handleTempFilterChange('city', value);
        setShowCityDropdown(value.length > 0);
    };

    const handlePropertySelect = (property: PropertyData) => {
        handleTempFilterChange('property', property.name);
        setShowPropertyDropdown(false);
    };

    const handlePropertyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        handleTempFilterChange('property', value);
        setShowPropertyDropdown(value.length > 0);
    };

    const handleUnitSelect = (unit: UnitData) => {
        handleTempFilterChange('unit', unit.name);
        setShowUnitDropdown(false);
    };

    const handleUnitInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        handleTempFilterChange('unit', value);
        setShowUnitDropdown(value.length > 0);
    };

    const handleSearchClick = () => {
        setSearchFilters(tempFilters);
        router.get(route('applications.index'), tempFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // const handleSearch = (e: React.FormEvent) => {
    //     e.preventDefault();
    //     handleSearchClick();
    // };

    const handleDelete = (application: Application) => {
        if (confirm('Are you sure you want to delete this application?')) {
            router.delete(route('applications.destroy', application.id));
        }
    };

    const handleCSVExport = () => {
        if (!applications || !applications.data || applications.data.length === 0) {
            alert('No data to export');
            return;
        }

        setIsExporting(true);

        try {
            const filename = `applications-${new Date().toISOString().split('T')[0]}.csv`;
            exportToCSV(applications.data, filename);
            console.log('Export completed successfully');
        } catch (error) {
            console.error('Export failed:', error);
            alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsExporting(false);
        }
    };

    const getStatusBadge = (status: string | null) => {
        if (!status) return <Badge variant="outline">No Status</Badge>;
        return <Badge variant="default">{status}</Badge>;
    };

    const handleDrawerSuccess = () => {
        router.get(route('applications.index'), searchFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        const cleared = {
            city: '',
            property: '',
            unit: '',
            name: '',
        };
        setTempFilters(cleared);
        setSearchFilters(cleared);
        router.get(route('applications.index'), {}, { preserveState: false });
    };

    const handleEditDrawerSuccess = () => {
        router.get(route('applications.index'), searchFilters, {
            preserveState: true,
            preserveScroll: true,
        });
        setIsEditDrawerOpen(false);
        setSelectedApplication(null);
    };

    const handleEditClick = (application: Application) => {
        setSelectedApplication(application);
        setIsEditDrawerOpen(true);
    };

    // Filter data for dropdowns
    const filteredCities = cities.filter((city) => 
        city.name.toLowerCase().includes(tempFilters.city.toLowerCase())
    );

    const allProperties = Object.values(properties).flat();
    const filteredProperties = allProperties.filter((property) => 
        property.name.toLowerCase().includes(tempFilters.property.toLowerCase())
    );

    const allUnits = Object.values(units).flat();
    const filteredUnits = allUnits.filter((unit) =>
        unit.name.toLowerCase().includes(tempFilters.unit.toLowerCase())
    );

    return (
        <AppLayout>
            <Head title="Applications" />
            <div className="min-h-screen bg-background py-12 text-foreground transition-colors">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Flash Messages */}
                    {(flash as any)?.success && (
                        <div className="mb-4 rounded border border-chart-1 bg-chart-1/20 px-4 py-3 text-chart-1">{(flash as any)?.success}</div>
                    )}
                    {(flash as any)?.error && (
                        <div className="mb-4 rounded border border-destructive bg-destructive/20 px-4 py-3 text-destructive">
                            {(flash as any)?.error}
                        </div>
                    )}

                    {/* Title and Buttons Section - Outside of Card */}
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-foreground">Applications</h1>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCSVExport}
                                disabled={isExporting || !applications?.data || applications.data.length === 0}
                                className="flex items-center"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                {isExporting ? 'Exporting...' : 'Export CSV'}
                            </Button>
                            {hasAllPermissions(['applications.create', 'applications.store']) && (
                                <Button onClick={() => setIsDrawerOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Application
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
                                                    {city.name}
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
                                                    {property.name}
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
                                                    {unit.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Application Name Filter */}
                                <Input
                                    type="text"
                                    placeholder="Application Name"
                                    value={tempFilters.name}
                                    onChange={(e) => handleTempFilterChange('name', e.target.value)}
                                    className="text-input-foreground bg-input"
                                />

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
                                                Property
                                            </TableHead>
                                            <TableHead className="sticky left-[270px] z-10 min-w-[120px] border border-border bg-muted text-muted-foreground">
                                                Unit
                                            </TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Name</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Co-signer</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Status</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Date</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Stage</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Note</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Attachment</TableHead>
                                            {hasAnyPermission([
                                                'applications.show',
                                                'applications.edit',
                                                'applications.update',
                                                'applications.destroy',
                                            ]) && <TableHead className="border border-border bg-muted text-muted-foreground">Actions</TableHead>}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {applications.data.map((application) => (
                                            <TableRow key={application.id} className="border-border hover:bg-muted/50">
                                                <TableCell className="sticky left-0 z-10 border border-border bg-muted text-center font-medium text-foreground">
                                                    {application.city}
                                                </TableCell>
                                                <TableCell className="sticky left-[120px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                                                    {application.property}
                                                </TableCell>
                                                <TableCell className="sticky left-[270px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                                                    {application.unit_name}
                                                </TableCell>
                                                <TableCell className="border border-border text-center text-foreground">{application.name}</TableCell>
                                                <TableCell className="border border-border text-center text-foreground">{application.co_signer}</TableCell>
                                                <TableCell className="border border-border text-center">{getStatusBadge(application.status)}</TableCell>
                                                <TableCell className="border border-border text-center text-foreground">{formatDateOnly(application.date)}</TableCell>
                                                <TableCell className="border border-border text-center text-foreground">{application.stage_in_progress || 'N/A'}</TableCell>
                                                <TableCell className="border border-border text-center">
                                                    {application.notes ? (
                                                        <div className="max-w-24 truncate" title={application.notes}>
                                                            {application.notes}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">N/A</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="border border-border text-center">
                                                    {application.attachment_name ? (
                                                        <a
                                                            href={`/applications/${application.id}/download`}
                                                            className="text-sm text-primary hover:underline"
                                                        >
                                                            {application.attachment_name}
                                                        </a>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">No attachment</span>
                                                    )}
                                                </TableCell>
                                                {hasAnyPermission([
                                                    'applications.show',
                                                    'applications.edit',
                                                    'applications.update',
                                                    'applications.destroy',
                                                ]) && (
                                                    <TableCell className="border border-border text-center">
                                                        <div className="flex gap-1">
                                                            {hasPermission('applications.show') && (
                                                                <Link href={route('applications.show', application.id)}>
                                                                    <Button variant="outline" size="sm">
                                                                        <Eye className="h-4 w-4" />
                                                                    </Button>
                                                                </Link>
                                                            )}
                                                            {hasAnyPermission(['applications.edit', 'applications.update']) && (
                                                                <Button 
                                                                    variant="outline" 
                                                                    size="sm"
                                                                    onClick={() => handleEditClick(application)}
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            {hasPermission('applications.destroy') && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleDelete(application)}
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

                            {applications.data.length === 0 && (
                                <div className="py-8 text-center text-muted-foreground">
                                    <p className="text-lg">No applications found.</p>
                                    <p className="text-sm">Try adjusting your search criteria.</p>
                                </div>
                            )}

                            {/* Pagination */}
                            {applications.last_page > 1 && (
                                <div className="mt-6 flex justify-center">
                                    <nav className="flex space-x-2">
                                        {applications.links.map((link, index) => (
                                            <button
                                                key={index}
                                                onClick={() => link.url && router.get(link.url)}
                                                disabled={!link.url}
                                                className={`rounded px-3 py-2 text-sm ${
                                                    link.active
                                                        ? 'bg-primary text-primary-foreground'
                                                        : link.url
                                                          ? 'bg-muted text-foreground hover:bg-accent'
                                                          : 'cursor-not-allowed bg-muted text-muted-foreground'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </nav>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Application Create Drawer */}
            <ApplicationCreateDrawer
                cities={cities}
                properties={properties}
                units={units}
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                onSuccess={handleDrawerSuccess}
            />

            {/* Application Edit Drawer */}
            {selectedApplication && (
                <ApplicationEditDrawer
                    application={selectedApplication}
                    cities={cities}
                    properties={properties}
                    units={units}
                    open={isEditDrawerOpen}
                    onOpenChange={setIsEditDrawerOpen}
                    onSuccess={handleEditDrawerSuccess}
                />
            )}
        </AppLayout>
    );
}