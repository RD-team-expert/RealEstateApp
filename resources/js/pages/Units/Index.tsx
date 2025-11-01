import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { usePermissions } from '@/hooks/usePermissions';
import AppLayout from '@/layouts/app-layout';
import { PageProps, PaginatedUnits, Unit, UnitFilters, UnitStatistics } from '@/types/unit';
import { PropertyInfoWithoutInsurance } from '@/types/PropertyInfoWithoutInsurance';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Download, Plus, Upload } from 'lucide-react';
import { useCallback, useState } from 'react';
import UnitCreateDrawer from './UnitCreateDrawer';
import UnitEditDrawer from './UnitEditDrawer';

// Import extracted components
import Notification from './index/Notification';
import ImportStatsCard from './index/ImportStatsCard';
import ImportModal from './index/ImportModal';
import FlashMessage from './index/FlashMessage';
import UnitsFilter from './index/UnitsFilter';
import UnitsTable from './index/UnitsTable';
import Pagination from './index/Pagination';
import { useNotification } from './index/useNotification';

// Import utilities
import { exportToCSV } from './index/csvExport';

interface Props extends PageProps {
    units: PaginatedUnits;
    statistics: UnitStatistics;
    filters: UnitFilters;
    cities?: Array<{ id: number; city: string }>;
    properties?: PropertyInfoWithoutInsurance[];
    importStats?: {
        success_count: number;
        error_count: number;
        skipped_count: number;
        total_processed: number;
    };
}

export default function Units({ units, filters, cities, properties, importStats }: Props) {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
    const [, setSearchFilters] = useState<UnitFilters>(filters);
    const [tempFilters, setTempFilters] = useState<UnitFilters>(filters);
    const [isExporting, setIsExporting] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showImportStats, setShowImportStats] = useState(!!importStats);
    const [showCreateDrawer, setShowCreateDrawer] = useState(false);
    const [showEditDrawer, setShowEditDrawer] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
    const { flash } = usePage().props;

    // City and Property autocomplete states
    const [cityInput, setCityInput] = useState(tempFilters.city || '');
    const [propertyInput, setPropertyInput] = useState(tempFilters.property || '');

    // Notification system
    const { notification, showNotification, hideNotification } = useNotification();

    // Import form
    const importForm = useForm({
        file: null as File | null,
        skip_duplicates: true,
        update_existing: false,
    });

    const handleTempFilterChange = (key: keyof UnitFilters, value: string) => {
        setTempFilters({ ...tempFilters, [key]: value });
    };

    const handleCityInputChange = (value: string) => {
        setCityInput(value);
        handleTempFilterChange('city', value);
    };

    const handleCitySelect = (city: string) => {
        setCityInput(city);
        handleTempFilterChange('city', city);
    };

    const handlePropertyInputChange = (value: string) => {
        setPropertyInput(value);
        handleTempFilterChange('property', value);
    };

    const handlePropertySelect = (property: PropertyInfoWithoutInsurance) => {
        setPropertyInput(property.property_name);
        handleTempFilterChange('property', property.property_name);
    };

    const handleSearchClick = () => {
        setSearchFilters(tempFilters);

        // Convert UnitFilters to a plain object
        const filterParams: Record<string, string> = {};
        Object.entries(tempFilters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                filterParams[key] = String(value);
            }
        });

        router.get(route('units.index'), filterParams, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        // Reset all filter states
        const emptyFilters: UnitFilters = {
            city: '',
            property: '',
            unit_name: '',
            vacant: '',
            listed: '',
            insurance: '',
        };

        setTempFilters(emptyFilters);
        setSearchFilters(emptyFilters);
        setCityInput('');
        setPropertyInput('');

        // Navigate to the page without any filters
        router.get(
            route('units.index'),
            {},
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleDelete = (unit: Unit) => {
        if (confirm('Are you sure you want to delete this unit?')) {
            router.delete(route('units.destroy', unit.id));
        }
    };

    const handleEdit = (unit: Unit) => {
        setSelectedUnit(unit);
        setShowEditDrawer(true);
    };

    const handleEditSuccess = () => {
        // Refresh the page data after successful edit
        router.reload({ only: ['units', 'statistics'] });
    };

    const handleCreateSuccess = () => {
        // Refresh the page data after successful creation
        router.reload({ only: ['units', 'statistics'] });
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

    // Handle import
    const handleImport = useCallback(
        (file: File) => {
            importForm.setData('file', file);

            router.post(
                route('units.import'),
                {
                    file: file,
                    skip_duplicates: importForm.data.skip_duplicates,
                    update_existing: importForm.data.update_existing,
                },
                {
                    forceFormData: true,
                    onSuccess: () => {
                        setShowImportModal(false);
                        importForm.reset();
                        showNotification('success', 'CSV file imported successfully!');
                    },
                    onError: (errors) => {
                        const errorMessage = (errors as any).file || 'Failed to import CSV file. Please try again.';
                        showNotification('error', errorMessage as string);
                    },
                    onFinish: () => {
                        importForm.clearErrors();
                    },
                }
            );
        },
        [importForm, showNotification]
    );

    return (
        <AppLayout>
            <Head title="Units" />

            {/* Custom Notification */}
            {notification && <Notification type={notification.type} message={notification.message} onClose={hideNotification} />}

            {/* Import Modal */}
            <ImportModal isOpen={showImportModal} onClose={() => setShowImportModal(false)} onSubmit={handleImport} isLoading={importForm.processing} />

            <div className="min-h-screen bg-background py-12 text-foreground transition-colors">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Flash Messages */}
                    {(flash as any)?.success && <FlashMessage type="success" message={(flash as any)?.success} />}
                    {(flash as any)?.error && <FlashMessage type="error" message={(flash as any)?.error} />}

                    {/* Import Stats */}
                    {showImportStats && importStats && <ImportStatsCard stats={importStats} onClose={() => setShowImportStats(false)} />}

                    {/* Title and Buttons Section */}
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-foreground">Units List</h1>
                        <div className="flex items-center gap-2">
                            {/* Export Button */}
                            <Button variant="outline" size="sm" onClick={handleCSVExport} disabled={isExporting || units.data.length === 0} className="flex items-center">
                                <Download className="mr-2 h-4 w-4" />
                                {isExporting ? 'Exporting...' : 'Export CSV'}
                            </Button>

                            {/* Import Button */}
                            {hasPermission('units.import') && (
                                <Button onClick={() => setShowImportModal(true)} variant="outline" size="sm" className="flex items-center">
                                    <Upload className="mr-2 h-4 w-4" />
                                    Import CSV
                                </Button>
                            )}

                            {hasAnyPermission(['units.store', 'units.create']) && (
                                <Button onClick={() => setShowCreateDrawer(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Unit
                                </Button>
                            )}
                        </div>
                    </div>

                    <Card className="bg-card text-card-foreground shadow-lg">
                        <CardHeader>
                            {/* Filters */}
                            <UnitsFilter
                                filters={tempFilters}
                                cities={cities || []}
                                properties={properties || []}
                                cityInput={cityInput}
                                propertyInput={propertyInput}
                                onFilterChange={handleTempFilterChange}
                                onCityInputChange={handleCityInputChange}
                                onCitySelect={handleCitySelect}
                                onPropertyInputChange={handlePropertyInputChange}
                                onPropertySelect={handlePropertySelect}
                                onSearch={handleSearchClick}
                                onClear={handleClearFilters}
                            />
                        </CardHeader>
                        <CardContent>
                            {/* Units Table */}
                            <UnitsTable
                                units={units.data}
                                hasEditPermission={hasAllPermissions(['units.edit', 'units.update'])}
                                hasDeletePermission={hasPermission('units.destroy')}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />

                            {units.data.length === 0 && (
                                <div className="py-8 text-center text-muted-foreground">
                                    <p className="text-lg">No units found matching your criteria.</p>
                                    <p className="text-sm">Try adjusting your search filters.</p>
                                </div>
                            )}

                            {/* Pagination */}
                            <Pagination links={units.links} currentPage={units.current_page} lastPage={units.last_page} />

                            {/* Total count */}
                            <div className="mt-4 text-center text-sm text-muted-foreground">
                                Showing {units.from || 0} to {units.to || 0} of {units.total || 0} units
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Unit Create Drawer */}
            <UnitCreateDrawer open={showCreateDrawer} onOpenChange={setShowCreateDrawer} cities={cities || []} properties={properties || []} onSuccess={handleCreateSuccess} />

            {/* Unit Edit Drawer */}
            {selectedUnit && (
                <UnitEditDrawer unit={selectedUnit} cities={cities || []} properties={properties || []} open={showEditDrawer} onOpenChange={setShowEditDrawer} onSuccess={handleEditSuccess} />
            )}
        </AppLayout>
    );
}
