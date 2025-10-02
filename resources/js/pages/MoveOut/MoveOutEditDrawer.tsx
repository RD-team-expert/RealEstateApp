import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup } from '@/components/ui/radioGroup';
import { MoveOut, MoveOutFormData, TenantData } from '@/types/move-out';
import { useForm } from '@inertiajs/react';
import { format, parse } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';

interface Props {
    moveOut: MoveOut | null;
    tenants: string[];
    unitsByTenant: Record<string, string[]>;
    tenantsData: TenantData[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function MoveOutEditDrawer({ moveOut, tenants, unitsByTenant, tenantsData, open, onOpenChange, onSuccess }: Props) {
    const tenantNameRef = useRef<HTMLButtonElement>(null);
    const unitNameRef = useRef<HTMLButtonElement>(null);
    const [validationError, setValidationError] = useState<string>('');
    const [unitValidationError, setUnitValidationError] = useState<string>('');
    const [availableUnits, setAvailableUnits] = useState<string[]>([]);
    
    const [calendarStates, setCalendarStates] = useState({
        move_out_date: false,
        date_lease_ending_on_buildium: false,
        date_utility_put_under_our_name: false,
    });

    const setCalendarOpen = (field: keyof typeof calendarStates, open: boolean) => {
        setCalendarStates((prev) => ({ ...prev, [field]: open }));
    };

    const { data, setData, put, processing, errors, reset } = useForm<MoveOutFormData>({
        tenants_name: moveOut?.tenants_name ?? '',
        units_name: moveOut?.units_name ?? '',
        move_out_date: moveOut?.move_out_date ?? '',
        lease_status: moveOut?.lease_status ?? '',
        date_lease_ending_on_buildium: moveOut?.date_lease_ending_on_buildium ?? '',
        keys_location: moveOut?.keys_location ?? '',
        utilities_under_our_name: moveOut?.utilities_under_our_name ?? '',
        date_utility_put_under_our_name: moveOut?.date_utility_put_under_our_name ?? '',
        walkthrough: moveOut?.walkthrough ?? '',
        repairs: moveOut?.repairs ?? '',
        send_back_security_deposit: moveOut?.send_back_security_deposit ?? '',
        notes: moveOut?.notes ?? '',
        cleaning: moveOut?.cleaning ?? '',
        list_the_unit: moveOut?.list_the_unit ?? '',
        move_out_form: moveOut?.move_out_form ?? '',
    });

    // Initialize available units when component mounts or moveOut changes
    useEffect(() => {
        if (moveOut?.tenants_name && unitsByTenant[moveOut.tenants_name]) {
            setAvailableUnits(unitsByTenant[moveOut.tenants_name]);
        }
    }, [moveOut?.tenants_name, unitsByTenant]);

    const handleTenantChange = (tenantName: string) => {
        setData('tenants_name', tenantName);
        setData('units_name', '');
        setValidationError('');
        setUnitValidationError('');

        if (tenantName && unitsByTenant && unitsByTenant[tenantName]) {
            setAvailableUnits(unitsByTenant[tenantName]);
        } else {
            setAvailableUnits([]);
        }
    };

    const handleUnitChange = (unitName: string) => {
        setData('units_name', unitName);
        setUnitValidationError('');
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Clear any previous validation errors
        setValidationError('');
        setUnitValidationError('');
        
        let hasValidationErrors = false;
        
        // Validate tenant_name is not empty
        if (!data.tenants_name || data.tenants_name.trim() === '') {
            setValidationError('Please select a tenant before submitting the form.');
            // Focus on the tenant name field
            if (tenantNameRef.current) {
                tenantNameRef.current.focus();
                tenantNameRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        // Validate units_name is not empty
        if (!data.units_name || data.units_name.trim() === '') {
            setUnitValidationError('Please select a unit before submitting the form.');
            // Focus on the unit name field
            if (unitNameRef.current) {
                unitNameRef.current.focus();
                unitNameRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        if (hasValidationErrors) {
            return;
        }
        
        put(route('move-out.update', moveOut?.id), {
            onSuccess: () => {
                setValidationError('');
                setUnitValidationError('');
                onOpenChange(false);
                onSuccess?.();
            },
        });
    };

    const handleCancel = () => {
        // Reset form to original moveOut data
        setData({
            tenants_name: moveOut?.tenants_name ?? '',
            units_name: moveOut?.units_name ?? '',
            move_out_date: moveOut?.move_out_date ?? '',
            lease_status: moveOut?.lease_status ?? '',
            date_lease_ending_on_buildium: moveOut?.date_lease_ending_on_buildium ?? '',
            keys_location: moveOut?.keys_location ?? '',
            utilities_under_our_name: moveOut?.utilities_under_our_name ?? '',
            date_utility_put_under_our_name: moveOut?.date_utility_put_under_our_name ?? '',
            walkthrough: moveOut?.walkthrough ?? '',
            repairs: moveOut?.repairs ?? '',
            send_back_security_deposit: moveOut?.send_back_security_deposit ?? '',
            notes: moveOut?.notes ?? '',
            cleaning: moveOut?.cleaning ?? '',
            list_the_unit: moveOut?.list_the_unit ?? '',
            move_out_form: moveOut?.move_out_form ?? '',
        });
        setValidationError('');
        setUnitValidationError('');
        if (moveOut?.tenants_name && unitsByTenant[moveOut.tenants_name]) {
            setAvailableUnits(unitsByTenant[moveOut.tenants_name]);
        }
        onOpenChange(false);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
            <DrawerContent size="half" title={`Edit Move-Out Record ${moveOut?.id ? `#${moveOut.id}` : ''}`}>
                {!moveOut ? (
                    <div className="flex h-full items-center justify-center">
                        <p className="text-muted-foreground">No move-out record selected</p>
                    </div>
                ) : (
                    <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-auto p-6">
                        <form onSubmit={submit} className="space-y-4">
                            {/* Tenant and Unit Information */}
                            <div className="rounded-lg border-l-4 border-l-blue-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="tenants_name" className="text-base font-semibold">
                                        Tenant Name *
                                    </Label>
                                </div>
                                <Select onValueChange={handleTenantChange} value={data.tenants_name}>
                                    <SelectTrigger ref={tenantNameRef}>
                                        <SelectValue placeholder="Select tenant" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tenants?.map((tenant) => (
                                            <SelectItem key={tenant} value={tenant}>
                                                {tenant}
                                            </SelectItem>
                                        )) || []}
                                    </SelectContent>
                                </Select>
                                {errors.tenants_name && <p className="mt-1 text-sm text-red-600">{errors.tenants_name}</p>}
                                {validationError && <p className="mt-1 text-sm text-red-600">{validationError}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-green-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="units_name" className="text-base font-semibold">
                                        Unit Name *
                                    </Label>
                                </div>
                                <Select
                                    onValueChange={handleUnitChange}
                                    value={data.units_name}
                                    disabled={!data.tenants_name}
                                >
                                    <SelectTrigger ref={unitNameRef}>
                                        <SelectValue placeholder="Select unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableUnits?.map((unit) => (
                                            <SelectItem key={unit} value={unit}>
                                                {unit}
                                            </SelectItem>
                                        )) || []}
                                    </SelectContent>
                                </Select>
                                {errors.units_name && <p className="mt-1 text-sm text-red-600">{errors.units_name}</p>}
                                {unitValidationError && <p className="mt-1 text-sm text-red-600">{unitValidationError}</p>}
                            </div>

                            {/* Date Fields */}
                            <div className="rounded-lg border-l-4 border-l-purple-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="move_out_date" className="text-base font-semibold">
                                        Move Out Date
                                    </Label>
                                </div>
                                <Popover
                                    open={calendarStates.move_out_date}
                                    onOpenChange={(open) => setCalendarOpen('move_out_date', open)}
                                    modal={false}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`w-full justify-start text-left font-normal ${!data.move_out_date && 'text-muted-foreground'}`}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {data.move_out_date
                                                ? format(parse(data.move_out_date, 'yyyy-MM-dd', new Date()), 'PPP')
                                                : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={data.move_out_date ? parse(data.move_out_date, 'yyyy-MM-dd', new Date()) : undefined}
                                            onSelect={(date) => {
                                                if (date) {
                                                    setData('move_out_date', format(date, 'yyyy-MM-dd'));
                                                    setCalendarOpen('move_out_date', false);
                                                }
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.move_out_date && <p className="mt-1 text-sm text-red-600">{errors.move_out_date}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-orange-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="date_lease_ending_on_buildium" className="text-base font-semibold">
                                        Date Lease Ending on Buildium
                                    </Label>
                                </div>
                                <Popover
                                    open={calendarStates.date_lease_ending_on_buildium}
                                    onOpenChange={(open) => setCalendarOpen('date_lease_ending_on_buildium', open)}
                                    modal={false}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`w-full justify-start text-left font-normal ${!data.date_lease_ending_on_buildium && 'text-muted-foreground'}`}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {data.date_lease_ending_on_buildium
                                                ? format(parse(data.date_lease_ending_on_buildium, 'yyyy-MM-dd', new Date()), 'PPP')
                                                : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={data.date_lease_ending_on_buildium ? parse(data.date_lease_ending_on_buildium, 'yyyy-MM-dd', new Date()) : undefined}
                                            onSelect={(date) => {
                                                if (date) {
                                                    setData('date_lease_ending_on_buildium', format(date, 'yyyy-MM-dd'));
                                                    setCalendarOpen('date_lease_ending_on_buildium', false);
                                                }
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.date_lease_ending_on_buildium && <p className="mt-1 text-sm text-red-600">{errors.date_lease_ending_on_buildium}</p>}
                            </div>

                            {/* Status and Location */}
                            <div className="rounded-lg border-l-4 border-l-emerald-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="lease_status" className="text-base font-semibold">
                                        Lease Status
                                    </Label>
                                </div>
                                <Input
                                    id="lease_status"
                                    value={data.lease_status}
                                    onChange={(e) => setData('lease_status', e.target.value)}
                                    placeholder="e.g., Terminated, Expired, etc."
                                />
                                {errors.lease_status && <p className="mt-1 text-sm text-red-600">{errors.lease_status}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-teal-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="keys_location" className="text-base font-semibold">
                                        Keys Location
                                    </Label>
                                </div>
                                <Input
                                    id="keys_location"
                                    value={data.keys_location}
                                    onChange={(e) => setData('keys_location', e.target.value)}
                                    placeholder="Enter keys location"
                                />
                                {errors.keys_location && <p className="mt-1 text-sm text-red-600">{errors.keys_location}</p>}
                            </div>

                            {/* Utilities */}
                            <div className="rounded-lg border-l-4 border-l-indigo-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="utilities_under_our_name" className="text-base font-semibold">
                                        Utilities Under Our Name
                                    </Label>
                                </div>
                                <RadioGroup
                                    value={data.utilities_under_our_name}
                                    onValueChange={(value) => setData('utilities_under_our_name', value as "" | "Yes" | "No")}
                                    name="utilities_under_our_name"
                                    options={[
                                        { value: 'Yes', label: 'Yes' },
                                        { value: 'No', label: 'No' }
                                    ]}
                                />
                                {errors.utilities_under_our_name && <p className="mt-1 text-sm text-red-600">{errors.utilities_under_our_name}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-pink-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="date_utility_put_under_our_name" className="text-base font-semibold">
                                        Date Utility Put Under Our Name
                                    </Label>
                                </div>
                                <Popover
                                    open={calendarStates.date_utility_put_under_our_name}
                                    onOpenChange={(open) => setCalendarOpen('date_utility_put_under_our_name', open)}
                                    modal={false}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`w-full justify-start text-left font-normal ${!data.date_utility_put_under_our_name && 'text-muted-foreground'}`}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {data.date_utility_put_under_our_name
                                                ? format(parse(data.date_utility_put_under_our_name, 'yyyy-MM-dd', new Date()), 'PPP')
                                                : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={data.date_utility_put_under_our_name ? parse(data.date_utility_put_under_our_name, 'yyyy-MM-dd', new Date()) : undefined}
                                            onSelect={(date) => {
                                                if (date) {
                                                    setData('date_utility_put_under_our_name', format(date, 'yyyy-MM-dd'));
                                                    setCalendarOpen('date_utility_put_under_our_name', false);
                                                }
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.date_utility_put_under_our_name && <p className="mt-1 text-sm text-red-600">{errors.date_utility_put_under_our_name}</p>}
                            </div>

                            {/* Text Areas */}
                            <div className="rounded-lg border-l-4 border-l-red-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="walkthrough" className="text-base font-semibold">
                                        Walkthrough
                                    </Label>
                                </div>
                                <textarea
                                    id="walkthrough"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={data.walkthrough}
                                    onChange={(e) => setData('walkthrough', e.target.value)}
                                    rows={4}
                                    placeholder="Enter walkthrough details..."
                                />
                                {errors.walkthrough && <p className="mt-1 text-sm text-red-600">{errors.walkthrough}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-yellow-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="repairs" className="text-base font-semibold">
                                        Repairs
                                    </Label>
                                </div>
                                <textarea
                                    id="repairs"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={data.repairs}
                                    onChange={(e) => setData('repairs', e.target.value)}
                                    rows={4}
                                    placeholder="Enter repair details..."
                                />
                                {errors.repairs && <p className="mt-1 text-sm text-red-600">{errors.repairs}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-cyan-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="send_back_security_deposit" className="text-base font-semibold">
                                        Send Back Security Deposit
                                    </Label>
                                </div>
                                <Input
                                    id="send_back_security_deposit"
                                    value={data.send_back_security_deposit}
                                    onChange={(e) => setData('send_back_security_deposit', e.target.value)}
                                    placeholder="Amount or status of security deposit return"
                                />
                                {errors.send_back_security_deposit && <p className="mt-1 text-sm text-red-600">{errors.send_back_security_deposit}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-gray-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="notes" className="text-base font-semibold">
                                        Notes
                                    </Label>
                                </div>
                                <textarea
                                    id="notes"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    rows={4}
                                    placeholder="Enter any additional notes..."
                                />
                                {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
                            </div>

                            {/* Status Fields */}
                            <div className="rounded-lg border-l-4 border-l-violet-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="cleaning" className="text-base font-semibold">
                                        Cleaning
                                    </Label>
                                </div>
                                <RadioGroup
                                    value={data.cleaning}
                                    onValueChange={(value) => setData('cleaning', value as "" | "cleaned" | "uncleaned")}
                                    name="cleaning"
                                    options={[
                                        { value: 'cleaned', label: 'Cleaned' },
                                        { value: 'uncleaned', label: 'Uncleaned' }
                                    ]}
                                />
                                {errors.cleaning && <p className="mt-1 text-sm text-red-600">{errors.cleaning}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-rose-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="list_the_unit" className="text-base font-semibold">
                                        List the Unit
                                    </Label>
                                </div>
                                <Input
                                    id="list_the_unit"
                                    value={data.list_the_unit}
                                    onChange={(e) => setData('list_the_unit', e.target.value)}
                                    placeholder="Unit listing information"
                                />
                                {errors.list_the_unit && <p className="mt-1 text-sm text-red-600">{errors.list_the_unit}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-amber-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="move_out_form" className="text-base font-semibold">
                                        Move Out Form
                                    </Label>
                                </div>
                                <RadioGroup
                                    value={data.move_out_form}
                                    onValueChange={(value) => setData('move_out_form', value as "" | "filled" | "not filled")}
                                    name="move_out_form"
                                    options={[
                                        { value: 'filled', label: 'Filled' },
                                        { value: 'not filled', label: 'Not Filled' }
                                    ]}
                                />
                                {errors.move_out_form && <p className="mt-1 text-sm text-red-600">{errors.move_out_form}</p>}
                            </div>
                        </form>
                    </div>

                    <DrawerFooter>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                onClick={submit}
                                disabled={processing}
                                className="flex-1"
                            >
                                {processing ? 'Updating...' : 'Update Move-Out Record'}
                            </Button>
                        </div>
                    </DrawerFooter>
                </div>
                )}
            </DrawerContent>
        </Drawer>
    );
}