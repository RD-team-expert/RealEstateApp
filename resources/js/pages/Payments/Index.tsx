import { Head } from '@inertiajs/react';
import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { usePermissions } from '@/hooks/usePermissions';
import { Payment } from '@/types/payments';
import { router } from '@inertiajs/react';
import PageHeader from './index/PageHeader';
import FilterSection from './index/FilterSection';
import PaymentsTable from './index/PaymentsTable';
import PaginationInfo from './index/PaginationInfo';
import EmptyState from './index/EmptyState';
import PaymentCreateDrawer from './PaymentCreateDrawer';
import PaymentEditDrawer from './PaymentEditDrawer';
import { exportToCSV } from './index/paymentUtils';


interface UnitData {
    id: number;
    unit_name: string;
    property_name: string;
    city: string;
}


interface Statistics {
    total: number;
    paid: number;
    didnt_pay: number;
    paid_partly: number;
    overpaid: number;
}


interface Props {
    payments: {
        data: Payment[];
        links: any[];
        meta: any;
    };
    search: string | null;
    filters: {
        city?: string;
        property?: string;
        unit?: string;
        status?: string[];
        permanent?: string[];
        is_hidden?: boolean;
    };
    units: UnitData[];
    cities: string[];
    properties: string[];
    unitsByCity: Record<string, string[]>;
    unitsByProperty: Record<string, string[]>;
    propertiesByCity: Record<string, string[]>;
    allCities: string[];
    allProperties: string[];
    statistics: Statistics;
}


export default function Index({ 
    payments, 
    filters, 
    units, 
    cities, 
    properties,
    unitsByCity, 
    unitsByProperty,
    propertiesByCity,
    allCities, 
    allProperties,
    statistics
}: Props) {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
    const [isExporting, setIsExporting] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editDrawerOpen, setEditDrawerOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);


    // Location filters
    const [cityFilter, setCityFilter] = useState(filters?.city || '');
    const [propertyFilter, setPropertyFilter] = useState(filters?.property || '');
    const [unitFilter, setUnitFilter] = useState(filters?.unit || '');

    // Status and other filters
    const [statusFilter, setStatusFilter] = useState<string[]>(filters?.status || []);
    const [permanentFilter, setPermanentFilter] = useState<string[]>(filters?.permanent || []);
    const [isHiddenFilter, setIsHiddenFilter] = useState<boolean>(filters?.is_hidden || false);


    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params: any = {};

        if (cityFilter) params.city = cityFilter;
        if (propertyFilter) params.property = propertyFilter;
        if (unitFilter) params.unit = unitFilter;
        if (statusFilter && statusFilter.length > 0) params.status = statusFilter.join(',');
        if (permanentFilter && permanentFilter.length > 0) params.permanent = permanentFilter.join(',');
        if (isHiddenFilter) params.is_hidden = 'true';

        router.get(route('payments.index'), params, { 
            preserveState: true,
            preserveScroll: true 
        });
    };


    const clearFilters = () => {
        setCityFilter('');
        setPropertyFilter('');
        setUnitFilter('');
        setStatusFilter([]);
        setPermanentFilter([]);
        setIsHiddenFilter(false);
        
        router.get(route('payments.index'), {}, { 
            preserveState: true,
            preserveScroll: true 
        });
    };


    const handleDelete = (payment: Payment) => {
        if (confirm('Are you sure you want to delete this payment?')) {
            router.delete(route('payments.destroy', payment.id));
        }
    };


    const handleHide = (payment: Payment) => {
        if (confirm('Are you sure you want to hide this payment?')) {
            router.post(route('payments.hide', payment.id), {});
        }
    };


    const handleEdit = (payment: Payment) => {
        setSelectedPayment(payment);
        setEditDrawerOpen(true);
    };


    const handleEditSuccess = () => {
        router.reload();
    };


    const handleCSVExport = () => {
        if (!payments || !payments.data || payments.data.length === 0) {
            alert('No data to export');
            return;
        }

        setIsExporting(true);

        try {
            console.log('Exporting payments data:', payments.data);
            const filename = `payments-${new Date().toISOString().split('T')[0]}.csv`;
            exportToCSV(payments.data, filename);
            console.log('Export completed successfully');
        } catch (error) {
            console.error('Export failed:', error);
            alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the console for details.`);
        } finally {
            setIsExporting(false);
        }
    };


    return (
        <AppLayout>
            <Head title="Payments" />

            <div className="min-h-screen bg-background py-12 text-foreground transition-colors">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <PageHeader
                        onExport={handleCSVExport}
                        onAddPayment={() => setDrawerOpen(true)}
                        isExporting={isExporting}
                        hasData={payments?.data && payments.data.length > 0}
                        canCreate={hasAllPermissions(['payments.create', 'payments.store'])}
                        statistics={statistics}
                    />

                    <FilterSection
                        cityFilter={cityFilter}
                        propertyFilter={propertyFilter}
                        unitFilter={unitFilter}
                        statusFilter={statusFilter}
                        permanentFilter={permanentFilter}
                        isHiddenFilter={isHiddenFilter}
                        setCityFilter={setCityFilter}
                        setPropertyFilter={setPropertyFilter}
                        setUnitFilter={setUnitFilter}
                        setStatusFilter={setStatusFilter}
                        setPermanentFilter={setPermanentFilter}
                        setIsHiddenFilter={setIsHiddenFilter}
                        uniqueCities={allCities}
                        uniqueProperties={allProperties}
                        units={units}
                        propertiesByCity={propertiesByCity}
                        onSearch={handleSearch}
                        onClear={clearFilters}
                    />

                    {payments.data.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <>
                            <PaymentsTable
                                payments={payments.data}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onHide={handleHide}
                                hasAnyPermission={hasAnyPermission}
                                hasAllPermissions={hasAllPermissions}
                                hasPermission={hasPermission}
                            />
                            <PaginationInfo meta={payments.meta} />
                        </>
                    )}
                </div>
            </div>

            <PaymentCreateDrawer 
                open={drawerOpen} 
                onOpenChange={setDrawerOpen} 
                units={units} 
                cities={cities}
                properties={properties}
                unitsByCity={unitsByCity} 
                unitsByProperty={unitsByProperty}
                propertiesByCity={propertiesByCity}
            />

            {selectedPayment && (
                <PaymentEditDrawer
                    payment={selectedPayment}
                    units={units}
                    cities={cities}
                    properties={properties}
                    unitsByCity={unitsByCity}
                    unitsByProperty={unitsByProperty}
                    propertiesByCity={propertiesByCity}
                    open={editDrawerOpen}
                    onOpenChange={setEditDrawerOpen}
                    onSuccess={handleEditSuccess}
                />
            )}
        </AppLayout>
    );
}
