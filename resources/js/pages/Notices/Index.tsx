import React from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { Notice } from '@/types/Notice';
import AppLayout from '@/Layouts/app-layout';

const Index = () => {
  const { notices } = usePage().props as { notices: Notice[] };

  const handleDelete = (id: number) => {
    if (window.confirm('Delete this notice? This cannot be undone.')) {
      router.delete(`/notices/${id}`);
    }
  };

  return (
    <AppLayout>
      <Head title="Notices" />
      <div className="container mx-auto mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Notices</h2>
          <Link
            href="/notices/create"
            className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded"
          >
            Add Notice
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="table-auto w-full border">
            <thead className="bg-gray-100">
              <tr>

                <th className="border px-4 py-2">Notice Name</th>
                <th className="border px-4 py-2">Days</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {notices.map(notice => (
                <tr key={notice.id}>

                  <td className="border px-4 py-2">{notice.notice_name}</td>
                  <td className="border px-4 py-2">{notice.days}</td>
                  <td className="border px-4 py-2">
                    <Link
                      href={`/notices/${notice.id}/edit`}
                      className="text-green-600 mr-2"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(notice.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {notices.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-6">
                    No notices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
