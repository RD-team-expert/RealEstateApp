import React from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { OfferRenewal } from '@/types/OfferRenewal';
import AppLayout from '@/Layouts/app-layout';

const Index = () => {
  const { offers } = usePage().props as { offers: OfferRenewal[] };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this offer? This action cannot be undone.')) {
      router.delete(`/offers_and_renewals/${id}`);
    }
  };

  return (
    <AppLayout>
      <Head title="Offers and Renewals" />
      <div className="container mx-auto mt-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-medium">Offers and Renewals</h2>
          <Link
            href="/offers_and_renewals/create"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Add New
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="table-auto w-full border border-gray-300 text-xs">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">ID</th>
                <th className="border px-2 py-1">Unit</th>
                <th className="border px-2 py-1">Tenant</th>
                <th className="border px-2 py-1">Date Sent Offer</th>
                <th className="border px-2 py-1">Status</th>
                <th className="border px-2 py-1">Date of Acceptance</th>
                <th className="border px-2 py-1">Last Notice Sent</th>
                <th className="border px-2 py-1">Notice Kind</th>
                <th className="border px-2 py-1">Lease Sent?</th>
                <th className="border px-2 py-1">Date Sent Lease</th>
                <th className="border px-2 py-1">Lease Signed?</th>
                <th className="border px-2 py-1">Date Signed</th>
                <th className="border px-2 py-1">2nd Last Notice Sent</th>
                <th className="border px-2 py-1">2nd Notice Kind</th>
                <th className="border px-2 py-1">Notes</th>
                <th className="border px-2 py-1">How Many Days Left</th>
                <th className="border px-2 py-1">Expired</th>
                <th className="border px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((offer) => (
                <tr key={offer.id}>
                  <td className="border px-2 py-1">{offer.id}</td>
                  <td className="border px-2 py-1">{offer.unit}</td>
                  <td className="border px-2 py-1">{offer.tenant}</td>
                  <td className="border px-2 py-1">{offer.date_sent_offer}</td>
                  <td className="border px-2 py-1">{offer.status ?? '-'}</td>
                  <td className="border px-2 py-1">{offer.date_of_acceptance ?? '-'}</td>
                  <td className="border px-2 py-1">{offer.last_notice_sent ?? '-'}</td>
                  <td className="border px-2 py-1">{offer.notice_kind ?? '-'}</td>
                  <td className="border px-2 py-1">{offer.lease_sent ?? '-'}</td>
                  <td className="border px-2 py-1">{offer.date_sent_lease ?? '-'}</td>
                  <td className="border px-2 py-1">{offer.lease_signed ?? '-'}</td>
                  <td className="border px-2 py-1">{offer.date_signed ?? '-'}</td>
                  <td className="border px-2 py-1">{offer.last_notice_sent_2 ?? '-'}</td>
                  <td className="border px-2 py-1">{offer.notice_kind_2 ?? '-'}</td>
                  <td className="border px-2 py-1 break-all whitespace-pre-wrap max-w-xs">{offer.notes ?? '-'}</td>
                  <td className="border px-2 py-1">{offer.how_many_days_left ?? '-'}</td>
                  <td className="border px-2 py-1">{offer.expired ?? '-'}</td>
                  <td className="border px-2 py-1">
                    <Link href={`/offers_and_renewals/${offer.id}`} className="text-blue-500 mr-2">View</Link>
                    <Link href={`/offers_and_renewals/${offer.id}/edit`} className="text-green-500 mr-2">Edit</Link>
                    <button
                      onClick={() => handleDelete(offer.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
