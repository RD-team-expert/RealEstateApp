import React from 'react';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/app-layout';
import { NoticeAndEviction, Tenant, Notice } from '@/types/NoticeAndEviction';

const Create = () => {
  const { tenants, notices } = usePage().props as { tenants: Tenant[]; notices: Notice[] };

  const { data, setData, post, processing, errors } = useForm<Partial<NoticeAndEviction>>({
    unit_name: '',
    tenants_name: '',
    status: '',
    date: '',
    type_of_notice: '',
    have_an_exception: '',
    note: '',
    evictions: '',
    sent_to_atorney: '',
    hearing_dates: '',
    evected_or_payment_plan: '',
    if_left: '',
    writ_date: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setData(name as keyof NoticeAndEviction, value);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    post('/notice_and_evictions');
  }

  const unitOptions = Array.from(new Set(tenants.map(t => t.unit_number)));
  const tenantOptions = tenants.map(t => ({
    label: `${t.first_name} ${t.last_name}`,
    value: `${t.first_name} ${t.last_name}`,
  }));

  return (
    <AppLayout>
      <Head title="Create Notice & Eviction" />
      <div className="container mx-auto mt-6">
        <div className="mb-4"><Link href="/notice_and_evictions" className="text-blue-600">&larr; Back</Link></div>
        <h2 className="text-xl mb-4 font-bold">Create Notice & Eviction</h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
          {/* Unit Name */}
          <div>
            <label className="font-semibold">Unit Name<span className="text-red-500">*</span></label>
            <select
              name="unit_name"
              value={data.unit_name}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            >
              <option value="">Select unit...</option>
              {unitOptions.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            {errors.unit_name && <div className="text-red-500 text-sm">{errors.unit_name}</div>}
          </div>
          {/* Tenant Name */}
          <div>
            <label className="font-semibold">Tenants Name<span className="text-red-500">*</span></label>
            <select
              name="tenants_name"
              value={data.tenants_name}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            >
              <option value="">Select tenant...</option>
              {tenantOptions.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            {errors.tenants_name && <div className="text-red-500 text-sm">{errors.tenants_name}</div>}
          </div>
          {/* Status */}
          <div>
            <label className="font-semibold">Status</label>
            <select
              name="status"
              value={data.status}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="">Posted</option>
              <option value="Yes">Sent to representative </option>

            </select>
          </div>
          {/* Date */}
          <div>
            <label className="font-semibold">Date</label>
            <input type="date" name="date" value={data.date ?? ''} onChange={handleChange}
              className="w-full border p-2 rounded" />
            {errors.date && <div className="text-red-500 text-sm">{errors.date}</div>}
          </div>
          {/* Type of Notice */}
          <div>
            <label className="font-semibold">Type of Notice</label>
            <select
              name="type_of_notice"
              value={data.type_of_notice}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="">Select type...</option>
              {notices.map(n => <option key={n.notice_name} value={n.notice_name}>{n.notice_name}</option>)}
            </select>
            {errors.type_of_notice && <div className="text-red-500 text-sm">{errors.type_of_notice}</div>}
          </div>
          {/* Have An Exception? */}
          <div>
            <label className="font-semibold">Have An Exception?</label>
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
            <label className="font-semibold">Note</label>
            <textarea name="note" value={data.note ?? ''} onChange={handleChange}
              className="w-full border p-2 rounded" />
            {errors.note && <div className="text-red-500 text-sm">{errors.note}</div>}
          </div>
          {/* Sent to Attorney */}
          <div>
            <label className="font-semibold">Sent to Attorney</label>
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
            <label className="font-semibold">Hearing Dates</label>
            <input type="date" name="hearing_dates" value={data.hearing_dates ?? ''} onChange={handleChange}
              className="w-full border p-2 rounded" />
            {errors.hearing_dates && <div className="text-red-500 text-sm">{errors.hearing_dates}</div>}
          </div>
          {/* Evected Or Payment Plan */}
          <div>
            <label className="font-semibold">Evected Or Payment Plan</label>
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
          {/* If Left */}
          <div>
            <label className="font-semibold">If Left?</label>
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
            <label className="font-semibold">Writ Date</label>
            <input type="date" name="writ_date" value={data.writ_date ?? ''} onChange={handleChange}
              className="w-full border p-2 rounded" />
            {errors.writ_date && <div className="text-red-500 text-sm">{errors.writ_date}</div>}
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded"
            disabled={processing}
          >
            Create
          </button>
        </form>
      </div>
    </AppLayout>
  );
};

export default Create;
