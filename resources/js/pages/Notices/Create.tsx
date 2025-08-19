import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/app-layout';
import { Notice } from '@/types/Notice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Create: React.FC = () => {
  const { data, setData, post, processing, errors } = useForm<Partial<Notice>>({
    notice_name: '',
    days: '',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    post('/notices');
  }

  return (
    <AppLayout>
      <Head title="Create Notice" />

      <div className="py-12">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl">Create New Notice</CardTitle>
                <Link href="/notices">
                  <Button variant="outline">Back to List</Button>
                </Link>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Notice Name */}
                  <div>
                    <Label htmlFor="notice_name">Notice Name *</Label>
                    <Input
                      id="notice_name"
                      value={data.notice_name ?? ''}
                      onChange={(e) => setData('notice_name', e.target.value)}
                      error={errors.notice_name}
                    />
                    {errors.notice_name && (
                      <p className="text-red-600 text-sm mt-1">{errors.notice_name}</p>
                    )}
                  </div>

                  {/* Days */}
                  <div>
                    <Label htmlFor="days">Days *</Label>
                    <Input
                      id="days"
                      type="number"
                      min={0}
                      value={data.days ?? ''}
                      onChange={(e) => setData('days', Number(e.target.value))}
                      error={errors.days}
                    />
                    {errors.days && (
                      <p className="text-red-600 text-sm mt-1">{errors.days}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Link href="/notices">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={processing}>
                    {processing ? 'Creating...' : 'Create Notice'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Create;
