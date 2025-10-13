// resources/js/Pages/Properties/Index.tsx
import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
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
import { Trash2, Edit, Plus, Download, Search, X } from 'lucide-react';
import { Property, PaginatedProperties, PropertyFilters, PropertyStatistics, PropertyWithoutInsurance } from '@/types/property';
import type { PageProps } from '@/types/auth';
import { usePermissions } from '@/hooks/usePermissions';
import { City } from '@/types/City';
import PropertyCreateDrawer from './PropertyCreateDrawer';
import PropertyEditDrawer from './PropertyEditDrawer';

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
            `"${property.property?.property_name || 'N/A'}"`, // Use relationship data
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
    filters: PropertyFilters;
    cities: City[];
    availableProperties: PropertyWithoutInsurance[]; // Add this
}

export default function Index({ properties, filters, cities = [], availableProperties = [] }: Props) {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
    const [searchFilters, setSearchFilters] = useState<PropertyFilters>(filters);
    const [isExporting, setIsExporting] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const { flash } = usePage().props;

    const handleFilterChange = (key: keyof PropertyFilters, value: string) => {
        const newFilters = { ...searchFilters, [key]: value };
        setSearchFilters(newFilters);
        // Remove automatic search - only update local state
    };

    const handleSearch = () => {
        // Convert PropertyFilters to a plain object for router.get
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
        const clearedFilters: PropertyFilters = {
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

    const getStatusBadge = (property: Property) => {
        if (property.status === 'Expired') {
            return <Badge variant="destructive">Expired</Badge>;
        }
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Active</Badge>;
    };

    const getDaysLeftBadge = (daysLeft: number) => {
        if (daysLeft < 0) {
            return <Badge variant="destructive">{Math.abs(daysLeft)} days overdue</Badge>;
        } else if (daysLeft <= 30) {
            return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">{daysLeft} days left</Badge>;
        } else {
            return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">{daysLeft} days left</Badge>;
        }
    };

    const calculateDaysLeft = (expirationDate: string): number => {
        const today = new Date();
        const expDate = new Date(expirationDate);
        const diffTime = expDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    return (
        <AppLayout>
            <Head title="Properties Insurance" />
            <div className="py-12 bg-background text-foreground transition-colors min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Flash Messages */}
                    {(flash as any)?.success && (
                        <Card className="mb-4 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                            <CardContent className="p-4">
                                <div className="text-green-700 dark:text-green-300">{(flash as any)?.success}</div>
                            </CardContent>
                        </Card>
                    )}
                    {(flash as any)?.error && (
                        <Card className="mb-4 border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
                            <CardContent className="p-4">
                                <div className="text-red-700 dark:text-red-300">{(flash as any)?.error}</div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Title and Buttons Section */}
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-foreground">Property Insurance List</h1>
                        <div className="flex gap-2 items-center">
                            {/* Export Button */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCSVExport}
                                disabled={isExporting || properties.data.length === 0}
                                className="flex items-center"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                {isExporting ? 'Exporting...' : 'Export CSV'}
                            </Button>

                            {hasAllPermissions(['properties.create','properties.store']) && (
                                <Button onClick={() => setIsDrawerOpen(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Property
                                </Button>
                            )}
                        </div>
                    </div>

                    <Card className="bg-card text-card-foreground shadow-lg">
                        <CardHeader>
                            {/* Filters */}
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                                <Input
                                    type="text"
                                    placeholder="Property Name"
                                    value={searchFilters.property_name || ''}
                                    onChange={(e) => handleFilterChange('property_name', e.target.value)}
                                    className="bg-input text-input-foreground"
                                />
                                <Input
                                    type="text"
                                    placeholder="Insurance Company"
                                    value={searchFilters.insurance_company_name || ''}
                                    onChange={(e) => handleFilterChange('insurance_company_name', e.target.value)}
                                    className="bg-input text-input-foreground"
                                />
                                <Input
                                    type="text"
                                    placeholder="Policy Number"
                                    value={searchFilters.policy_number || ''}
                                    onChange={(e) => handleFilterChange('policy_number', e.target.value)}
                                    className="bg-input text-input-foreground"
                                />
                                <select
                                    value={searchFilters.status || ''}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">All Status</option>
                                    <option value="Active">Active</option>
                                    <option value="Expired">Expired</option>
                                </select>
                                <div className="flex justify-around">
                                <Button
                                    variant="outline"
                                    onClick={handleClearFilters}
                                    className="flex items-center"
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Clear
                                </Button>
                                <Button
                                    onClick={handleSearch}
                                    className="flex items-center"
                                >
                                    <Search className="h-4 w-4 mr-2" />
                                    Search
                                </Button>
                            </div>
                            </div>
                            
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto relative">
                                <Table className="border-collapse border border-border rounded-md">
                                    <TableHeader>
                                        <TableRow className="border-border">
                                            <TableHead className="text-muted-foreground border border-border bg-muted sticky left-0 z-10 min-w-[120px]">Property Name</TableHead>
                                            <TableHead className="text-muted-foreground border border-border bg-muted">Insurance Company</TableHead>
                                            <TableHead className="text-muted-foreground border border-border bg-muted">Amount</TableHead>
                                            <TableHead className="text-muted-foreground border border-border bg-muted">Effective Date</TableHead>
                                            <TableHead className="text-muted-foreground border border-border bg-muted">Policy Number</TableHead>
                                            <TableHead className="text-muted-foreground border border-border bg-muted">Expiration Date</TableHead>
                                            <TableHead className="text-muted-foreground border border-border bg-muted">Days Left</TableHead>
                                            <TableHead className="text-muted-foreground border border-border bg-muted">Status</TableHead>
                                            {hasAnyPermission(['properties.destroy','properties.update','properties.edit','properties.show']) && (
                                            <TableHead className="text-muted-foreground border border-border bg-muted">Actions</TableHead>)}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {properties.data.map((property) => (
                                            <TableRow key={property.id} className="hover:bg-muted/50 border-border">
                                                <TableCell className="font-medium text-center text-foreground border border-border bg-muted sticky left-0 z-10 min-w-[120px]">
                                                    {property.property?.property_name || 'N/A'} {/* Display relationship data */}
                                                </TableCell>
                                                <TableCell className="text-center text-foreground border border-border">{property.insurance_company_name}</TableCell>
                                                <TableCell className="text-center text-foreground border border-border">{property.formatted_amount}</TableCell>
                                                <TableCell className="text-center text-foreground border border-border">{property.effective_date}</TableCell>
                                                <TableCell className="text-center text-foreground border border-border">{property.policy_number}</TableCell>
                                                <TableCell className="text-center text-foreground border border-border">
                                                    {property.expiration_date}
                                                </TableCell>
                                                <TableCell className="text-center border border-border">
                                                    {getDaysLeftBadge(calculateDaysLeft(property.expiration_date))}
                                                </TableCell>
                                                <TableCell className="text-center border border-border">
                                                    {getStatusBadge(property)}
                                                </TableCell>
                                                {hasAnyPermission(['properties.destroy','properties.update','properties.edit','properties.show']) && (
                                                <TableCell className="text-center border border-border">
                                                    <div className="flex gap-1">
                                                        {hasAllPermissions(['properties.update','properties.edit']) && (
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={() => handleEdit(property)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>)}
                                                        {hasPermission('properties.destroy') && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDelete(property)}
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
                            {properties.data.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p className="text-lg">No properties found.</p>
                                    <p className="text-sm">Try adjusting your search criteria.</p>
                                </div>
                            )}
                            {/* Pagination - keep existing code */}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Property Create Drawer */}
            <PropertyCreateDrawer
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                cities={cities}
                availableProperties={availableProperties} // Pass available properties
                onSuccess={handleDrawerSuccess}
            />

            {/* Property Edit Drawer */}
            {selectedProperty && (
                <PropertyEditDrawer
                    open={isEditDrawerOpen}
                    onOpenChange={setIsEditDrawerOpen}
                    property={selectedProperty}
                    availableProperties={availableProperties} // Pass available properties
                    onSuccess={handleEditDrawerSuccess}
                />
            )}
        </AppLayout>
    );
}
