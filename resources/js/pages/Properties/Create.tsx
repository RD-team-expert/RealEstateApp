// // resources/js/Pages/Properties/Create.tsx

// import React, { useState } from 'react';
// import { Head, useForm, Link } from '@inertiajs/react';
// import AppLayout from '@/Layouts/app-layout';
// import { PropertyFormData } from '@/types/property';
// import type { PageProps } from '@/types/property';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { type BreadcrumbItem } from '@/types';
// export default function Create({ auth }: PageProps) {
//     const { data, setData, post, processing, errors } = useForm<PropertyFormData>({
//         property_name: '',
//         insurance_company_name: '',
//         amount: '',
//         policy_number: '',
//         effective_date: '',
//         expiration_date: '',
//     });

//     const handleSubmit = (e: React.FormEvent) => {
//         e.preventDefault();
//         post(route('properties-info.store'));

//     };

//     return (
//         <AppLayout >
//             <Head title="Create Property" />

//             <div className="py-12">
//                 <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
//                     <Card>
//                         <CardHeader>
//                             <div className="flex justify-between items-center">
//                                 <CardTitle className="text-2xl">Create New Property</CardTitle>
//                                 <Link href={route('properties-info.index')}>
//                                     <Button variant="outline">Back to List</Button>
//                                 </Link>
//                             </div>
//                         </CardHeader>

//                         <CardContent>
//                             <form onSubmit={handleSubmit} className="space-y-6">
//                                 <div className="grid md:grid-cols-2 gap-4">
//                                     {/* Property Name */}
//                                     <div>
//                                         <Label htmlFor="property_name">Property Name *</Label>
//                                         <Input
//                                             id="property_name"
//                                             value={data.property_name}
//                                             onChange={(e) => setData('property_name', e.target.value)}
//                                             error={errors.property_name}
//                                         />
//                                         {errors.property_name && (
//                                             <p className="text-red-600 text-sm mt-1">{errors.property_name}</p>
//                                         )}
//                                     </div>

//                                     {/* Insurance Company */}
//                                     <div>
//                                         <Label htmlFor="insurance_company_name">Insurance Company *</Label>
//                                         <Input
//                                             id="insurance_company_name"
//                                             value={data.insurance_company_name}
//                                             onChange={(e) => setData('insurance_company_name', e.target.value)}
//                                             error={errors.insurance_company_name}
//                                         />
//                                         {errors.insurance_company_name && (
//                                             <p className="text-red-600 text-sm mt-1">{errors.insurance_company_name}</p>
//                                         )}
//                                     </div>
//                                 </div>

//                                 <div className="grid md:grid-cols-2 gap-4">
//                                     {/* Amount */}
//                                     <div>
//                                         <Label htmlFor="amount">Amount *</Label>
//                                         <Input
//                                             id="amount"
//                                             type="number"
//                                             step="0.01"
//                                             min="0"
//                                             value={data.amount}
//                                             onChange={(e) => setData('amount', e.target.value)}
//                                             error={errors.amount}
//                                         />
//                                         {errors.amount && (
//                                             <p className="text-red-600 text-sm mt-1">{errors.amount}</p>
//                                         )}
//                                     </div>

//                                     {/* Policy Number */}
//                                     <div>
//                                         <Label htmlFor="policy_number">Policy Number *</Label>
//                                         <Input
//                                             id="policy_number"
//                                             value={data.policy_number}
//                                             onChange={(e) => setData('policy_number', e.target.value)}
//                                             error={errors.policy_number}
//                                         />
//                                         {errors.policy_number && (
//                                             <p className="text-red-600 text-sm mt-1">{errors.policy_number}</p>
//                                         )}
//                                     </div>
//                                 </div>

//                                 <div className="grid md:grid-cols-2 gap-4">
//                                     {/* Effective Date */}
//                                     <div>
//                                         <Label htmlFor="effective_date">Effective Date *</Label>
//                                         <Input
//                                             id="effective_date"
//                                             type="date"
//                                             value={data.effective_date}
//                                             onChange={(e) => setData('effective_date', e.target.value)}
//                                             error={errors.effective_date}
//                                         />
//                                         {errors.effective_date && (
//                                             <p className="text-red-600 text-sm mt-1">{errors.effective_date}</p>
//                                         )}
//                                     </div>

//                                     {/* Expiration Date */}
//                                     <div>
//                                         <Label htmlFor="expiration_date">Expiration Date *</Label>
//                                         <Input
//                                             id="expiration_date"
//                                             type="date"
//                                             value={data.expiration_date}
//                                             onChange={(e) => setData('expiration_date', e.target.value)}
//                                             error={errors.expiration_date}
//                                         />
//                                         {errors.expiration_date && (
//                                             <p className="text-red-600 text-sm mt-1">{errors.expiration_date}</p>
//                                         )}
//                                     </div>
//                                 </div>

//                                 <div className="flex justify-end gap-2">
//                                     <Link href={route('properties-info.index')}>
//                                         <Button type="button" variant="outline">
//                                             Cancel
//                                         </Button>
//                                     </Link>
//                                     <Button type="submit" disabled={processing}>
//                                         {processing ? 'Creating...' : 'Create Property'}
//                                     </Button>
//                                 </div>
//                             </form>
//                         </CardContent>
//                     </Card>
//                 </div>
//             </div>
//         </AppLayout>
//     );
// }
