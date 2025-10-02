import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup } from '@/components/ui/radioGroup';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ApplicationFormData, UnitData } from '@/types/application';
import { useForm } from '@inertiajs/react';
import { format, parse } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import React, { useState, useRef } from 'react';

interface Props {
    units: UnitData[];
    cities: string[];
    properties: Record<string, string[]>;
    unitsByProperty: Record<string, Record<string, string[]>>;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function ApplicationCreateDrawer({ 
    units, 
    cities, 
    properties, 
    unitsByProperty, 
    open, 
    onOpenChange, 
    onSuccess 
}: Props) {
    const cityRef = useRef<HTMLButtonElement>(null);
    const propertyRef = useRef<HTMLButtonElement>(null);
    const unitRef = useRef<HTMLButtonElement>(null);
    const [validationErrors, setValidationErrors] = useState<{
        city?: string;
        property?: string;
        unit?: string;
        name?: string;
        co_signer?: string;
        status?: string;
    }>({});
    
    const [selectedCity, setSelectedCity] = useState('');
    const [availableProperties, setAvailableProperties] = useState<string[]>([]);
    const [availableUnits, setAvailableUnits] = useState<string[]>([]);
    
    const [calendarOpen, setCalendarOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<ApplicationFormData>({
        city: '',
        property: '',
        name: '',
        co_signer: '',
        unit: '',
        status: 'New',
        date: '',
        stage_in_progress: '',
        notes: '',
        attachment: null,
    });

    // Handle city selection
    const handleCityChange = (city: string) => {
        setSelectedCity(city);
        setData('city', city);
        setData('property', '');
        setData('unit', '');
        setValidationErrors(prev => ({ ...prev, city: undefined, property: undefined, unit: undefined }));

        if (city && properties[city]) {
            setAvailableProperties(properties[city]);
        } else {
            setAvailableProperties([]);
        }
        setAvailableUnits([]);
    };

    // Handle property selection
    const handlePropertyChange = (property: string) => {
        setData('property', property);
        setData('unit', ''); // Reset unit
        setValidationErrors(prev => ({ ...prev, property: undefined, unit: undefined }));

        if (selectedCity && property && unitsByProperty[selectedCity]?.[property]) {
            setAvailableUnits(unitsByProperty[selectedCity][property]);
        } else {
            setAvailableUnits([]);
        }
    };

    const handleUnitChange = (unit: string) => {
        setData('unit', unit);
        setValidationErrors(prev => ({ ...prev, unit: undefined }));
    };

    const handleNameChange = (name: string) => {
        setData('name', name);
        setValidationErrors(prev => ({ ...prev, name: undefined }));
    };

    const handleCoSignerChange = (coSigner: string) => {
        setData('co_signer', coSigner);
        setValidationErrors(prev => ({ ...prev, co_signer: undefined }));
    };

    const handleStatusChange = (status: string) => {
        setData('status', status);
        setValidationErrors(prev => ({ ...prev, status: undefined }));
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Clear any previous validation errors
        setValidationErrors({});
        
        let hasValidationErrors = false;
        const newValidationErrors: typeof validationErrors = {};
        
        // Validate required fields
        if (!data.city || data.city.trim() === '') {
            newValidationErrors.city = 'Please select a city before submitting the form.';
            if (cityRef.current) {
                cityRef.current.focus();
                cityRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        if (!data.property || data.property.trim() === '') {
            newValidationErrors.property = 'Please select a property before submitting the form.';
            if (!hasValidationErrors && propertyRef.current) {
                propertyRef.current.focus();
                propertyRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        if (!data.unit || data.unit.trim() === '') {
            newValidationErrors.unit = 'Please select a unit before submitting the form.';
            if (!hasValidationErrors && unitRef.current) {
                unitRef.current.focus();
                unitRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }

        if (!data.name || data.name.trim() === '') {
            newValidationErrors.name = 'Please enter a name before submitting the form.';
            hasValidationErrors = true;
        }

        if (!data.co_signer || data.co_signer.trim() === '') {
            newValidationErrors.co_signer = 'Please enter a co-signer before submitting the form.';
            hasValidationErrors = true;
        }

        if (!data.status || data.status.trim() === '') {
            newValidationErrors.status = 'Please select a status before submitting the form.';
            hasValidationErrors = true;
        }
        
        if (hasValidationErrors) {
            setValidationErrors(newValidationErrors);
            return;
        }
        
        post(route('applications.store'), {
            onSuccess: () => {
                reset();
                setValidationErrors({});
                setSelectedCity('');
                setAvailableProperties([]);
                setAvailableUnits([]);
                onOpenChange(false);
                onSuccess?.();
            },
        });
    };

    const handleCancel = () => {
        reset();
        setValidationErrors({});
        setSelectedCity('');
        setAvailableProperties([]);
        setAvailableUnits([]);
        onOpenChange(false);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
            <DrawerContent size="half" title="Create New Application">
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-auto p-6">
                        <form onSubmit={submit} className="space-y-4">
                            {/* City, Property, and Unit Information */}
                            <div className="rounded-lg border-l-4 border-l-blue-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="city" className="text-base font-semibold">
                                        City *
                                    </Label>
                                </div>
                                <Select onValueChange={handleCityChange} value={selectedCity}>
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
                                {validationErrors.city && <p className="mt-1 text-sm text-red-600">{validationErrors.city}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-green-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="property" className="text-base font-semibold">
                                        Property *
                                    </Label>
                                </div>
                                <Select
                                    onValueChange={handlePropertyChange}
                                    value={data.property}
                                    disabled={!selectedCity}
                                >
                                    <SelectTrigger ref={propertyRef}>
                                        <SelectValue placeholder="Select property" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableProperties?.map((property) => (
                                            <SelectItem key={property} value={property}>
                                                {property}
                                            </SelectItem>
                                        )) || []}
                                    </SelectContent>
                                </Select>
                                {errors.property && <p className="mt-1 text-sm text-red-600">{errors.property}</p>}
                                {validationErrors.property && <p className="mt-1 text-sm text-red-600">{validationErrors.property}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-purple-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="unit" className="text-base font-semibold">
                                        Unit *
                                    </Label>
                                </div>
                                <Select
                                    onValueChange={handleUnitChange}
                                    value={data.unit}
                                    disabled={!data.property}
                                >
                                    <SelectTrigger ref={unitRef}>
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
                                {errors.unit && <p className="mt-1 text-sm text-red-600">{errors.unit}</p>}
                                {validationErrors.unit && <p className="mt-1 text-sm text-red-600">{validationErrors.unit}</p>}
                            </div>

                            {/* Applicant Information */}
                            <div className="rounded-lg border-l-4 border-l-orange-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="name" className="text-base font-semibold">
                                        Name *
                                    </Label>
                                </div>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    placeholder="Enter applicant name"
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                {validationErrors.name && <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-emerald-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="co_signer" className="text-base font-semibold">
                                        Co-signer *
                                    </Label>
                                </div>
                                <Input
                                    id="co_signer"
                                    value={data.co_signer}
                                    onChange={(e) => handleCoSignerChange(e.target.value)}
                                    placeholder="Enter co-signer name"
                                />
                                {errors.co_signer && <p className="mt-1 text-sm text-red-600">{errors.co_signer}</p>}
                                {validationErrors.co_signer && <p className="mt-1 text-sm text-red-600">{validationErrors.co_signer}</p>}
                            </div>

                            {/* Status and Date */}
                            <div className="rounded-lg border-l-4 border-l-teal-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="status" className="text-base font-semibold">
                                        Status *
                                    </Label>
                                </div>
                                <RadioGroup
                                    value={data.status}
                                    onValueChange={handleStatusChange}
                                    name="status"
                                    options={[
                                        { value: 'New', label: 'New' },
                                        { value: 'Approved', label: 'Approved' },
                                        { value: 'Undecided', label: 'Undecided' }
                                    ]}
                                />
                                {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
                                {validationErrors.status && <p className="mt-1 text-sm text-red-600">{validationErrors.status}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-indigo-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="date" className="text-base font-semibold">
                                        Date
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
                                            onSelect={(date) => {
                                                if (date) {
                                                    setData('date', format(date, 'yyyy-MM-dd'));
                                                    setCalendarOpen(false);
                                                }
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
                            </div>

                            {/* Stage in Progress */}
                            <div className="rounded-lg border-l-4 border-l-pink-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="stage_in_progress" className="text-base font-semibold">
                                        Stage in Progress
                                    </Label>
                                </div>
                                <Input
                                    id="stage_in_progress"
                                    value={data.stage_in_progress}
                                    onChange={(e) => setData('stage_in_progress', e.target.value)}
                                    placeholder="e.g., Document Review, Background Check, etc."
                                />
                                {errors.stage_in_progress && <p className="mt-1 text-sm text-red-600">{errors.stage_in_progress}</p>}
                            </div>

                            {/* Notes */}
                            <div className="rounded-lg border-l-4 border-l-red-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="notes" className="text-base font-semibold">
                                        Notes
                                    </Label>
                                </div>
                                <textarea
                                    id="notes"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] resize-vertical"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Add any additional notes..."
                                    rows={4}
                                />
                                {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
                            </div>

                            {/* Attachment */}
                            <div className="rounded-lg border-l-4 border-l-yellow-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="attachment" className="text-base font-semibold">
                                        Attachment
                                    </Label>
                                </div>
                                <Input
                                    id="attachment"
                                    type="file"
                                    accept="*"
                                    onChange={(e) => setData('attachment', e.target.files?.[0] || null)}
                                    className="cursor-pointer file:cursor-pointer file:border-0 file:bg-transparent file:text-sm file:font-medium"
                                />
                                {errors.attachment && <p className="mt-1 text-sm text-red-600">{errors.attachment}</p>}
                            </div>
                        </form>
                    </div>

                    <DrawerFooter>
                        <div className="flex gap-2 justify-end">
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
                            >
                                {processing ? 'Creating...' : 'Create Application'}
                            </Button>
                        </div>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}