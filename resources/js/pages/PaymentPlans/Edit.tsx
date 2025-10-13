// import React from 'react';
// import { type BreadcrumbItem } from '@/types';import { Head, Link, useForm } from '@inertiajs/react';
// import { PaymentPlanEditProps, PaymentPlanFormData } from '@/types/PaymentPlan';
// import AppLayout from '@/Layouts/app-layout';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// const Edit: React.FC<PaymentPlanEditProps> = ({ paymentPlan, dropdownData }) => {
//   const { data, setData, put, processing, errors } = useForm<PaymentPlanFormData>({
//     property: paymentPlan.property,
//     city_name: paymentPlan.city_name || '',
//     unit: paymentPlan.unit,
//     tenant: paymentPlan.tenant,
//     amount: paymentPlan.amount,
//     dates: paymentPlan.dates,
//     paid: paymentPlan.paid,
//     notes: paymentPlan.notes || ''
//   });

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     put(`/payment-plans/${paymentPlan.id}`);
//   };


//   return (
//     <AppLayout >
//       <Head title="Edit Payment Plan" />
//       <div className="py-12">
//         <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
//           <Card>
//             <CardHeader>
//               <div className="flex justify-between items-center">
//                 <CardTitle className="text-2xl">
//                   Edit Payment Plan
//                 </CardTitle>
//                 <Link href="/payment-plans">
//                   <Button variant="outline">Back to List</Button>
//                 </Link>
//               </div>
//             </CardHeader>

//             <CardContent>
//               <form onSubmit={handleSubmit} className="space-y-6">
//                 <div className="grid md:grid-cols-2 gap-4">
//                   <div>
//                     <Label htmlFor="property">Property *</Label>
//                     <Select
//                       onValueChange={value => setData('property', value)}
//                       value={data.property}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select property" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {Object.entries(dropdownData.properties).map(([key, value]) => (
//                           <SelectItem key={key} value={key}>{value}</SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     {errors.property && (
//                       <p className="text-red-600 text-sm mt-1">{errors.property}</p>
//                     )}
//                   </div>

//                   <div>
//                     <Label htmlFor="city_name">City</Label>
//                     <Select
//                       onValueChange={value => setData('city_name', value)}
//                       value={data.city_name}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select city" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {Object.entries(dropdownData.cities).map(([key, value]) => (
//                           <SelectItem key={key} value={key}>{value}</SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     {errors.city_name && (
//                       <p className="text-red-600 text-sm mt-1">{errors.city_name}</p>
//                     )}
//                   </div>
//                 </div>

//                 <div className="grid md:grid-cols-2 gap-4">
//                   <div>
//                     <Label htmlFor="unit">Unit *</Label>
//                     <Select
//                       onValueChange={value => setData('unit', value)}
//                       value={data.unit}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select unit" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {Object.entries(dropdownData.units).map(([key, value]) => (
//                           <SelectItem key={key} value={key}>{value}</SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     {errors.unit && (
//                       <p className="text-red-600 text-sm mt-1">{errors.unit}</p>
//                     )}
//                   </div>
//                 </div>

//                 <div className="grid md:grid-cols-2 gap-4">
//                   <div>
//                     <Label htmlFor="tenant">Tenant *</Label>
//                     <Select
//                       onValueChange={value => setData('tenant', value)}
//                       value={data.tenant}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select tenant" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {Object.entries(dropdownData.tenants).map(([key, value]) => (
//                           <SelectItem key={key} value={key}>{value}</SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     {errors.tenant && (
//                       <p className="text-red-600 text-sm mt-1">{errors.tenant}</p>
//                     )}
//                   </div>

//                   <div>
//                     <Label htmlFor="dates">Date *</Label>
//                     <Input
//                       id="dates"
//                       type="date"
//                       value={data.dates}
//                       onChange={e => setData('dates', e.target.value)}
//                       error={errors.dates}
//                     />
//                     {errors.dates && (
//                       <p className="text-red-600 text-sm mt-1">{errors.dates}</p>
//                     )}
//                   </div>
//                 </div>

//                 <div className="grid md:grid-cols-2 gap-4">
//                   <div>
//                     <Label htmlFor="amount">Amount *</Label>
//                     <Input
//                       id="amount"
//                       type="number"
//                       step="0.01"
//                       min="0"
//                       value={data.amount}
//                       onChange={e => setData('amount', parseFloat(e.target.value) || 0)}
//                       error={errors.amount}
//                     />
//                     {errors.amount && (
//                       <p className="text-red-600 text-sm mt-1">{errors.amount}</p>
//                     )}
//                   </div>
//                   <div>
//                     <Label htmlFor="paid">Paid Amount *</Label>
//                     <Input
//                       id="paid"
//                       type="number"
//                       step="0.01"
//                       min="0"
//                       value={data.paid}
//                       onChange={e => setData('paid', parseFloat(e.target.value) || 0)}
//                       error={errors.paid}
//                     />
//                     {errors.paid && (
//                       <p className="text-red-600 text-sm mt-1">{errors.paid}</p>
//                     )}
//                   </div>
//                 </div>

//                 <div>
//                   <Label htmlFor="notes">Notes</Label>
//                   <textarea
//                     id="notes"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     value={data.notes || ''}
//                     onChange={e => setData('notes', e.target.value)}
//                     rows={3}
//                     placeholder="Enter any additional notes..."
//                   />
//                   {errors.notes && (
//                     <p className="text-red-600 text-sm mt-1">{errors.notes}</p>
//                   )}
//                 </div>

//                 <div className="flex justify-end gap-2">
//                   <Link href="/payment-plans">
//                     <Button type="button" variant="outline">Cancel</Button>
//                   </Link>
//                   <Button type="submit" disabled={processing}>
//                     {processing ? 'Updating...' : 'Update Payment Plan'}
//                   </Button>
//                 </div>
//               </form>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </AppLayout>
//   );
// };

// export default Edit;
