// Cities/Index.tsx
import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { City } from '@/types/City';
import AppLayout from '@/Layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { usePermissions } from '@/hooks/usePermissions';

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

  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  return (
    <AppLayout>
      <Head title="Cities" />

      <div className="py-12 bg-background text-foreground transition-colors min-h-screen">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Add City Form Card */}
            {hasAllPermissions(['cities.store','cities.create']) && (
            <div className="lg:col-span-1">
              <Card className="bg-card text-card-foreground shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">Manage Cities</CardTitle>
                    <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"}>
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
                    <h3 className="text-lg font-semibold mb-3 text-foreground">Add New City</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="city" className="block text-sm font-medium text-foreground mb-1">
                          City Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="city"
                          type="text"
                          value={data.city}
                          onChange={(e) => setData('city', e.target.value)}
                          placeholder="Enter city name"
                          className="bg-input text-input-foreground"
                          required
                        />
                        {errors.city && <div className="text-destructive text-sm mt-1">{errors.city}</div>}
                      </div>
                      <Button type="submit" disabled={processing} className="w-full">
                        {processing ? 'Adding...' : 'Add City'}
                      </Button>
                    </form>
                  </CardContent>
                )}
              </Card>
            </div>)}

            {/* Cities Table Card */}
            <div className="lg:col-span-2">
              <Card className="bg-card text-card-foreground shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Cities List</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border">
                          <TableHead className="text-muted-foreground">City</TableHead>
                          {hasPermission('cities.destroy') && (
                          <TableHead className="text-muted-foreground">Actions</TableHead>)}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cities.map((city) => (
                          <TableRow key={city.id} className="hover:bg-muted/50 border-border">
                            <TableCell className="font-medium text-foreground">{city.city}</TableCell>
                            {hasPermission('cities.destroy') && (
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(city.id)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>)}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {cities.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-lg">No cities found.</p>
                      <p className="text-sm">Add your first city using the form on the left.</p>
                    </div>
                  )}

                  {/* Records count info */}
                  <div className="mt-6 flex justify-between items-center border-t border-border pt-4">
                    <div className="text-sm text-muted-foreground">
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
