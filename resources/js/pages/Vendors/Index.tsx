import { Card, CardContent } from '@/components/ui/card';
import { usePermissions } from '@/hooks/usePermissions';
import AppLayout from '@/layouts/app-layout';
import { PageProps, PaginatedVendors, VendorFilters, VendorInfo, VendorStatistics } from '@/types/vendor';
import { Head, router, usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import VendorCreateDrawer from './VendorCreateDrawer';
import VendorEditDrawer from './VendorEditDrawer';
import FlashMessages from './index/FlashMessages';
import PageHeader from './index/PageHeader';
import VendorFiltersComponent from './index/VendorFilters';
import VendorTable from './index/VendorTable';
import VendorPagination from './index/VendorPagination';

// CSV Export utility function
const exportToCSV = (data: VendorInfo[], filename: string = 'vendors.csv') => {
    const headers = ['ID', 'City', 'Vendor Name', 'Number', 'Email', 'Service Type'];

    const formatArrayField = (field: string[] | null | undefined): string => {
        if (!field || !Array.isArray(field) || field.length === 0) {
            return '';
        }
        return field.join('; ');
    };

    const csvData = [
        headers.join(','),
        ...data.map((vendor) =>
            [
                vendor.id,
                `"${vendor.city?.city || 'N/A'}"`,
                `"${vendor.vendor_name}"`,
                `"${formatArrayField(vendor.number as string[])}"`,
                `"${formatArrayField(vendor.email as string[])}"`,
                `"${formatArrayField(vendor.service_type as string[])}"`,
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

export default function Index({ vendors, filters, cities }: Props) {
    const [, setSearchFilters] = useState<VendorFilters>(filters);
    const [isExporting, setIsExporting] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState<VendorInfo | null>(null);
    const { flash } = usePage().props;
    const { hasPermission, hasAllPermissions } = usePermissions();

    // Filter states
    const [tempFilters, setTempFilters] = useState({
        city: filters.city || '',
        vendor_name: filters.vendor_name || '',
    });

    // Dropdown states
    const [showCityDropdown, setShowCityDropdown] = useState(false);

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

    const handleClearFilters = () => {
        const clearedFilters = {
            city: '',
            vendor_name: '',
        };
        setTempFilters(clearedFilters);
        setSearchFilters(clearedFilters);
        setShowCityDropdown(false);
        router.get(
            route('vendors.index'),
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
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
        <AppLayout>
            <Head title="Vendors" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <FlashMessages flash={flash} />

                    <PageHeader
                        hasExportPermission={hasPermission('vendor.export')}
                        hasCreatePermissions={hasAllPermissions(['vendors.create', 'vendors.store'])}
                        isExporting={isExporting}
                        onExport={handleExport}
                        onAddVendor={() => setIsDrawerOpen(true)}
                    />

                    <Card>
                        <CardContent className="p-6">
                            <VendorFiltersComponent
                                tempFilters={tempFilters}
                                cities={cities}
                                showCityDropdown={showCityDropdown}
                                onTempFilterChange={handleTempFilterChange}
                                onCityInputChange={handleCityInputChange}
                                onCitySelect={handleCitySelect}
                                onSearchClick={handleSearchClick}
                                onClearFilters={handleClearFilters}
                                setShowCityDropdown={setShowCityDropdown}
                            />

                            <VendorTable
                                vendors={vendors.data}
                                hasEditPermissions={hasAllPermissions(['vendors.edit', 'vendors.update'])}
                                hasDeletePermission={hasPermission('vendors.destroy')}
                                onEditVendor={handleEditVendor}
                                onDeleteVendor={handleDelete}
                            />

                            <VendorPagination links={vendors.links} />
                        </CardContent>
                    </Card>
                </div>
            </div>

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
