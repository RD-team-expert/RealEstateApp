import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePermissions } from '@/hooks/usePermissions';
import AppLayout from '@/layouts/app-layout';
import { PageProps, PaginatedVendors, VendorFilters, VendorInfo, VendorStatistics } from '@/types/vendor';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Download, Edit, Plus, Search, Trash2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import VendorCreateDrawer from './VendorCreateDrawer';
import VendorEditDrawer from './VendorEditDrawer';

// CSV Export utility function
const exportToCSV = (data: VendorInfo[], filename: string = 'vendors.csv') => {
    const headers = ['ID', 'City', 'Vendor Name', 'Number', 'Email', 'Service Type'];

    const csvData = [
        headers.join(','),
        ...data.map((vendor) =>
            [
                vendor.id,
                `"${vendor.city}"`,
                `"${vendor.vendor_name}"`,
                `"${vendor.number || ''}"`,
                `"${vendor.email || ''}"`,
                `"${vendor.service_type}"`,
            ].join(','),
        ),
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

interface Props extends PageProps {
    vendors: PaginatedVendors;
    statistics: VendorStatistics;
    filters: VendorFilters;
    cities: Array<{ id: number; city: string }>;
}

export default function Index({ auth, vendors, statistics, filters, cities }: Props) {
    const [searchFilters, setSearchFilters] = useState<VendorFilters>(filters);
    const [isExporting, setIsExporting] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState<VendorInfo | null>(null);
    const { flash } = usePage().props;
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

    // New filter states matching Tenants page
    const [tempFilters, setTempFilters] = useState({
        city: filters.city || '',
        vendor_name: filters.vendor_name || '',
    });

    // Dropdown states
    const [showCityDropdown, setShowCityDropdown] = useState(false);

    // Refs for dropdowns
    const cityDropdownRef = useRef<HTMLDivElement>(null);

    // Handle clicks outside dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
                setShowCityDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleTempFilterChange = (key: string, value: string) => {
        setTempFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        handleTempFilterChange('city', value);
        setShowCityDropdown(value.length > 0);
    };

    const handleCitySelect = (city: { id: number; city: string }) => {
        handleTempFilterChange('city', city.city);
        setShowCityDropdown(false);
    };

    const handleSearchClick = () => {
        const newFilters = { ...tempFilters };
        setSearchFilters(newFilters);
        router.get(route('vendors.index'), newFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleFilterChange = (key: keyof VendorFilters, value: string) => {
        const newFilters = { ...searchFilters, [key]: value };
        setSearchFilters(newFilters);
        router.get(route('vendors.index'), newFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleExport = () => {
        if (vendors.data.length === 0) {
            alert('No data to export');
            return;
        }

        setIsExporting(true);
        try {
            const filename = `vendors-${new Date().toISOString().split('T')[0]}.csv`;
            exportToCSV(vendors.data, filename);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    const handleDelete = (vendor: VendorInfo) => {
        if (confirm('Are you sure you want to delete this vendor?')) {
            router.delete(route('vendors.destroy', vendor.id));
        }
    };

    const handleDrawerSuccess = () => {
        router.reload();
    };

    const handleEditVendor = (vendor: VendorInfo) => {
        setSelectedVendor(vendor);
        setIsEditDrawerOpen(true);
    };

    const handleEditDrawerSuccess = () => {
        router.reload();
    };

    return (
        <AppLayout >
            <Head title="Vendors" />

            <div className="py-12">
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

                    {/* Title and Buttons - Outside Card */}
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900">Vendor List</h1>
                        <div className="flex gap-2">
                            {hasPermission('vendor.export') && (
                                <Button onClick={handleExport} disabled={isExporting} variant="outline" className="flex items-center gap-2">
                                    <Download className="h-4 w-4" />
                                    {isExporting ? 'Exporting...' : 'Export CSV'}
                                </Button>
                            )}
                            {hasAllPermissions(['vendors.create', 'vendors.store']) && (
                                <Button onClick={() => setIsDrawerOpen(true)} className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add Vendor
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Main Card with Filters and Table */}
                    <Card>
                        <CardContent className="p-6">
                            {/* Filters */}
                            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                                {/* City Filter with Dropdown */}
                                <div className="relative" ref={cityDropdownRef}>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">City</label>
                                    <Input
                                        type="text"
                                        placeholder="Select or type city..."
                                        value={tempFilters.city}
                                        onChange={handleCityInputChange}
                                        onFocus={() => setShowCityDropdown(true)}
                                        className="w-full"
                                    />
                                    {showCityDropdown && cities && cities.length > 0 && (
                                        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white shadow-lg">
                                            {cities
                                                .filter((city) => city.city.toLowerCase().includes(tempFilters.city.toLowerCase()))
                                                .map((city) => (
                                                    <div
                                                        key={city.id}
                                                        className="cursor-pointer px-3 py-2 text-sm hover:bg-gray-100"
                                                        onClick={() => handleCitySelect(city)}
                                                    >
                                                        {city.city}
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </div>

                                {/* Vendor Name Filter */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Vendor Name</label>
                                    <Input
                                        type="text"
                                        placeholder="Enter vendor name..."
                                        value={tempFilters.vendor_name}
                                        onChange={(e) => handleTempFilterChange('vendor_name', e.target.value)}
                                        className="w-full"
                                    />
                                </div>

                                {/* Search Button */}
                                <div className="flex items-end">
                                    <Button onClick={handleSearchClick} className="flex w-full items-center justify-center gap-2">
                                        <Search className="h-4 w-4" />
                                        Search
                                    </Button>
                                </div>
                            </div>

                            {/* Table with Sticky Columns and Borders */}
                            <div className="overflow-x-auto rounded-lg border border-gray-200">
                                <Table className="min-w-full">
                                    <TableHeader>
                                        <TableRow className="border-b border-gray-200 bg-gray-50">
                                            <TableHead className="sticky left-0 z-10 border-r border-gray-200 bg-gray-50 px-4 py-3 text-center font-semibold text-gray-900">
                                                City
                                            </TableHead>
                                            <TableHead className="sticky left-[120px] z-10 border-r border-gray-200 bg-gray-50 px-4 py-3 text-center font-semibold text-gray-900">
                                                Vendor Name
                                            </TableHead>
                                            <TableHead className="border-r border-gray-200 px-4 py-3 text-center font-semibold text-gray-900">
                                                Phone Number
                                            </TableHead>
                                            <TableHead className="border-r border-gray-200 px-4 py-3 text-center font-semibold text-gray-900">
                                                Email
                                            </TableHead>
                                            <TableHead className="px-4 py-3 text-center font-semibold text-gray-900">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {vendors.data.length > 0 ? (
                                            vendors.data.map((vendor) => (
                                                <TableRow key={vendor.id} className="border-b border-gray-200 hover:bg-gray-50">
                                                    <TableCell className="sticky left-0 z-10 border-r border-gray-200 bg-white px-4 py-3 text-center">
                                                        {vendor.city || 'N/A'}
                                                    </TableCell>
                                                    <TableCell className="sticky left-[120px] z-10 border-r border-gray-200 bg-white px-4 py-3 text-center font-medium">
                                                        {vendor.vendor_name}
                                                    </TableCell>
                                                    <TableCell className="border-r border-gray-200 px-4 py-3 text-center">
                                                        {vendor.number || 'N/A'}
                                                    </TableCell>
                                                    <TableCell className="border-r border-gray-200 px-4 py-3 text-center">
                                                        {vendor.email || 'N/A'}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-center">
                                                        <div className="flex justify-center gap-2">
                                                            {hasAllPermissions(['vendors.edit', 'vendors.update']) && (
                                                                <button
                                                                    onClick={() => handleEditVendor(vendor)}
                                                                    className="text-green-600 hover:text-green-800"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </button>
                                                            )}
                                                            {hasPermission('vendors.destroy') && (
                                                                <button
                                                                    onClick={() => handleDelete(vendor)}
                                                                    className="text-red-600 hover:text-red-800"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="py-8 text-center text-gray-500">
                                                    No vendors found
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {vendors.links && vendors.links.length > 3 && (
                                <div className="mt-6 flex justify-center">
                                    <div className="flex gap-2">
                                        {vendors.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`rounded px-3 py-2 text-sm ${
                                                    link.active ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                } ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Drawers */}
            <VendorCreateDrawer cities={cities} open={isDrawerOpen} onOpenChange={setIsDrawerOpen} onSuccess={handleDrawerSuccess} />

            <VendorEditDrawer
                cities={cities}
                open={isEditDrawerOpen}
                onOpenChange={setIsEditDrawerOpen}
                vendor={selectedVendor}
                onSuccess={handleEditDrawerSuccess}
            />
        </AppLayout>
    );
}
