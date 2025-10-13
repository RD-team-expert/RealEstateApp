// import React, { useState } from 'react';
// import { type BreadcrumbItem } from '@/types';import { Head, useForm, Link, usePage } from '@inertiajs/react';
// import AppLayout from '@/Layouts/app-layout';
// import { NoticeAndEviction, Tenant, Notice } from '@/types/NoticeAndEviction';
// import { City } from '@/types/City';
// import { PropertyInfoWithoutInsurance } from '@/types/PropertyInfoWithoutInsurance';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from '@/components/ui/select';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { usePermissions } from '@/hooks/usePermissions';
// const Create = () => {
//   const { tenants, notices, cities, properties } = usePage().props as { 
//     tenants: Tenant[]; 
//     notices: Notice[];
//     cities: City[];
//     properties: PropertyInfoWithoutInsurance[];
//   };

//   const [availableProperties, setAvailableProperties] = useState<PropertyInfoWithoutInsurance[]>([]);

//   const { data, setData, post, processing, errors } = useForm<Partial<NoticeAndEviction>>({
//     unit_name: '',
//     tenants_name: '',
//     status: '',
//     date: '',
//     type_of_notice: '',
//     have_an_exception: '',
//     note: '',
//     evictions: '',
//     sent_to_atorney: '',
//     hearing_dates: '',
//     evected_or_payment_plan: '',
//     if_left: '',
//     writ_date: '',
//     city_name: '',
//     property_name: '',
//   });

//   function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     post('/notice_and_evictions');
//   }

//   // Handle city change to filter properties
//   const handleCityChange = (cityId: string) => {
//     const selectedCity = cities.find(city => city.id.toString() === cityId);
//     setData('city_name', selectedCity ? selectedCity.city : '');
//     setData('property_name', '');
    
//     if (cityId) {
//       const filteredProperties = properties.filter(
//         property => property.city_id?.toString() === cityId
//       );
//       setAvailableProperties(filteredProperties);
//     } else {
//       setAvailableProperties([]);
//     }
//   };

//   // Handle property change
//   const handlePropertyChange = (propertyName: string) => {
//     setData('property_name', propertyName);
//   };

//   const unitOptions = Array.from(new Set(tenants.map(t => t.unit_number)));
//   const tenantOptions = tenants.map(t => ({
//     label: `${t.first_name} ${t.last_name}`,
//     value: `${t.first_name} ${t.last_name}`,
//   }));
// const { hasPermission, hasAnyPermission, hasAllPermissions} = usePermissions();

//   return (
//     <AppLayout >
//       <Head title="Create Notice & Eviction" />

//       <div className="py-12">
//         <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
//           <Card>
//             <CardHeader>
//               <div className="flex justify-between items-center">
//                 <CardTitle className="text-2xl">Create New Notice & Eviction</CardTitle>
//                 <div className="flex gap-2">
//                     {hasPermission('notices.index')&&(
//                   <Link href={route('notices.index')}>
//                     <Button variant="outline">View Notices</Button>
//                   </Link>)}
//                   <Link href={'/notice_and_evictions'}>
//                     <Button variant="outline">Back to List</Button>
//                   </Link>
//                 </div>
//               </div>
//             </CardHeader>

//             <CardContent>
//               <form onSubmit={handleSubmit} className="space-y-6">
//                 <div className="grid md:grid-cols-2 gap-4">
//                   {/* City Name */}
//                   <div>
//                     <Label htmlFor="city_name">City Name</Label>
//                     <Select onValueChange={handleCityChange} value={cities.find(c => c.city === data.city_name)?.id.toString() || ''}>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select city" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {cities.map((city) => (
//                           <SelectItem key={city.id} value={city.id.toString()}>
//                             {city.city}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     {errors.city_name && (
//                       <p className="text-red-600 text-sm mt-1">{errors.city_name}</p>
//                     )}
//                   </div>

//                   {/* Property Name */}
//                   <div>
//                     <Label htmlFor="property_name">Property Name</Label>
//                     <Select onValueChange={handlePropertyChange} value={data.property_name} disabled={!data.city_name}>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select property" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {availableProperties.map((property) => (
//                           <SelectItem key={property.id} value={property.property_name}>
//                             {property.property_name}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     {errors.property_name && (
//                       <p className="text-red-600 text-sm mt-1">{errors.property_name}</p>
//                     )}
//                   </div>
//                 </div>

//                 <div className="grid md:grid-cols-2 gap-4">
//                   {/* Unit Name */}
//                   <div>
//                     <Label htmlFor="unit_name">Unit Name *</Label>
//                     <Select onValueChange={(value) => setData('unit_name', value)} value={data.unit_name}>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select unit" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {unitOptions.map((unit) => (
//                           <SelectItem key={unit} value={unit}>
//                             {unit}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     {errors.unit_name && (
//                       <p className="text-red-600 text-sm mt-1">{errors.unit_name}</p>
//                     )}
//                   </div>

//                   {/* Tenant Name */}
//                   <div>
//                     <Label htmlFor="tenants_name">Tenants Name *</Label>
//                     <Select onValueChange={(value) => setData('tenants_name', value)} value={data.tenants_name}>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select tenant" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {tenantOptions.map((tenant) => (
//                           <SelectItem key={tenant.value} value={tenant.value}>
//                             {tenant.label}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     {errors.tenants_name && (
//                       <p className="text-red-600 text-sm mt-1">{errors.tenants_name}</p>
//                     )}
//                   </div>
//                 </div>

//                 <div className="grid md:grid-cols-2 gap-4">
//                   {/* Status */}
//                   <div>
//                     <Label htmlFor="status">Status</Label>
//                     <Select onValueChange={(value) => setData('status', value)} value={data.status}>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select status" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="Posted">Posted</SelectItem>
//                         <SelectItem value="Yes">Sent to representative</SelectItem>
//                       </SelectContent>
//                     </Select>
//                     {errors.status && (
//                       <p className="text-red-600 text-sm mt-1">{errors.status}</p>
//                     )}
//                   </div>

//                   {/* Date */}
//                   <div>
//                     <Label htmlFor="date">Date</Label>
//                     <Input
//                       id="date"
//                       type="date"
//                       value={data.date ?? ''}
//                       onChange={(e) => setData('date', e.target.value)}
//                       error={errors.date}
//                     />
//                     {errors.date && (
//                       <p className="text-red-600 text-sm mt-1">{errors.date}</p>
//                     )}
//                   </div>
//                 </div>

//                 <div className="grid md:grid-cols-2 gap-4">
//                   {/* Type of Notice */}
//                   <div>
//                     <Label htmlFor="type_of_notice">Type of Notice</Label>
//                     <Select onValueChange={(value) => setData('type_of_notice', value)} value={data.type_of_notice}>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select type" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {notices.map((notice) => (
//                           <SelectItem key={notice.notice_name} value={notice.notice_name}>
//                             {notice.notice_name}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     {errors.type_of_notice && (
//                       <p className="text-red-600 text-sm mt-1">{errors.type_of_notice}</p>
//                     )}
//                   </div>

//                   {/* Have An Exception */}
//                   <div>
//                     <Label htmlFor="have_an_exception">Have An Exception?</Label>
//                     <Select onValueChange={(value) => setData('have_an_exception', value)} value={data.have_an_exception}>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select option" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="Yes">Yes</SelectItem>
//                         <SelectItem value="No">No</SelectItem>
//                       </SelectContent>
//                     </Select>
//                     {errors.have_an_exception && (
//                       <p className="text-red-600 text-sm mt-1">{errors.have_an_exception}</p>
//                     )}
//                   </div>
//                 </div>

//                 {/* Note */}
//                 <div>
//                   <Label htmlFor="note">Note</Label>
//                   <textarea
//                     id="note"
//                     value={data.note ?? ''}
//                     onChange={(e) => setData('note', e.target.value)}
//                     rows={3}
//                     placeholder="Enter any notes..."
//                     className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-vertical"
//                   />
//                   {errors.note && (
//                     <p className="text-red-600 text-sm mt-1">{errors.note}</p>
//                   )}
//                 </div>

//                 <div className="grid md:grid-cols-2 gap-4">
//                   {/* Sent to Attorney */}
//                   <div>
//                     <Label htmlFor="sent_to_atorney">Sent to Attorney</Label>
//                     <Select onValueChange={(value) => setData('sent_to_atorney', value)} value={data.sent_to_atorney}>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select option" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="Yes">Yes</SelectItem>
//                         <SelectItem value="No">No</SelectItem>
//                       </SelectContent>
//                     </Select>
//                     {errors.sent_to_atorney && (
//                       <p className="text-red-600 text-sm mt-1">{errors.sent_to_atorney}</p>
//                     )}
//                   </div>

//                   {/* Hearing Dates */}
//                   <div>
//                     <Label htmlFor="hearing_dates">Hearing Dates</Label>
//                     <Input
//                       id="hearing_dates"
//                       type="date"
//                       value={data.hearing_dates ?? ''}
//                       onChange={(e) => setData('hearing_dates', e.target.value)}
//                       error={errors.hearing_dates}
//                     />
//                     {errors.hearing_dates && (
//                       <p className="text-red-600 text-sm mt-1">{errors.hearing_dates}</p>
//                     )}
//                   </div>
//                 </div>

//                 <div className="grid md:grid-cols-2 gap-4">
//                   {/* Evected Or Payment Plan */}
//                   <div>
//                     <Label htmlFor="evected_or_payment_plan">Evected Or Payment Plan</Label>
//                     <Select onValueChange={(value) => setData('evected_or_payment_plan', value)} value={data.evected_or_payment_plan}>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select option" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="Evected">Evected</SelectItem>
//                         <SelectItem value="Payment Plan">Payment Plan</SelectItem>
//                       </SelectContent>
//                     </Select>
//                     {errors.evected_or_payment_plan && (
//                       <p className="text-red-600 text-sm mt-1">{errors.evected_or_payment_plan}</p>
//                     )}
//                   </div>

//                   {/* If Left */}
//                   <div>
//                     <Label htmlFor="if_left">If Left?</Label>
//                     <Select onValueChange={(value) => setData('if_left', value)} value={data.if_left}>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select option" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="Yes">Yes</SelectItem>
//                         <SelectItem value="No">No</SelectItem>
//                       </SelectContent>
//                     </Select>
//                     {errors.if_left && (
//                       <p className="text-red-600 text-sm mt-1">{errors.if_left}</p>
//                     )}
//                   </div>
//                 </div>

//                 {/* Writ Date */}
//                 <div className="grid md:grid-cols-2 gap-4">
//                   <div>
//                     <Label htmlFor="writ_date">Writ Date</Label>
//                     <Input
//                       id="writ_date"
//                       type="date"
//                       value={data.writ_date ?? ''}
//                       onChange={(e) => setData('writ_date', e.target.value)}
//                       error={errors.writ_date}
//                     />
//                     {errors.writ_date && (
//                       <p className="text-red-600 text-sm mt-1">{errors.writ_date}</p>
//                     )}
//                   </div>
//                 </div>

//                 <div className="flex justify-end gap-2">
//                   <Link href={'/notice_and_evictions'}>
//                     <Button type="button" variant="outline">
//                       Cancel
//                     </Button>
//                   </Link>
//                   <Button type="submit" disabled={processing}>
//                     {processing ? 'Creating...' : 'Create Notice & Eviction'}
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

// export default Create;
