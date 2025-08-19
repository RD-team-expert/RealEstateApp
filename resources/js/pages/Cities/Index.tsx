// Cities/Index.tsx
import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { City } from '@/types/City';
import AppLayout from '@/Layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Trash2, Plus, X } from 'lucide-react';

interface Props {
  cities: City[];
}

const Index = ({ cities }: Props) => {
  const [showForm, setShowForm] = useState(false);
  const { data, setData, post, processing, errors, reset } = useForm({
    city: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/cities', {
      onSuccess: () => {
        reset();
        setShowForm(false);
      }
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this city?')) {
      router.delete(`/cities/${id}`);
    }
  };

  return (
    <AppLayout>
      <Head title="Cities" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Add City Form Card */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">Manage Cities</CardTitle>
                    <Button onClick={() => setShowForm(!showForm)}>
                      {showForm ? (
                        <>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Add City
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>

                {/* Create Form */}
                {showForm && (
                  <CardContent>
                    <h3 className="text-lg font-semibold mb-3">Add New City</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          value={data.city}
                          onChange={(e) => setData('city', e.target.value)}
                          placeholder="Enter city name"
                          required
                        />
                        {errors.city && <div className="text-red-500 text-sm mt-1">{errors.city}</div>}
                      </div>
                      <Button type="submit" disabled={processing} className="w-full">
                        {processing ? 'Adding...' : 'Add City'}
                      </Button>
                    </form>
                  </CardContent>
                )}
              </Card>
            </div>

            {/* Cities Table Card */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Cities List</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>City</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cities.map((city) => (
                          <TableRow key={city.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">{city.city}</TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(city.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {cities.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-lg">No cities found.</p>
                      <p className="text-sm">Add your first city using the form on the left.</p>
                    </div>
                  )}

                  {/* Records count info */}
                  <div className="mt-6 flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Showing {cities.length} cities
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
