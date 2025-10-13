import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePermissions } from '@/hooks/usePermissions';
import AppLayout from '@/layouts/app-layout';
import { City } from '@/types/City';
import { PropertyInfoWithoutInsurance } from '@/types/PropertyInfoWithoutInsurance';
import { Tenant } from '@/types/tenant';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle, Download, Edit, FileSpreadsheet, Loader2, Plus, Search, Trash2, Upload, X, XCircle, RotateCcw } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import TenantCreateDrawer from './TenantCreateDrawer';
import TenantEditDrawer from './TenantEditDrawer';

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
                        <div className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.successful_imports}</div>
                        <div className="text-sm text-green-600 dark:text-green-400">Success</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.errors}</div>
                        <div className="text-sm text-red-600 dark:text-red-400">Errors</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">{stats.duplicates}</div>
                        <div className="text-sm text-orange-600 dark:text-orange-400">Duplicates</div>
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
    onSubmit: (file: File, skipDuplicates: boolean) => void;
    isLoading: boolean;
}> = ({ isOpen, onClose, onSubmit, isLoading }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [skipDuplicates, setSkipDuplicates] = useState(false);

    const handleFileSelect = (file: File) => {
        if (file && (file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv'))) {
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
            onSubmit(selectedFile, skipDuplicates);
        }
    };

    const resetModal = () => {
        setSelectedFile(null);
        setDragOver(false);
        setSkipDuplicates(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClose = () => {
        resetModal();
        onClose();
    };

    const downloadTemplate = () => {
        window.location.href = route('tenants.import.template');
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
                            <CardTitle>Import Tenants from CSV</CardTitle>
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
                            <div className="mb-2 flex items-center justify-between">
                                <h4 className="text-sm font-medium">Required CSV Columns</h4>
                                <Button type="button" variant="link" size="sm" onClick={downloadTemplate} className="h-auto p-0 text-xs text-primary">
                                    Download Template
                                </Button>
                            </div>
                            <ul className="space-y-1 text-xs text-muted-foreground">
                                <li>
                                    <strong>Property name</strong> - Name of the property
                                </li>
                                <li>
                                    <strong>Unit number</strong> - Unit number/name
                                </li>
                                <li>
                                    <strong>First name</strong> - Tenant's first name
                                </li>
                                <li>
                                    <strong>Last name</strong> - Tenant's last name
                                </li>
                                <li>
                                    <strong>Street address line 1</strong> - Street address (optional)
                                </li>
                                <li>
                                    <strong>Login email</strong> - Login email (optional)
                                </li>
                                <li>
                                    <strong>Alternate email</strong> - Alternate email (optional)
                                </li>
                                <li>
                                    <strong>Mobile</strong> - Mobile phone (optional)
                                </li>
                                <li>
                                    <strong>Emergency phone</strong> - Emergency contact (optional)
                                </li>
                            </ul>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                id="skip-duplicates"
                                type="checkbox"
                                checked={skipDuplicates}
                                onChange={(e) => setSkipDuplicates(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                disabled={isLoading}
                            />
                            <Label htmlFor="skip-duplicates" className="text-sm text-muted-foreground">
                                Skip duplicate tenants
                            </Label>
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

interface Props {
    tenants: Tenant[];
    search?: string;
    cities: City[];
    properties: PropertyInfoWithoutInsurance[];
    unitsByProperty: Record<string, Array<{id: number; unit_name: string}>>;
    importStats?: {
        total_processed: number;
        successful_imports: number;
        errors: number;
        duplicates: number;
    };
}

export default function Index({ tenants, search, cities, properties, unitsByProperty, importStats }: Props) {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
    // const [searchTerm, setSearchTerm] = useState(search || '');
    const [isExporting, setIsExporting] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showImportStats, setShowImportStats] = useState(!!importStats);
    const [showCreateDrawer, setShowCreateDrawer] = useState(false);
    const [showEditDrawer, setShowEditDrawer] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
    const { flash } = usePage().props;

    // New filter states
    const [tempFilters, setTempFilters] = useState({
        city: '',
        property: '',
        unitName: '',
        search: search || ''
    });

    const [, setFilters] = useState({
        city: '',
        property: '',
        unitName: '',
        search: search || ''
    });

    // Dropdown states
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
    const [showUnitDropdown, setShowUnitDropdown] = useState(false);

    // Refs for dropdowns
    const cityDropdownRef = useRef<HTMLDivElement>(null);
    const propertyDropdownRef = useRef<HTMLDivElement>(null);
    const unitDropdownRef = useRef<HTMLDivElement>(null);

    // Notification system
    const { notification, showNotification, hideNotification } = useNotification();

    // Import form
    const importForm = useForm({
        file: null as File | null,
        skip_duplicates: false as boolean,
    });

    // Handle clicks outside dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
                setShowCityDropdown(false);
            }
            if (propertyDropdownRef.current && !propertyDropdownRef.current.contains(event.target as Node)) {
                setShowPropertyDropdown(false);
            }
            if (unitDropdownRef.current && !unitDropdownRef.current.contains(event.target as Node)) {
                setShowUnitDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter change handlers
    const handleTempFilterChange = (key: string, value: string) => {
        setTempFilters(prev => ({ ...prev, [key]: value }));
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

    const handleSearchClick = () => {
        setFilters(tempFilters);
        router.get(route('tenants.index'), {
            search: tempFilters.search,
            city: tempFilters.city,
            property: tempFilters.property,
            unit_name: tempFilters.unitName
        }, { preserveState: true });
    };

    // const handleSearch = (e: React.FormEvent) => {
    //     e.preventDefault();
    //     handleSearchClick();
    // };

    const handleClearFilters = () => {
        // Reset all filters to empty state
        setTempFilters({
            city: '',
            property: '',
            unitName: '',
            search: ''
        });
        setFilters({
            city: '',
            property: '',
            unitName: '',
            search: ''
        });
        
        // Navigate to the base route without any query parameters
        router.get(route('tenants.index'), {}, {
            preserveState: false,
            replace: true
        });
    };

    const handleDelete = (tenant: Tenant) => {
        if (confirm(`Are you sure you want to archive ${tenant.first_name} ${tenant.last_name}? This will hide them from the main list but they can be restored later.`)) {
            router.patch(route('tenants.archive', tenant.id), {}, {
                onSuccess: () => {
                    showNotification('success', 'Tenant archived successfully!');
                },
                onError: () => {
                    showNotification('error', 'Failed to archive tenant. Please try again.');
                }
            });
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

    // Handle import
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
                },
            );
        },
        [importForm, showNotification],
    );

    // Helper function to display values or 'N/A'
    const displayValue = (value: string | number | null | undefined): string => {
        if (value === null || value === undefined || value === '') {
            return 'N/A';
        }
        return String(value);
    };

    // const getYesNoBadge = (value: 'Yes' | 'No' | string | null) => {
    //     if (value === null || value === undefined || value === '') return <Badge variant="outline">N/A</Badge>;
    //     return (
    //         <Badge
    //             variant={value === 'Yes' ? 'default' : 'secondary'}
    //             className={
    //                 value === 'Yes'
    //                     ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    //                     : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    //             }
    //         >
    //             {value}
    //         </Badge>
    //     );
    // };

    const getInsuranceBadge = (value: 'Yes' | 'No' | string | null) => {
        if (value === null || value === undefined || value === '') return <Badge variant="outline">N/A</Badge>;
        return (
            <Badge
                variant={value === 'Yes' ? 'default' : 'destructive'}
                className={value === 'Yes' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : undefined}
            >
                {value}
            </Badge>
        );
    };

    const getSensitiveBadge = (value: 'Yes' | 'No' | string | null) => {
        if (value === null || value === undefined || value === '') return <Badge variant="outline">N/A</Badge>;
        return (
            <Badge
                variant={value === 'Yes' ? 'destructive' : 'default'}
                className={value === 'No' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : undefined}
            >
                {value}
            </Badge>
        );
    };

    const getAssistanceBadge = (value: 'Yes' | 'No' | string | null) => {
        if (value === null || value === undefined || value === '') return <Badge variant="outline">N/A</Badge>;
        return (
            <Badge
                variant={value === 'Yes' ? 'default' : 'secondary'}
                className={
                    value === 'Yes'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                }
            >
                {value}
            </Badge>
        );
    };

    // Filter cities based on input
    const filteredCities = cities.filter(city =>
        city.city.toLowerCase().includes(tempFilters.city.toLowerCase())
    );

    // Filter properties based on input
    const filteredProperties = properties.filter(property =>
        property.property_name.toLowerCase().includes(tempFilters.property.toLowerCase())
    );

    // Get unique unit names from tenants
    const uniqueUnitNames = Array.from(new Set(tenants.map(tenant => tenant.unit_number).filter(Boolean)));
    const filteredUnitNames = uniqueUnitNames.filter(unitName =>
        unitName.toLowerCase().includes(tempFilters.unitName.toLowerCase())
    );

    return (
        <AppLayout>
            <Head title="Tenants" />

            {/* Custom Notification */}
            {notification && <Notification type={notification.type} message={notification.message} onClose={hideNotification} />}

            {/* Import Modal */}
            <ImportModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                onSubmit={handleImport}
                isLoading={importForm.processing}
            />

            {/* Create Tenant Drawer */}
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
                    {/* Flash Messages */}
                    {(flash as any)?.success && (
                        <div className="mb-4 rounded border border-green-200 bg-green-50 px-4 py-3 text-green-800 dark:border-green-800 dark:bg-green-950/20 dark:text-green-200">
                            {(flash as { success?: string })?.success}
                        </div>
                    )}
                    {flash && typeof flash === 'object' && 'error' in flash && flash.error && (
                        <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-800 dark:border-red-800 dark:bg-red-950/20 dark:text-red-200">
                            {flash.error && <div>{flash.error as React.ReactNode}</div>}
                        </div>
                    )}

                    {/* Import Stats */}
                    {showImportStats && importStats && <ImportStatsCard stats={importStats} onClose={() => setShowImportStats(false)} />}

                    {/* Title and Buttons - Outside Card */}
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-foreground">Tenants</h1>
                        <div className="flex items-center gap-2">
                            {/* Export Button */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCSVExport}
                                disabled={isExporting || tenants.length === 0}
                                className="flex items-center"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                {isExporting ? 'Exporting...' : 'Export CSV'}
                            </Button>

                            {/* Import Button */}
                            {hasPermission('tenants.import') && (
                                <Button onClick={() => setShowImportModal(true)} variant="outline" size="sm" className="flex items-center">
                                    <Upload className="mr-2 h-4 w-4" />
                                    Import CSV
                                </Button>
                            )}

                            {hasAllPermissions(['tenants.create', 'tenants.store']) && (
                                <Button onClick={() => setShowCreateDrawer(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add New Tenant
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Filters and Table Card */}
                    <Card className="bg-card text-card-foreground shadow-lg">
                        <CardHeader>
                            {/* Filters */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                {/* City Filter with Autocomplete */}
                                <div className="relative" ref={cityDropdownRef}>
                                    <Input
                                        type="text"
                                        placeholder="City"
                                        value={tempFilters.city}
                                        onChange={handleCityInputChange}
                                        onFocus={() => setShowCityDropdown(true)}
                                        className="text-input-foreground bg-input"
                                    />
                                    {showCityDropdown && filteredCities.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 z-50 mb-1 max-h-60 overflow-auto rounded-md border border-input bg-popover shadow-lg">
                                            {filteredCities.map((city) => (
                                                <div
                                                    key={city.id}
                                                    className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                                    onClick={() => handleCitySelect(city)}
                                                >
                                                    {city.city}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Property Filter with Autocomplete */}
                                <div className="relative" ref={propertyDropdownRef}>
                                    <Input
                                        type="text"
                                        placeholder="Property"
                                        value={tempFilters.property}
                                        onChange={handlePropertyInputChange}
                                        onFocus={() => setShowPropertyDropdown(true)}
                                        className="text-input-foreground bg-input"
                                    />
                                    {showPropertyDropdown && filteredProperties.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 z-50 mb-1 max-h-60 overflow-auto rounded-md border border-input bg-popover shadow-lg">
                                            {filteredProperties.map((property) => (
                                                <div
                                                    key={property.id}
                                                    className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                                    onClick={() => {
                                                        handleTempFilterChange('property', property.property_name);
                                                        setShowPropertyDropdown(false);
                                                    }}
                                                >
                                                    {property.property_name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Unit Name Filter */}
                                <div className="relative" ref={unitDropdownRef}>
                                    <Input
                                        type="text"
                                        placeholder="Unit Name"
                                        value={tempFilters.unitName}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            handleTempFilterChange('unitName', value);
                                            setShowUnitDropdown(value.length > 0);
                                        }}
                                        onFocus={() => setShowUnitDropdown(tempFilters.unitName.length > 0)}
                                        className="text-input-foreground bg-input"
                                    />
                                    {showUnitDropdown && filteredUnitNames.length > 0 && ( 
                                        <div className="absolute top-full left-0 right-0 z-50 mb-1 max-h-60 overflow-auto rounded-md border border-input bg-popover shadow-lg">
                                            {filteredUnitNames.map((unitName) => (
                                                <div
                                                    key={unitName}
                                                    className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                                    onClick={() => {
                                                        handleTempFilterChange('unitName', unitName);
                                                        setShowUnitDropdown(false);
                                                    }}
                                                >
                                                    {unitName}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Search Filter */}
                                <div className="flex gap-2">
                                    <Input
                                        type="text"
                                        placeholder="Search tenants..."
                                        value={tempFilters.search}
                                        onChange={(e) => handleTempFilterChange('search', e.target.value)}
                                        className="text-input-foreground bg-input flex-1"
                                    />
                                    <Button type="button" onClick={handleSearchClick} size="sm">
                                        <Search className="h-4 w-4" />
                                    </Button>
                                    <Button type="button" onClick={handleClearFilters} size="sm" variant="outline" title="Clear all filters">
                                        <RotateCcw className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            {/* Table */}
                            <div className="overflow-x-auto">
                                <Table className="border-collapse rounded-md border border-border">
                                    <TableHeader>
                                        <TableRow className="border-border">
                                            <TableHead className="sticky left-0 z-10 bg-muted text-muted-foreground border border-border min-w-[120px]">City</TableHead>
                                            <TableHead className="sticky left-[120px] z-10 bg-muted text-muted-foreground border border-border min-w-[150px]">Property Name</TableHead>
                                            <TableHead className="sticky left-[270px] z-10 bg-muted text-muted-foreground border border-border min-w-[120px]">Unit Number</TableHead>
                                            <TableHead className="sticky left-[390px] z-10 bg-muted text-muted-foreground border border-border min-w-[120px]">First Name</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Last Name</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Street Address</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Login Email</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Alternate Email</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Mobile</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Emergency Phone</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Payment Method</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Has Insurance</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Sensitive Communication</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Has Assistance</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Assistance Amount</TableHead>
                                            <TableHead className="border border-border bg-muted text-muted-foreground">Assistance Company</TableHead>
                                            {hasAnyPermission(['tenants.show', 'tenants.edit', 'tenants.update', 'tenants.destroy']) && (
                                                <TableHead className="border border-border bg-muted text-muted-foreground">Actions</TableHead>
                                            )}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tenants.map((tenant) => (
                                            <TableRow key={tenant.id} className="border-border hover:bg-muted/50">
                                                <TableCell className="sticky left-0 z-10 bg-muted text-center font-medium text-foreground border border-border">{displayValue(tenant.city_name)}</TableCell>
                                                <TableCell className="sticky left-[120px] z-10 bg-muted text-center font-medium text-foreground border border-border">{displayValue(tenant.property_name)}</TableCell>
                                                <TableCell className="sticky left-[270px] z-10 bg-muted text-center font-medium text-foreground border border-border">{displayValue(tenant.unit_number)}</TableCell>
                                                <TableCell className="sticky left-[390px] z-10 bg-muted text-center font-medium text-foreground border border-border">{displayValue(tenant.first_name)}</TableCell>
                                                <TableCell className="border border-border text-center text-foreground">{displayValue(tenant.last_name)}</TableCell>
                                                <TableCell className="border border-border text-center text-foreground max-w-[200px]">
                                                    <div className="truncate" title={tenant.street_address_line || 'N/A'}>
                                                        {displayValue(tenant.street_address_line)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="border border-border text-center text-foreground max-w-[200px]">
                                                    <div className="truncate" title={tenant.login_email || 'N/A'}>
                                                        {displayValue(tenant.login_email)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="border border-border text-center text-foreground max-w-[200px]">
                                                    <div className="truncate" title={tenant.alternate_email || 'N/A'}>
                                                        {displayValue(tenant.alternate_email)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="border border-border text-center text-foreground">{displayValue(tenant.mobile)}</TableCell>
                                                <TableCell className="border border-border text-center text-foreground">{displayValue(tenant.emergency_phone)}</TableCell>
                                                <TableCell className="border border-border text-center text-foreground">{displayValue(tenant.cash_or_check)}</TableCell>
                                                <TableCell className="border border-border text-center">{getInsuranceBadge(tenant.has_insurance ?? null)}</TableCell>
                                                <TableCell className="border border-border text-center">{getSensitiveBadge(tenant.sensitive_communication ?? null)}</TableCell>
                                                <TableCell className="border border-border text-center">{getAssistanceBadge(tenant.has_assistance ?? null)}</TableCell>
                                                <TableCell className="border border-border text-center text-foreground">
                                                    {tenant.assistance_amount ? (
                                                        `$${tenant.assistance_amount}`
                                                    ) : (
                                                        <span className="text-muted-foreground">N/A</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="border border-border text-center text-foreground max-w-[150px]">
                                                    <div className="truncate" title={tenant.assistance_company || 'N/A'}>
                                                        {displayValue(tenant.assistance_company)}
                                                    </div>
                                                </TableCell>

                                                {hasAnyPermission(['tenants.show', 'tenants.edit', 'tenants.update', 'tenants.destroy']) && (
                                                    <TableCell className="border border-border text-center">
                                                        <div className="flex gap-1">
                                                            {hasAllPermissions(['tenants.edit', 'tenants.update']) && (
                                                                <Button variant="outline" size="sm" onClick={() => handleEdit(tenant)}>
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            {hasPermission('tenants.destroy') && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleDelete(tenant)}
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
                            {tenants.length === 0 && (
                                <div className="py-8 text-center text-muted-foreground">
                                    <p className="text-lg">No tenants found.</p>
                                    <p className="text-sm">Try adjusting your search criteria.</p>
                                </div>
                            )}
                            {/* Summary information */}
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

            {/* Edit Drawer */}
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
