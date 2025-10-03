// PropertyInfoWithoutInsurance/Index.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { PropertyInfoWithoutInsurance, PaginatedPropertyInfoWithoutInsurance, PropertyInfoWithoutInsuranceFilters } from '@/types/PropertyInfoWithoutInsurance';
import { City } from '@/types/City';
import AppLayout from '@/layouts/app-layout';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { 
    Trash2, 
    Plus, 
    X, 
    Search, 
    Building2,
    AlertCircle,
    CheckCircle,
    XCircle,
    Edit,
    MapPin,
    Home
} from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

interface Props {
    properties: PaginatedPropertyInfoWithoutInsurance;
    cities: City[];
    filters: PropertyInfoWithoutInsuranceFilters;
}

// Custom Notification Component
interface NotificationProps {
    type: 'success' | 'error' | 'info';
    message: string;
    onClose: () => void;
    duration?: number;
}

const Notification: React.FC<NotificationProps> = ({ 
    type, 
    message, 
    onClose, 
    duration = 4000 
}) => {
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
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

// Custom hook for notifications
const useNotification = () => {
    const [notification, setNotification] = useState<{
        type: 'success' | 'error' | 'info';
        message: string;
    } | null>(null);

    const showNotification = useCallback((type: 'success' | 'error' | 'info', message: string) => {
        setNotification({ type, message });
    }, []);

    const hideNotification = useCallback(() => {
        setNotification(null);
    }, []);

    return {
        notification,
        showNotification,
        hideNotification
    };
};

// Separate form component for better organization
const PropertyForm: React.FC<{
    onSubmit: (data: { property_name: string; city_id: number | null }) => void;
    onCancel: () => void;
    isLoading: boolean;
    error?: string;
    cities: City[];
    editingProperty?: PropertyInfoWithoutInsurance | null;
}> = ({ onSubmit, onCancel, isLoading, error, cities, editingProperty }) => {
    const [propertyName, setPropertyName] = useState(editingProperty?.property_name || '');
    const [cityId, setCityId] = useState<string>(editingProperty?.city_id?.toString() || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (propertyName.trim()) {
            onSubmit({
                property_name: propertyName.trim(),
                city_id: cityId ? parseInt(cityId) : null
            });
            if (!editingProperty) {
                setPropertyName('');
                setCityId('');
            }
        }
    };

    return (
        <Card className="bg-card text-card-foreground shadow-lg border-primary/10">
            <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Home className="h-5 w-5 text-primary" />
                        <CardTitle className="text-xl font-semibold">
                            {editingProperty ? 'Edit Property' : 'Add New Property'}
                        </CardTitle>
                    </div>
                    <Button 
                        onClick={onCancel} 
                        variant="ghost" 
                        size="sm"
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {error && (
                    <Alert className="mb-4 text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-destructive">{error}</AlertDescription>
                    </Alert>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="property_name" className="text-sm font-medium">
                            Property Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="property_name"
                            type="text"
                            value={propertyName}
                            onChange={(e) => setPropertyName(e.target.value)}
                            placeholder="Enter property name (e.g., Sunset Apartments, Oak Street Complex)"
                            className="transition-colors focus:border-primary"
                            disabled={isLoading}
                            autoComplete="off"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="city_id" className="text-sm font-medium">
                            City <span className="text-muted-foreground">(Optional)</span>
                        </Label>
                        <Select value={cityId} onValueChange={setCityId} disabled={isLoading}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a city (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                                {cities.map((city) => (
                                    <SelectItem key={city.id} value={city.id.toString()}>
                                        {city.city}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <Button 
                            type="submit" 
                            disabled={isLoading || !propertyName.trim()}
                            className="flex-1"
                        >
                            {isLoading ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                                    {editingProperty ? 'Updating...' : 'Adding...'}
                                </>
                            ) : (
                                <>
                                    {editingProperty ? (
                                        <>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Update Property
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Property
                                        </>
                                    )}
                                </>
                            )}
                        </Button>
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={onCancel}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

// Separate table component for better organization
const PropertiesTable: React.FC<{
    properties: PropertyInfoWithoutInsurance[];
    onDelete: (id: number) => void;
    onEdit: (property: PropertyInfoWithoutInsurance) => void;
    canEdit: boolean;
    canDelete: boolean;
    canView: boolean;
    searchTerm: string;
    cityFilter: string;
}> = ({ properties, onDelete, onEdit, canEdit, canDelete, canView, searchTerm, cityFilter }) => {
    const handleDelete = useCallback((id: number, propertyName: string) => {
        if (window.confirm(`Are you sure you want to delete "${propertyName}"? This action cannot be undone.`)) {
            onDelete(id);
        }
    }, [onDelete]);

    if (properties.length === 0 && (searchTerm || cityFilter)) {
        return (
            <div className="text-center py-12">
                <Search className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">No properties found</h3>
                <p className="text-muted-foreground">
                    No properties match your current filters
                </p>
            </div>
        );
    }

    if (properties.length === 0) {
        return (
            <div className="text-center py-12">
                <Home className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">No properties yet</h3>
                <p className="text-muted-foreground">
                    Get started by adding your first property
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="overflow-hidden rounded-lg border border-border">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                            <TableHead className="font-semibold text-foreground">
                                <div className="flex items-center gap-2">
                                    <Home className="h-4 w-4" />
                                    Property Name
                                </div>
                            </TableHead>
                            <TableHead className="font-semibold text-foreground">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    City
                                </div>
                            </TableHead>
                            {(canEdit || canDelete || canView) && (
                                <TableHead className="font-semibold text-foreground w-32">
                                    Actions
                                </TableHead>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {properties.map((property) => (
                            <TableRow 
                                key={property.id} 
                                className="hover:bg-muted/30 transition-colors group"
                            >
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-primary/60" />
                                        <span className="text-foreground">{property.property_name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {property.city ? (
                                        <Badge variant="secondary" className="font-normal">
                                            {property.city.city}
                                        </Badge>
                                    ) : (
                                        <span className="text-muted-foreground italic">No city assigned</span>
                                    )}
                                </TableCell>
                                {(canEdit || canDelete || canView) && (
                                    <TableCell>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            
                                            {canEdit && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onEdit(property)}
                                                    className="text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                    <span className="sr-only">Edit {property.property_name}</span>
                                                </Button>
                                            )}
                                            {canDelete && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(property.id, property.property_name)}
                                                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Delete {property.property_name}</span>
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
            
            <div className="flex items-center justify-between pt-4 text-sm text-muted-foreground border-t border-border">
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono">
                        {properties.length}
                    </Badge>
                    <span>
                        {properties.length === 1 ? 'property' : 'properties'} on this page
                    </span>
                </div>
            </div>
        </>
    );
};

// Pagination component
const Pagination: React.FC<{
    paginationData: PaginatedPropertyInfoWithoutInsurance;
    filters: PropertyInfoWithoutInsuranceFilters;
}> = ({ paginationData, filters }) => {
    const handlePageChange = (url: string | null) => {
        if (!url) return;
        
        router.get(url, filters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    if (paginationData.last_page <= 1) return null;

    return (
        <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
                Showing {paginationData.from} to {paginationData.to} of {paginationData.total} results
            </div>
            <div className="flex items-center gap-2">
                {paginationData.links.map((link, index) => (
                    <Button
                        key={index}
                        variant={link.active ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(link.url)}
                        disabled={!link.url}
                        className="min-w-[2.5rem]"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ))}
            </div>
        </div>
    );
};

const Index: React.FC<Props> = ({ properties, cities, filters }) => {
    const [showForm, setShowForm] = useState(false);
    const [editingProperty, setEditingProperty] = useState<PropertyInfoWithoutInsurance | null>(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [cityFilter, setCityFilter] = useState(filters.city_filter?.toString() || '');
    const { notification, showNotification, hideNotification } = useNotification();
    const { processing, errors, reset } = useForm({
        property_name: '',
        city_id: null as number | null,
    });

    const { hasPermission, hasAllPermissions } = usePermissions();

    const canCreate = hasAllPermissions(['all-properties.store', 'all-properties.create']);
    const canEdit = hasPermission('all-properties.update');
    const canDelete = hasPermission('all-properties.destroy');
    const canView = hasPermission('all-properties.show');

    const handleSubmit = useCallback((formData: { property_name: string; city_id: number | null }) => {
        if (editingProperty) {
            // Update existing property
            router.put(`/all-properties/${editingProperty.id}`, formData, {
                onSuccess: () => {
                    reset();
                    setShowForm(false);
                    setEditingProperty(null);
                    showNotification('success', `Property "${formData.property_name}" has been updated successfully!`);
                },
                onError: () => {
                    showNotification('error', 'Failed to update property. Please try again.');
                }
            });
        } else {
            // Create new property
            router.post('/all-properties', formData, {
                onSuccess: () => {
                    reset();
                    setShowForm(false);
                    showNotification('success', `Property "${formData.property_name}" has been added successfully!`);
                },
                onError: () => {
                    showNotification('error', 'Failed to add property. Please try again.');
                }
            });
        }
    }, [editingProperty, reset, showNotification]);

    const handleDelete = useCallback((id: number) => {
        const propertyToDelete = properties.data.find(property => property.id === id);
        const propertyName = propertyToDelete?.property_name || 'Unknown';
        
        router.delete(`/all-properties/${id}`, {
            onSuccess: () => {
                showNotification('success', `Property "${propertyName}" has been deleted successfully!`);
            },
            onError: () => {
                showNotification('error', 'Failed to delete property. Please try again.');
            }
        });
    }, [properties.data, showNotification]);

    const handleEdit = useCallback((property: PropertyInfoWithoutInsurance) => {
        setEditingProperty(property);
        setShowForm(true);
    }, []);

    const handleCancelForm = useCallback(() => {
        setShowForm(false);
        setEditingProperty(null);
        reset();
    }, [reset]);

    const handleSearch = useCallback(() => {
        router.visit('/all-properties', {
            data: {
                search: searchTerm || undefined,
                city_filter: cityFilter || undefined,
            },
            preserveState: true,
            preserveScroll: true,
        });
    }, [searchTerm, cityFilter]);

    const handleClearFilters = useCallback(() => {
        setSearchTerm('');
        setCityFilter('');
        router.visit('/all-properties', {
            preserveState: true,
            preserveScroll: true,
        });
    }, []);

    return (
        <AppLayout>
            <Head title="Properties Without Insurance" />

            {/* Custom Notification */}
            {notification && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    onClose={hideNotification}
                />
            )}

            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8 max-w-7xl">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                                    <Building2 className="h-8 w-8 text-primary" />
                                    Properties Without Insurance
                                </h1>
                                <p className="text-muted-foreground mt-2">
                                    Manage properties that don't require insurance coverage
                                </p>
                            </div>
                            {canCreate && (
                                <Button
                                    onClick={() => {
                                        setEditingProperty(null);
                                        setShowForm(!showForm);
                                    }}
                                    variant={showForm ? "outline" : "default"}
                                    size="lg"
                                    className="shadow-lg"
                                >
                                    {showForm ? (
                                        <>
                                            <X className="h-4 w-4 mr-2" />
                                            Cancel
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Property
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Form Section */}
                        {showForm && canCreate && (
                            <div className="lg:col-span-4">
                                <PropertyForm
                                    onSubmit={handleSubmit}
                                    onCancel={handleCancelForm}
                                    isLoading={processing}
                                    error={errors.property_name || errors.city_id}
                                    cities={cities}
                                    editingProperty={editingProperty}
                                />
                            </div>
                        )}

                        {/* Table Section */}
                        <div className={`${showForm && canCreate ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
                            <Card className="bg-card text-card-foreground shadow-lg">
                                <CardHeader className="pb-4">
                                    <div className="flex flex-col gap-4">
                                        <CardTitle className="text-xl font-semibold">
                                            Properties Directory
                                        </CardTitle>
                                        
                                        {/* Filters */}
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <div className="relative flex-1">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="Search properties..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="pl-10 bg-background"
                                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                                />
                                            </div>
                                            <Select value={cityFilter} onValueChange={setCityFilter}>
                                                <SelectTrigger className="w-full sm:w-48">
                                                    <SelectValue placeholder="Filter by city" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all-cities">All Cities</SelectItem>
                                                    {cities.map((city) => (
                                                        <SelectItem key={city.id} value={city.id.toString()}>
                                                            {city.city}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <div className="flex gap-2">
                                                <Button onClick={handleSearch} variant="outline" size="sm">
                                                    <Search className="h-4 w-4 mr-2" />
                                                    Search
                                                </Button>
                                                {(searchTerm || cityFilter) && (
                                                    <Button onClick={handleClearFilters} variant="ghost" size="sm">
                                                        <X className="h-4 w-4 mr-2" />
                                                        Clear
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <PropertiesTable
                                        properties={properties.data}
                                        onDelete={handleDelete}
                                        onEdit={handleEdit}
                                        canEdit={canEdit}
                                        canDelete={canDelete}
                                        canView={canView}
                                        searchTerm={searchTerm}
                                        cityFilter={cityFilter}
                                    />
                                    
                                    {/* Pagination */}
                                    <div className="mt-6">
                                        <Pagination paginationData={properties} filters={filters} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default Index;