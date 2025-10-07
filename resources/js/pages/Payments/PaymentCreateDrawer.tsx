import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup } from '@/components/ui/radioGroup';
import { PaymentFormData, UnitData } from '@/types/payments';
import { useForm } from '@inertiajs/react';
import { format, parse } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import React, { useState, useRef } from 'react';

interface Props {
    units: UnitData[];
    cities: string[];
    unitsByCity: Record<string, string[]>;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function PaymentCreateDrawer({ units, cities, unitsByCity, open, onOpenChange, onSuccess }: Props) {
    const cityRef = useRef<HTMLButtonElement>(null);
    const unitNameRef = useRef<HTMLButtonElement>(null);
    const dateRef = useRef<HTMLButtonElement>(null);
    const owesRef = useRef<HTMLInputElement>(null);
    const [validationError, setValidationError] = useState<string>('');
    const [unitValidationError, setUnitValidationError] = useState<string>('');
    const [dateValidationError, setDateValidationError] = useState<string>('');
    const [owesValidationError, setOwesValidationError] = useState<string>('');
    const [availableUnits, setAvailableUnits] = useState<string[]>([]);
    
    const [calendarOpen, setCalendarOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        date: '',
        city: '',
        unit_name: '',
        owes: '',
        paid: '',
        status: '',
        notes: '',
        reversed_payments: '',
        permanent: 'No',
    });

    const handleCityChange = (city: string) => {
        setData('city', city);
        setData('unit_name', '');
        setValidationError('');
        setUnitValidationError('');

        if (city && unitsByCity && unitsByCity[city]) {
            setAvailableUnits(unitsByCity[city]);
        } else {
            setAvailableUnits([]);
        }
    };

    const handleUnitChange = (unitName: string) => {
        setData('unit_name', unitName);
        setUnitValidationError('');
    };

    const handleDateChange = (date: Date | undefined) => {
        if (date) {
            setData('date', format(date, 'yyyy-MM-dd'));
            setDateValidationError('');
            setCalendarOpen(false);
        }
    };

    const handleOwesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('owes', e.target.value);
        setOwesValidationError('');
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Clear any previous validation errors
        setValidationError('');
        setUnitValidationError('');
        setDateValidationError('');
        setOwesValidationError('');
        
        let hasValidationErrors = false;
        
        // Validate date is not empty
        if (!data.date || data.date.trim() === '') {
            setDateValidationError('Please select a date before submitting the form.');
            // Focus on the date field
            if (dateRef.current) {
                dateRef.current.focus();
                dateRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        // Validate city is not empty
        if (!data.city || data.city.trim() === '') {
            setValidationError('Please select a city before submitting the form.');
            // Focus on the city field
            if (cityRef.current) {
                cityRef.current.focus();
                cityRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        // Validate unit_name is not empty
        if (!data.unit_name || data.unit_name.trim() === '') {
            setUnitValidationError('Please select a unit before submitting the form.');
            // Focus on the unit name field
            if (unitNameRef.current) {
                unitNameRef.current.focus();
                unitNameRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        // Validate owes is not empty
        if (!data.owes || data.owes.trim() === '') {
            setOwesValidationError('Please enter the amount owed before submitting the form.');
            // Focus on the owes field
            if (owesRef.current) {
                owesRef.current.focus();
                owesRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        if (hasValidationErrors) {
            return;
        }
        
        post(route('payments.store'), {
            onSuccess: () => {
                reset();
                setValidationError('');
                setUnitValidationError('');
                setDateValidationError('');
                setOwesValidationError('');
                setAvailableUnits([]);
                onOpenChange(false);
                onSuccess?.();
            },
        });
    };

    const handleCancel = () => {
        reset();
        setValidationError('');
        setUnitValidationError('');
        setDateValidationError('');
        setOwesValidationError('');
        setAvailableUnits([]);
        onOpenChange(false);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
            <DrawerContent size="half" title="Create New Payment">
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-auto p-6">
                        <form onSubmit={submit} className="space-y-4">
                            {/* Date Field */}
                            <div className="rounded-lg border-l-4 border-l-blue-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="date" className="text-base font-semibold">
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
                                            ref={dateRef}
                                            variant="outline"
                                            className={`w-full justify-start text-left font-normal ${!data.date && 'text-muted-foreground'}`}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {data.date
                                                ? format(parse(data.date, 'yyyy-MM-dd', new Date()), 'PPP')
                                                : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={data.date ? parse(data.date, 'yyyy-MM-dd', new Date()) : undefined}
                                            onSelect={handleDateChange}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
                                {dateValidationError && <p className="mt-1 text-sm text-red-600">{dateValidationError}</p>}
                            </div>

                            {/* City and Unit Information */}
                            <div className="rounded-lg border-l-4 border-l-green-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="city" className="text-base font-semibold">
                                        City *
                                    </Label>
                                </div>
                                <Select onValueChange={handleCityChange} value={data.city}>
                                    <SelectTrigger ref={cityRef}>
                                        <SelectValue placeholder="Select city" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {cities?.map((city) => (
                                            <SelectItem key={city} value={city}>
                                                {city}
                                            </SelectItem>
                                        )) || []}
                                    </SelectContent>
                                </Select>
                                {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                                {validationError && <p className="mt-1 text-sm text-red-600">{validationError}</p>}
                            </div>

                            {/* Property Name Field */}
                            <div className="rounded-lg border-l-4 border-l-orange-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="property_name" className="text-base font-semibold">
                                        Property Name
                                    </Label>
                                </div>
                                <Input
                                    id="property_name"
                                    type="text"
                                    value={data.property_name || ''}
                                    onChange={(e) => setData('property_name', e.target.value)}
                                    placeholder="Enter property name"
                                />
                                {errors.property_name && <p className="mt-1 text-sm text-red-600">{errors.property_name}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-purple-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="unit_name" className="text-base font-semibold">
                                        Unit Name *
                                    </Label>
                                </div>
                                <Select
                                    onValueChange={handleUnitChange}
                                    value={data.unit_name}
                                    disabled={!data.city}
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
                                {errors.unit_name && <p className="mt-1 text-sm text-red-600">{errors.unit_name}</p>}
                                {unitValidationError && <p className="mt-1 text-sm text-red-600">{unitValidationError}</p>}
                            </div>

                            {/* Financial Information */}
                            <div className="rounded-lg border-l-4 border-l-orange-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="owes" className="text-base font-semibold">
                                        Owes *
                                    </Label>
                                </div>
                                <Input
                                    ref={owesRef}
                                    id="owes"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.owes}
                                    onChange={handleOwesChange}
                                    placeholder="Enter amount owed"
                                />
                                {errors.owes && <p className="mt-1 text-sm text-red-600">{errors.owes}</p>}
                                {owesValidationError && <p className="mt-1 text-sm text-red-600">{owesValidationError}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-emerald-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="paid" className="text-base font-semibold">
                                        Paid
                                    </Label>
                                </div>
                                <Input
                                    id="paid"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.paid}
                                    onChange={(e) => setData('paid', e.target.value)}
                                    placeholder="Enter amount paid"
                                />
                                {errors.paid && <p className="mt-1 text-sm text-red-600">{errors.paid}</p>}
                            </div>

                            {/* Status and Permanent */}
                            <div className="rounded-lg border-l-4 border-l-teal-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="permanent" className="text-base font-semibold">
                                        Permanent *
                                    </Label>
                                </div>
                                <RadioGroup
                                    value={data.permanent}
                                    onValueChange={(value) => setData('permanent', value as 'Yes' | 'No')}
                                    name="permanent"
                                    options={[
                                        { value: 'Yes', label: 'Yes' },
                                        { value: 'No', label: 'No' }
                                    ]}
                                />
                                {errors.permanent && <p className="mt-1 text-sm text-red-600">{errors.permanent}</p>}
                            </div>

                            {/* Additional Information */}
                            <div className="rounded-lg border-l-4 border-l-indigo-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="reversed_payments" className="text-base font-semibold">
                                        Reversed Payments?
                                    </Label>
                                </div>
                                <Input
                                    id="reversed_payments"
                                    value={data.reversed_payments}
                                    onChange={(e) => setData('reversed_payments', e.target.value)}
                                    placeholder="Enter reversed payments information"
                                />
                                {errors.reversed_payments && <p className="mt-1 text-sm text-red-600">{errors.reversed_payments}</p>}
                            </div>

                            {/* Notes */}
                            <div className="rounded-lg border-l-4 border-l-pink-500 p-4">
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
                                    rows={3}
                                    placeholder="Enter any additional notes..."
                                />
                                {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
                            </div>
                        </form>
                    </div>

                    <DrawerFooter className="border-t bg-muted/50 p-4">
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                disabled={processing}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                onClick={submit}
                                disabled={processing}
                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                {processing ? 'Creating...' : 'Create Payment'}
                            </Button>
                        </div>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}