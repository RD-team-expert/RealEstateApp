import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Trash2, Edit, Eye, Plus, Search, Download } from 'lucide-react';
import { OfferRenewal } from '@/types/OfferRenewal';
import { usePermissions } from '@/hooks/usePermissions';
import { type BreadcrumbItem } from '@/types';

// CSV Export utility function
const exportToCSV = (data: OfferRenewal[], activeTab: string, filename: string = 'offers-renewals.csv') => {
    try {
        const formatDate = (dateStr: string | null | undefined) => {
            if (!dateStr) return '';
            try {
                return new Date(dateStr).toLocaleDateString();
            } catch (error) {
                return dateStr || '';
            }
        };

        const formatString = (value: string | null | undefined) => {
            if (value === null || value === undefined) return '';
            return String(value).replace(/"/g, '""');
        };

        // Dynamic headers based on active tab
        let headers = ['ID', 'Unit', 'Tenant'];

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
                        `"${formatString(offer.unit)}"`,
                        `"${formatString(offer.tenant)}"`
                    ];

                    if (activeTab === 'offers' || activeTab === 'both') {
                        row = row.concat([
                            `"${formatDate(offer.date_sent_offer)}"`,
                            `"${formatString(offer.status)}"`,
                            `"${formatDate(offer.date_of_acceptance)}"`,
                            `"${formatDate(offer.last_notice_sent)}"`,
                            `"${formatString(offer.notice_kind)}"`
                        ]);
                    }

                    if (activeTab === 'renewals' || activeTab === 'both') {
                        row = row.concat([
                            `"${formatString(offer.lease_sent)}"`,
                            `"${formatDate(offer.date_sent_lease)}"`,
                            `"${formatString(offer.lease_signed)}"`,
                            `"${formatDate(offer.date_signed)}"`,
                            `"${formatDate(offer.last_notice_sent_2)}"`,
                            `"${formatString(offer.notice_kind_2)}"`,
                            `"${formatString(offer.notes)}"`
                        ]);
                    }

                    row = row.concat([
                        `"${formatString(offer.how_many_days_left)}"`,
                        `"${formatString(offer.expired)}"`
                    ]);

                    return row.join(',');
                } catch (rowError) {
                    console.error('Error processing offer row:', offer, rowError);
                    return ''; // Skip problematic rows
                }
            }).filter(row => row !== '') // Remove empty rows
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

interface Props {
  offers: OfferRenewal[];
  search?: string;
}

const TABS = [
  { label: 'Offers', value: 'offers' },
  { label: 'Renewals', value: 'renewals' },
  { label: 'Both', value: 'both' },
];

const Index = ({ offers, search }: Props) => {
  const [searchTerm, setSearchTerm] = useState(search || '');
  const [activeTab, setActiveTab] = useState<'offers' | 'renewals' | 'both'>('offers');
  const [isExporting, setIsExporting] = useState(false);

  // Filtering logic, shows all by default
  const filtered = offers.filter(offer => {
    if (activeTab === 'offers') {
      // Show those with offer columns (could be all, adjust if needed for business logic)
      return true;
    }
    if (activeTab === 'renewals') {
      // Show those with renewal columns (could be all, adjust if needed for business logic)
      return true;
    }
    return true;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route('offers-and-renewals.index'), { search: searchTerm }, { preserveState: true });
  };

  const handleDelete = (offer: OfferRenewal) => {
    if (window.confirm('Are you sure you want to delete this offer? This action cannot be undone.')) {
      router.delete(`/offers_and_renewals/${offer.id}`);
    }
  };

  const handleCSVExport = () => {
    if (!filtered || filtered.length === 0) {
        alert('No data to export');
        return;
    }

    setIsExporting(true);

    try {
        console.log('Exporting offers and renewals data:', filtered); // Debug log
        const filename = `offers-renewals-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`;
        exportToCSV(filtered, activeTab, filename);

        // Success feedback
        console.log('Export completed successfully');
    } catch (error) {
        console.error('Export failed:', error);
        alert(`Export failed: ${error.message || 'Unknown error'}. Please check the console for details.`);
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

  const getDaysLeftBadge = (days: string | null) => {
    if (!days) return <Badge variant="outline">N/A</Badge>;
    const numDays = parseInt(days);
    if (numDays <= 7) {
      return <Badge variant="destructive">{days} days</Badge>;
    } else if (numDays <= 30) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">{days} days</Badge>;
    } else {
      return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">{days} days</Badge>;
    }
  };

  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  return (
    <AppLayout >
      <Head title="Offers and Renewals" />

      <div className="py-12 bg-background text-foreground transition-colors min-h-screen">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Card className="bg-card text-card-foreground shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl">Offers and Renewals</CardTitle>
                <div className="flex gap-2 items-center">
                  {/* Export Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCSVExport}
                    disabled={isExporting || !filtered || filtered.length === 0}
                    className="flex items-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isExporting ? 'Exporting...' : 'Export CSV'}
                  </Button>

                  {hasAllPermissions(['offers-and-renewals.create','offers-and-renewals.store']) && (
                    <Link href="/offers_and_renewals/create">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add New
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
              <form onSubmit={handleSearch} className="flex gap-2 mt-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Search by unit, tenant, or status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-input text-input-foreground"
                  />
                </div>
                <Button type="submit">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
              {/* Tabs for filtering */}
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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      {/* Static columns - Basic info */}
                      <TableHead className="text-muted-foreground">Unit</TableHead>
                      <TableHead className="text-muted-foreground">Tenant</TableHead>
                      {/* Conditional columns */}
                      {(activeTab === 'offers' || activeTab === 'both') && (
                        <>
                          <TableHead className="text-muted-foreground">Date Sent Offer</TableHead>
                          <TableHead className="text-muted-foreground">Status</TableHead>
                          <TableHead className="text-muted-foreground">Date of Acceptance</TableHead>
                          <TableHead className="text-muted-foreground">Offer Last Notice Sent</TableHead>
                          <TableHead className="text-muted-foreground">Offer Notice Kind</TableHead>
                        </>
                      )}
                      {(activeTab === 'renewals' || activeTab === 'both') && (
                        <>
                          <TableHead className="text-muted-foreground">Lease Sent?</TableHead>
                          <TableHead className="text-muted-foreground">Date Sent Lease</TableHead>
                          <TableHead className="text-muted-foreground">Lease Signed?</TableHead>
                          <TableHead className="text-muted-foreground">Date Signed</TableHead>
                          <TableHead className="text-muted-foreground">Renewal Last Notice Sent</TableHead>
                          <TableHead className="text-muted-foreground">Renewal Notice Kind</TableHead>
                          <TableHead className="text-muted-foreground">Notes</TableHead>
                        </>
                      )}
                      {/* Status columns at the end */}
                      <TableHead className="text-muted-foreground">How Many Days Left</TableHead>
                      <TableHead className="text-muted-foreground">Expired</TableHead>
                      {hasAnyPermission(['offers-and-renewals.show','offers-and-renewals.edit','offers-and-renewals.update','offers-and-renewals.destroy']) && (
                      <TableHead className="text-muted-foreground">Actions</TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((offer) => (
                      <TableRow key={offer.id} className="hover:bg-muted/50 border-border">
                        <TableCell className="font-medium text-foreground">{offer.unit}</TableCell>
                        <TableCell className="text-foreground">{offer.tenant}</TableCell>
                        {(activeTab === 'offers' || activeTab === 'both') && (
                          <>
                            <TableCell className="text-foreground">
                              {offer.date_sent_offer
                                ? new Date(offer.date_sent_offer).toLocaleDateString()
                                : <span className="text-muted-foreground">N/A</span>}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(offer.status)}
                            </TableCell>
                            <TableCell className="text-foreground">
                              {offer.date_of_acceptance
                                ? new Date(offer.date_of_acceptance).toLocaleDateString()
                                : <span className="text-muted-foreground">N/A</span>}
                            </TableCell>
                            <TableCell className="text-foreground">
                              {offer.last_notice_sent
                                ? new Date(offer.last_notice_sent).toLocaleDateString()
                                : <span className="text-muted-foreground">N/A</span>}
                            </TableCell>
                            <TableCell className="text-foreground">{offer.notice_kind || <span className="text-muted-foreground">N/A</span>}</TableCell>
                          </>
                        )}
                        {(activeTab === 'renewals' || activeTab === 'both') && (
                          <>
                            <TableCell>
                              {getYesNoBadge(offer.lease_sent)}
                            </TableCell>
                            <TableCell className="text-foreground">
                              {offer.date_sent_lease
                                ? new Date(offer.date_sent_lease).toLocaleDateString()
                                : <span className="text-muted-foreground">N/A</span>}
                            </TableCell>
                            <TableCell>
                              {getYesNoBadge(offer.lease_signed)}
                            </TableCell>
                            <TableCell className="text-foreground">
                              {offer.date_signed
                                ? new Date(offer.date_signed).toLocaleDateString()
                                : <span className="text-muted-foreground">N/A</span>}
                            </TableCell>
                            <TableCell className="text-foreground">
                              {offer.last_notice_sent_2
                                ? new Date(offer.last_notice_sent_2).toLocaleDateString()
                                : <span className="text-muted-foreground">N/A</span>}
                            </TableCell>
                            <TableCell className="text-foreground">{offer.notice_kind_2 || <span className="text-muted-foreground">N/A</span>}</TableCell>
                            <TableCell className="max-w-xs text-foreground">
                              <div className="truncate" title={offer.notes || 'N/A'}>
                                {offer.notes || <span className="text-muted-foreground">N/A</span>}
                              </div>
                            </TableCell>
                          </>
                        )}
                        {/* Status columns at the end */}
                        <TableCell>
                          {getDaysLeftBadge(offer.how_many_days_left)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={offer.expired === 'expired' ? 'destructive' : 'default'}>
                            {offer.expired ?? <span className="text-muted-foreground">N/A</span>}
                          </Badge>
                        </TableCell>
                        {hasAnyPermission(['offers-and-renewals.show','offers-and-renewals.edit','offers-and-renewals.update','offers-and-renewals.destroy']) && (
                        <TableCell>
                          <div className="flex gap-1">
                            {hasPermission('offers-and-renewals.show') && (
                            <Link href={`/offers_and_renewals/${offer.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>)}
                            {hasAllPermissions(['offers-and-renewals.edit','offers-and-renewals.update']) && (
                            <Link href={`/offers_and_renewals/${offer.id}/edit`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>)}
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
                  Showing {filtered.length} {activeTab}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
