import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePermissions } from '@/hooks/usePermissions';
import AppLayout from '@/layouts/app-layout';
import { City } from '@/types/City';
import { MoveIn } from '@/types/move-in';
import { PropertyInfoWithoutInsurance } from '@/types/PropertyInfoWithoutInsurance';
import { Head, router } from '@inertiajs/react';
import { Download, Edit, Plus, Search, Trash2 } from 'lucide-react';
import React, { useRef, useState } from 'react';
import MoveInCreateDrawer from './MoveInCreateDrawer';
import MoveInEditDrawer from './MoveInEditDrawer';

// CSV Export utility function
const exportToCSV = (
    data: MoveIn[],
    filename: string = 'move-ins.csv',
    cities: City[],
    properties: PropertyInfoWithoutInsurance[],
    unitsByProperty: Record<string, string[]>,
) => {
    try {
        const formatDate = (dateStr: string | null | undefined) => {
            if (!dateStr) return '';
            try {
                return new Date(dateStr).toLocaleDateString();
            } catch (error) {
                return dateStr || '';
            }
        };

        const formatString = (value: string | null | undefined) => {
            if (value === null || value === undefined) return '';
            return String(value).replace(/"/g, '""');
        };

        // Helper function to get city name from unit name
        const getCityNameFromUnit = (unitName: string) => {
            for (const [propertyId, unitNames] of Object.entries(unitsByProperty)) {
                if (unitNames.includes(unitName)) {
                    const property = properties.find((p) => p.id.toString() === propertyId);
                    if (property) {
                        const city = cities.find((c) => c.id === property.city_id);
                        return city?.city || 'N/A';
                    }
                }
            }
            return 'N/A';
        };

        // Helper function to get property name from unit name
        const getPropertyNameFromUnit = (unitName: string) => {
            for (const [propertyId, unitNames] of Object.entries(unitsByProperty)) {
                if (unitNames.includes(unitName)) {
                    const property = properties.find((p) => p.id.toString() === propertyId);
                    return property?.property_name || 'N/A';
                }
            }
            return 'N/A';
        };

        const headers = [
            'ID',
            'City',
            'Property Name',
            'Unit Name',
            'Signed Lease',
            'Lease Signing Date',
            'Move-In Date',
            'Paid Security & First Month',
            'Scheduled Payment Date',
            'Handled Keys',
            'Move in form sent On',
            'Filled Move-In Form',
            'Date of move in form filled in',
            'Submitted Insurance',
            'Date of Insurance expiration',
        ];

        const csvData = [
            headers.join(','),
            ...data
                .map((moveIn) => {
                    try {
                        return [
                            moveIn.id || '',
                            `"${formatString(getCityNameFromUnit(moveIn.unit_name))}"`,
                            `"${formatString(getPropertyNameFromUnit(moveIn.unit_name))}"`,
                            `"${formatString(moveIn.unit_name)}"`,
                            `"${formatString(moveIn.signed_lease)}"`,
                            `"${formatDate(moveIn.lease_signing_date)}"`,
                            `"${formatDate(moveIn.move_in_date)}"`,
                            `"${formatString(moveIn.paid_security_deposit_first_month_rent)}"`,
                            `"${formatDate(moveIn.scheduled_paid_time)}"`,
                            `"${formatString(moveIn.handled_keys)}"`,
                            `"${formatDate(moveIn.move_in_form_sent_date)}"`,
                            `"${formatString(moveIn.filled_move_in_form)}"`,
                            `"${formatDate(moveIn.date_of_move_in_form_filled)}"`,
                            `"${formatString(moveIn.submitted_insurance)}"`,
                            `"${formatDate(moveIn.date_of_insurance_expiration)}"`,
                        ].join(',');
                    } catch (rowError) {
                        console.error('Error processing move-in row:', moveIn, rowError);
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
    moveIns: {
        data: MoveIn[];
        links: any[];
        meta: any;
    };
    search: string | null;
    units: string[];
    cities: City[];
    properties: PropertyInfoWithoutInsurance[];
    unitsByProperty: Record<string, string[]>;
}

export default function Index({ moveIns, search, units, cities, properties, unitsByProperty }: Props) {
    const [searchTerm, setSearchTerm] = useState(search || '');
    const [isExporting, setIsExporting] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    const [selectedMoveIn, setSelectedMoveIn] = useState<MoveIn | null>(null);

    // Filter states
    const [tempFilters, setTempFilters] = useState({
        city: '',
        property: '',
        search: search || '',
    });
    const [filters, setFilters] = useState({
        city: '',
        property: '',
        search: search || '',
    });

    // Dropdown states
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);

    // Refs for dropdown management
    const cityInputRef = useRef<HTMLInputElement>(null);
    const propertyInputRef = useRef<HTMLInputElement>(null);

    // Filter cities based on input
    const filteredCities = cities.filter((city) => city.city.toLowerCase().includes(tempFilters.city.toLowerCase()));

    // Filter properties based on input
    const filteredProperties = properties.filter((property) => property.property_name.toLowerCase().includes(tempFilters.property.toLowerCase()));

    // Helper function to get city name from unit name
    const getCityNameFromUnit = (unitName: string) => {
        for (const [propertyId, unitNames] of Object.entries(unitsByProperty)) {
            if (unitNames.includes(unitName)) {
                const property = properties.find((p) => p.id.toString() === propertyId);
                if (property) {
                    const city = cities.find((c) => c.id === property.city_id);
                    return city?.city || 'N/A';
                }
            }
        }
        return 'N/A';
    };

    // Helper function to get property name from unit name
    const getPropertyNameFromUnit = (unitName: string) => {
        for (const [propertyId, unitNames] of Object.entries(unitsByProperty)) {
            if (unitNames.includes(unitName)) {
                const property = properties.find((p) => p.id.toString() === propertyId);
                return property?.property_name || 'N/A';
            }
        }
        return 'N/A';
    };

    const handleTempFilterChange = (key: string, value: string) => {
        setTempFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleSearchClick = () => {
        setFilters(tempFilters);
        const params: any = {};
        if (tempFilters.search) params.search = tempFilters.search;
        if (tempFilters.city) params.city = tempFilters.city;
        if (tempFilters.property) params.property = tempFilters.property;

        router.get(route('move-in.index'), params, { preserveState: true });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearchClick();
    };

    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

    const handleDelete = (moveIn: MoveIn) => {
        if (confirm('Are you sure you want to delete this move-in record?')) {
            router.delete(route('move-in.destroy', moveIn.id));
        }
    };

    const handleCSVExport = () => {
        if (!moveIns || !moveIns.data || moveIns.data.length === 0) {
            alert('No data to export');
            return;
        }

        setIsExporting(true);

        try {
            console.log('Exporting move-in data:', moveIns.data); // Debug log
            const filename = `move-ins-${new Date().toISOString().split('T')[0]}.csv`;
            exportToCSV(moveIns.data, filename, cities, properties, unitsByProperty);

            // Success feedback
            console.log('Export completed successfully');
        } catch (error) {
            console.error('Export failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            alert(`Export failed: ${errorMessage}. Please check the console for details.`);
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

    const handleEdit = (moveIn: MoveIn) => {
        setSelectedMoveIn(moveIn);
        setIsEditDrawerOpen(true);
    };

    const formatDateUTC = (dateStr?: string | null) => {
        if (!dateStr) return 'N/A';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return 'N/A';
        return new Intl.DateTimeFormat(undefined, {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            timeZone: 'UTC',
        }).format(d);
    };

    const getYesNoBadge = (value: 'Yes' | 'No' | null) => {
        if (value === null) return <Badge variant="outline">N/A</Badge>;
        return (
            <Badge
                variant={value === 'Yes' ? 'default' : 'secondary'}
                className={
                    value === 'Yes'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                }
            >
                {value}
            </Badge>
        );
    };

    return (
        <AppLayout>
            <Head title="Move-In Management" />

            <div className="min-h-screen bg-background py-12 text-foreground transition-colors">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Title and Buttons Section */}
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-foreground">Move-In Management</h1>
                        <div className="flex items-center gap-2">
                            {/* Export Button */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCSVExport}
                                disabled={isExporting || !moveIns?.data || moveIns.data.length === 0}
                                className="flex items-center"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                {isExporting ? 'Exporting...' : 'Export CSV'}
                            </Button>

                            {hasAllPermissions(['move-in.create', 'move-in.store']) && (
                                <Button onClick={() => setIsDrawerOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Move-In Record
                                </Button>
                            )}
                        </div>
                    </div>

                    <Card className="bg-card text-card-foreground shadow-lg">
                        <CardHeader>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                {/* City Filter */}
                                <div className="relative">
                                    <Input
                                        ref={cityInputRef}
                                        type="text"
                                        placeholder="City"
                                        value={tempFilters.city}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            handleTempFilterChange('city', value);
                                            setShowCityDropdown(value.length > 0);
                                        }}
                                        onFocus={() => setShowCityDropdown(tempFilters.city.length > 0)}
                                        className="text-input-foreground bg-input"
                                    />
                                    {showCityDropdown && filteredCities.length > 0 && (
                                        <div className="absolute top-full right-0 left-0 z-50 mb-1 max-h-60 overflow-auto rounded-md border border-input bg-popover shadow-lg">
                                            {filteredCities.map((city) => (
                                                <div
                                                    key={city.id}
                                                    className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                                    onClick={() => {
                                                        handleTempFilterChange('city', city.city);
                                                        setShowCityDropdown(false);
                                                    }}
                                                >
                                                    {city.city}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Property Filter */}
                                <div className="relative">
                                    <Input
                                        ref={propertyInputRef}
                                        type="text"
                                        placeholder="Property Name"
                                        value={tempFilters.property}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            handleTempFilterChange('property', value);
                                            setShowPropertyDropdown(value.length > 0);
                                        }}
                                        onFocus={() => setShowPropertyDropdown(tempFilters.property.length > 0)}
                                        className="text-input-foreground bg-input"
                                    />
                                    {showPropertyDropdown && filteredProperties.length > 0 && (
                                        <div className="absolute top-full right-0 left-0 z-50 mb-1 max-h-60 overflow-auto rounded-md border border-input bg-popover shadow-lg">
                                            {filteredProperties.map((property) => (
                                                <div
                                                    key={property.id}
                                                    className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                                    onClick={() => {
                                                        handleTempFilterChange('property', property.property_name);
                                                        setShowPropertyDropdown(false);
                                                    }}
                                                >
                                                    {property.property_name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Search Filter */}
                                <div className="flex gap-2 md:col-span-2">
                                    <Input
                                        type="text"
                                        placeholder="Search by unit name..."
                                        value={tempFilters.search}
                                        onChange={(e) => handleTempFilterChange('search', e.target.value)}
                                        className="text-input-foreground flex-1 bg-input"
                                    />
                                    <Button type="button" onClick={handleSearchClick} size="sm">
                                        <Search className="h-4 w-4" />
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
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Signed Lease</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Lease Signing Date</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Move-In Date</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">
                                                Paid Security & First Month
                                            </TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">
                                                Scheduled Payment Date
                                            </TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Handled Keys</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">
                                                Move in form sent On
                                            </TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Filled Move-In Form</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">
                                                Date of move in form filled in
                                            </TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Submitted Insurance</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">
                                                Date of Insurance expiration
                                            </TableHead>
                                            {hasAnyPermission(['move-in.show', 'move-in.edit', 'move-in.update', 'move-in.destroy']) && (
                                                <TableHead className="border border-border bg-muted text-muted-foreground">Actions</TableHead>
                                            )}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {moveIns.data.map((moveIn) => (
                                            <TableRow key={moveIn.id} className="border-border hover:bg-muted/50">
                                                <TableCell className="sticky left-0 z-10 border border-border bg-muted text-center font-medium text-foreground">
                                                    {getCityNameFromUnit(moveIn.unit_name)}
                                                </TableCell>
                                                <TableCell className="sticky left-[120px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                                                    {getPropertyNameFromUnit(moveIn.unit_name)}
                                                </TableCell>
                                                <TableCell className="sticky left-[270px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                                                    {moveIn.unit_name}
                                                </TableCell>
                                                <TableCell className="border border-border text-center">
                                                    {getYesNoBadge(moveIn.signed_lease)}
                                                </TableCell>
                                                <TableCell className="border border-border text-center text-foreground">
                                                    {formatDateUTC(moveIn.lease_signing_date)}
                                                </TableCell>
                                                <TableCell className="border border-border text-center text-foreground">
                                                    {formatDateUTC(moveIn.move_in_date)}
                                                </TableCell>
                                                <TableCell className="border border-border text-center">
                                                    {getYesNoBadge(moveIn.paid_security_deposit_first_month_rent)}
                                                </TableCell>
                                                <TableCell className="border border-border text-center text-foreground">
                                                    {formatDateUTC(moveIn.scheduled_paid_time)}
                                                </TableCell>
                                                <TableCell className="border border-border text-center">
                                                    {getYesNoBadge(moveIn.handled_keys)}
                                                </TableCell>
                                                <TableCell className="border border-border text-center text-foreground">
                                                    {formatDateUTC(moveIn.move_in_form_sent_date)}
                                                </TableCell>
                                                <TableCell className="border border-border text-center">
                                                    {getYesNoBadge(moveIn.filled_move_in_form)}
                                                </TableCell>
                                                <TableCell className="border border-border text-center text-foreground">
                                                    {formatDateUTC(moveIn.date_of_move_in_form_filled)}
                                                </TableCell>
                                                <TableCell className="border border-border text-center">
                                                    {getYesNoBadge(moveIn.submitted_insurance)}
                                                </TableCell>
                                                <TableCell className="border border-border text-center text-foreground">
                                                    {formatDateUTC(moveIn.date_of_insurance_expiration)}
                                                </TableCell>
                                                {hasAnyPermission(['move-in.show', 'move-in.edit', 'move-in.update', 'move-in.destroy']) && (
                                                    <TableCell className="border border-border text-center">
                                                        <div className="flex gap-1">
                                                            {/* {hasPermission('move-in.show') && (
                                                        <Link href={route('move-in.show', moveIn.id)}>
                                                            <Button variant="outline" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>)} */}
                                                            {hasAllPermissions(['move-in.edit', 'move-in.update']) && (
                                                                <Button variant="outline" size="sm" onClick={() => handleEdit(moveIn)}>
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            {hasPermission('move-in.destroy') && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleDelete(moveIn)}
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

                            {moveIns.data.length === 0 && (
                                <div className="py-8 text-center text-muted-foreground">
                                    <p className="text-lg">No move-in records found.</p>
                                    <p className="text-sm">Try adjusting your search criteria.</p>
                                </div>
                            )}

                            {/* Pagination info */}
                            {moveIns.meta && (
                                <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {moveIns.meta.from || 0} to {moveIns.meta.to || 0} of {moveIns.meta.total || 0} results
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Move-In Create Drawer */}
            <MoveInCreateDrawer
                units={units}
                cities={cities}
                properties={properties}
                unitsByProperty={unitsByProperty}
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                onSuccess={handleDrawerSuccess}
            />

            {/* Move-In Edit Drawer */}
            {selectedMoveIn && (
                <MoveInEditDrawer
                    moveIn={selectedMoveIn}
                    units={units}
                    cities={cities}
                    properties={properties}
                    unitsByProperty={unitsByProperty}
                    open={isEditDrawerOpen}
                    onOpenChange={setIsEditDrawerOpen}
                    onSuccess={handleEditDrawerSuccess}
                />
            )}
        </AppLayout>
    );
}
