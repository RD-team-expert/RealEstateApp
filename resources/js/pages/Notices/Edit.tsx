import React from 'react';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/app-layout';
import { Notice } from '@/types/Notice';

const Edit: React.FC = () => {
  const { notice } = usePage().props as { notice: Notice };
  const { data, setData, put, processing, errors } = useForm({
    notice_name: notice.notice_name,
    days: notice.days,
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setData(name as keyof Notice, name === 'days' ? Number(value) : value);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    put(`/notices/${notice.id}`);
  }

  return (
    <AppLayout>
      <Head title="Edit Notice" />
      <div className="container mx-auto mt-6">
        <div className="mb-4">
          <Link href="/notices" className="text-blue-600">&larr; Back</Link>
        </div>
        <h2 className="text-xl mb-4 font-bold">Edit Notice</h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block mb-1 font-semibold" htmlFor="notice_name">
              Notice Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="notice_name"
              id="notice_name"
              value={data.notice_name}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            />
            {errors.notice_name && <div className="text-red-500 text-sm">{errors.notice_name}</div>}
          </div>
          <div>
            <label className="block mb-1 font-semibold" htmlFor="days">
              Days <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="days"
              id="days"
              value={data.days}
              onChange={handleChange}
              required
              min={0}
              className="w-full border p-2 rounded"
            />
            {errors.days && <div className="text-red-500 text-sm">{errors.days}</div>}
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
