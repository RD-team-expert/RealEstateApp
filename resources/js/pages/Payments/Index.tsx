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
    };
    units: UnitData[];
    cities: string[];
    properties: string[];
    unitsByCity: Record<string, string[]>;
    unitsByProperty: Record<string, string[]>;
    propertiesByCity: Record<string, string[]>;
    allCities: string[];
    allProperties: string[];
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
    allProperties 
}: Props) {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
    const [isExporting, setIsExporting] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editDrawerOpen, setEditDrawerOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

    // Filter states
    const [cityFilter, setCityFilter] = useState(filters?.city || '');
    const [propertyFilter, setPropertyFilter] = useState(filters?.property || '');
    const [unitFilter, setUnitFilter] = useState(filters?.unit || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params: any = {};

        if (cityFilter) params.city = cityFilter;
        if (propertyFilter) params.property = propertyFilter;
        if (unitFilter) params.unit = unitFilter;

        router.get(route('payments.index'), params, { 
            preserveState: true,
            preserveScroll: true 
        });
    };

    const clearFilters = () => {
        setCityFilter('');
        setPropertyFilter('');
        setUnitFilter('');
        
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
                    />

                    <FilterSection
                        cityFilter={cityFilter}
                        propertyFilter={propertyFilter}
                        unitFilter={unitFilter}
                        setCityFilter={setCityFilter}
                        setPropertyFilter={setPropertyFilter}
                        setUnitFilter={setUnitFilter}
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
