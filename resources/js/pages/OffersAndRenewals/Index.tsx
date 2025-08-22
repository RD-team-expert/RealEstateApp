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
import { Trash2, Edit, Eye, Plus, Search } from 'lucide-react';
import { OfferRenewal } from '@/types/OfferRenewal';

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

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline">N/A</Badge>;
    return <Badge variant="default">{status}</Badge>;
  };

  const getYesNoBadge = (value: string | null) => {
    if (!value || value === '-') return <Badge variant="outline">N/A</Badge>;
    return (
      <Badge variant={value === 'Yes' ? 'default' : 'secondary'}>
        {value}
      </Badge>
    );
  };

  return (
    <AppLayout>
      <Head title="Offers and Renewals" />
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl">Offers and Renewals</CardTitle>
                <Link href="/offers_and_renewals/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New
                  </Button>
                </Link>
              </div>
              <form onSubmit={handleSearch} className="flex gap-2 mt-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Search by unit, tenant, or status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                    <TableRow>
                      {/* Static columns - Basic info */}
                      <TableHead>Unit</TableHead>
                      <TableHead>Tenant</TableHead>

                      {/* Conditional columns */}
                      {(activeTab === 'offers' || activeTab === 'both') && (
                        <>
                          <TableHead>Date Sent Offer</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date of Acceptance</TableHead>
                          <TableHead>Offer Last Notice Sent</TableHead>
                          <TableHead>Offer Notice Kind</TableHead>
                        </>
                      )}
                      {(activeTab === 'renewals' || activeTab === 'both') && (
                        <>
                          <TableHead>Lease Sent?</TableHead>
                          <TableHead>Date Sent Lease</TableHead>
                          <TableHead>Lease Signed?</TableHead>
                          <TableHead>Date Signed</TableHead>
                          <TableHead>Renewal Last Notice Sent</TableHead>
                          <TableHead>Renewal Notice Kind</TableHead>
                          <TableHead>Notes</TableHead>
                        </>
                      )}

                      {/* Status columns at the end */}
                      <TableHead>How Many Days Left</TableHead>
                      <TableHead>Expired</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((offer) => (
                      <TableRow key={offer.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{offer.unit}</TableCell>
                        <TableCell>{offer.tenant}</TableCell>

                        {(activeTab === 'offers' || activeTab === 'both') && (
                          <>
                            <TableCell>
                              {offer.date_sent_offer
                                ? new Date(offer.date_sent_offer).toLocaleDateString()
                                : 'N/A'}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(offer.status)}
                            </TableCell>
                            <TableCell>
                              {offer.date_of_acceptance
                                ? new Date(offer.date_of_acceptance).toLocaleDateString()
                                : 'N/A'}
                            </TableCell>
                            <TableCell>
                              {offer.last_notice_sent
                                ? new Date(offer.last_notice_sent).toLocaleDateString()
                                : 'N/A'}
                            </TableCell>
                            <TableCell>{offer.notice_kind || 'N/A'}</TableCell>
                          </>
                        )}
                        {(activeTab === 'renewals' || activeTab === 'both') && (
                          <>
                            <TableCell>
                              {getYesNoBadge(offer.lease_sent)}
                            </TableCell>
                            <TableCell>
                              {offer.date_sent_lease
                                ? new Date(offer.date_sent_lease).toLocaleDateString()
                                : 'N/A'}
                            </TableCell>
                            <TableCell>
                              {getYesNoBadge(offer.lease_signed)}
                            </TableCell>
                            <TableCell>
                              {offer.date_signed
                                ? new Date(offer.date_signed).toLocaleDateString()
                                : 'N/A'}
                            </TableCell>
                            <TableCell>
                              {offer.last_notice_sent_2
                                ? new Date(offer.last_notice_sent_2).toLocaleDateString()
                                : 'N/A'}
                            </TableCell>
                            <TableCell>{offer.notice_kind_2 || 'N/A'}</TableCell>
                            <TableCell className="max-w-xs">
                              <div className="truncate" title={offer.notes || 'N/A'}>
                                {offer.notes || 'N/A'}
                              </div>
                            </TableCell>
                          </>
                        )}

                        {/* Status columns at the end */}
                        <TableCell>{offer.how_many_days_left || '0'}</TableCell>
                        <TableCell>
                          <Badge variant={offer.expired === 'expired' ? 'destructive' : 'default'}>
                            {offer.expired ?? 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Link href={`/offers_and_renewals/${offer.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/offers_and_renewals/${offer.id}/edit`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(offer)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {filtered.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg">No offers found.</p>
                  <p className="text-sm">Try adjusting your search criteria.</p>
                </div>
              )}

              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-gray-600">
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
