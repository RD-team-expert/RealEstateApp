import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Eye, Plus, Search, Download, X, ChevronDown } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import OffersAndRenewalsCreateDrawer from './OffersAndRenewalsCreateDrawer';
import OffersAndRenewalsEditDrawer from './OffersAndRenewalsEditDrawer';
import { format } from 'date-fns';

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
const exportToCSV = (data: any[], activeTab: string, filename: string = 'offers-renewals.csv') => {
    try {
        const formatString = (value: string | null | undefined) => {
            if (value === null || value === undefined) return '';
            return String(value).replace(/"/g, '""');
        };

        // Dynamic headers based on active tab
        let headers = ['ID', 'City', 'Property', 'Unit', 'Tenant'];

        if (activeTab === 'offers' || activeTab === 'both') {
            headers = headers.concat([
                'Date Sent Offer',
                'Status',
                'Date of Acceptance',
                'Offer Last Notice Sent',
                'Offer Notice Kind'
            ]);
        }

        if (activeTab === 'renewals' || activeTab === 'both') {
            headers = headers.concat([
                'Lease Sent',
                'Date Sent Lease',
                'Lease Signed',
                'Date Signed',
                'Renewal Last Notice Sent',
                'Renewal Notice Kind',
                'Notes'
            ]);
        }

        headers = headers.concat(['How Many Days Left', 'Expired']);

        const csvData = [
            headers.join(','),
            ...data.map(offer => {
                try {
                    let row = [
                        offer.id || '',
                        `"${formatString(offer.city_name)}"`,
                        `"${formatString(offer.property)}"`,
                        `"${formatString(offer.unit)}"`,
                        `"${formatString(offer.tenant)}"`
                    ];

                    if (activeTab === 'offers' || activeTab === 'both') {
                        row = row.concat([
                            `"${formatDateOnly(offer.date_sent_offer, '')}"`,
                            `"${formatString(offer.status)}"`,
                            `"${formatDateOnly(offer.date_of_acceptance, '')}"`,
                            `"${formatDateOnly(offer.last_notice_sent, '')}"`,
                            `"${formatString(offer.notice_kind)}"`
                        ]);
                    }

                    if (activeTab === 'renewals' || activeTab === 'both') {
                        row = row.concat([
                            `"${formatString(offer.lease_sent)}"`,
                            `"${formatDateOnly(offer.date_sent_lease, '')}"`,
                            `"${formatString(offer.lease_signed)}"`,
                            `"${formatDateOnly(offer.date_signed, '')}"`,
                            `"${formatDateOnly(offer.last_notice_sent_2, '')}"`,
                            `"${formatString(offer.notice_kind_2)}"`,
                            `"${formatString(offer.notes)}"`
                        ]);
                    }

                    row = row.concat([
                        `"${formatString(String(offer.how_many_days_left))}"`,
                        `"${formatString(offer.expired)}"`
                    ]);

                    return row.join(',');
                } catch (rowError) {
                    console.error('Error processing offer row:', offer, rowError);
                    return '';
                }
            }).filter(row => row !== '')
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

        return true;
    } catch (error) {
        console.error('CSV Export Error:', error);
        throw error;
    }
};

interface HierarchicalData {
  id: number;
  name: string;
  properties: {
    id: number;
    name: string;
    city_id: number;
    units: {
      id: number;
      name: string;
      property_id: number;
      tenants: {
        id: number;
        name: string;
        first_name: string;
        last_name: string;
        unit_id: number;
      }[];
    }[];
  }[];
}

interface OfferRenewal {
  id: number;
  tenant_id?: number;
  city_name?: string;
  property?: string;
  unit?: string;
  tenant?: string;
  date_sent_offer?: string;
  date_offer_expires?: string;
  status?: string;
  date_of_acceptance?: string;
  last_notice_sent?: string;
  notice_kind?: string;
  lease_sent?: string;
  date_sent_lease?: string;
  lease_expires?: string;
  lease_signed?: string;
  date_signed?: string;
  last_notice_sent_2?: string;
  notice_kind_2?: string;
  notes?: string;
  how_many_days_left?: number;
  expired?: string;
  is_archived?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface PaginatedOffers {
  data: OfferRenewal[];
  current_page: number;
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
}

interface Props {
  offers: OfferRenewal[] | PaginatedOffers;
  unit_id: string | null;
  tenant_id: string | null;
  cities: any[];
  properties: any[];
  propertiesByCityId: Record<number, any[]>;
  unitsByPropertyId: Record<number, Array<{ id: number; unit_name: string }>>;
  tenantsByUnitId: Record<number, Array<{ id: number; full_name: string; tenant_id: number }>>;
  allUnits: Array<{ id: number; unit_name: string; city_name: string; property_name: string }>;
  tenantsData: Array<{ id: number; full_name: string; unit_name: string; property_name: string; city_name: string }>;
}

const TABS = [
  { label: 'Offers', value: 'offers' },
  { label: 'Renewals', value: 'renewals' },
  { label: 'Both', value: 'both' },
];

const Index = ({ offers, unit_id, tenant_id, cities, properties, propertiesByCityId, unitsByPropertyId, tenantsByUnitId, allUnits, tenantsData }: Props) => {
  const [activeTab, setActiveTab] = useState<'offers' | 'renewals' | 'both'>('offers');
  const [isExporting, setIsExporting] = useState(false);
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<OfferRenewal | null>(null);

  // Filter states
  const [tempFilters, setTempFilters] = useState({
    city: '',
    property: '',
    unit: '',
    tenant: '',
    selectedCityId: null as number | null,
    selectedPropertyId: null as number | null,
    selectedUnitId: null as number | null,
    selectedTenantId: null as number | null,
  });

  const [filters, setFilters] = useState({
    city: '',
    property: '',
    unit: '',
    tenant: '',
    selectedCityId: null as number | null,
    selectedPropertyId: null as number | null,
    selectedUnitId: null as number | null,
    selectedTenantId: null as number | null,
  });

  // Dropdown states
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const [showTenantDropdown, setShowTenantDropdown] = useState(false);

  // Refs for dropdowns
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const propertyDropdownRef = useRef<HTMLDivElement>(null);
  const unitDropdownRef = useRef<HTMLDivElement>(null);
  const tenantDropdownRef = useRef<HTMLDivElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const propertyInputRef = useRef<HTMLInputElement>(null);
  const unitInputRef = useRef<HTMLInputElement>(null);
  const tenantInputRef = useRef<HTMLInputElement>(null);

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        cityDropdownRef.current &&
        !cityDropdownRef.current.contains(event.target as Node) &&
        cityInputRef.current &&
        !cityInputRef.current.contains(event.target as Node)
      ) {
        setShowCityDropdown(false);
      }
      if (
        propertyDropdownRef.current &&
        !propertyDropdownRef.current.contains(event.target as Node) &&
        propertyInputRef.current &&
        !propertyInputRef.current.contains(event.target as Node)
      ) {
        setShowPropertyDropdown(false);
      }
      if (
        unitDropdownRef.current &&
        !unitDropdownRef.current.contains(event.target as Node) &&
        unitInputRef.current &&
        !unitInputRef.current.contains(event.target as Node)
      ) {
        setShowUnitDropdown(false);
      }
      if (
        tenantDropdownRef.current &&
        !tenantDropdownRef.current.contains(event.target as Node) &&
        tenantInputRef.current &&
        !tenantInputRef.current.contains(event.target as Node)
      ) {
        setShowTenantDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Extract the actual offers data, handling both array and paginated results
  const offersData = useMemo(() => {
    if (!offers) return [];
    
    // Check if it's a paginated result
    if (typeof offers === 'object' && 'data' in offers && Array.isArray(offers.data)) {
      return offers.data;
    }
    
    // Check if it's a plain array
    if (Array.isArray(offers)) {
      return offers;
    }
    
    // Fallback to empty array
    console.warn('Offers data is in unexpected format:', offers);
    return [];
  }, [offers]);

  // Create data arrays for dropdowns - use the data from props instead of deriving from offers
  // No need to create separate variables since we're using props directly

  // Create hierarchicalData for drawer components compatibility
  const hierarchicalData = useMemo(() => {
    return cities.map(city => ({
      id: city.id,
      name: city.city,
      properties: (propertiesByCityId[city.id] || []).map(property => ({
        id: property.id,
        name: property.property_name,
        city_id: city.id,
        units: (unitsByPropertyId[property.id] || []).map(unit => ({
          id: unit.id,
          name: unit.unit_name,
          property_id: property.id,
          tenants: (tenantsByUnitId[unit.id] || []).map(tenant => ({
            id: tenant.id,
            name: tenant.full_name,
            first_name: tenant.full_name.split(' ')[0] || '',
            last_name: tenant.full_name.split(' ').slice(1).join(' ') || '',
            unit_id: unit.id,
          }))
        }))
      }))
    }));
  }, [cities, propertiesByCityId, unitsByPropertyId, tenantsByUnitId]);

  // Filter data based on temp filters - remove frontend filtering since we'll use backend
  const filtered = offersData;

  // Filter change handlers
  const handleTempFilterChange = (key: string, value: string) => {
    setTempFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleCitySelect = (city: any) => {
    setTempFilters((prev) => ({ 
      ...prev, 
      city: city.city,
      selectedCityId: city.id,
      property: '',
      selectedPropertyId: null,
      unit: '',
      selectedUnitId: null,
      tenant: '',
      selectedTenantId: null
    }));
    setShowCityDropdown(false);
  };

  const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTempFilters((prev) => ({ 
      ...prev, 
      city: value,
      selectedCityId: null,
      property: '',
      selectedPropertyId: null,
      unit: '',
      selectedUnitId: null,
      tenant: '',
      selectedTenantId: null
    }));
    setShowCityDropdown(value.length > 0);
  };

  const handlePropertyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTempFilters((prev) => ({ 
      ...prev, 
      property: value,
      selectedPropertyId: null,
      unit: '',
      selectedUnitId: null,
      tenant: '',
      selectedTenantId: null
    }));
    setShowPropertyDropdown(value.length > 0);
  };

  const handlePropertySelect = (property: any) => {
    setTempFilters((prev) => ({ 
      ...prev, 
      property: property.property_name,
      selectedPropertyId: property.id,
      unit: '',
      selectedUnitId: null,
      tenant: '',
      selectedTenantId: null
    }));
    setShowPropertyDropdown(false);
  };

  const handleUnitInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTempFilters((prev) => ({ 
      ...prev, 
      unit: value,
      selectedUnitId: null,
      tenant: '',
      selectedTenantId: null
    }));
    setShowUnitDropdown(value.length > 0);
  };

  const handleUnitSelect = (unit: any) => {
    setTempFilters((prev) => ({ 
      ...prev, 
      unit: unit.unit_name,
      selectedUnitId: unit.id,
      tenant: '',
      selectedTenantId: null
    }));
    setShowUnitDropdown(false);
  };

  const handleTenantInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTempFilters((prev) => ({ 
      ...prev, 
      tenant: value,
      selectedTenantId: null
    }));
    setShowTenantDropdown(value.length > 0);
  };

  const handleTenantSelect = (tenant: any) => {
    setTempFilters((prev) => ({ 
      ...prev, 
      tenant: tenant.full_name,
      selectedTenantId: tenant.id
    }));
    setShowTenantDropdown(false);
  };

  const handleSearchClick = () => {
    setFilters(tempFilters);
    
    // Send name-based search parameters to the backend
    router.get(
      route('offers_and_renewals.index'),
      {
        city_name: tempFilters.city || null,
        property_name: tempFilters.property || null,
        unit_name: tempFilters.unit || null,
        tenant_name: tempFilters.tenant || null,
      },
      { preserveState: true },
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearchClick();
  };

  const handleClearFilters = () => {
    // Reset all filter states
    setTempFilters({
      city: '',
      property: '',
      unit: '',
      tenant: '',
      selectedCityId: null,
      selectedPropertyId: null,
      selectedUnitId: null,
      selectedTenantId: null,
    });
    setFilters({
      city: '',
      property: '',
      unit: '',
      tenant: '',
      selectedCityId: null,
      selectedPropertyId: null,
      selectedUnitId: null,
      selectedTenantId: null,
    });
    
    // Navigate to the page without any filter parameters
    router.get(route('offers_and_renewals.index'), {}, { preserveState: false });
  };

  const handleDelete = (offer: OfferRenewal) => {
    if (window.confirm('Are you sure you want to delete this offer? This action cannot be undone.')) {
      router.delete(`/offers_and_renewals/${offer.id}`);
    }
  };

  const handleEdit = (offer: OfferRenewal) => {
    setSelectedOffer(offer);
    setEditDrawerOpen(true);
  };

  const handleCSVExport = () => {
    if (!filtered || filtered.length === 0) {
        alert('No data to export');
        return;
    }

    setIsExporting(true);

    try {
        console.log('Exporting offers and renewals data:', filtered);
        const filename = `offers-renewals-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`;
        exportToCSV(filtered, activeTab, filename);
        console.log('Export completed successfully');
    } catch (error) {
        console.error('Export failed:', error);
        alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the console for details.`);
    } finally {
        setIsExporting(false);
    }
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline">N/A</Badge>;

    switch (status.toLowerCase()) {
      case 'accepted':
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">{status}</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">{status}</Badge>;
      case 'rejected':
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getYesNoBadge = (value: string | null) => {
    if (!value || value === '-') return <Badge variant="outline">N/A</Badge>;
    return (
      <Badge variant={value === 'Yes' ? 'default' : 'secondary'} className={
        value === 'Yes'
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
      }>
        {value}
      </Badge>
    );
  };

  const getDaysLeftBadge = (days: string | number | null) => {
    if (!days && days !== 0) return <Badge variant="outline">N/A</Badge>;
    const numDays = typeof days === 'string' ? parseInt(days) : days;
    if (numDays <= 7) {
      return <Badge variant="destructive">{days} days</Badge>;
    } else if (numDays <= 30) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">{days} days</Badge>;
    } else {
      return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">{days} days</Badge>;
    }
  };

  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  // Filter dropdown data based on input
  const filteredCities = cities.filter((city) => 
    city?.city?.toLowerCase().includes(tempFilters.city.toLowerCase())
  );

  const filteredProperties = tempFilters.selectedCityId 
    ? (propertiesByCityId[tempFilters.selectedCityId] || []).filter((property) => 
        property?.property_name?.toLowerCase().includes(tempFilters.property.toLowerCase())
      )
    : properties.filter((property) => 
        property?.property_name?.toLowerCase().includes(tempFilters.property.toLowerCase())
      );

  const filteredUnits = tempFilters.selectedPropertyId 
    ? (unitsByPropertyId[tempFilters.selectedPropertyId] || []).filter(unit =>
        unit?.unit_name?.toLowerCase().includes(tempFilters.unit.toLowerCase())
      )
    : allUnits.filter(unit =>
        unit?.unit_name?.toLowerCase().includes(tempFilters.unit.toLowerCase())
      );

  const filteredTenants = tempFilters.selectedUnitId 
    ? (tenantsByUnitId[tempFilters.selectedUnitId] || []).filter(tenant =>
        tenant?.full_name?.toLowerCase().includes(tempFilters.tenant.toLowerCase())
      )
    : tenantsData.filter(tenant =>
        tenant?.full_name?.toLowerCase().includes(tempFilters.tenant.toLowerCase())
      );

  return (
    <AppLayout>
      <Head title="Offers and Renewals" />

      <div className="min-h-screen bg-background py-12 text-foreground transition-colors">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Title and Buttons Section - Outside of Card */}
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Offers and Renewals</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCSVExport}
                disabled={isExporting || !filtered || filtered.length === 0}
                className="flex items-center"
              >
                <Download className="mr-2 h-4 w-4" />
                {isExporting ? 'Exporting...' : 'Export CSV'}
              </Button>

              {hasAllPermissions(['offers-and-renewals.create','offers-and-renewals.store']) && (
                <Button onClick={() => setCreateDrawerOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New
                </Button>
              )}
            </div>
          </div>

          {/* Card with Filters and Table */}
          <Card className="bg-card text-card-foreground shadow-lg">
            <CardHeader>
              {/* Filters */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
                {/* City Filter with Autocomplete */}
                <div className="relative">
                  <Input
                    ref={cityInputRef}
                    type="text"
                    placeholder="City"
                    value={tempFilters.city}
                    onChange={handleCityInputChange}
                    onFocus={() => setShowCityDropdown(true)}
                    className="text-input-foreground bg-input pr-8"
                  />
                  <ChevronDown className="absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  {showCityDropdown && filteredCities.length > 0 && (
                    <div
                      ref={cityDropdownRef}
                      className="absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-input bg-popover shadow-lg"
                    >
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
                <div className="relative">
                  <Input
                    ref={propertyInputRef}
                    type="text"
                    placeholder="Property"
                    value={tempFilters.property}
                    onChange={handlePropertyInputChange}
                    onFocus={() => setShowPropertyDropdown(true)}
                    className="text-input-foreground bg-input pr-8"
                  />
                  <ChevronDown className="absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  {showPropertyDropdown && filteredProperties.length > 0 && (
                    <div
                      ref={propertyDropdownRef}
                      className="absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-input bg-popover shadow-lg"
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

                {/* Unit Filter with Autocomplete */}
                <div className="relative">
                  <Input
                    ref={unitInputRef}
                    type="text"
                    placeholder="Unit"
                    value={tempFilters.unit}
                    onChange={handleUnitInputChange}
                    onFocus={() => setShowUnitDropdown(true)}
                    className="text-input-foreground bg-input pr-8"
                  />
                  <ChevronDown className="absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  {showUnitDropdown && filteredUnits.length > 0 && (
                    <div
                      ref={unitDropdownRef}
                      className="absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-input bg-popover shadow-lg"
                    >
                      {filteredUnits.map((unit) => (
                        <div
                          key={unit.id}
                          className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                          onClick={() => handleUnitSelect(unit)}
                        >
                          {unit.unit_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tenant Filter with Autocomplete */}
                <div className="relative">
                  <Input
                    ref={tenantInputRef}
                    type="text"
                    placeholder="Tenant"
                    value={tempFilters.tenant}
                    onChange={handleTenantInputChange}
                    onFocus={() => setShowTenantDropdown(true)}
                    className="text-input-foreground bg-input pr-8"
                  />
                  <ChevronDown className="absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  {showTenantDropdown && filteredTenants.length > 0 && (
                    <div
                      ref={tenantDropdownRef}
                      className="absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-input bg-popover shadow-lg"
                    >
                      {filteredTenants.map((tenant) => (
                        <div
                          key={tenant.id}
                          className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                          onClick={() => handleTenantSelect(tenant)}
                        >
                          {tenant.full_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Placeholder column for responsive grid */}
                <div className="hidden md:block"></div>

                {/* Search and Clear Buttons */}
                <div className="flex gap-2">
                  <Button onClick={handleSearchClick} variant="default" className="flex items-center">
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </Button>
                  <Button onClick={handleClearFilters} variant="outline" className="flex items-center">
                    <X className="mr-2 h-4 w-4" />
                    Clear
                  </Button>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                {TABS.map(tab => (
                  <Button
                    key={tab.value}
                    variant={activeTab === tab.value ? 'default' : 'outline'}
                    onClick={() => setActiveTab(tab.value as any)}
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>
            </CardHeader>

            <CardContent>
              <div className="relative overflow-x-auto">
                <Table className="border-collapse rounded-md border border-border">
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="sticky left-0 z-10 min-w-[120px] border border-border bg-muted text-muted-foreground">City</TableHead>
                      <TableHead className="sticky left-[120px] z-10 min-w-[150px] border border-border bg-muted text-muted-foreground">Property</TableHead>
                      <TableHead className="sticky left-[270px] z-10 min-w-[120px] border border-border bg-muted text-muted-foreground">Unit</TableHead>
                      <TableHead className="sticky left-[390px] z-10 min-w-[150px] border border-border bg-muted text-muted-foreground">Tenant</TableHead>
                      {(activeTab === 'offers' || activeTab === 'both') && (
                        <>
                          <TableHead className="border border-border bg-muted text-muted-foreground">Date Sent Offer</TableHead>
                          <TableHead className="border border-border bg-muted text-muted-foreground">Status</TableHead>
                          <TableHead className="border border-border bg-muted text-muted-foreground">Date of Acceptance</TableHead>
                          <TableHead className="border border-border bg-muted text-muted-foreground">Offer Last Notice Sent</TableHead>
                          <TableHead className="border border-border bg-muted text-muted-foreground">Offer Notice Kind</TableHead>
                        </>
                      )}
                      {(activeTab === 'renewals' || activeTab === 'both') && (
                        <>
                          <TableHead className="border border-border bg-muted text-muted-foreground">Lease Sent?</TableHead>
                          <TableHead className="border border-border bg-muted text-muted-foreground">Date Sent Lease</TableHead>
                          <TableHead className="border border-border bg-muted text-muted-foreground">Lease Signed?</TableHead>
                          <TableHead className="border border-border bg-muted text-muted-foreground">Date Signed</TableHead>
                          <TableHead className="border border-border bg-muted text-muted-foreground">Renewal Last Notice Sent</TableHead>
                          <TableHead className="border border-border bg-muted text-muted-foreground">Renewal Notice Kind</TableHead>
                          <TableHead className="border border-border bg-muted text-muted-foreground">Notes</TableHead>
                        </>
                      )}
                      <TableHead className="border border-border bg-muted text-muted-foreground">How Many Days Left</TableHead>
                      <TableHead className="border border-border bg-muted text-muted-foreground">Expired</TableHead>
                      {hasAnyPermission(['offers-and-renewals.show','offers-and-renewals.edit','offers-and-renewals.update','offers-and-renewals.destroy']) && (
                      <TableHead className="border border-border bg-muted text-muted-foreground">Actions</TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((offer) => (
                      <TableRow key={offer.id} className="hover:bg-muted/50 border-border">
                        <TableCell className="sticky left-0 z-10 border border-border bg-muted text-center font-medium text-foreground">{offer.city_name || 'N/A'}</TableCell>
                        <TableCell className="sticky left-[120px] z-10 border border-border bg-muted text-center font-medium text-foreground">{offer.property || 'N/A'}</TableCell>
                        <TableCell className="sticky left-[270px] z-10 border border-border bg-muted text-center font-medium text-foreground">{offer.unit || 'N/A'}</TableCell>
                        <TableCell className="sticky left-[390px] z-10 border border-border bg-muted text-center font-medium text-foreground">{offer.tenant || 'N/A'}</TableCell>
                        {(activeTab === 'offers' || activeTab === 'both') && (
                          <>
                            <TableCell className="border border-border text-center text-foreground">
                              {formatDateOnly(offer.date_sent_offer)}
                            </TableCell>
                            <TableCell className="border border-border text-center">
                              {getStatusBadge(offer.status ?? null)}
                            </TableCell>
                            <TableCell className="border border-border text-center text-foreground">
                              {formatDateOnly(offer.date_of_acceptance)}
                            </TableCell>
                            <TableCell className="border border-border text-center text-foreground">
                              {formatDateOnly(offer.last_notice_sent)}
                            </TableCell>
                            <TableCell className="border border-border text-center text-foreground">{offer.notice_kind || <span className="text-muted-foreground">N/A</span>}</TableCell>
                          </>
                        )}
                        {(activeTab === 'renewals' || activeTab === 'both') && (
                          <>
                            <TableCell className="border border-border text-center">
                              {getYesNoBadge(offer.lease_sent ?? null)}
                            </TableCell>
                            <TableCell className="border border-border text-center text-foreground">
                              {formatDateOnly(offer.date_sent_lease)}
                            </TableCell>
                            <TableCell className="border border-border text-center">
                              {getYesNoBadge(offer.lease_signed ?? null)}
                            </TableCell>
                            <TableCell className="border border-border text-center text-foreground">
                              {formatDateOnly(offer.date_signed)}
                            </TableCell>
                            <TableCell className="border border-border text-center text-foreground">
                              {formatDateOnly(offer.last_notice_sent_2)}
                            </TableCell>
                            <TableCell className="border border-border text-center text-foreground">{offer.notice_kind_2 || <span className="text-muted-foreground">N/A</span>}</TableCell>
                            <TableCell className="border border-border text-center">
                              {offer.notes ? (
                                <div className="max-w-24 truncate" title={offer.notes}>
                                  {offer.notes}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">N/A</span>
                              )}
                            </TableCell>
                          </>
                        )}
                        <TableCell className="border border-border text-center">
                          {getDaysLeftBadge(offer.how_many_days_left ?? null)}
                        </TableCell>
                        <TableCell className="border border-border text-center">
                          <Badge variant={offer.expired === 'expired' ? 'destructive' : 'default'}>
                            {offer.expired ?? 'N/A'}
                          </Badge>
                        </TableCell>
                        {hasAnyPermission(['offers-and-renewals.show','offers-and-renewals.edit','offers-and-renewals.update','offers-and-renewals.destroy']) && (
                        <TableCell className="border border-border text-center">
                          <div className="flex gap-1">
                            {hasPermission('offers-and-renewals.show') && (
                            <Link href={`/offers_and_renewals/${offer.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>)}
                            {hasAllPermissions(['offers-and-renewals.edit','offers-and-renewals.update']) && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEdit(offer)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>)}
                            {hasPermission('offers-and-renewals.destroy') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(offer)}
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

              {filtered.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-lg">No offers found.</p>
                  <p className="text-sm">Try adjusting your search criteria.</p>
                </div>
              )}

              <div className="mt-6 flex justify-between items-center border-t border-border pt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {filtered.length} of {offersData.length} offers
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Drawer */}
      <OffersAndRenewalsCreateDrawer
        hierarchicalData={hierarchicalData}
        open={createDrawerOpen}
        onOpenChange={setCreateDrawerOpen}
        onSuccess={() => {
          router.reload();
        }}
      />

      {/* Edit Drawer */}
      {selectedOffer && (
        <OffersAndRenewalsEditDrawer
          offer={selectedOffer}
          hierarchicalData={hierarchicalData}
          open={editDrawerOpen}
          onOpenChange={setEditDrawerOpen}
          onSuccess={() => {
            router.reload();
          }}
        />
      )}
    </AppLayout>
  );
};

export default Index;
