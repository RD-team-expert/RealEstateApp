import React from 'react';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/app-layout';
import { NoticeAndEviction, Tenant, Notice } from '@/types/NoticeAndEviction';

const Edit = () => {
  const { record, tenants, notices } = usePage().props as {
    record: NoticeAndEviction;
    tenants: Tenant[];
    notices: Notice[];
  };

  const { data, setData, put, processing, errors } = useForm<Partial<NoticeAndEviction>>({
    unit_name: record.unit_name || '',
    tenants_name: record.tenants_name || '',
    status: record.status || '',
    date: record.date || '',
    type_of_notice: record.type_of_notice || '',
    have_an_exception: record.have_an_exception || '',
    note: record.note || '',
    evictions: record.evictions || '',
    sent_to_atorney: record.sent_to_atorney || '',
    hearing_dates: record.hearing_dates || '',
    evected_or_payment_plan: record.evected_or_payment_plan || '',
    if_left: record.if_left || '',
    writ_date: record.writ_date || '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setData(name as keyof NoticeAndEviction, value);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    put(`/notice_and_evictions/${record.id}`);
  }

  const unitOptions = Array.from(new Set(tenants.map(t => t.unit_number)));
  const tenantOptions = tenants.map(t => ({
    label: `${t.first_name} ${t.last_name}`,
    value: `${t.first_name} ${t.last_name}`,
  }));

  return (
    <AppLayout>
      <Head title="Edit Notice & Eviction" />
      <div className="container mx-auto mt-6">
        <div className="mb-4">
          <Link href="/notice_and_evictions" className="text-blue-600">&larr; Back</Link>
        </div>
        <h2 className="text-xl mb-4 font-bold">Edit Notice & Eviction (ID: {record.id})</h2>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
          {/* Unit Name */}
          <div>
            <label className="block mb-1 font-semibold">
              Unit Name <span className="text-red-500">*</span>
            </label>
            <select
              name="unit_name"
              value={data.unit_name}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            >
              <option value="">Select unit...</option>
              {unitOptions.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
            {errors.unit_name && <div className="text-red-500 text-sm">{errors.unit_name}</div>}
          </div>

          {/* Tenants Name */}
          <div>
            <label className="block mb-1 font-semibold">
              Tenants Name <span className="text-red-500">*</span>
            </label>
            <select
              name="tenants_name"
              value={data.tenants_name}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            >
              <option value="">Select tenant...</option>
              {tenantOptions.map(tenant => (
                <option key={tenant.value} value={tenant.value}>{tenant.label}</option>
              ))}
            </select>
            {errors.tenants_name && <div className="text-red-500 text-sm">{errors.tenants_name}</div>}
          </div>

          {/* Status */}
          <div>
            <label className="block mb-1 font-semibold">Status</label>
            <input
              type="text"
              name="status"
              value={data.status}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
            {errors.status && <div className="text-red-500 text-sm">{errors.status}</div>}
          </div>

          {/* Date */}
          <div>
            <label className="block mb-1 font-semibold">Date</label>
            <input
              type="date"
              name="date"
              value={data.date}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
            {errors.date && <div className="text-red-500 text-sm">{errors.date}</div>}
          </div>

          {/* Type of Notice */}
          <div>
            <label className="block mb-1 font-semibold">Type of Notice</label>
            <select
              name="type_of_notice"
              value={data.type_of_notice}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="">Select type...</option>
              {notices.map(notice => (
                <option key={notice.notice_name} value={notice.notice_name}>
                  {notice.notice_name}
                </option>
              ))}
            </select>
            {errors.type_of_notice && <div className="text-red-500 text-sm">{errors.type_of_notice}</div>}
          </div>

          {/* Have An Exception? */}
          <div>
            <label className="block mb-1 font-semibold">Have An Exception?</label>
            <select
              name="have_an_exception"
              value={data.have_an_exception}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="">Select...</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            {errors.have_an_exception && <div className="text-red-500 text-sm">{errors.have_an_exception}</div>}
          </div>

          {/* Note */}
          <div>
            <label className="block mb-1 font-semibold">Note</label>
            <textarea
              name="note"
              value={data.note}
              onChange={handleChange}
              rows={3}
              className="w-full border p-2 rounded"
            />
            {errors.note && <div className="text-red-500 text-sm">{errors.note}</div>}
          </div>

          {/* Evictions (calculated field, but editable) */}
          <div>
            <label className="block mb-1 font-semibold">Evictions</label>
            <input
              type="text"
              name="evictions"
              value={data.evictions}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
            {errors.evictions && <div className="text-red-500 text-sm">{errors.evictions}</div>}
          </div>

          {/* Sent to Attorney */}
          <div>
            <label className="block mb-1 font-semibold">Sent to Attorney</label>
            <select
              name="sent_to_atorney"
              value={data.sent_to_atorney}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="">Select...</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            {errors.sent_to_atorney && <div className="text-red-500 text-sm">{errors.sent_to_atorney}</div>}
          </div>

          {/* Hearing Dates */}
          <div>
            <label className="block mb-1 font-semibold">Hearing Dates</label>
            <input
              type="date"
              name="hearing_dates"
              value={data.hearing_dates}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
            {errors.hearing_dates && <div className="text-red-500 text-sm">{errors.hearing_dates}</div>}
          </div>

          {/* Evected Or Payment Plan */}
          <div>
            <label className="block mb-1 font-semibold">Evected Or Payment Plan</label>
            <select
              name="evected_or_payment_plan"
              value={data.evected_or_payment_plan}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="">Select...</option>
              <option value="Evected">Evected</option>
              <option value="Payment Plan">Payment Plan</option>
            </select>
            {errors.evected_or_payment_plan && <div className="text-red-500 text-sm">{errors.evected_or_payment_plan}</div>}
          </div>

          {/* If Left? */}
          <div>
            <label className="block mb-1 font-semibold">If Left?</label>
            <select
              name="if_left"
              value={data.if_left}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="">Select...</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            {errors.if_left && <div className="text-red-500 text-sm">{errors.if_left}</div>}
          </div>

          {/* Writ Date */}
          <div>
            <label className="block mb-1 font-semibold">Writ Date</label>
            <input
              type="date"
              name="writ_date"
              value={data.writ_date}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
            {errors.writ_date && <div className="text-red-500 text-sm">{errors.writ_date}</div>}
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded"
            disabled={processing}
          >
            Update
          </button>
        </form>
      </div>
    </AppLayout>
  );
};

export default Edit;
