import AppLayout from '@/layouts/app-layout';
import { PaymentPlan, PaymentPlanIndexProps } from '@/types/PaymentPlan';
import { PropertyInfoWithoutInsurance } from '@/types/PropertyInfoWithoutInsurance';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import PaymentPlanCreateDrawer from './PaymentPlanCreateDrawer';
import PaymentPlanEditDrawer from './PaymentPlanEditDrawer';
import FiltersCard from './index/FiltersCard';
import PageHeader from './index/PageHeader';
import PaymentPlansTable from './index/PaymentPlansTable';

interface TenantData {
    id: number;
    full_name: string;
    tenant_id: number;
}

interface Props extends PaymentPlanIndexProps {
    search?: string | null;
    cities: Array<{ id: number; city: string }>;
    properties: PropertyInfoWithoutInsurance[];
    propertiesByCityId: Record<number, PropertyInfoWithoutInsurance[]>;
    unitsByPropertyId: Record<number, Array<{ id: number; unit_name: string }>>;
    tenantsByUnitId: Record<number, Array<{ id: number; full_name: string; tenant_id: number }>>;
    allUnits: Array<{ id: number; unit_name: string; city_name: string; property_name: string }>;
    tenantsData: TenantData[];
}

export default function Index({
    paymentPlans,
    cities,
    properties,
    propertiesByCityId,
    unitsByPropertyId,
    tenantsByUnitId,
    allUnits,
    tenantsData,
}: Props) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editDrawerOpen, setEditDrawerOpen] = useState(false);
    const [selectedPaymentPlan, setSelectedPaymentPlan] = useState<PaymentPlan | null>(null);

    const handleEdit = (paymentPlan: PaymentPlan) => {
        setSelectedPaymentPlan(paymentPlan);
        setEditDrawerOpen(true);
    };

    const handleDelete = (paymentPlan: PaymentPlan) => {
        if (confirm('Are you sure you want to delete this payment plan?')) {
            router.delete(`/payment-plans/${paymentPlan.id}`);
        }
    };

    return (
        <AppLayout>
            <Head title="Payment Plans" />

            <div className="min-h-screen bg-background py-12 text-foreground transition-colors">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <PageHeader paymentPlans={paymentPlans} onAddClick={() => setDrawerOpen(true)} />

                    <FiltersCard cities={cities} properties={properties} allUnits={allUnits} tenantsData={tenantsData} />

                    <PaymentPlansTable paymentPlans={paymentPlans} onEdit={handleEdit} onDelete={handleDelete} />
                </div>
            </div>

            <PaymentPlanCreateDrawer
                cities={cities}
                properties={properties}
                propertiesByCityId={propertiesByCityId}
                unitsByPropertyId={unitsByPropertyId}
                tenantsByUnitId={tenantsByUnitId}
                tenantsData={tenantsData}
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                onSuccess={() => {
                    router.reload();
                }}
            />

            {selectedPaymentPlan && (
                <PaymentPlanEditDrawer
                    paymentPlan={selectedPaymentPlan}
                    cities={cities}
                    properties={properties}
                    propertiesByCityId={propertiesByCityId}
                    unitsByPropertyId={unitsByPropertyId}
                    tenantsByUnitId={tenantsByUnitId}
                    allUnits={allUnits}
                    tenantsData={tenantsData}
                    open={editDrawerOpen}
                    onOpenChange={setEditDrawerOpen}
                    onSuccess={() => {
                        router.reload();
                        setSelectedPaymentPlan(null);
                    }}
                />
            )}
        </AppLayout>
    );
}
