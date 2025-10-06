import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Head, Link, router, usePage, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, Edit, Eye, Plus, Search, Download, Upload, FileSpreadsheet, Loader2, CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
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
        <div className={`fixed top-4 right-4 z-50 min-w-80 max-w-md p-4 rounded-lg border shadow-lg transform transition-all duration-300 ease-in-out ${getBgColor()}`}>
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
        <Card className="mb-6 border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
            <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <CardTitle className="text-lg font-semibold text-green-800 dark:text-green-200">
                            Import Completed Successfully
                        </CardTitle>
                    </div>
                    <Button onClick={onClose} variant="ghost" size="sm" className="text-green-600 hover:text-green-800 dark:text-green-400">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md bg-background">
                <CardHeader className="pb-4">
                    <div className="flex justify-between items-center">
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
                                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
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
                                        <FileSpreadsheet className="h-8 w-8 text-green-600 mx-auto" />
                                        <p className="font-medium text-green-700">{selectedFile.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {(selectedFile.size / 1024).toFixed(1)} KB
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                                        <p className="text-muted-foreground">
                                            Drop your CSV file here or{' '}
                                            <Button
                                                type="button"
                                                variant="link"
                                                className="p-0 h-auto text-primary"
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

                        <div className="bg-muted/50 rounded-lg p-3">
                            <h4 className="font-medium mb-2 text-sm">Required CSV Columns</h4>
                            <ul className="text-xs text-muted-foreground space-y-1">
                                <li><strong>PropertyName</strong> - Name of the property</li>
                                <li><strong>number</strong> - Unit number/name</li>
                                <li><strong>BedBath</strong> - Bedroom/bathroom info (e.g., "4 Bed/3.5 Bath")</li>
                                <li><strong>Residents</strong> - Tenant names or "VACANT"</li>
                                <li><strong>LeaseStartRaw</strong> - Lease start date</li>
                                <li><strong>LeaseEndRaw</strong> - Lease end date</li>
                                <li><strong>rent</strong> - Monthly rent amount</li>
                                <li><strong>recurringCharges</strong> - Recurring charges</li>
                            </ul>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button type="submit" disabled={!selectedFile || isLoading} className="flex-1">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Importing...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4 mr-2" />
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
    importStats?: {
        success_count: number;
        error_count: number;
        skipped_count: number;
        total_processed: number;
    };
}

export default function Index({ auth, units, statistics, filters, importStats }: Props) {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
    const [searchFilters, setSearchFilters] = useState<UnitFilters>(filters);
    const [isExporting, setIsExporting] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showImportStats, setShowImportStats] = useState(!!importStats);
    const { flash } = usePage().props;

    // Notification system
    const { notification, showNotification, hideNotification } = useNotification();

    // Import form
    const importForm = useForm({
        file: null as File | null,
        skip_duplicates: true,
        update_existing: false,
    });

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

    // Handle import
    const handleImport = useCallback((file: File) => {
        importForm.setData('file', file);
        
        router.post(route('units.import'), {
            file: file,
            skip_duplicates: importForm.data.skip_duplicates,
            update_existing: importForm.data.update_existing,
        }, {
            forceFormData: true,
            onSuccess: () => {
                setShowImportModal(false);
                importForm.reset();
                showNotification('success', 'CSV file imported successfully!');
            },
            onError: (errors) => {
                const errorMessage = errors.file || 'Failed to import CSV file. Please try again.';
                showNotification('error', errorMessage);
            },
            onFinish: () => {
                importForm.clearErrors();
            },
        });
    }, [importForm, showNotification]);

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
        <AppLayout>
            <Head title="Units" />
            
            {/* Custom Notification */}
            {notification && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    onClose={hideNotification}
                />
            )}

            {/* Import Modal */}
            <ImportModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                onSubmit={handleImport}
                isLoading={importForm.processing}
            />

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

                    {/* Import Stats */}
                    {showImportStats && importStats && (
                        <ImportStatsCard
                            stats={importStats}
                            onClose={() => setShowImportStats(false)}
                        />
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

                                    {/* Import Button */}
                                    {hasPermission('units.import') && (
                                        <Button
                                            onClick={() => setShowImportModal(true)}
                                            variant="outline"
                                            size="sm"
                                            className="flex items-center"
                                        >
                                            <Upload className="h-4 w-4 mr-2" />
                                            Import CSV
                                        </Button>
                                    )}

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
