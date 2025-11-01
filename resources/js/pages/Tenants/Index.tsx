import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { usePermissions } from '@/hooks/usePermissions';
import AppLayout from '@/layouts/app-layout';
import { City } from '@/types/City';
import { PropertyInfoWithoutInsurance } from '@/types/PropertyInfoWithoutInsurance';
import { Tenant } from '@/types/tenant';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useCallback, useState } from 'react';
import TenantCreateDrawer from './TenantCreateDrawer';
import TenantEditDrawer from './TenantEditDrawer';
import { FlashMessages } from './index/FlashMessages';
import { ImportModal } from './index/ImportModal';
import { ImportStatsCard } from './index/ImportStatsCard';
import { Notification } from './index/Notification';
import { TenantFilters, FilterState } from './index/TenantFilters';
import { TenantPageHeader } from './index/TenantPageHeader';
import { TenantTable } from './index/TenantTable';
import { useNotification } from './index/useNotification';

// CSV Export utility function
const exportToCSV = (data: Tenant[], filename: string = 'tenants.csv') => {
    const headers = [
        'ID',
        'City',
        'Property Name',
        'Unit Number',
        'First Name',
        'Last Name',
        'Street Address',
        'Login Email',
        'Alternate Email',
        'Mobile',
        'Emergency Phone',
        'Payment Method',
        'Has Insurance',
        'Sensitive Communication',
        'Has Assistance',
        'Assistance Amount',
        'Assistance Company',
    ];

    const csvData = [
        headers.join(','),
        ...data.map((tenant) =>
            [
                tenant.id,
                `"${tenant.city_name || ''}"`,
                `"${tenant.property_name || ''}"`,
                `"${tenant.unit_number || ''}"`,
                `"${tenant.first_name || ''}"`,
                `"${tenant.last_name || ''}"`,
                `"${(tenant.street_address_line || '').replace(/"/g, '""')}"`,
                `"${tenant.login_email || ''}"`,
                `"${tenant.alternate_email || ''}"`,
                `"${tenant.mobile || ''}"`,
                `"${tenant.emergency_phone || ''}"`,
                `"${tenant.cash_or_check || ''}"`,
                `"${tenant.has_insurance || ''}"`,
                `"${tenant.sensitive_communication || ''}"`,
                `"${tenant.has_assistance || ''}"`,
                `"${tenant.assistance_amount || ''}"`,
                `"${(tenant.assistance_company || '').replace(/"/g, '""')}"`,
            ].join(',')
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

interface Props {
    tenants: Tenant[];
    search?: string;
    cities: City[];
    properties: PropertyInfoWithoutInsurance[];
    unitsByProperty: Record<string, Array<{ id: number; unit_name: string }>>;
    importStats?: {
        total_processed: number;
        successful_imports: number;
        errors: number;
        duplicates: number;
    };
}

export default function Index({ tenants, search, cities, properties, unitsByProperty, importStats }: Props) {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
    const [isExporting, setIsExporting] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showImportStats, setShowImportStats] = useState(!!importStats);
    const [showCreateDrawer, setShowCreateDrawer] = useState(false);
    const [showEditDrawer, setShowEditDrawer] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
    const { flash } = usePage().props;

    const { notification, showNotification, hideNotification } = useNotification();

    const importForm = useForm({
        file: null as File | null,
        skip_duplicates: false as boolean,
    });

    const handleSearch = (filters: FilterState) => {
        router.get(
            route('tenants.index'),
            {
                search: filters.search,
                city: filters.city,
                property: filters.property,
                unit_name: filters.unitName,
            },
            { preserveState: true }
        );
    };

    const handleClearFilters = () => {
        router.get(route('tenants.index'), {}, { preserveState: false, replace: true });
    };

    const handleDelete = (tenant: Tenant) => {
        if (
            confirm(
                `Are you sure you want to archive ${tenant.first_name} ${tenant.last_name}? This will hide them from the main list but they can be restored later.`
            )
        ) {
            router.patch(
                route('tenants.archive', tenant.id),
                {},
                {
                    onSuccess: () => {
                        showNotification('success', 'Tenant archived successfully!');
                    },
                    onError: () => {
                        showNotification('error', 'Failed to archive tenant. Please try again.');
                    },
                }
            );
        }
    };

    const handleEdit = (tenant: Tenant) => {
        setSelectedTenant(tenant);
        setShowEditDrawer(true);
    };

    const handleEditSuccess = () => {
        showNotification('success', 'Tenant updated successfully!');
        setSelectedTenant(null);
    };

    const handleCSVExport = () => {
        if (tenants.length === 0) {
            alert('No data to export');
            return;
        }

        setIsExporting(true);
        try {
            const filename = `tenants-${new Date().toISOString().split('T')[0]}.csv`;
            exportToCSV(tenants, filename);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    const handleImport = useCallback(
        (file: File, skipDuplicates: boolean) => {
            importForm.setData({
                file: file,
                skip_duplicates: skipDuplicates,
            });

            router.post(
                route('tenants.import.process'),
                {
                    file: file,
                    skip_duplicates: skipDuplicates,
                },
                {
                    forceFormData: true,
                    onSuccess: () => {
                        setShowImportModal(false);
                        importForm.reset();
                        showNotification('success', 'CSV file imported successfully!');
                    },
                    onError: (errors) => {
                        const errorMessage = errors.file || errors.import || 'Failed to import CSV file. Please try again.';
                        showNotification('error', errorMessage);
                    },
                    onFinish: () => {
                        importForm.clearErrors();
                    },
                }
            );
        },
        [importForm, showNotification]
    );

    const uniqueUnitNames = Array.from(new Set(tenants.map((tenant) => tenant.unit_number).filter(Boolean)));

    return (
        <AppLayout>
            <Head title="Tenants" />

            {notification && <Notification type={notification.type} message={notification.message} onClose={hideNotification} />}

            <ImportModal isOpen={showImportModal} onClose={() => setShowImportModal(false)} onSubmit={handleImport} isLoading={importForm.processing} />

            <TenantCreateDrawer
                open={showCreateDrawer}
                onOpenChange={() => setShowCreateDrawer(false)}
                cities={cities}
                properties={properties}
                unitsByProperty={unitsByProperty}
                onSuccess={() => showNotification('success', 'Tenant created successfully!')}
            />

            <div className="min-h-screen bg-background py-12 text-foreground transition-colors">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <FlashMessages success={(flash as any)?.success} error={(flash as any)?.error} />

                    {showImportStats && importStats && <ImportStatsCard stats={importStats} onClose={() => setShowImportStats(false)} />}

                    <TenantPageHeader
                        onExport={handleCSVExport}
                        onImport={() => setShowImportModal(true)}
                        onAddNew={() => setShowCreateDrawer(true)}
                        isExporting={isExporting}
                        hasExportData={tenants.length > 0}
                        canImport={hasPermission('tenants.import')}
                        canCreate={hasAllPermissions(['tenants.create', 'tenants.store'])}
                    />

                    <Card className="bg-card text-card-foreground shadow-lg">
                        <CardHeader>
                            <TenantFilters
                                cities={cities}
                                properties={properties}
                                uniqueUnitNames={uniqueUnitNames}
                                onSearch={handleSearch}
                                onClear={handleClearFilters}
                                initialFilters={{
                                    city: '',
                                    property: '',
                                    unitName: '',
                                    search: search || '',
                                }}
                            />
                        </CardHeader>
                        <CardContent className="p-6">
                            <TenantTable
                                tenants={tenants}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                canEdit={hasAllPermissions(['tenants.edit', 'tenants.update'])}
                                canDelete={hasPermission('tenants.destroy')}
                                showActions={hasAnyPermission(['tenants.show', 'tenants.edit', 'tenants.update', 'tenants.destroy'])}
                            />
                            {tenants.length === 0 && (
                                <div className="py-8 text-center text-muted-foreground">
                                    <p className="text-lg">No tenants found.</p>
                                    <p className="text-sm">Try adjusting your search criteria.</p>
                                </div>
                            )}
                            <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {tenants.length} tenant{tenants.length !== 1 ? 's' : ''}
                                    {search && ` matching "${search}"`}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {selectedTenant && (
                <TenantEditDrawer
                    open={showEditDrawer}
                    onOpenChange={() => {
                        setShowEditDrawer(false);
                        setSelectedTenant(null);
                    }}
                    tenant={selectedTenant}
                    cities={cities}
                    properties={properties}
                    unitsByProperty={unitsByProperty}
                    onSuccess={handleEditSuccess}
                />
            )}
        </AppLayout>
    );
}
