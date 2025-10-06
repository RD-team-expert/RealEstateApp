import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Head, Link, router, usePage, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/app-layout';
import { Tenant } from '@/types/tenant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, Edit, Eye, Plus, Search, Download, Upload, FileSpreadsheet, Loader2, CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { type BreadcrumbItem } from '@/types';


// CSV Export utility function
const exportToCSV = (data: Tenant[], filename: string = 'tenants.csv') => {
    const headers = [
        'ID',
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
        ...data.map(tenant => [
            tenant.id,
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md bg-background">
                <CardHeader className="pb-4">
                    <div className="flex justify-between items-center">
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
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium text-sm">Required CSV Columns</h4>
                                <Button
                                    type="button"
                                    variant="link"
                                    size="sm"
                                    onClick={downloadTemplate}
                                    className="p-0 h-auto text-xs text-primary"
                                >
                                    Download Template
                                </Button>
                            </div>
                            <ul className="text-xs text-muted-foreground space-y-1">
                                <li><strong>Property name</strong> - Name of the property</li>
                                <li><strong>Unit number</strong> - Unit number/name</li>
                                <li><strong>First name</strong> - Tenant's first name</li>
                                <li><strong>Last name</strong> - Tenant's last name</li>
                                <li><strong>Street address line 1</strong> - Street address (optional)</li>
                                <li><strong>Login email</strong> - Login email (optional)</li>
                                <li><strong>Alternate email</strong> - Alternate email (optional)</li>
                                <li><strong>Mobile</strong> - Mobile phone (optional)</li>
                                <li><strong>Emergency phone</strong> - Emergency contact (optional)</li>
                            </ul>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                id="skip-duplicates"
                                type="checkbox"
                                checked={skipDuplicates}
                                onChange={(e) => setSkipDuplicates(e.target.checked)}
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
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

interface Props {
    tenants: Tenant[];
    search?: string;
    importStats?: {
        total_processed: number;
        successful_imports: number;
        errors: number;
        duplicates: number;
    };
}

export default function Index({ tenants, search, importStats }: Props) {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
    const [searchTerm, setSearchTerm] = useState(search || '');
    const [isExporting, setIsExporting] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showImportStats, setShowImportStats] = useState(!!importStats);
    const { flash } = usePage().props;

    // Notification system
    const { notification, showNotification, hideNotification } = useNotification();

    // Import form
    const importForm = useForm({
        file: null as File | null,
        skip_duplicates: false,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('tenants.index'), { search: searchTerm }, { preserveState: true });
    };

    const handleDelete = (tenant: Tenant) => {
        if (confirm(`Are you sure you want to delete ${tenant.first_name} ${tenant.last_name}?`)) {
            router.delete(route('tenants.destroy', tenant.id));
        }
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
    const handleImport = useCallback((file: File, skipDuplicates: boolean) => {
        importForm.setData({
            file: file,
            skip_duplicates: skipDuplicates,
        });
        
        router.post(route('tenants.import.process'), {
            file: file,
            skip_duplicates: skipDuplicates,
        }, {
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
        });
    }, [importForm, showNotification]);

    // Helper function to display values or 'N/A'
    const displayValue = (value: string | number | null | undefined): string => {
        if (value === null || value === undefined || value === '') {
            return 'N/A';
        }
        return String(value);
    };

    const getYesNoBadge = (value: 'Yes' | 'No' | string | null) => {
        if (value === null || value === undefined || value === '') return <Badge variant="outline">N/A</Badge>;
        return (
            <Badge
                variant={value === 'Yes' ? 'default' : 'secondary'}
                className={value === 'Yes'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                }
            >
                {value}
            </Badge>
        );
    };

    const getInsuranceBadge = (value: 'Yes' | 'No' | string | null) => {
        if (value === null || value === undefined || value === '') return <Badge variant="outline">N/A</Badge>;
        return (
            <Badge
                variant={value === 'Yes' ? 'default' : 'destructive'}
                className={value === 'Yes'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : undefined
                }
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
                className={value === 'No'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : undefined
                }
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
                className={value === 'Yes'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                }
            >
                {value}
            </Badge>
        );
    };

    return (
        <AppLayout>
            <Head title="Tenants" />
            
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

            <div className="py-12 bg-background text-foreground transition-colors min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="mb-4 bg-green-50 border border-green-200 text-green-800 dark:bg-green-950/20 dark:border-green-800 dark:text-green-200 px-4 py-3 rounded">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-800 dark:text-red-200 px-4 py-3 rounded">
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

                    <Card className="bg-card text-card-foreground shadow-lg">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl">Tenants</CardTitle>
                                <div className="flex gap-2 items-center">
                                    {/* Export Button */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCSVExport}
                                        disabled={isExporting || tenants.length === 0}
                                        className="flex items-center"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        {isExporting ? 'Exporting...' : 'Export CSV'}
                                    </Button>

                                    {/* Import Button */}
                                    {hasPermission('tenants.import') && (
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

                                    {hasAllPermissions(['tenants.create','tenants.store']) && (
                                        <Link href={route('tenants.create')}>
                                            <Button>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add New Tenant
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                            <form onSubmit={handleSearch} className="flex gap-2 mt-4">
                                <div className="flex-1">
                                    <Input
                                        type="text"
                                        placeholder="Search tenants..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="bg-input text-input-foreground"
                                    />
                                </div>
                                <Button type="submit">
                                    <Search className="h-4 w-4" />
                                </Button>
                            </form>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-border">
                                            <TableHead className="text-muted-foreground">Property Name</TableHead>
                                            <TableHead className="text-muted-foreground">Unit Number</TableHead>
                                            <TableHead className="text-muted-foreground">First Name</TableHead>
                                            <TableHead className="text-muted-foreground">Last Name</TableHead>
                                            <TableHead className="text-muted-foreground">Street Address</TableHead>
                                            <TableHead className="text-muted-foreground">Login Email</TableHead>
                                            <TableHead className="text-muted-foreground">Alternate Email</TableHead>
                                            <TableHead className="text-muted-foreground">Mobile</TableHead>
                                            <TableHead className="text-muted-foreground">Emergency Phone</TableHead>
                                            <TableHead className="text-muted-foreground">Payment Method</TableHead>
                                            <TableHead className="text-muted-foreground">Has Insurance</TableHead>
                                            <TableHead className="text-muted-foreground">Sensitive Communication</TableHead>
                                            <TableHead className="text-muted-foreground">Has Assistance</TableHead>
                                            <TableHead className="text-muted-foreground">Assistance Amount</TableHead>
                                            <TableHead className="text-muted-foreground">Assistance Company</TableHead>

                                            {hasAnyPermission(['tenants.show','tenants.edit','tenants.update','tenants.destroy']) && (
                                            <TableHead className="text-muted-foreground">Actions</TableHead>)}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tenants.map((tenant) => (
                                            <TableRow key={tenant.id} className="hover:bg-muted/50 border-border">
                                                <TableCell className="font-medium text-foreground">
                                                    {displayValue(tenant.property_name)}
                                                </TableCell>
                                                <TableCell className="text-foreground">
                                                    {displayValue(tenant.unit_number)}
                                                </TableCell>
                                                <TableCell className="text-foreground">
                                                    {displayValue(tenant.first_name)}
                                                </TableCell>
                                                <TableCell className="text-foreground">
                                                    {displayValue(tenant.last_name)}
                                                </TableCell>
                                                <TableCell className="max-w-[200px] text-foreground">
                                                    <div className="truncate" title={tenant.street_address_line || 'N/A'}>
                                                        {displayValue(tenant.street_address_line)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="max-w-[200px] text-foreground">
                                                    <div className="truncate" title={tenant.login_email || 'N/A'}>
                                                        {displayValue(tenant.login_email)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="max-w-[200px] text-foreground">
                                                    <div className="truncate" title={tenant.alternate_email || 'N/A'}>
                                                        {displayValue(tenant.alternate_email)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-foreground">
                                                    {displayValue(tenant.mobile)}
                                                </TableCell>
                                                <TableCell className="text-foreground">
                                                    {displayValue(tenant.emergency_phone)}
                                                </TableCell>
                                                <TableCell className="text-foreground">
                                                    {displayValue(tenant.cash_or_check)}
                                                </TableCell>
                                                <TableCell>
                                                    {getInsuranceBadge(tenant.has_insurance)}
                                                </TableCell>
                                                <TableCell>
                                                    {getSensitiveBadge(tenant.sensitive_communication)}
                                                </TableCell>
                                                <TableCell>
                                                    {getAssistanceBadge(tenant.has_assistance)}
                                                </TableCell>
                                                <TableCell className="text-foreground">
                                                    {tenant.assistance_amount ? `$${tenant.assistance_amount}` : <span className="text-muted-foreground">N/A</span>}
                                                </TableCell>
                                                <TableCell className="max-w-[150px] text-foreground">
                                                    <div className="truncate" title={tenant.assistance_company || 'N/A'}>
                                                        {displayValue(tenant.assistance_company)}
                                                    </div>
                                                </TableCell>

                                                {hasAnyPermission(['tenants.show','tenants.edit','tenants.update','tenants.destroy']) && (
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        {hasPermission('tenants.show') && (
                                                        <Link href={route('tenants.show', tenant.id)}>
                                                            <Button variant="outline" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>)}
                                                        {hasAllPermissions(['tenants.edit','tenants.update']) && (
                                                        <Link href={route('tenants.edit', tenant.id)}>
                                                            <Button variant="outline" size="sm">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>)}
                                                        {hasPermission('tenants.destroy') && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDelete(tenant)}
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
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
                            {tenants.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p className="text-lg">No tenants found.</p>
                                    <p className="text-sm">Try adjusting your search criteria.</p>
                                </div>
                            )}
                            {/* Summary information */}
                            <div className="mt-6 flex justify-between items-center border-t border-border pt-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {tenants.length} tenant{tenants.length !== 1 ? 's' : ''}
                                    {search && ` matching "${search}"`}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
