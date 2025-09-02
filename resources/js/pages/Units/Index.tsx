import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Eye, Plus, Search, Download } from 'lucide-react';
import { Unit, PaginatedUnits, UnitFilters, UnitStatistics } from '@/types/unit';
import { PageProps } from '@/types/unit';
import { usePermissions } from '@/hooks/usePermissions';
import { type BreadcrumbItem } from '@/types';

// CSV Export utility function
const exportToCSV = (data: Unit[], filename: string = 'units.csv') => {
    const headers = [
        'ID',
        'City',
        'Property',
        'Unit Name',
        'Tenants',
        'Lease Start',
        'Lease End',
        'Beds',
        'Baths',
        'Lease Status',
        'Monthly Rent',
        'Recurring Transaction',
        'Utility Status',
        'Account Number',
        'Insurance',
        'Insurance Expiration',
        'Vacant',
        'Listed',
        'Applications'
    ];

    const csvData = [
        headers.join(','),
        ...data.map(unit => [
            unit.id,
            `"${unit.city}"`,
            `"${unit.property}"`,
            `"${unit.unit_name}"`,
            `"${unit.tenants || ''}"`,
            `"${unit.lease_start ? new Date(unit.lease_start).toLocaleDateString() : ''}"`,
            `"${unit.lease_end ? new Date(unit.lease_end).toLocaleDateString() : ''}"`,
            unit.count_beds || '',
            unit.count_baths || '',
            `"${unit.lease_status || ''}"`,
            `"${unit.formatted_monthly_rent || ''}"`,
            `"${(unit.recurring_transaction || '').replace(/"/g, '""')}"`,
            `"${(unit.utility_status || '').replace(/"/g, '""')}"`,
            `"${(unit.account_number || '').replace(/"/g, '""')}"`,
            `"${unit.insurance || ''}"`,
            `"${unit.insurance_expiration_date ? new Date(unit.insurance_expiration_date).toLocaleDateString() : ''}"`,
            `"${unit.vacant}"`,
            `"${unit.listed}"`,
            unit.total_applications || 0
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
    units: PaginatedUnits;
    statistics: UnitStatistics;
    filters: UnitFilters;
}

export default function Index({ auth, units, statistics, filters }: Props) {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
    const [searchFilters, setSearchFilters] = useState<UnitFilters>(filters);
    const [isExporting, setIsExporting] = useState(false);
    const { flash } = usePage().props;

    const handleFilterChange = (key: keyof UnitFilters, value: string) => {
        const newFilters = { ...searchFilters, [key]: value };
        setSearchFilters(newFilters);
        router.get(route('units.index'), newFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDelete = (unit: Unit) => {
        if (confirm('Are you sure you want to delete this unit?')) {
            router.delete(route('units.destroy', unit.id));
        }
    };

    const handleCSVExport = () => {
        if (units.data.length === 0) {
            alert('No data to export');
            return;
        }

        setIsExporting(true);
        try {
            const filename = `units-${new Date().toISOString().split('T')[0]}.csv`;
            exportToCSV(units.data, filename);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    const getVacantBadge = (vacant: string) => {
        if (!vacant) return <Badge variant="outline">-</Badge>;
        return (
            <Badge variant={vacant === 'Yes' ? 'destructive' : 'default'}>
                {vacant}
            </Badge>
        );
    };

    const getListedBadge = (listed: string) => {
        if (!listed) return <Badge variant="outline">-</Badge>;
        return (
            <Badge variant={listed === 'Yes' ? 'default' : 'secondary'}>
                {listed}
            </Badge>
        );
    };

    const getInsuranceBadge = (insurance: string | null) => {
        if (!insurance || insurance === '-') return <Badge variant="outline">N/A</Badge>;
        return (
            <Badge variant={insurance === 'Yes' ? 'default' : 'destructive'}>
                {insurance}
            </Badge>
        );
    };

    return (
        <AppLayout >
            <Head title="Units" />
            <div className="py-12">
                <div className="max-w-full mx-auto sm:px-6 lg:px-8">
                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="mb-4 bg-chart-1/20 border border-chart-1 text-chart-1 px-4 py-3 rounded">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-4 bg-destructive/20 border border-destructive text-destructive px-4 py-3 rounded">
                            {flash.error}
                        </div>
                    )}

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold text-foreground">Total Units</h3>
                                <p className="text-3xl font-bold text-primary">{statistics.total}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold text-foreground">Vacant</h3>
                                <p className="text-3xl font-bold text-destructive">{statistics.vacant}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold text-foreground">Occupied</h3>
                                <p className="text-3xl font-bold text-chart-1">{statistics.occupied}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold text-foreground">Listed</h3>
                                <p className="text-3xl font-bold text-chart-2">{statistics.listed}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold text-foreground">Total Applications</h3>
                                <p className="text-3xl font-bold text-chart-3">{statistics.total_applications}</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">Units List</CardTitle>
                                <div className="flex gap-2 items-center">
                                    {/* Export Button */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCSVExport}
                                        disabled={isExporting || units.data.length === 0}
                                        className="flex items-center"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        {isExporting ? 'Exporting...' : 'Export CSV'}
                                    </Button>

                                    {hasAnyPermission(['units.store','units.create']) && (
                                        <Link href={route('units.create')}>
                                            <Button>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Unit
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                            {/* Filters */}
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-4">
                                <Input
                                    type="text"
                                    placeholder="City"
                                    value={searchFilters.city || ''}
                                    onChange={(e) => handleFilterChange('city', e.target.value)}
                                />
                                <Input
                                    type="text"
                                    placeholder="Property"
                                    value={searchFilters.property || ''}
                                    onChange={(e) => handleFilterChange('property', e.target.value)}
                                />
                                <Input
                                    type="text"
                                    placeholder="Unit Name"
                                    value={searchFilters.unit_name || ''}
                                    onChange={(e) => handleFilterChange('unit_name', e.target.value)}
                                />
                                <select
                                    value={searchFilters.vacant || ''}
                                    onChange={(e) => handleFilterChange('vacant', e.target.value)}
                                    className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                                >
                                    <option value="">All Vacant Status</option>
                                    <option value="Yes">Vacant</option>
                                    <option value="No">Occupied</option>
                                </select>
                                <select
                                    value={searchFilters.listed || ''}
                                    onChange={(e) => handleFilterChange('listed', e.target.value)}
                                    className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                                >
                                    <option value="">All Listed Status</option>
                                    <option value="Yes">Listed</option>
                                    <option value="No">Not Listed</option>
                                </select>
                                <select
                                    value={searchFilters.insurance || ''}
                                    onChange={(e) => handleFilterChange('insurance', e.target.value)}
                                    className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                                >
                                    <option value="">All Insurance</option>
                                    <option value="Yes">Has Insurance</option>
                                    <option value="No">No Insurance</option>
                                </select>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>City</TableHead>
                                            <TableHead>Property</TableHead>
                                            <TableHead>Unit Name</TableHead>
                                            <TableHead>Tenants</TableHead>
                                            <TableHead>Lease Start</TableHead>
                                            <TableHead>Lease End</TableHead>
                                            <TableHead>Beds</TableHead>
                                            <TableHead>Baths</TableHead>
                                            <TableHead>Lease Status</TableHead>
                                            <TableHead>Monthly Rent</TableHead>
                                            <TableHead>Recurring Transaction</TableHead>
                                            <TableHead>Utility Status</TableHead>
                                            <TableHead>Account Number</TableHead>
                                            <TableHead>Insurance</TableHead>
                                            <TableHead>Insurance Exp.</TableHead>
                                            <TableHead>Vacant</TableHead>
                                            <TableHead>Listed</TableHead>
                                            <TableHead>Applications</TableHead>
                                            {hasAnyPermission(['units.show','units.edit','units.update','units.destroy']) && (
                                            <TableHead>Actions</TableHead>
                                            )}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {units.data.map((unit) => (
                                            <TableRow key={unit.id} className="hover:bg-muted/50">
                                                <TableCell className="font-medium">{unit.city}</TableCell>
                                                <TableCell>{unit.property}</TableCell>
                                                <TableCell>
                                                    <span className="font-medium">{unit.unit_name}</span>
                                                </TableCell>
                                                <TableCell>{unit.tenants || '-'}</TableCell>
                                                <TableCell>
                                                    {unit.lease_start ? new Date(unit.lease_start).toLocaleDateString() : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {unit.lease_end ? new Date(unit.lease_end).toLocaleDateString() : '-'}
                                                </TableCell>
                                                <TableCell>{unit.count_beds || '-'}</TableCell>
                                                <TableCell>{unit.count_baths || '-'}</TableCell>
                                                <TableCell>{unit.lease_status || '-'}</TableCell>
                                                <TableCell>
                                                    <span className="font-medium">{unit.formatted_monthly_rent}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="max-w-32 truncate" title={unit.recurring_transaction || ''}>
                                                        {unit.recurring_transaction || '-'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="max-w-24 truncate" title={unit.utility_status || ''}>
                                                        {unit.utility_status || '-'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="max-w-24 truncate" title={unit.account_number || ''}>
                                                        {unit.account_number || '-'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {getInsuranceBadge(unit.insurance)}
                                                </TableCell>
                                                <TableCell>
                                                    {unit.insurance_expiration_date ?
                                                        new Date(unit.insurance_expiration_date).toLocaleDateString() : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {getVacantBadge(unit.vacant)}
                                                </TableCell>
                                                <TableCell>
                                                    {getListedBadge(unit.listed)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                                                        {unit.total_applications}
                                                    </Badge>
                                                </TableCell>
                                                {hasAnyPermission(['units.show','units.edit','units.update','units.destroy']) && (
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        {hasPermission('units.show') && (
                                                        <Link href={route('units.show', unit.id)}>
                                                            <Button variant="outline" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>)}
                                                        {hasAllPermissions(['units.edit','units.update']) && (
                                                        <Link href={route('units.edit', unit.id)}>
                                                            <Button variant="outline" size="sm">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>)}
                                                        {hasPermission('units.destroy') && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDelete(unit)}
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
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

                            {units.data.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p className="text-lg">No units found matching your criteria.</p>
                                    <p className="text-sm">Try adjusting your search filters.</p>
                                </div>
                            )}

                            {/* Pagination */}
                            {units.last_page > 1 && (
                                <div className="mt-6 flex justify-center">
                                    <nav className="flex space-x-2">
                                        {units.links.map((link, index) => (
                                            <button
                                                key={index}
                                                onClick={() => link.url && router.get(link.url)}
                                                disabled={!link.url}
                                                className={`px-3 py-2 text-sm rounded ${
                                                    link.active
                                                        ? 'bg-primary text-primary-foreground'
                                                        : link.url
                                                        ? 'bg-muted text-foreground hover:bg-accent'
                                                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </nav>
                                </div>
                            )}

                            {/* Total count */}
                            <div className="mt-4 text-sm text-muted-foreground text-center">
                                Showing {units.from || 0} to {units.to || 0} of {units.total || 0} units
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
