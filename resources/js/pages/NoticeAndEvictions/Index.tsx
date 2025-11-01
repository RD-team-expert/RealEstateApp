import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { usePermissions } from '@/hooks/usePermissions';
import AppLayout from '@/layouts/app-layout';
import { City, Notice, NoticeAndEviction } from '@/types/NoticeAndEviction';
import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import React, { useState } from 'react';
import NoticeAndEvictionsCreateDrawer from './NoticeAndEvictionsCreateDrawer';
import NoticeAndEvictionsEditDrawer from './NoticeAndEvictionsEditDrawer';
import { FilterBar } from './index/FilterBar';
import { NoticeEvictionsTable } from './index/NoticeEvictionsTable';
import { PageHeader } from './index/PageHeader';
import { Unit, ExtendedTenant, ExtendedProperty } from './index/types';

const formatDateForInput = (value?: string | null): string => {
    if (!value) return '';

    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (!m) return '';

    const [, y, mo, d] = m;
    return `${y}-${mo}-${d}`;
};

const formatDateOnly = (value?: string | null, fallback = '-'): string => {
    if (!value) return fallback;

    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (!m) return fallback;

    const [, y, mo, d] = m;
    const date = new Date(Number(y), Number(mo) - 1, Number(d));
    return format(date, 'P');
};

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

interface Props {
    records: NoticeAndEviction[];
    search?: string;
    cities: City[];
    properties: ExtendedProperty[];
    units: Unit[];
    tenants: ExtendedTenant[];
    notices: Notice[];
}

const Index = ({ records, cities = [], properties = [], units = [], tenants = [], notices = [] }: Props) => {
    const [isExporting, setIsExporting] = useState(false);
    const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<NoticeAndEviction | null>(null);

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

    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
    const [showUnitDropdown, setShowUnitDropdown] = useState(false);
    const [showTenantDropdown, setShowTenantDropdown] = useState(false);

    const handleTempFilterChange = (key: string, value: string) => {
        setTempFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleCitySelect = (city: City) => {
        handleTempFilterChange('city', city.city);
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
        handleTempFilterChange('property', property.property_name);
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

    const handleSearchClick = () => {
        setFilters(tempFilters);

        const selectedCity = cities.find((city) => city.city === tempFilters.city);
        const selectedProperty = properties.find((property) => property.property_name === tempFilters.property);
        const selectedUnit = units.find((unit) => unit.unit_name === tempFilters.unit);
        const selectedTenant = tenants.find((tenant) => tenant.full_name === tempFilters.tenant);

        const searchParams: Record<string, any> = {};

        if (selectedCity?.id) {
            searchParams.city_id = selectedCity.id;
        } else if (tempFilters.city.trim()) {
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

        router.get(route('notice_and_evictions.index'), searchParams, { preserveState: true });
    };

    const handleClearFilters = () => {
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

        setShowCityDropdown(false);
        setShowPropertyDropdown(false);
        setShowUnitDropdown(false);
        setShowTenantDropdown(false);

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
        router.reload();
    };

    const handleCreateSuccess = () => {
        setIsCreateDrawerOpen(false);
        router.reload();
    };

    const handleCSVExport = () => {
        if (!records || records.length === 0) {
            alert('No data to export');
            return;
        }

        setIsExporting(true);

        try {
            console.log('Exporting notice and evictions data:', records);
            const filename = `notice-evictions-${new Date().toISOString().split('T')[0]}.csv`;
            exportToCSV(records, filename);

            console.log('Export completed successfully');
        } catch (error) {
            console.error('Export failed:', error);
            alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the console for details.`);
        } finally {
            setIsExporting(false);
        }
    };

    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

    return (
        <AppLayout>
            <Head title="Notice & Evictions" />

            <div className="min-h-screen bg-background py-12 text-foreground transition-colors">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <PageHeader
                        title="Notice & Evictions"
                        onExport={handleCSVExport}
                        onAdd={() => setIsCreateDrawerOpen(true)}
                        isExporting={isExporting}
                        hasRecords={records && records.length > 0}
                        canCreate={hasAllPermissions(['notice-and-evictions.create', 'notice-and-evictions.store'])}
                    />

                    <Card className="bg-card text-card-foreground shadow-lg">
                        <CardHeader>
                            <FilterBar
                                tempFilters={tempFilters}
                                cities={cities}
                                properties={properties}
                                units={units}
                                tenants={tenants}
                                showCityDropdown={showCityDropdown}
                                showPropertyDropdown={showPropertyDropdown}
                                showUnitDropdown={showUnitDropdown}
                                showTenantDropdown={showTenantDropdown}
                                setShowCityDropdown={setShowCityDropdown}
                                setShowPropertyDropdown={setShowPropertyDropdown}
                                setShowUnitDropdown={setShowUnitDropdown}
                                setShowTenantDropdown={setShowTenantDropdown}
                                onCityInputChange={handleCityInputChange}
                                onPropertyInputChange={handlePropertyInputChange}
                                onUnitInputChange={handleUnitInputChange}
                                onTenantInputChange={handleTenantInputChange}
                                onCitySelect={handleCitySelect}
                                onPropertySelect={handlePropertySelect}
                                onUnitSelect={handleUnitSelect}
                                onTenantSelect={handleTenantSelect}
                                onSearch={handleSearchClick}
                                onClear={handleClearFilters}
                            />
                        </CardHeader>

                        <CardContent>
                            <NoticeEvictionsTable
                                records={records}
                                hasShowPermission={hasPermission('notice-and-evictions.show')}
                                hasEditPermission={hasAllPermissions(['notice-and-evictions.edit', 'notice-and-evictions.update'])}
                                hasDeletePermission={hasPermission('notice-and-evictions.destroy')}
                                hasAnyActionPermission={hasAnyPermission([
                                    'notice-and-evictions.show',
                                    'notice-and-evictions.edit',
                                    'notice-and-evictions.update',
                                    'notice-and-evictions.destroy',
                                ])}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />

                            {records.length === 0 && (
                                <div className="py-8 text-center text-muted-foreground">
                                    <p className="text-lg">No records found.</p>
                                    <p className="text-sm">Try adjusting your search criteria.</p>
                                </div>
                            )}

                            <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                                <div className="text-sm text-muted-foreground">Showing {records.length} records</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

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
