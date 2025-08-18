import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/app-layout';
import { Notice } from '@/types/Notice';

const Create: React.FC = () => {
  const { data, setData, post, processing, errors } = useForm<Partial<Notice>>({
    notice_name: '',
    days: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setData(name as keyof Notice, name === 'days' ? Number(value) : value);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    post('/notices');
  }

  return (
    <AppLayout>
      <Head title="Create Notice" />
      <div className="container mx-auto mt-6">
        <div className="mb-4">
          <Link href="/notices" className="text-blue-600">&larr; Back</Link>
        </div>
        <h2 className="text-xl mb-4 font-bold">Create Notice</h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block mb-1 font-semibold" htmlFor="notice_name">
              Notice Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="notice_name"
              id="notice_name"
              value={data.notice_name ?? ''}
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
              value={data.days ?? ''}
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
            Create
          </button>
        </form>
      </div>
    </AppLayout>
  );
};

export default Create;
