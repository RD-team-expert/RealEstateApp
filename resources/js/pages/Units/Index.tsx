import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePermissions } from '@/hooks/usePermissions';
import AppLayout from '@/layouts/app-layout';
import { PageProps, PaginatedUnits, Unit, UnitFilters, UnitStatistics } from '@/types/unit';
import { PropertyInfoWithoutInsurance } from '@/types/PropertyInfoWithoutInsurance';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { AlertCircle, CheckCircle, Download, Edit, FileSpreadsheet, Loader2, Plus, Search, Trash2, Upload, X, XCircle, ChevronDown } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import UnitCreateDrawer from './UnitCreateDrawer';
import UnitEditDrawer from './UnitEditDrawer';

/**
 * Always treat the value as a date-only (no time, no TZ).
 * Works for "YYYY-MM-DD" and for ISO strings by grabbing the first 10 chars.
 */
const formatDateOnly = (value?: string | null, fallback = '-'): string => {
    if (!value) return fallback;

    // Grab YYYY-MM-DD from the front (works for "2025-10-01" and "2025-10-01T00:00:00Z")
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (!m) return fallback;

    const [, y, mo, d] = m;
    // Construct a local calendar date (no timezone shifting)
    const date = new Date(Number(y), Number(mo) - 1, Number(d));
    return format(date, 'P'); // localized short date (or use 'MM/dd/yyyy' if you want fixed format)
};

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
        'Applications',
    ];

    // Handles either "YYYY-MM-DD" (date-only) or full ISO timestamps

    const csvData = [
        headers.join(','),
        ...data.map((unit) =>
            [
                unit.id,
                `"${unit.city}"`,
                `"${unit.property}"`,
                `"${unit.unit_name}"`,
                `"${unit.tenants || ''}"`,
                `"${formatDateOnly(unit.lease_start, '')}"`,
                `"${formatDateOnly(unit.lease_end, '')}"`,
                unit.count_beds || '',
                unit.count_baths || '',
                `"${unit.lease_status || ''}"`,
                `"${unit.formatted_monthly_rent || ''}"`,
                `"${(unit.recurring_transaction || '').replace(/"/g, '""')}"`,
                `"${(unit.utility_status || '').replace(/"/g, '""')}"`,
                `"${(unit.account_number || '').replace(/"/g, '""')}"`,
                `"${unit.insurance || ''}"`,
                `"${formatDateOnly(unit.insurance_expiration_date, '')}"`,
                `"${unit.vacant}"`,
                `"${unit.listed}"`,
                unit.total_applications || 0,
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

// Custom Notification Component
interface NotificationProps {
    type: 'success' | 'error' | 'info';
    message: string;
    onClose: () => void;
    duration?: number;
}

const Notification: React.FC<NotificationProps> = ({ type, message, onClose, duration = 4000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [onClose, duration]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'error':
                return <XCircle className="h-5 w-5 text-red-500" />;
            case 'info':
                return <AlertCircle className="h-5 w-5 text-blue-500" />;
            default:
                return <AlertCircle className="h-5 w-5 text-blue-500" />;
        }
    };

    const getBgColor = () => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800';
            case 'error':
                return 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800';
            case 'info':
                return 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800';
            default:
                return 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800';
        }
    };

    return (
        <div
            className={`fixed top-4 right-4 z-50 max-w-md min-w-80 transform rounded-lg border p-4 shadow-lg transition-all duration-300 ease-in-out ${getBgColor()}`}
        >
            <div className="flex items-start gap-3">
                {getIcon()}
                <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{message}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

// Custom hook for notifications
const useNotification = () => {
    const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

    const showNotification = useCallback((type: 'success' | 'error' | 'info', message: string) => {
        setNotification({ type, message });
    }, []);

    const hideNotification = useCallback(() => {
        setNotification(null);
    }, []);

    return { notification, showNotification, hideNotification };
};

// Import Stats Component
const ImportStatsCard: React.FC<{ stats: any; onClose: () => void }> = ({ stats, onClose }) => {
    if (!stats) return null;

    return (
        <Card className="mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <CardTitle className="text-lg font-semibold text-green-800 dark:text-green-200">Import Completed Successfully</CardTitle>
                    </div>
                    <Button onClick={onClose} variant="ghost" size="sm" className="text-green-600 hover:text-green-800 dark:text-green-400">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.success_count}</div>
                        <div className="text-sm text-green-600 dark:text-green-400">Success</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.error_count}</div>
                        <div className="text-sm text-blue-600 dark:text-blue-400">Errors</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">{stats.skipped_count}</div>
                        <div className="text-sm text-orange-600 dark:text-orange-400">Skipped</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.total_processed}</div>
                        <div className="text-sm text-purple-600 dark:text-purple-400">Total Processed</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// Import Modal Component
const ImportModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (file: File) => void;
    isLoading: boolean;
}> = ({ isOpen, onClose, onSubmit, isLoading }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dragOver, setDragOver] = useState(false);

    const handleFileSelect = (file: File) => {
        if (file && file.type === 'text/csv') {
            setSelectedFile(file);
        } else {
            alert('Please select a valid CSV file.');
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedFile) {
            onSubmit(selectedFile);
        }
    };

    const resetModal = () => {
        setSelectedFile(null);
        setDragOver(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClose = () => {
        resetModal();
        onClose();
    };

    useEffect(() => {
        if (!isOpen) {
            resetModal();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-md bg-background">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FileSpreadsheet className="h-5 w-5 text-primary" />
                            <CardTitle>Import Units from CSV</CardTitle>
                        </div>
                        <Button onClick={handleClose} variant="ghost" size="sm" disabled={isLoading}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>CSV File</Label>
                            <div
                                className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                                    dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
                                }`}
                                onDrop={handleDrop}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setDragOver(true);
                                }}
                                onDragLeave={() => setDragOver(false)}
                            >
                                {selectedFile ? (
                                    <div className="space-y-2">
                                        <FileSpreadsheet className="mx-auto h-8 w-8 text-green-600" />
                                        <p className="font-medium text-green-700">{selectedFile.name}</p>
                                        <p className="text-sm text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                                        <p className="text-muted-foreground">
                                            Drop your CSV file here or{' '}
                                            <Button
                                                type="button"
                                                variant="link"
                                                className="h-auto p-0 text-primary"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                browse files
                                            </Button>
                                        </p>
                                        <p className="text-xs text-muted-foreground">CSV files only, max 10MB</p>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileInputChange}
                                    className="hidden"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="rounded-lg bg-muted/50 p-3">
                            <h4 className="mb-2 text-sm font-medium">Required CSV Columns</h4>
                            <ul className="space-y-1 text-xs text-muted-foreground">
                                <li>
                                    <strong>PropertyName</strong> - Name of the property
                                </li>
                                <li>
                                    <strong>number</strong> - Unit number/name
                                </li>
                                <li>
                                    <strong>BedBath</strong> - Bedroom/bathroom info (e.g., "4 Bed/3.5 Bath")
                                </li>
                                <li>
                                    <strong>Residents</strong> - Tenant names or "VACANT"
                                </li>
                                <li>
                                    <strong>LeaseStartRaw</strong> - Lease start date
                                </li>
                                <li>
                                    <strong>LeaseEndRaw</strong> - Lease end date
                                </li>
                                <li>
                                    <strong>rent</strong> - Monthly rent amount
                                </li>
                                <li>
                                    <strong>recurringCharges</strong> - Recurring charges
                                </li>
                            </ul>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button type="submit" disabled={!selectedFile || isLoading} className="flex-1">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Importing...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Import CSV
                                    </>
                                )}
                            </Button>
                            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

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

export default function Index({  units,  filters, cities, properties, importStats }: Props) {
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

    // City autocomplete states
    const [cityInput, setCityInput] = useState(tempFilters.city || '');
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [filteredCities, setFilteredCities] = useState<Array<{ id: number; city: string }>>([]);
    const cityInputRef = useRef<HTMLInputElement>(null);
    const cityDropdownRef = useRef<HTMLDivElement>(null);

    // Property autocomplete states
    const [propertyInput, setPropertyInput] = useState(tempFilters.property || '');
    const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
    const propertyInputRef = useRef<HTMLInputElement>(null);
    const propertyDropdownRef = useRef<HTMLDivElement>(null);

    // Notification system
    const { notification, showNotification, hideNotification } = useNotification();

    // Import form
    const importForm = useForm({
        file: null as File | null,
        skip_duplicates: true,
        update_existing: false,
    });

    // Filter cities based on input
    useEffect(() => {
        if (!cities) return;
        
        if (cityInput.trim() === '') {
            setFilteredCities(cities);
        } else {
            const filtered = cities.filter(city =>
                city.city.toLowerCase().includes(cityInput.toLowerCase())
            );
            setFilteredCities(filtered);
        }
    }, [cityInput, cities]);

    // Filter properties based on input
    const filteredProperties = properties?.filter(property =>
        property.property_name.toLowerCase().includes(propertyInput.toLowerCase())
    ) || [];

    // Handle clicks outside dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node) &&
                cityInputRef.current && !cityInputRef.current.contains(event.target as Node)) {
                setShowCityDropdown(false);
            }
            if (propertyDropdownRef.current && !propertyDropdownRef.current.contains(event.target as Node) &&
                propertyInputRef.current && !propertyInputRef.current.contains(event.target as Node)) {
                setShowPropertyDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleTempFilterChange = (key: keyof UnitFilters, value: string) => {
        setTempFilters({ ...tempFilters, [key]: value });
    };

    const handleCitySelect = (city: string) => {
        setCityInput(city);
        handleTempFilterChange('city', city);
        setShowCityDropdown(false);
    };

    const handleCityInputChange = (value: string) => {
        setCityInput(value);
        handleTempFilterChange('city', value);
        setShowCityDropdown(true);
    };

    const handlePropertyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPropertyInput(value);
        handleTempFilterChange('property', value);
        setShowPropertyDropdown(value.length > 0);
    };

    const handlePropertySelect = (property: PropertyInfoWithoutInsurance) => {
        setPropertyInput(property.property_name);
        handleTempFilterChange('property', property.property_name);
        setShowPropertyDropdown(false);
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
        router.get(route('units.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
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
                },
            );
        },
        [importForm, showNotification],
    );

    const getVacantBadge = (vacant: string) => {
        if (!vacant) return <Badge variant="outline">-</Badge>;
        return <Badge variant={vacant === 'Yes' ? 'destructive' : 'default'}>{vacant}</Badge>;
    };

    const getListedBadge = (listed: string) => {
        if (!listed) return <Badge variant="outline">-</Badge>;
        return <Badge variant={listed === 'Yes' ? 'default' : 'secondary'}>{listed}</Badge>;
    };

    const getInsuranceBadge = (insurance: string | null) => {
        if (!insurance || insurance === '-') return <Badge variant="outline">N/A</Badge>;
        return <Badge variant={insurance === 'Yes' ? 'default' : 'destructive'}>{insurance}</Badge>;
    };

    return (
        <AppLayout>
            <Head title="Units" />

            {/* Custom Notification */}
            {notification && <Notification type={notification.type} message={notification.message} onClose={hideNotification} />}

            {/* Import Modal */}
            <ImportModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                onSubmit={handleImport}
                isLoading={importForm.processing}
            />

            <div className="min-h-screen bg-background py-12 text-foreground transition-colors">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Flash Messages */}
                    {(flash as any)?.success && (
                        <Card className="mb-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                            <CardContent className="p-4">
                                <div className="text-green-700 dark:text-green-300">{(flash as any)?.success}</div>
                            </CardContent>
                        </Card>
                    )}
                    {(flash as any)?.error && (
                        <Card className="mb-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                            <CardContent className="p-4">
                                <div className="text-red-700 dark:text-red-300">{(flash as any)?.error}</div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Import Stats */}
                    {showImportStats && importStats && <ImportStatsCard stats={importStats} onClose={() => setShowImportStats(false)} />}

                    {/* Title and Buttons Section */}
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-foreground">Units List</h1>
                        <div className="flex items-center gap-2">
                            {/* Export Button */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCSVExport}
                                disabled={isExporting || units.data.length === 0}
                                className="flex items-center"
                            >
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
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-7">
                                {/* City Filter with Autocomplete */}
                                <div className="relative">
                                    <Input
                                        ref={cityInputRef}
                                        type="text"
                                        placeholder="City"
                                        value={cityInput}
                                        onChange={(e) => handleCityInputChange(e.target.value)}
                                        onFocus={() => setShowCityDropdown(true)}
                                        className="text-input-foreground bg-input pr-8"
                                    />
                                    <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    
                                    {showCityDropdown && filteredCities.length > 0 && (
                                        <div
                                            ref={cityDropdownRef}
                                            className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-input bg-popover shadow-lg"
                                        >
                                            {filteredCities.map((city) => (
                                                <div
                                                    key={city.id}
                                                    className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                                    onClick={() => handleCitySelect(city.city)}
                                                >
                                                    {city.city}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Property Filter with Autocomplete */}
                                <div className="relative">
                                    <Input
                                        ref={propertyInputRef}
                                        type="text"
                                        placeholder="Property"
                                        value={propertyInput}
                                        onChange={handlePropertyInputChange}
                                        onFocus={() => setShowPropertyDropdown(true)}
                                        className="text-input-foreground bg-input pr-8"
                                    />
                                    <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    
                                    {showPropertyDropdown && filteredProperties.length > 0 && (
                                        <div
                                            ref={propertyDropdownRef}
                                            className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-input bg-popover shadow-lg"
                                        >
                                            {filteredProperties.map((property) => (
                                                <div
                                                    key={property.id}
                                                    className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                                    onClick={() => handlePropertySelect(property)}
                                                >
                                                    {property.property_name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <Input
                                    type="text"
                                    placeholder="Unit Name"
                                    value={tempFilters.unit_name || ''}
                                    onChange={(e) => handleTempFilterChange('unit_name', e.target.value)}
                                    className="text-input-foreground bg-input"
                                />
                                <select
                                    value={tempFilters.vacant || ''}
                                    onChange={(e) => handleTempFilterChange('vacant', e.target.value)}
                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">All Vacant Status</option>
                                    <option value="Yes">Vacant</option>
                                    <option value="No">Occupied</option>
                                </select>
                                <select
                                    value={tempFilters.listed || ''}
                                    onChange={(e) => handleTempFilterChange('listed', e.target.value)}
                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">All Listed Status</option>
                                    <option value="Yes">Listed</option>
                                    <option value="No">Not Listed</option>
                                </select>
                                <Button onClick={handleSearchClick} variant="default" className="flex items-center">
                                    <Search className="mr-2 h-4 w-4" />
                                    Search
                                </Button>
                                <Button onClick={handleClearFilters} variant="outline" className="flex items-center">
                                    <X className="mr-2 h-4 w-4" />
                                    Clear
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="relative overflow-x-auto">
                                <Table className="border-collapse rounded-md border border-border">
                                    <TableHeader>
                                        <TableRow className="border-border">
                                            <TableHead className="sticky left-0 z-10 min-w-[120px] border border-border bg-muted text-muted-foreground">
                                                City
                                            </TableHead>
                                            <TableHead className="sticky left-[120px] z-10 min-w-[120px] border border-border bg-muted text-muted-foreground">
                                                Property
                                            </TableHead>
                                            <TableHead className="sticky left-[240px] z-10 min-w-[120px] border border-border bg-muted text-muted-foreground">
                                                Unit Name
                                            </TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Tenants</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Lease Start</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Lease End</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Beds</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Baths</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Lease Status</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Monthly Rent</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">
                                                Recurring Transaction
                                            </TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Utility Status</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Account Number</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Insurance</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Insurance Exp.</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Vacant</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Listed</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Applications</TableHead>
                                            {hasAnyPermission(['units.show', 'units.edit', 'units.update', 'units.destroy']) && (
                                                <TableHead className="border border-border bg-muted text-muted-foreground">Actions</TableHead>
                                            )}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {units.data.map((unit) => (
                                            <TableRow key={unit.id} className="border-border hover:bg-muted/50">
                                                <TableCell className="sticky left-0 z-10 min-w-[120px] border border-border bg-muted text-center font-medium text-foreground">
                                                    {unit.city}
                                                </TableCell>
                                                <TableCell className="sticky left-[120px] z-10 min-w-[120px] border border-border bg-muted text-center font-medium text-foreground">
                                                    {unit.property}
                                                </TableCell>
                                                <TableCell className="sticky left-[240px] z-10 min-w-[120px] border border-border bg-muted text-center font-medium text-foreground">
                                                    {unit.unit_name}
                                                </TableCell>
                                                <TableCell className="border border-border text-center text-foreground">
                                                    {unit.tenants || '-'}
                                                </TableCell>
                                                <TableCell className="border border-border text-center text-foreground">
                                                    {formatDateOnly(unit.lease_start)}
                                                </TableCell>
                                                <TableCell className="border border-border text-center text-foreground">
                                                    {formatDateOnly(unit.lease_end)}
                                                </TableCell>
                                                <TableCell className="border border-border text-center text-foreground">
                                                    {unit.count_beds || '-'}
                                                </TableCell>
                                                <TableCell className="border border-border text-center text-foreground">
                                                    {unit.count_baths || '-'}
                                                </TableCell>
                                                <TableCell className="border border-border text-center text-foreground">
                                                    {unit.lease_status || '-'}
                                                </TableCell>
                                                <TableCell className="border border-border text-center text-foreground">
                                                    <span className="font-medium">{unit.formatted_monthly_rent}</span>
                                                </TableCell>
                                                <TableCell className="border border-border text-center text-foreground">
                                                    <div className="max-w-32 truncate" title={unit.recurring_transaction || ''}>
                                                        {unit.recurring_transaction || '-'}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="border border-border text-center text-foreground">
                                                    <div className="max-w-24 truncate" title={unit.utility_status || ''}>
                                                        {unit.utility_status || '-'}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="border border-border text-center text-foreground">
                                                    <div className="max-w-24 truncate" title={unit.account_number || ''}>
                                                        {unit.account_number || '-'}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="border border-border text-center">
                                                    {getInsuranceBadge(unit.insurance)}
                                                </TableCell>
                                                <TableCell className="border border-border text-center text-foreground">
                                                    {unit.insurance_expiration_date ? formatDateOnly(unit.insurance_expiration_date) : '-'}
                                                </TableCell>
                                                <TableCell className="border border-border text-center">{getVacantBadge(unit.vacant)}</TableCell>
                                                <TableCell className="border border-border text-center">{getListedBadge(unit.listed)}</TableCell>
                                                <TableCell className="border border-border text-center">
                                                    <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                                                        {unit.total_applications}
                                                    </Badge>
                                                </TableCell>
                                                {hasAnyPermission(['units.show', 'units.edit', 'units.update', 'units.destroy']) && (
                                                    <TableCell className="border border-border text-center">
                                                        <div className="flex gap-1">
                                                            {hasAllPermissions(['units.edit', 'units.update']) && (
                                                                <Button variant="outline" size="sm" onClick={() => handleEdit(unit)}>
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            {hasPermission('units.destroy') && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleDelete(unit)}
                                                                    className="border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {units.data.length === 0 && (
                                <div className="py-8 text-center text-muted-foreground">
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
                                                className={`rounded px-3 py-2 text-sm transition-colors ${
                                                    link.active
                                                        ? 'bg-primary text-primary-foreground'
                                                        : link.url
                                                          ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                                          : 'cursor-not-allowed bg-muted text-muted-foreground'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </nav>
                                </div>
                            )}

                            {/* Total count */}
                            <div className="mt-4 text-center text-sm text-muted-foreground">
                                Showing {units.from || 0} to {units.to || 0} of {units.total || 0} units
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Unit Create Drawer */}
            <UnitCreateDrawer 
                open={showCreateDrawer} 
                onOpenChange={setShowCreateDrawer} 
                cities={cities || []} 
                properties={properties || []}
                onSuccess={handleCreateSuccess}
            />

            {/* Unit Edit Drawer */}
            {selectedUnit && (
                <UnitEditDrawer
                    unit={selectedUnit}
                    cities={cities || []}
                    properties={properties || []}
                    open={showEditDrawer}
                    onOpenChange={setShowEditDrawer}
                    onSuccess={handleEditSuccess}
                />
            )}
        </AppLayout>
    );
}
