// import React, { useState } from 'react';
// import { Head, Link, useForm } from '@inertiajs/react';
// import AppLayout from '@/Layouts/app-layout';
// import { MoveOutFormData, TenantData } from '@/types/move-out';
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
// import { type BreadcrumbItem } from '@/types';
// interface Props {
//     tenants: string[];
//     unitsByTenant: Record<string, string[]>;
//     tenantsData: TenantData[];
// }

// export default function Create({ tenants, unitsByTenant, tenantsData }: Props) {
//     const { data, setData, post, processing, errors } = useForm<MoveOutFormData>({
//         tenants_name: '',
//         units_name: '',
//         move_out_date: '',
//         lease_status: '',
//         date_lease_ending_on_buildium: '',
//         keys_location: '',
//         utilities_under_our_name: '',
//         date_utility_put_under_our_name: '',
//         walkthrough: '',
//         repairs: '',
//         send_back_security_deposit: '',
//         notes: '',
//         cleaning: '',
//         list_the_unit: '',
//         move_out_form: '',
//     });

//     const [availableUnits, setAvailableUnits] = useState<string[]>([]);

//     const handleTenantChange = (tenantName: string) => {
//         setData('tenants_name', tenantName);
//         setData('units_name', '');

//         if (tenantName && unitsByTenant[tenantName]) {
//             setAvailableUnits(unitsByTenant[tenantName]);
//         } else {
//             setAvailableUnits([]);
//         }
//     };

//     const submit = (e: React.FormEvent) => {
//         e.preventDefault();
//         post(route('move-out.store'));
//     };


//     return (
//         <AppLayout >
//             <Head title="Create Move-Out Record" />

//             <div className="py-12">
//                 <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
//                     <Card>
//                         <CardHeader>
//                             <div className="flex justify-between items-center">
//                                 <CardTitle className="text-2xl">Create New Move-Out Record</CardTitle>
//                                 <Link href={route('move-out.index')}>
//                                     <Button variant="outline">Back to List</Button>
//                                 </Link>
//                             </div>
//                         </CardHeader>

//                         <CardContent>
//                             <form onSubmit={submit} className="space-y-6">
//                                 {/* Tenant and Unit Information */}
//                                 <div className="grid md:grid-cols-2 gap-4">
//                                     <div>
//                                         <Label htmlFor="tenants_name">Tenant Name *</Label>
//                                         <Select onValueChange={handleTenantChange} value={data.tenants_name}>
//                                             <SelectTrigger>
//                                                 <SelectValue placeholder="Select tenant" />
//                                             </SelectTrigger>
//                                             <SelectContent>
//                                                 {tenants.map((tenant) => (
//                                                     <SelectItem key={tenant} value={tenant}>
//                                                         {tenant}
//                                                     </SelectItem>
//                                                 ))}
//                                             </SelectContent>
//                                         </Select>
//                                         {errors.tenants_name && <p className="text-red-600 text-sm mt-1">{errors.tenants_name}</p>}
//                                     </div>
//                                     <div>
//                                         <Label htmlFor="units_name">Unit Name *</Label>
//                                         <Select
//                                             onValueChange={(value) => setData('units_name', value)}
//                                             value={data.units_name}
//                                             disabled={!data.tenants_name}
//                                         >
//                                             <SelectTrigger>
//                                                 <SelectValue placeholder="Select unit" />
//                                             </SelectTrigger>
//                                             <SelectContent>
//                                                 {availableUnits.map((unit) => (
//                                                     <SelectItem key={unit} value={unit}>
//                                                         {unit}
//                                                     </SelectItem>
//                                                 ))}
//                                             </SelectContent>
//                                         </Select>
//                                         {errors.units_name && <p className="text-red-600 text-sm mt-1">{errors.units_name}</p>}
//                                     </div>
//                                 </div>

//                                 {/* Date Fields */}
//                                 <div className="grid md:grid-cols-2 gap-4">
//                                     <div>
//                                         <Label htmlFor="move_out_date">Move Out Date</Label>
//                                         <Input
//                                             type="date"
//                                             id="move_out_date"
//                                             value={data.move_out_date}
//                                             onChange={(e) => setData('move_out_date', e.target.value)}
//                                             error={errors.move_out_date}
//                                         />
//                                         {errors.move_out_date && <p className="text-red-600 text-sm mt-1">{errors.move_out_date}</p>}
//                                     </div>
//                                     <div>
//                                         <Label htmlFor="date_lease_ending_on_buildium">Date Lease Ending on Buildium</Label>
//                                         <Input
//                                             type="date"
//                                             id="date_lease_ending_on_buildium"
//                                             value={data.date_lease_ending_on_buildium}
//                                             onChange={(e) => setData('date_lease_ending_on_buildium', e.target.value)}
//                                             error={errors.date_lease_ending_on_buildium}
//                                         />
//                                         {errors.date_lease_ending_on_buildium && <p className="text-red-600 text-sm mt-1">{errors.date_lease_ending_on_buildium}</p>}
//                                     </div>
//                                 </div>

//                                 {/* Status and Location */}
//                                 <div className="grid md:grid-cols-2 gap-4">
//                                     <div>
//                                         <Label htmlFor="lease_status">Lease Status</Label>
//                                         <Input
//                                             id="lease_status"
//                                             value={data.lease_status}
//                                             onChange={(e) => setData('lease_status', e.target.value)}
//                                             error={errors.lease_status}
//                                             placeholder="e.g., Terminated, Expired, etc."
//                                         />
//                                         {errors.lease_status && <p className="text-red-600 text-sm mt-1">{errors.lease_status}</p>}
//                                     </div>
//                                     <div>
//                                         <Label htmlFor="keys_location">Keys Location</Label>
//                                         <Input
//                                             id="keys_location"
//                                             value={data.keys_location}
//                                             onChange={(e) => setData('keys_location', e.target.value)}
//                                             error={errors.keys_location}
//                                         />
//                                         {errors.keys_location && <p className="text-red-600 text-sm mt-1">{errors.keys_location}</p>}
//                                     </div>
//                                 </div>

//                                 {/* Utilities */}
//                                 <div className="grid md:grid-cols-2 gap-4">
//                                     <div>
//                                         <Label htmlFor="utilities_under_our_name">Utilities Under Our Name</Label>
//                                         <Select onValueChange={(value) => setData('utilities_under_our_name', value)} value={data.utilities_under_our_name}>
//                                             <SelectTrigger>
//                                                 <SelectValue placeholder="Select option" />
//                                             </SelectTrigger>
//                                             <SelectContent>
//                                                 <SelectItem value="Yes">Yes</SelectItem>
//                                                 <SelectItem value="No">No</SelectItem>
//                                             </SelectContent>
//                                         </Select>
//                                         {errors.utilities_under_our_name && <p className="text-red-600 text-sm mt-1">{errors.utilities_under_our_name}</p>}
//                                     </div>
//                                     <div>
//                                         <Label htmlFor="date_utility_put_under_our_name">Date Utility Put Under Our Name</Label>
//                                         <Input
//                                             type="date"
//                                             id="date_utility_put_under_our_name"
//                                             value={data.date_utility_put_under_our_name}
//                                             onChange={(e) => setData('date_utility_put_under_our_name', e.target.value)}
//                                             error={errors.date_utility_put_under_our_name}
//                                         />
//                                         {errors.date_utility_put_under_our_name && <p className="text-red-600 text-sm mt-1">{errors.date_utility_put_under_our_name}</p>}
//                                     </div>
//                                 </div>

//                                 {/* Text Areas */}
//                                 <div>
//                                     <Label htmlFor="walkthrough">Walkthrough</Label>
//                                     <textarea
//                                         id="walkthrough"
//                                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                         value={data.walkthrough}
//                                         onChange={(e) => setData('walkthrough', e.target.value)}
//                                         rows={3}
//                                         placeholder="Enter walkthrough details..."
//                                     />
//                                     {errors.walkthrough && <p className="text-red-600 text-sm mt-1">{errors.walkthrough}</p>}
//                                 </div>

//                                 <div>
//                                     <Label htmlFor="repairs">Repairs</Label>
//                                     <textarea
//                                         id="repairs"
//                                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                         value={data.repairs}
//                                         onChange={(e) => setData('repairs', e.target.value)}
//                                         rows={3}
//                                         placeholder="Enter repair details..."
//                                     />
//                                     {errors.repairs && <p className="text-red-600 text-sm mt-1">{errors.repairs}</p>}
//                                 </div>

//                                 {/* Security Deposit */}
//                                 <div>
//                                     <Label htmlFor="send_back_security_deposit">Send Back Security Deposit</Label>
//                                     <Input
//                                         id="send_back_security_deposit"
//                                         value={data.send_back_security_deposit}
//                                         onChange={(e) => setData('send_back_security_deposit', e.target.value)}
//                                         error={errors.send_back_security_deposit}
//                                     />
//                                     {errors.send_back_security_deposit && <p className="text-red-600 text-sm mt-1">{errors.send_back_security_deposit}</p>}
//                                 </div>

//                                 {/* Notes */}
//                                 <div>
//                                     <Label htmlFor="notes">Notes</Label>
//                                     <textarea
//                                         id="notes"
//                                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                         value={data.notes}
//                                         onChange={(e) => setData('notes', e.target.value)}
//                                         rows={3}
//                                         placeholder="Enter any additional notes..."
//                                     />
//                                     {errors.notes && <p className="text-red-600 text-sm mt-1">{errors.notes}</p>}
//                                 </div>

//                                 {/* Status Fields */}
//                                 <div className="grid md:grid-cols-3 gap-4">
//                                     <div>
//                                         <Label htmlFor="cleaning">Cleaning</Label>
//                                         <Select onValueChange={(value) => setData('cleaning', value)} value={data.cleaning}>
//                                             <SelectTrigger>
//                                                 <SelectValue placeholder="Select option" />
//                                             </SelectTrigger>
//                                             <SelectContent>
//                                                 <SelectItem value="cleaned">Cleaned</SelectItem>
//                                                 <SelectItem value="uncleaned">Uncleaned</SelectItem>
//                                             </SelectContent>
//                                         </Select>
//                                         {errors.cleaning && <p className="text-red-600 text-sm mt-1">{errors.cleaning}</p>}
//                                     </div>
//                                     <div>
//                                         <Label htmlFor="list_the_unit">List the Unit</Label>
//                                         <Input
//                                             id="list_the_unit"
//                                             value={data.list_the_unit}
//                                             onChange={(e) => setData('list_the_unit', e.target.value)}
//                                             error={errors.list_the_unit}
//                                         />
//                                         {errors.list_the_unit && <p className="text-red-600 text-sm mt-1">{errors.list_the_unit}</p>}
//                                     </div>
//                                     <div>
//                                         <Label htmlFor="move_out_form">Move Out Form</Label>
//                                         <Select onValueChange={(value) => setData('move_out_form', value)} value={data.move_out_form}>
//                                             <SelectTrigger>
//                                                 <SelectValue placeholder="Select option" />
//                                             </SelectTrigger>
//                                             <SelectContent>
//                                                 <SelectItem value="filled">Filled</SelectItem>
//                                                 <SelectItem value="not filled">Not Filled</SelectItem>
//                                             </SelectContent>
//                                         </Select>
//                                         {errors.move_out_form && <p className="text-red-600 text-sm mt-1">{errors.move_out_form}</p>}
//                                     </div>
//                                 </div>

//                                 <div className="flex justify-end gap-2">
//                                     <Link href={route('move-out.index')}>
//                                         <Button type="button" variant="outline">Cancel</Button>
//                                     </Link>
//                                     <Button type="submit" disabled={processing}>
//                                         {processing ? 'Creating...' : 'Create Move-Out Record'}
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
