import React from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { NoticeAndEviction } from '@/types/NoticeAndEviction';
import AppLayout from '@/Layouts/app-layout';

const Index = () => {
  const { records } = usePage().props as { records: NoticeAndEviction[] };

  const handleDelete = (id: number) => {
    if (window.confirm('Delete this record? This cannot be undone.')) {
      router.delete(`/notice_and_evictions/${id}`);
    }
  };

  return (
    <AppLayout>
      <Head title="Notice & Evictions" />
      <div className="container mx-auto mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Notice & Evictions</h2>
          <Link
            href="/notice_and_evictions/create"
            className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded"
          >
            Add
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="table-auto w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">ID</th>
                <th className="border px-2 py-1">Unit Name</th>
                <th className="border px-2 py-1">Tenants Name</th>
                <th className="border px-2 py-1">Status</th>
                <th className="border px-2 py-1">Date</th>
                <th className="border px-2 py-1">Type of Notice</th>
                <th className="border px-2 py-1">Have An Exception?</th>
                <th className="border px-2 py-1">Note</th>
                <th className="border px-2 py-1">Evictions</th>
                <th className="border px-2 py-1">Sent to Attorney</th>
                <th className="border px-2 py-1">Hearing Dates</th>
                <th className="border px-2 py-1">Evected/Payment Plan</th>
                <th className="border px-2 py-1">If Left?</th>
                <th className="border px-2 py-1">Writ Date</th>
                <th className="border px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map(rec => (
                <tr key={rec.id}>
                  <td className="border px-2 py-1">{rec.id}</td>
                  <td className="border px-2 py-1">{rec.unit_name}</td>
                  <td className="border px-2 py-1">{rec.tenants_name}</td>
                  <td className="border px-2 py-1">{rec.status ?? '-'}</td>
                  <td className="border px-2 py-1">{rec.date ?? '-'}</td>
                  <td className="border px-2 py-1">{rec.type_of_notice ?? '-'}</td>
                  <td className="border px-2 py-1">{rec.have_an_exception ?? '-'}</td>
                  <td className="border px-2 py-1">{rec.note ?? '-'}</td>
                  <td className="border px-2 py-1">{rec.evictions ?? '-'}</td>
                  <td className="border px-2 py-1">{rec.sent_to_atorney ?? '-'}</td>
                  <td className="border px-2 py-1">{rec.hearing_dates ?? '-'}</td>
                  <td className="border px-2 py-1">{rec.evected_or_payment_plan ?? '-'}</td>
                  <td className="border px-2 py-1">{rec.if_left ?? '-'}</td>
                  <td className="border px-2 py-1">{rec.writ_date ?? '-'}</td>
                  <td className="border px-2 py-1 whitespace-nowrap">
                    <Link href={`/notice_and_evictions/${rec.id}`} className="text-blue-600 mr-2">Show</Link>
                    <Link href={`/notice_and_evictions/${rec.id}/edit`} className="text-green-600 mr-2">Edit</Link>
                    <button
                      onClick={() => handleDelete(rec.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr><td colSpan={15} className="text-center p-8">No records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
