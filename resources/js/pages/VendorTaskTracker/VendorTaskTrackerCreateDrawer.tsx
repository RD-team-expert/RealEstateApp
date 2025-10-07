import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup } from '@/components/ui/radioGroup';
import { VendorTaskTrackerFormData, UnitData, VendorData } from '@/types/vendor-task-tracker';
import { useForm } from '@inertiajs/react';
import { format, parse } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import React, { useState, useRef } from 'react';

interface Props {
    units: string[];
    cities: Array<{ id: number; city: string }>;
    unitsByCity: Record<string, string[]>;
    propertiesByCity: Record<string, string[]>;
    unitsByProperty: Record<string, Record<string, string[]>>;
    vendorsByCity: Record<string, string[]>;
    vendors: string[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function VendorTaskTrackerCreateDrawer({ 
    units, 
    cities, 
    unitsByCity, 
    propertiesByCity,
    unitsByProperty,
    vendorsByCity,
    vendors, 
    open, 
    onOpenChange, 
    onSuccess 
}: Props) {
    const cityRef = useRef<HTMLButtonElement>(null);
    const unitRef = useRef<HTMLButtonElement>(null);
    const vendorRef = useRef<HTMLButtonElement>(null);
    const taskSubmissionDateRef = useRef<HTMLButtonElement>(null);
    const assignedTasksRef = useRef<HTMLTextAreaElement>(null);
    
    const [validationError, setValidationError] = useState<string>('');
    const [unitValidationError, setUnitValidationError] = useState<string>('');
    const [vendorValidationError, setVendorValidationError] = useState<string>('');
    const [taskSubmissionDateValidationError, setTaskSubmissionDateValidationError] = useState<string>('');
    const [assignedTasksValidationError, setAssignedTasksValidationError] = useState<string>('');
    const [availableUnits, setAvailableUnits] = useState<string[]>([]);
    const [availableProperties, setAvailableProperties] = useState<string[]>([]);
    const [availableVendors, setAvailableVendors] = useState<string[]>([]);
    
    const [calendarStates, setCalendarStates] = useState({
        task_submission_date: false,
        any_scheduled_visits: false,
        task_ending_date: false,
    });

    const setCalendarOpen = (field: keyof typeof calendarStates, open: boolean) => {
        setCalendarStates((prev) => ({ ...prev, [field]: open }));
    };

    const { data, setData, post, processing, errors, reset } = useForm<VendorTaskTrackerFormData>({
        city: '',
        property: '',
        task_submission_date: '',
        vendor_name: '',
        unit_name: '',
        assigned_tasks: '',
        any_scheduled_visits: '',
        notes: '',
        task_ending_date: '',
        status: '',
        urgent: 'No',
    });

    const handleCityChange = (city: string) => {
        setData('city', city);
        setData('property', '');
        setData('unit_name', '');
        setData('vendor_name', '');
        setValidationError('');
        setUnitValidationError('');
        setVendorValidationError('');

        if (city) {
            // Set available properties for the selected city
            if (propertiesByCity[city]) {
                setAvailableProperties(propertiesByCity[city]);
            } else {
                setAvailableProperties([]);
            }

            // Set available vendors for the selected city
            if (vendorsByCity[city]) {
                setAvailableVendors(vendorsByCity[city]);
            } else {
                setAvailableVendors([]);
            }
        } else {
            setAvailableProperties([]);
            setAvailableVendors([]);
        }

        // Clear units since property is reset
        setAvailableUnits([]);
    };

    const handlePropertyChange = (property: string) => {
        setData('property', property);
        setData('unit_name', '');
        setUnitValidationError('');

        if (data.city && property && unitsByProperty[data.city] && unitsByProperty[data.city][property]) {
            setAvailableUnits(unitsByProperty[data.city][property]);
        } else {
            setAvailableUnits([]);
        }
    };

    const handleUnitChange = (unitName: string) => {
        setData('unit_name', unitName);
        setUnitValidationError('');
    };

    const handleVendorChange = (vendorName: string) => {
        setData('vendor_name', vendorName);
        setVendorValidationError('');
    };

    const handleAssignedTasksChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setData('assigned_tasks', e.target.value);
        setAssignedTasksValidationError('');
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Clear any previous validation errors
        setValidationError('');
        setUnitValidationError('');
        setVendorValidationError('');
        setTaskSubmissionDateValidationError('');
        setAssignedTasksValidationError('');
        
        let hasValidationErrors = false;
        
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
            if (unitRef.current) {
                unitRef.current.focus();
                unitRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        // Validate vendor_name is not empty
        if (!data.vendor_name || data.vendor_name.trim() === '') {
            setVendorValidationError('Please select a vendor before submitting the form.');
            // Focus on the vendor name field
            if (vendorRef.current) {
                vendorRef.current.focus();
                vendorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        // Validate task_submission_date is not empty
        if (!data.task_submission_date || data.task_submission_date.trim() === '') {
            setTaskSubmissionDateValidationError('Please select a task submission date before submitting the form.');
            // Focus on the task submission date field
            if (taskSubmissionDateRef.current) {
                taskSubmissionDateRef.current.focus();
                taskSubmissionDateRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        // Validate assigned_tasks is not empty
        if (!data.assigned_tasks || data.assigned_tasks.trim() === '') {
            setAssignedTasksValidationError('Please enter assigned tasks before submitting the form.');
            // Focus on the assigned tasks field
            if (assignedTasksRef.current) {
                assignedTasksRef.current.focus();
                assignedTasksRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        if (hasValidationErrors) {
            return;
        }
        
        post(route('vendor-task-tracker.store'), {
            onSuccess: () => {
                reset();
                setValidationError('');
                setUnitValidationError('');
                setVendorValidationError('');
                setTaskSubmissionDateValidationError('');
                setAssignedTasksValidationError('');
                setAvailableUnits([]);
                setAvailableProperties([]);
                setAvailableVendors([]);
                onOpenChange(false);
                onSuccess?.();
            },
        });
    };

    const handleCancel = () => {
        reset();
        setValidationError('');
        setUnitValidationError('');
        setVendorValidationError('');
        setTaskSubmissionDateValidationError('');
        setAssignedTasksValidationError('');
        setAvailableUnits([]);
        setAvailableProperties([]);
        setAvailableVendors([]);
        onOpenChange(false);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
            <DrawerContent size="half" title="Create New Vendor Task">
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-auto p-6">
                        <form onSubmit={submit} className="space-y-4">
                            {/* City and Unit Information */}
                            <div className="rounded-lg border-l-4 border-l-blue-500 p-4">
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
                                            <SelectItem key={city.id} value={city.city}>
                                                {city.city}
                                            </SelectItem>
                                        )) || []}
                                    </SelectContent>
                                </Select>
                                {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                                {validationError && <p className="mt-1 text-sm text-red-600">{validationError}</p>}
                            </div>

                            {/* Property Information */}
                            <div className="rounded-lg border-l-4 border-l-indigo-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="property" className="text-base font-semibold">
                                        Property *
                                    </Label>
                                </div>
                                <Select
                                    onValueChange={handlePropertyChange}
                                    value={data.property}
                                    disabled={!data.city}
                                >
                                    <SelectTrigger>
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
                            </div>

                            <div className="rounded-lg border-l-4 border-l-green-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="unit_name" className="text-base font-semibold">
                                        Unit Name *
                                    </Label>
                                </div>
                                <Select
                                    onValueChange={handleUnitChange}
                                    value={data.unit_name}
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
                                {errors.unit_name && <p className="mt-1 text-sm text-red-600">{errors.unit_name}</p>}
                                {unitValidationError && <p className="mt-1 text-sm text-red-600">{unitValidationError}</p>}
                            </div>

                            {/* Vendor Information */}
                            <div className="rounded-lg border-l-4 border-l-purple-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="vendor_name" className="text-base font-semibold">
                                        Vendor Name *
                                    </Label>
                                </div>
                                <Select 
                                    onValueChange={handleVendorChange} 
                                    value={data.vendor_name}
                                    disabled={!data.city}
                                >
                                    <SelectTrigger ref={vendorRef}>
                                        <SelectValue placeholder="Select vendor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableVendors?.map((vendor) => (
                                            <SelectItem key={vendor} value={vendor}>
                                                {vendor}
                                            </SelectItem>
                                        )) || []}
                                    </SelectContent>
                                </Select>
                                {errors.vendor_name && <p className="mt-1 text-sm text-red-600">{errors.vendor_name}</p>}
                                {vendorValidationError && <p className="mt-1 text-sm text-red-600">{vendorValidationError}</p>}
                            </div>

                            {/* Date Fields */}
                            <div className="rounded-lg border-l-4 border-l-orange-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="task_submission_date" className="text-base font-semibold">
                                        Task Submission Date *
                                    </Label>
                                </div>
                                <Popover
                                    open={calendarStates.task_submission_date}
                                    onOpenChange={(open) => setCalendarOpen('task_submission_date', open)}
                                    modal={false}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            ref={taskSubmissionDateRef}
                                            variant="outline"
                                            className={`w-full justify-start text-left font-normal ${!data.task_submission_date && 'text-muted-foreground'}`}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {data.task_submission_date
                                                ? format(parse(data.task_submission_date, 'yyyy-MM-dd', new Date()), 'PPP')
                                                : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={data.task_submission_date ? parse(data.task_submission_date, 'yyyy-MM-dd', new Date()) : undefined}
                                            onSelect={(date) => {
                                                if (date) {
                                                    setData('task_submission_date', format(date, 'yyyy-MM-dd'));
                                                    setCalendarOpen('task_submission_date', false);
                                                    setTaskSubmissionDateValidationError('');
                                                }
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.task_submission_date && <p className="mt-1 text-sm text-red-600">{errors.task_submission_date}</p>}
                                {taskSubmissionDateValidationError && <p className="mt-1 text-sm text-red-600">{taskSubmissionDateValidationError}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-emerald-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="any_scheduled_visits" className="text-base font-semibold">
                                        Any Scheduled Visits
                                    </Label>
                                </div>
                                <Popover
                                    open={calendarStates.any_scheduled_visits}
                                    onOpenChange={(open) => setCalendarOpen('any_scheduled_visits', open)}
                                    modal={false}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`w-full justify-start text-left font-normal ${!data.any_scheduled_visits && 'text-muted-foreground'}`}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {data.any_scheduled_visits
                                                ? format(parse(data.any_scheduled_visits, 'yyyy-MM-dd', new Date()), 'PPP')
                                                : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={data.any_scheduled_visits ? parse(data.any_scheduled_visits, 'yyyy-MM-dd', new Date()) : undefined}
                                            onSelect={(date) => {
                                                if (date) {
                                                    setData('any_scheduled_visits', format(date, 'yyyy-MM-dd'));
                                                    setCalendarOpen('any_scheduled_visits', false);
                                                }
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.any_scheduled_visits && <p className="mt-1 text-sm text-red-600">{errors.any_scheduled_visits}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-teal-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="task_ending_date" className="text-base font-semibold">
                                        Task Ending Date
                                    </Label>
                                </div>
                                <Popover
                                    open={calendarStates.task_ending_date}
                                    onOpenChange={(open) => setCalendarOpen('task_ending_date', open)}
                                    modal={false}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`w-full justify-start text-left font-normal ${!data.task_ending_date && 'text-muted-foreground'}`}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {data.task_ending_date
                                                ? format(parse(data.task_ending_date, 'yyyy-MM-dd', new Date()), 'PPP')
                                                : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={data.task_ending_date ? parse(data.task_ending_date, 'yyyy-MM-dd', new Date()) : undefined}
                                            onSelect={(date) => {
                                                if (date) {
                                                    setData('task_ending_date', format(date, 'yyyy-MM-dd'));
                                                    setCalendarOpen('task_ending_date', false);
                                                }
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.task_ending_date && <p className="mt-1 text-sm text-red-600">{errors.task_ending_date}</p>}
                            </div>

                            {/* Task Information */}
                            <div className="rounded-lg border-l-4 border-l-indigo-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="assigned_tasks" className="text-base font-semibold">
                                        Assigned Tasks *
                                    </Label>
                                </div>
                                <textarea
                                    ref={assignedTasksRef}
                                    id="assigned_tasks"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={data.assigned_tasks}
                                    onChange={handleAssignedTasksChange}
                                    rows={3}
                                    placeholder="Describe the assigned tasks..."
                                />
                                {errors.assigned_tasks && <p className="mt-1 text-sm text-red-600">{errors.assigned_tasks}</p>}
                                {assignedTasksValidationError && <p className="mt-1 text-sm text-red-600">{assignedTasksValidationError}</p>}
                            </div>

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

                            {/* Status and Urgency */}
                            <div className="rounded-lg border-l-4 border-l-red-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="status" className="text-base font-semibold">
                                        Status
                                    </Label>
                                </div>
                                <RadioGroup
                                    value={data.status}
                                    onValueChange={(value) => setData('status', value)}
                                    name="status"
                                    options={[
                                        { value: 'Pending', label: 'Pending' },
                                        { value: 'In Progress', label: 'In Progress' },
                                        { value: 'Completed', label: 'Completed' },
                                        { value: 'On Hold', label: 'On Hold' }
                                    ]}
                                    className="flex-wrap"
                                />
                                {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-yellow-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="urgent" className="text-base font-semibold">
                                        Urgent
                                    </Label>
                                </div>
                                <RadioGroup
                                    value={data.urgent}
                                    onValueChange={(value) => setData('urgent', value as "Yes" | "No")}
                                    name="urgent"
                                    options={[
                                        { value: 'Yes', label: 'Yes' },
                                        { value: 'No', label: 'No' }
                                    ]}
                                />
                                {errors.urgent && <p className="mt-1 text-sm text-red-600">{errors.urgent}</p>}
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
                                {processing ? 'Creating...' : 'Create Task'}
                            </Button>
                        </div>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}