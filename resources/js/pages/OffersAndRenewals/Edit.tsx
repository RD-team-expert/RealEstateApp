import React from 'react';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import { OfferRenewal, Tenant } from '@/types/OfferRenewal';
import AppLayout from '@/Layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Edit: React.FC = () => {
  const { offer, tenants } = usePage().props as { offer: OfferRenewal; tenants: Tenant[] };

  const { data, setData, put, processing, errors } = useForm<Partial<OfferRenewal>>(offer);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    put(`/offers_and_renewals/${offer.id}`);
  }

  // Get unique units for Unit dropdown
  const units = Array.from(new Set(tenants.map(t => t.unit_number)));

  // Build tenant name list for Tenant dropdown
  const tenantNames = tenants.map(t => ({
    label: `${t.first_name} ${t.last_name}`,
    value: `${t.first_name} ${t.last_name}`,
  }));

  return (
    <AppLayout>
      <Head title="Edit Offer & Renewal" />

      <div className="py-12">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl">
                  Edit Offer/Renewal (ID: {offer.id})
                </CardTitle>
                <Link href={`/offers_and_renewals/${offer.id}`}>
                  <Button variant="outline">Back to Details</Button>
                </Link>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* --- Basic Information --- */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="unit">Unit *</Label>
                    <Select
                      onValueChange={(value) => setData('unit', value)}
                      value={data.unit || undefined}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map(unit => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.unit && (
                      <p className="text-red-600 text-sm mt-1">{errors.unit}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="tenant">Tenant *</Label>
                    <Select
                      onValueChange={(value) => setData('tenant', value)}
                      value={data.tenant || undefined}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select tenant" />
                      </SelectTrigger>
                      <SelectContent>
                        {tenantNames.map(tn => (
                          <SelectItem key={tn.value} value={tn.value}>
                            {tn.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.tenant && (
                      <p className="text-red-600 text-sm mt-1">{errors.tenant}</p>
                    )}
                  </div>
                </div>

                {/* --- Offer Information --- */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date_sent_offer">Date Sent Offer *</Label>
                    <Input
                      id="date_sent_offer"
                      type="date"
                      value={data.date_sent_offer || ''}
                      onChange={(e) => setData('date_sent_offer', e.target.value)}
                      error={errors.date_sent_offer}
                    />
                    {errors.date_sent_offer && (
                      <p className="text-red-600 text-sm mt-1">{errors.date_sent_offer}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      onValueChange={(value) => setData('status', value)}
                      value={data.status || undefined}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Accepted">Accepted</SelectItem>
                        <SelectItem value="Didn't Accept">Didn't Accept</SelectItem>
                        <SelectItem value="Didn't respond">Didn't respond</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.status && (
                      <p className="text-red-600 text-sm mt-1">{errors.status}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date_of_acceptance">Date of Acceptance</Label>
                    <Input
                      id="date_of_acceptance"
                      type="date"
                      value={data.date_of_acceptance || ''}
                      onChange={(e) => setData('date_of_acceptance', e.target.value)}
                      error={errors.date_of_acceptance}
                    />
                    {errors.date_of_acceptance && (
                      <p className="text-red-600 text-sm mt-1">{errors.date_of_acceptance}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="how_many_days_left">How Many Days Left</Label>
                    <Input
                      id="how_many_days_left"
                      type="number"
                      min="0"
                      step="1"
                      value={data.how_many_days_left?.toString() || ''}
                      onChange={(e) => setData('how_many_days_left', Number(e.target.value) || 0)}
                      error={errors.how_many_days_left}
                    />
                    {errors.how_many_days_left && (
                      <p className="text-red-600 text-sm mt-1">{errors.how_many_days_left}</p>
                    )}
                  </div>
                </div>

                {/* --- Offer Notice Information --- */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="last_notice_sent">Offer Last Notice Sent</Label>
                    <Input
                      id="last_notice_sent"
                      type="date"
                      value={data.last_notice_sent || ''}
                      onChange={(e) => setData('last_notice_sent', e.target.value)}
                      error={errors.last_notice_sent}
                    />
                    {errors.last_notice_sent && (
                      <p className="text-red-600 text-sm mt-1">{errors.last_notice_sent}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="notice_kind">Offer Notice Kind</Label>
                    <Select
                      onValueChange={(value) => setData('notice_kind', value)}
                      value={data.notice_kind || undefined}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select notice kind" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Email">Email</SelectItem>
                        <SelectItem value="Call">Call</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.notice_kind && (
                      <p className="text-red-600 text-sm mt-1">{errors.notice_kind}</p>
                    )}
                  </div>
                </div>

                {/* --- Lease Information --- */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lease_sent">Lease Sent?</Label>
                    <Select
                      onValueChange={(value) => setData('lease_sent', value)}
                      value={data.lease_sent || undefined}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.lease_sent && (
                      <p className="text-red-600 text-sm mt-1">{errors.lease_sent}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="date_sent_lease">Date Sent Lease</Label>
                    <Input
                      id="date_sent_lease"
                      type="date"
                      value={data.date_sent_lease || ''}
                      onChange={(e) => setData('date_sent_lease', e.target.value)}
                      error={errors.date_sent_lease}
                    />
                    {errors.date_sent_lease && (
                      <p className="text-red-600 text-sm mt-1">{errors.date_sent_lease}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lease_signed">Lease Signed?</Label>
                    <Select
                      onValueChange={(value) => setData('lease_signed', value)}
                      value={data.lease_signed || undefined}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Signed">Signed</SelectItem>
                        <SelectItem value="Unsigned">Unsigned</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.lease_signed && (
                      <p className="text-red-600 text-sm mt-1">{errors.lease_signed}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="date_signed">Date Signed</Label>
                    <Input
                      id="date_signed"
                      type="date"
                      value={data.date_signed || ''}
                      onChange={(e) => setData('date_signed', e.target.value)}
                      error={errors.date_signed}
                    />
                    {errors.date_signed && (
                      <p className="text-red-600 text-sm mt-1">{errors.date_signed}</p>
                    )}
                  </div>
                </div>

                {/* --- Renewal Notice Information --- */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="last_notice_sent_2">Renewal Last Notice Sent</Label>
                    <Input
                      id="last_notice_sent_2"
                      type="date"
                      value={data.last_notice_sent_2 || ''}
                      onChange={(e) => setData('last_notice_sent_2', e.target.value)}
                      error={errors.last_notice_sent_2}
                    />
                    {errors.last_notice_sent_2 && (
                      <p className="text-red-600 text-sm mt-1">{errors.last_notice_sent_2}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="notice_kind_2">Renewal Notice Kind</Label>
                    <Select
                      onValueChange={(value) => setData('notice_kind_2', value)}
                      value={data.notice_kind_2 || undefined}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select notice kind" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Email">Email</SelectItem>
                        <SelectItem value="Call">Call</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.notice_kind_2 && (
                      <p className="text-red-600 text-sm mt-1">{errors.notice_kind_2}</p>
                    )}
                  </div>
                </div>

                {/* --- Notes --- */}
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <textarea
                    id="notes"
                    value={data.notes || ''}
                    onChange={(e) => setData('notes', e.target.value)}
                    rows={3}
                    placeholder="Add any additional notes..."
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  {errors.notes && (
                    <p className="text-red-600 text-sm mt-1">{errors.notes}</p>
                  )}
                </div>

                {/* --- Action Buttons --- */}
                <div className="flex justify-end gap-2">
                  <Link href="/offers_and_renewals">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={processing}>
                    {processing ? 'Updating…' : 'Update Offer'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Edit;
