import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PaymentPlanFormData, DropdownData, PaymentPlan } from '@/types/PaymentPlan';
import { useForm } from '@inertiajs/react';
import { format, parse } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';

interface Props {
    paymentPlan: PaymentPlan;
    dropdownData: DropdownData;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function PaymentPlanEditDrawer({ paymentPlan, dropdownData, open, onOpenChange, onSuccess }: Props) {
    const propertyRef = useRef<HTMLButtonElement>(null);
    const unitRef = useRef<HTMLButtonElement>(null);
    const tenantRef = useRef<HTMLButtonElement>(null);
    const amountRef = useRef<HTMLInputElement>(null);
    const [validationErrors, setValidationErrors] = useState({
        property: '',
        unit: '',
        tenant: '',
        amount: '',
        dates: ''
    });
    
    const [calendarOpen, setCalendarOpen] = useState(false);

    const { data, setData, put, processing, errors, reset } = useForm<PaymentPlanFormData>({
        property: paymentPlan.property,
        unit: paymentPlan.unit,
        tenant: paymentPlan.tenant,
        amount: paymentPlan.amount,
        dates: paymentPlan.dates,
        paid: paymentPlan.paid,
        notes: paymentPlan.notes || ''
    });

    // Reset form data when paymentPlan changes
    useEffect(() => {
        setData({
            property: paymentPlan.property,
            unit: paymentPlan.unit,
            tenant: paymentPlan.tenant,
            amount: paymentPlan.amount,
            dates: paymentPlan.dates,
            paid: paymentPlan.paid,
            notes: paymentPlan.notes || ''
        });
        clearValidationErrors();
    }, [paymentPlan]);

    const clearValidationErrors = () => {
        setValidationErrors({
            property: '',
            unit: '',
            tenant: '',
            amount: '',
            dates: ''
        });
    };

    const validateForm = () => {
        let hasErrors = false;
        const newErrors = {
            property: '',
            unit: '',
            tenant: '',
            amount: '',
            dates: ''
        };

        if (!data.property || data.property.trim() === '') {
            newErrors.property = 'Please select a property before submitting the form.';
            if (propertyRef.current) {
                propertyRef.current.focus();
                propertyRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasErrors = true;
        }

        if (!data.unit || data.unit.trim() === '') {
            newErrors.unit = 'Please select a unit before submitting the form.';
            if (unitRef.current && !hasErrors) {
                unitRef.current.focus();
                unitRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasErrors = true;
        }

        if (!data.tenant || data.tenant.trim() === '') {
            newErrors.tenant = 'Please select a tenant before submitting the form.';
            if (tenantRef.current && !hasErrors) {
                tenantRef.current.focus();
                tenantRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasErrors = true;
        }

        if (!data.amount || data.amount <= 0) {
            newErrors.amount = 'Please enter a valid amount greater than 0.';
            if (amountRef.current && !hasErrors) {
                amountRef.current.focus();
                amountRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasErrors = true;
        }

        setValidationErrors(newErrors);
        return !hasErrors;
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        clearValidationErrors();
        
        if (!validateForm()) {
            return;
        }
        
        put(`/payment-plans/${paymentPlan.id}`, {
            onSuccess: () => {
                clearValidationErrors();
                onOpenChange(false);
                onSuccess?.();
            },
        });
    };

    const handleCancel = () => {
        // Reset to original values
        setData({
            property: paymentPlan.property,
            unit: paymentPlan.unit,
            tenant: paymentPlan.tenant,
            amount: paymentPlan.amount,
            dates: paymentPlan.dates,
            paid: paymentPlan.paid,
            notes: paymentPlan.notes || ''
        });
        clearValidationErrors();
        onOpenChange(false);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
            <DrawerContent size="half" title="Edit Payment Plan">
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-auto p-6">
                        <form onSubmit={submit} className="space-y-4">
                            {/* Property Selection */}
                            <div className="rounded-lg border-l-4 border-l-blue-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="property" className="text-base font-semibold">
                                        Property *
                                    </Label>
                                </div>
                                <Select
                                    onValueChange={(value) => {
                                        setData('property', value);
                                        setValidationErrors(prev => ({ ...prev, property: '' }));
                                    }}
                                    value={data.property}
                                >
                                    <SelectTrigger ref={propertyRef}>
                                        <SelectValue placeholder="Select property" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(dropdownData.properties).map(([key, value]) => (
                                            <SelectItem key={key} value={key}>{value}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.property && <p className="mt-1 text-sm text-red-600">{errors.property}</p>}
                                {validationErrors.property && <p className="mt-1 text-sm text-red-600">{validationErrors.property}</p>}
                            </div>

                            {/* Unit Selection */}
                            <div className="rounded-lg border-l-4 border-l-green-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="unit" className="text-base font-semibold">
                                        Unit *
                                    </Label>
                                </div>
                                <Select
                                    onValueChange={(value) => {
                                        setData('unit', value);
                                        setValidationErrors(prev => ({ ...prev, unit: '' }));
                                    }}
                                    value={data.unit}
                                >
                                    <SelectTrigger ref={unitRef}>
                                        <SelectValue placeholder="Select unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(dropdownData.units).map(([key, value]) => (
                                            <SelectItem key={key} value={key}>{value}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.unit && <p className="mt-1 text-sm text-red-600">{errors.unit}</p>}
                                {validationErrors.unit && <p className="mt-1 text-sm text-red-600">{validationErrors.unit}</p>}
                            </div>

                            {/* Tenant Selection */}
                            <div className="rounded-lg border-l-4 border-l-purple-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="tenant" className="text-base font-semibold">
                                        Tenant *
                                    </Label>
                                </div>
                                <Select
                                    onValueChange={(value) => {
                                        setData('tenant', value);
                                        setValidationErrors(prev => ({ ...prev, tenant: '' }));
                                    }}
                                    value={data.tenant}
                                >
                                    <SelectTrigger ref={tenantRef}>
                                        <SelectValue placeholder="Select tenant" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(dropdownData.tenants).map(([key, value]) => (
                                            <SelectItem key={key} value={key}>{value}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.tenant && <p className="mt-1 text-sm text-red-600">{errors.tenant}</p>}
                                {validationErrors.tenant && <p className="mt-1 text-sm text-red-600">{validationErrors.tenant}</p>}
                            </div>

                            {/* Date Selection */}
                            <div className="rounded-lg border-l-4 border-l-orange-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="dates" className="text-base font-semibold">
                                        Date *
                                    </Label>
                                </div>
                                <Popover
                                    open={calendarOpen}
                                    onOpenChange={setCalendarOpen}
                                    modal={false}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`w-full justify-start text-left font-normal ${!data.dates && 'text-muted-foreground'}`}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {(() => {
                                                if (!data.dates) return 'Pick a date';
                                                try {
                                                    const parsedDate = parse(data.dates, 'yyyy-MM-dd', new Date());
                                                    if (isNaN(parsedDate.getTime())) {
                                                        return 'Pick a date';
                                                    }
                                                    return format(parsedDate, 'PPP');
                                                } catch (error) {
                                                    return 'Pick a date';
                                                }
                                            })()}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={(() => {
                                                if (!data.dates) return undefined;
                                                try {
                                                    const parsedDate = parse(data.dates, 'yyyy-MM-dd', new Date());
                                                    return isNaN(parsedDate.getTime()) ? undefined : parsedDate;
                                                } catch (error) {
                                                    return undefined;
                                                }
                                            })()}
                                            onSelect={(date) => {
                                                if (date) {
                                                    setData('dates', format(date, 'yyyy-MM-dd'));
                                                    setCalendarOpen(false);
                                                }
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.dates && <p className="mt-1 text-sm text-red-600">{errors.dates}</p>}
                                {validationErrors.dates && <p className="mt-1 text-sm text-red-600">{validationErrors.dates}</p>}
                            </div>

                            {/* Amount Fields */}
                            <div className="rounded-lg border-l-4 border-l-emerald-500 p-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <div className="mb-2">
                                            <Label htmlFor="amount" className="text-base font-semibold">
                                                Amount *
                                            </Label>
                                        </div>
                                        <Input
                                            ref={amountRef}
                                            id="amount"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.amount}
                                            onChange={(e) => {
                                                setData('amount', parseFloat(e.target.value) || 0);
                                                setValidationErrors(prev => ({ ...prev, amount: '' }));
                                            }}
                                            placeholder="Enter amount"
                                        />
                                        {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
                                        {validationErrors.amount && <p className="mt-1 text-sm text-red-600">{validationErrors.amount}</p>}
                                    </div>
                                    <div>
                                        <div className="mb-2">
                                            <Label htmlFor="paid" className="text-base font-semibold">
                                                Paid Amount
                                            </Label>
                                        </div>
                                        <Input
                                            id="paid"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.paid}
                                            onChange={(e) => setData('paid', parseFloat(e.target.value) || 0)}
                                            placeholder="Enter paid amount"
                                        />
                                        {errors.paid && <p className="mt-1 text-sm text-red-600">{errors.paid}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Notes Section */}
                            <div className="rounded-lg border-l-4 border-l-teal-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="notes" className="text-base font-semibold">
                                        Notes
                                    </Label>
                                </div>
                                <textarea
                                    id="notes"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={data.notes || ''}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    rows={3}
                                    placeholder="Enter any additional notes..."
                                />
                                {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
                            </div>
                        </form>
                    </div>

                    <DrawerFooter>
                        <div className="flex justify-end gap-2 w-full">
                            <Button type="button" variant="outline" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button type="submit" onClick={submit} disabled={processing}>
                                {processing ? 'Updating...' : 'Update Payment Plan'}
                            </Button>
                        </div>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}