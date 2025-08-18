import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { NoticeAndEviction } from '@/types/NoticeAndEviction';
import AppLayout from '@/Layouts/app-layout';

const Show = () => {
  const { record } = usePage().props as { record: NoticeAndEviction };

  return (
    <AppLayout>
      <Head title={`Notice & Eviction #${record.id}`} />
      <div className="container mx-auto mt-6">
        <div className="mb-4"><Link href="/notice_and_evictions" className="text-blue-600">&larr; Back</Link></div>
        <h2 className="text-2xl mb-4">Notice & Eviction Details (ID: {record.id})</h2>
        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-6 rounded">
          <div><b>Unit Name:</b> {record.unit_name}</div>
          <div><b>Tenants Name:</b> {record.tenants_name}</div>
          <div><b>Status:</b> {record.status ?? '-'}</div>
          <div><b>Date:</b> {record.date ?? '-'}</div>
          <div><b>Type of Notice:</b> {record.type_of_notice ?? '-'}</div>
          <div><b>Have An Exception?</b> {record.have_an_exception ?? '-'}</div>
          <div><b>Note:</b> {record.note ?? '-'}</div>
          <div><b>Evictions:</b> {record.evictions ?? '-'}</div>
          <div><b>Sent to Attorney:</b> {record.sent_to_atorney ?? '-'}</div>
          <div><b>Hearing Dates:</b> {record.hearing_dates ?? '-'}</div>
          <div><b>Evected/Payment Plan:</b> {record.evected_or_payment_plan ?? '-'}</div>
          <div><b>If Left:</b> {record.if_left ?? '-'}</div>
          <div><b>Writ Date:</b> {record.writ_date ?? '-'}</div>
        </div>
        <div className="mt-6">
          <Link
            href={`/notice_and_evictions/${record.id}/edit`}
            className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded"
          >
            Edit
          </Link>
        </div>
      </div>
    </AppLayout>
  );
};

export default Show;
