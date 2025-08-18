import React from 'react';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import { OfferRenewal, Tenant } from '@/types/OfferRenewal';
import AppLayout from '@/Layouts/app-layout';

const Create: React.FC = () => {
  const { tenants } = usePage().props as { tenants: Tenant[] };

  const { data, setData, post, processing, errors } = useForm<Partial<OfferRenewal>>({
    unit: '',
    tenant: '',
    date_sent_offer: '',
    status: '',
    date_of_acceptance: '',
    last_notice_sent: '',
    notice_kind: '',
    lease_sent: '',
    date_sent_lease: '',
    lease_signed: '',
    date_signed: '',
    last_notice_sent_2: '',
    notice_kind_2: '',
    notes: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setData(name as keyof OfferRenewal, value);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    post('/offers_and_renewals');
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
      <Head title="Create Offer" />
      <div className="container mx-auto mt-6">
        <div className="mb-4">
          <Link href="/offers_and_renewals" className="text-blue-600">&larr; Back</Link>
        </div>
        <h2 className="text-xl mb-4">Create New Offer/Renewal</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold" htmlFor="unit">
              Unit <span className="text-red-500">*</span>
            </label>
            <select
              name="unit"
              id="unit"
              value={data.unit}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            >
              <option value="">Select unit...</option>
              {units.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
            {errors.unit && <div className="text-red-500 text-sm">{errors.unit}</div>}
          </div>

          <div>
            <label className="block mb-1 font-semibold" htmlFor="tenant">
              Tenant <span className="text-red-500">*</span>
            </label>
            <select
              name="tenant"
              id="tenant"
              value={data.tenant}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            >
              <option value="">Select tenant...</option>
              {tenantNames.map(tn => (
                <option key={tn.value} value={tn.value}>{tn.label}</option>
              ))}
            </select>
            {errors.tenant && <div className="text-red-500 text-sm">{errors.tenant}</div>}
          </div>

          <div>
            <label className="block mb-1 font-semibold" htmlFor="date_sent_offer">
              Date Sent Offer <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date_sent_offer"
              id="date_sent_offer"
              value={data.date_sent_offer}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
            {errors.date_sent_offer && <div className="text-red-500 text-sm">{errors.date_sent_offer}</div>}
          </div>

          <div>
            <label className="block mb-1 font-semibold" htmlFor="status">
              Status
            </label>
            <input
              type="text"
              name="status"
              id="status"
              value={data.status}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
            {errors.status && <div className="text-red-500 text-sm">{errors.status}</div>}
          </div>

          <div>
            <label className="block mb-1 font-semibold" htmlFor="date_of_acceptance">
              Date of Acceptance
            </label>
            <input
              type="date"
              name="date_of_acceptance"
              id="date_of_acceptance"
              value={data.date_of_acceptance}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
            {errors.date_of_acceptance && <div className="text-red-500 text-sm">{errors.date_of_acceptance}</div>}
          </div>

          <div>
            <label className="block mb-1 font-semibold" htmlFor="last_notice_sent">
              Last Notice Sent
            </label>
            <input
              type="date"
              name="last_notice_sent"
              id="last_notice_sent"
              value={data.last_notice_sent}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
            {errors.last_notice_sent && <div className="text-red-500 text-sm">{errors.last_notice_sent}</div>}
          </div>

          <div>
            <label className="block mb-1 font-semibold" htmlFor="notice_kind">
              Notice Kind
            </label>
            <input
              type="text"
              name="notice_kind"
              id="notice_kind"
              value={data.notice_kind}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
            {errors.notice_kind && <div className="text-red-500 text-sm">{errors.notice_kind}</div>}
          </div>

          <div>
            <label className="block mb-1 font-semibold" htmlFor="lease_sent">
              Lease Sent?
            </label>
            <select
    name="lease_sent"
    id="lease_sent"
    value={data.lease_sent}
    onChange={handleChange}
    className="w-full border p-2 rounded"

  >
    <option value="">Select...</option>
    <option value="Yes">Yes</option>
    <option value="No">No</option>
  </select>
            {errors.lease_sent && <div className="text-red-500 text-sm">{errors.lease_sent}</div>}
          </div>

          <div>
            <label className="block mb-1 font-semibold" htmlFor="date_sent_lease">
              Date Sent Lease
            </label>
            <input
              type="date"
              name="date_sent_lease"
              id="date_sent_lease"
              value={data.date_sent_lease}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
            {errors.date_sent_lease && <div className="text-red-500 text-sm">{errors.date_sent_lease}</div>}
          </div>

          <div>
            <label className="block mb-1 font-semibold" htmlFor="lease_signed">
              Lease Signed?
            </label>
            <select
    name="lease_signed"
    id="lease_signed"
    value={data.lease_signed}
    onChange={handleChange}
    className="w-full border p-2 rounded"

  >
    <option value="">Select...</option>
    <option value="Yes">Yes</option>
    <option value="No">No</option>
  </select>
            {errors.lease_signed && <div className="text-red-500 text-sm">{errors.lease_signed}</div>}
          </div>

          <div>
            <label className="block mb-1 font-semibold" htmlFor="date_signed">
              Date Signed
            </label>
            <input
              type="date"
              name="date_signed"
              id="date_signed"
              value={data.date_signed}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
            {errors.date_signed && <div className="text-red-500 text-sm">{errors.date_signed}</div>}
          </div>

          <div>
            <label className="block mb-1 font-semibold" htmlFor="last_notice_sent_2">
              2nd Last Notice Sent
            </label>
            <input
              type="date"
              name="last_notice_sent_2"
              id="last_notice_sent_2"
              value={data.last_notice_sent_2}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
            {errors.last_notice_sent_2 && <div className="text-red-500 text-sm">{errors.last_notice_sent_2}</div>}
          </div>

          <div>
            <label className="block mb-1 font-semibold" htmlFor="notice_kind_2">
              2nd Notice Kind
            </label>
            <input
              type="text"
              name="notice_kind_2"
              id="notice_kind_2"
              value={data.notice_kind_2}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
            {errors.notice_kind_2 && <div className="text-red-500 text-sm">{errors.notice_kind_2}</div>}
          </div>

          <div>
            <label className="block mb-1 font-semibold" htmlFor="notes">
              Notes
            </label>
            <textarea
              name="notes"
              id="notes"
              rows={3}
              value={data.notes}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
            {errors.notes && <div className="text-red-500 text-sm">{errors.notes}</div>}
          </div>
          <div>
  <label className="block mb-1 font-semibold" htmlFor="how_many_days_left">
    How Many Days Left
  </label>
  <input
    type="number"
    name="how_many_days_left"
    id="how_many_days_left"
    value={data.how_many_days_left ?? ''}
    onChange={handleChange}
    className="w-full border p-2 rounded"
    step={1}
  />
  {errors.how_many_days_left && <div className="text-red-500 text-sm">{errors.how_many_days_left}</div>}
</div>

          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            disabled={processing}
          >
            Create Offer
          </button>
        </form>
      </div>
    </AppLayout>
  );
};

export default Create;
