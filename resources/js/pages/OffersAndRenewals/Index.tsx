import  { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody } from '@/components/ui/table';
import { usePermissions } from '@/hooks/usePermissions';
import OffersAndRenewalsCreateDrawer from './OffersAndRenewalsCreateDrawer';
import OffersAndRenewalsEditDrawer from './OffersAndRenewalsEditDrawer';
import { FilterBar } from './index/FilterBar';
import { TabNavigation } from './index/TabNavigation';
import { PageHeader } from './index/PageHeader';
import { OffersTableHeader } from './index/TableHeader';
import { OffersTableRow } from './index/TableRow';
import { EmptyState } from './index/EmptyState';
import { TableFooter } from './index/TableFooter';
import { exportToCSV } from './index/utils/csvExport';

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
  other_tenants?: string;
  date_of_decline?: string;
  is_archived?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface Props {
  offers: OfferRenewal[];
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

const Index = ({ offers, cities, properties, propertiesByCityId, unitsByPropertyId, tenantsByUnitId, allUnits, tenantsData }: Props) => {
  const [activeTab, setActiveTab] = useState<'offers' | 'renewals' | 'both'>('offers');
  const [isExporting, setIsExporting] = useState(false);
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<OfferRenewal | null>(null);

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

  const [, setFilters] = useState({
    city: '',
    property: '',
    unit: '',
    tenant: '',
    selectedCityId: null as number | null,
    selectedPropertyId: null as number | null,
    selectedUnitId: null as number | null,
    selectedTenantId: null as number | null,
  });

  const offersData = useMemo(() => {
    if (!offers) return [];
    if (Array.isArray(offers)) return offers;
    console.warn('Offers data is in unexpected format:', offers);
    return [];
  }, [offers]);

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

  const filtered = offersData;

  const handleSearchClick = () => {
    setFilters(tempFilters);
    
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

  const handleClearFilters = () => {
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

  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  const permissions = {
    canView: hasPermission('offers-and-renewals.show'),
    canEdit: hasAllPermissions(['offers-and-renewals.edit','offers-and-renewals.update']),
    canDelete: hasPermission('offers-and-renewals.destroy'),
  };

  return (
    <AppLayout>
      <Head title="Offers and Renewals" />

      <div className="min-h-screen bg-background py-12 text-foreground transition-colors">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <PageHeader
            onExport={handleCSVExport}
            onAddNew={() => setCreateDrawerOpen(true)}
            isExporting={isExporting}
            hasData={filtered.length > 0}
            canCreate={hasAllPermissions(['offers-and-renewals.create','offers-and-renewals.store'])}
          />

          <Card className="bg-card text-card-foreground shadow-lg">
            <CardHeader>
              <FilterBar
                cities={cities}
                properties={properties}
                propertiesByCityId={propertiesByCityId}
                unitsByPropertyId={unitsByPropertyId}
                tenantsByUnitId={tenantsByUnitId}
                allUnits={allUnits}
                tenantsData={tenantsData}
                tempFilters={tempFilters}
                onTempFiltersChange={setTempFilters}
                onSearch={handleSearchClick}
                onClear={handleClearFilters}
              />

              <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
            </CardHeader>

            <CardContent>
              <div className="relative overflow-x-auto">
                <Table className="border-collapse rounded-md border border-border">
                  <OffersTableHeader 
                    activeTab={activeTab} 
                    hasPermissions={hasAnyPermission(['offers-and-renewals.show','offers-and-renewals.edit','offers-and-renewals.update','offers-and-renewals.destroy'])}
                  />
                  <TableBody>
                    {filtered.map((offer) => (
                      <OffersTableRow
                        key={offer.id}
                        offer={offer}
                        activeTab={activeTab}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        permissions={permissions}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filtered.length === 0 && <EmptyState />}

              <TableFooter filteredCount={filtered.length} totalCount={offersData.length} />
            </CardContent>
          </Card>
        </div>
      </div>

      <OffersAndRenewalsCreateDrawer
        hierarchicalData={hierarchicalData}
        open={createDrawerOpen}
        onOpenChange={setCreateDrawerOpen}
        onSuccess={() => {
          router.reload();
        }}
      />

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
