import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { OfferRenewal } from '@/types/OfferRenewal';
import AppLayout from '@/Layouts/app-layout';

const Show = () => {
  const { offer } = usePage().props as { offer: OfferRenewal };

  return (
    <AppLayout>
      <Head title={`Offer ${offer.id}`} />
      <div className="container mx-auto mt-6">
        <div className="mb-4">
          <Link href="/offers_and_renewals" className="text-blue-600">&larr; Back</Link>
        </div>
        <h2 className="text-2xl mb-4">Offer Details (ID: {offer.id})</h2>
        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-6 rounded">
          <div><strong>Unit:</strong> {offer.unit}</div>
          <div><strong>Tenant:</strong> {offer.tenant}</div>
          <div><strong>Date Sent Offer:</strong> {offer.date_sent_offer}</div>
          <div><strong>Status:</strong> {offer.status ?? '-'}</div>
          <div><strong>Date of Acceptance:</strong> {offer.date_of_acceptance ?? '-'}</div>
          <div><strong>Last Notice Sent:</strong> {offer.last_notice_sent ?? '-'}</div>
          <div><strong>Notice Kind:</strong> {offer.notice_kind ?? '-'}</div>
          <div><strong>Lease Sent?</strong> {offer.lease_sent ?? '-'}</div>
          <div><strong>Date Sent Lease:</strong> {offer.date_sent_lease ?? '-'}</div>
          <div><strong>Lease Signed?</strong> {offer.lease_signed ?? '-'}</div>
          <div><strong>Date Signed:</strong> {offer.date_signed ?? '-'}</div>
          <div><strong>2nd Last Notice Sent:</strong> {offer.last_notice_sent_2 ?? '-'}</div>
          <div><strong>2nd Notice Kind:</strong> {offer.notice_kind_2 ?? '-'}</div>
          <div><strong>How Many Days Left:</strong> {offer.how_many_days_left ?? '-'}</div>
          <div><strong>Expired:</strong> {offer.expired ?? '-'}</div>
          <div className="col-span-2"><strong>Notes:</strong> {offer.notes ?? '-'}</div>
        </div>
        <div className="mt-6">
          <Link
            href={`/offers_and_renewals/${offer.id}/edit`}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Edit
          </Link>
        </div>
      </div>
    </AppLayout>
  );
};

export default Show;
