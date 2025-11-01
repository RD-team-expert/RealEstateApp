// resources/js/Pages/Properties/Index.tsx
import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Property, PaginatedProperties, PropertyFilters as PropertyFiltersType, PropertyStatistics, PropertyWithoutInsurance } from '@/types/property';
import type { PageProps } from '@/types/auth';
import { usePermissions } from '@/hooks/usePermissions';
import { City } from '@/types/City';
import PropertyCreateDrawer from './PropertyCreateDrawer';
import PropertyEditDrawer from './PropertyEditDrawer';
import PropertyPageHeader from './index/PropertyPageHeader';
import PropertyFilters from './index/PropertyFilters';
import PropertyTable from './index/PropertyTable';
import PropertyEmptyState from './index/PropertyEmptyState';
import FlashMessages from './index/FlashMessages';

// CSV Export utility function
const exportToCSV = (data: Property[], filename: string = 'properties.csv') => {
    const headers = [
        'ID',
        'Property Name',
        'Insurance Company',
        'Amount',
        'Effective Date',
        'Policy Number',
        'Expiration Date',
        'Days Left',
        'Status'
    ];

    const calculateDaysLeft = (expirationDate: string): number => {
        const today = new Date();
        const expDate = new Date(expirationDate);
        const diffTime = expDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const csvData = [
        headers.join(','),
        ...data.map(property => [
            property.id,
            `"${property.property?.property_name || 'N/A'}"`,
            `"${property.insurance_company_name}"`,
            `"${property.formatted_amount}"`,
            `"${property.effective_date}"`,
            `"${property.policy_number}"`,
            `"${property.expiration_date}"`,
            calculateDaysLeft(property.expiration_date),
            `"${property.status}"`
        ].join(','))
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
    properties: PaginatedProperties;
    statistics: PropertyStatistics;
    filters: PropertyFiltersType;
    cities: City[];
    availableProperties: PropertyWithoutInsurance[];
}

export default function Index({ properties, filters, cities = [], availableProperties = [] }: Props) {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
    const [searchFilters, setSearchFilters] = useState<PropertyFiltersType>(filters);
    const [isExporting, setIsExporting] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const { flash } = usePage().props;

    const handleFilterChange = (key: keyof PropertyFiltersType, value: string) => {
        const newFilters = { ...searchFilters, [key]: value };
        setSearchFilters(newFilters);
    };

    const handleSearch = () => {
        const filterParams: Record<string, string> = {};
        Object.entries(searchFilters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                filterParams[key] = String(value);
            }
        });
        
        router.get(route('properties-info.index'), filterParams, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        const clearedFilters: PropertyFiltersType = {
            property_name: '',
            insurance_company_name: '',
            policy_number: '',
            status: undefined
        };
        setSearchFilters(clearedFilters);
        router.get(route('properties-info.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDelete = (property: Property) => {
        if (confirm('Are you sure you want to delete this property?')) {
            router.delete(route('properties-info.destroy', property.id));
        }
    };

    const handleCSVExport = () => {
        if (properties.data.length === 0) {
            alert('No data to export');
            return;
        }

        setIsExporting(true);
        try {
            const filename = `properties-insurance-${new Date().toISOString().split('T')[0]}.csv`;
            exportToCSV(properties.data, filename);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    const handleDrawerSuccess = () => {
        router.reload();
    };

    const handleEditDrawerSuccess = () => {
        router.reload();
    };

    const handleEdit = (property: Property) => {
        setSelectedProperty(property);
        setIsEditDrawerOpen(true);
    };

    return (
        <AppLayout>
            <Head title="Properties Insurance" />
            <div className="py-12 bg-background text-foreground transition-colors min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <FlashMessages 
                        success={(flash as any)?.success} 
                        error={(flash as any)?.error} 
                    />

                    <PropertyPageHeader
                        onExport={handleCSVExport}
                        onAddProperty={() => setIsDrawerOpen(true)}
                        isExporting={isExporting}
                        hasExportData={properties.data.length > 0}
                        canCreate={hasAllPermissions(['properties.create', 'properties.store'])}
                    />

                    <Card className="bg-card text-card-foreground shadow-lg">
                        <CardHeader>
                            <PropertyFilters
                                filters={searchFilters}
                                onFilterChange={handleFilterChange}
                                onSearch={handleSearch}
                                onClear={handleClearFilters}
                            />
                        </CardHeader>
                        <CardContent>
                            <PropertyTable
                                properties={properties.data}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                canEdit={hasAllPermissions(['properties.update', 'properties.edit'])}
                                canDelete={hasPermission('properties.destroy')}
                                hasAnyActionPermission={hasAnyPermission(['properties.destroy', 'properties.update', 'properties.edit', 'properties.show'])}
                            />
                            
                            {properties.data.length === 0 && <PropertyEmptyState />}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <PropertyCreateDrawer
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                cities={cities}
                availableProperties={availableProperties}
                onSuccess={handleDrawerSuccess}
            />

            {selectedProperty && (
                <PropertyEditDrawer
                    open={isEditDrawerOpen}
                    onOpenChange={setIsEditDrawerOpen}
                    property={selectedProperty}
                    availableProperties={availableProperties}
                    onSuccess={handleEditDrawerSuccess}
                />
            )}
        </AppLayout>
    );
}
