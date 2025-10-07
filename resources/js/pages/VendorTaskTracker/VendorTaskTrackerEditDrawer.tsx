import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup } from '@/components/ui/radioGroup';
import { VendorTaskTracker, VendorTaskTrackerFormData, UnitData } from '@/types/vendor-task-tracker';
import { useForm } from '@inertiajs/react';
import { format, parse, isValid } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';

interface Props {
    task: VendorTaskTracker;
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

export default function VendorTaskTrackerEditDrawer({ 
    task,
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
    
    // Helper function to safely parse dates
    const safeParseDateString = (dateString: string | null | undefined): Date | undefined => {
        if (!dateString || dateString.trim() === '') {
            return undefined;
        }

        try {
            // Grab YYYY-MM-DD from the front (works for "2025-10-01" and "2025-10-01T00:00:00Z")
            const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateString);
            if (m) {
                const [, y, mo, d] = m;
                // Construct a local calendar date (no timezone shifting)
                const date = new Date(Number(y), Number(mo) - 1, Number(d));
                if (isValid(date)) {
                    return date;
                }
            }
            
            // Fallback: Try parsing as YYYY-MM-DD format with date-fns
            const parsedDate = parse(dateString, 'yyyy-MM-dd', new Date(2000, 0, 1));
            if (isValid(parsedDate)) {
                return parsedDate;
            }
            
            return undefined;
        } catch (error) {
            console.warn('Failed to parse date:', dateString, error);
            return undefined;
        }
    };

    // Helper function to safely format dates for display
    const safeFormatDate = (dateString: string | null | undefined): string => {
        const parsedDate = safeParseDateString(dateString);
        if (!parsedDate) {
            return 'Pick a date';
        }

        try {
            return format(parsedDate, 'PPP');
        } catch (error) {
            console.warn('Failed to format date:', dateString, error);
            return 'Pick a date';
        }
    };
    
    const [calendarStates, setCalendarStates] = useState({
        task_submission_date: false,
        any_scheduled_visits: false,
        task_ending_date: false,
    });

    const setCalendarOpen = (field: keyof typeof calendarStates, open: boolean) => {
        setCalendarStates((prev) => ({ ...prev, [field]: open }));
    };

    const { data, setData, put, processing, errors, reset } = useForm<VendorTaskTrackerFormData>({
        city: task.city ?? '',
        property_name: task.property_name ?? '',
        task_submission_date: task.task_submission_date ?? '',
        vendor_name: task.vendor_name ?? '',
        unit_name: task.unit_name ?? '',
        assigned_tasks: task.assigned_tasks ?? '',
        any_scheduled_visits: task.any_scheduled_visits ?? '',
        notes: task.notes ?? '',
        task_ending_date: task.task_ending_date ?? '',
        status: task.status ?? '',
        urgent: task.urgent ?? 'No',
    });

    // Initialize available units when component mounts or task changes
    useEffect(() => {
        if (task.city) {
            // Set available properties for the selected city
            if (propertiesByCity[task.city]) {
                setAvailableProperties(propertiesByCity[task.city]);
            } else {
                setAvailableProperties([]);
            }

            // Set available vendors for the selected city
            if (vendorsByCity[task.city]) {
                setAvailableVendors(vendorsByCity[task.city]);
            } else {
                setAvailableVendors([]);
            }

            // Set available units based on city and property_name
            if (task.property_name && unitsByProperty[task.city] && unitsByProperty[task.city][task.property_name]) {
                setAvailableUnits(unitsByProperty[task.city][task.property_name]);
            } else if (unitsByCity[task.city]) {
                // Fallback to old behavior if property_name is not set
                setAvailableUnits(unitsByCity[task.city]);
            } else {
                setAvailableUnits([]);
            }
        } else {
            setAvailableProperties([]);
            setAvailableVendors([]);
            setAvailableUnits([]);
        }
    }, [task.city, task.property_name, unitsByCity, propertiesByCity, unitsByProperty, vendorsByCity]);

    const handleCityChange = (city: string) => {
        setData('city', city);
        setData('property_name', '');
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
        setData('property_name', property);
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
        
        put(route('vendor-task-tracker.update', task.id), {
            onSuccess: () => {
                setValidationError('');
                setUnitValidationError('');
                setVendorValidationError('');
                setTaskSubmissionDateValidationError('');
                setAssignedTasksValidationError('');
                onOpenChange(false);
                onSuccess?.();
            },
        });
    };

    const handleCancel = () => {
        // Reset form to original task data
        setData({
            city: task.city ?? '',
            property_name: task.property_name ?? '',
            task_submission_date: task.task_submission_date ?? '',
            vendor_name: task.vendor_name ?? '',
            unit_name: task.unit_name ?? '',
            assigned_tasks: task.assigned_tasks ?? '',
            any_scheduled_visits: task.any_scheduled_visits ?? '',
            notes: task.notes ?? '',
            task_ending_date: task.task_ending_date ?? '',
            status: task.status ?? '',
            urgent: task.urgent ?? 'No',
        });
        setValidationError('');
        setUnitValidationError('');
        setVendorValidationError('');
        setTaskSubmissionDateValidationError('');
        setAssignedTasksValidationError('');
        if (task.city && unitsByCity[task.city]) {
            setAvailableUnits(unitsByCity[task.city]);
        } else {
            setAvailableUnits([]);
        }
        onOpenChange(false);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
            <DrawerContent size="half" title={`Edit Vendor Task #${task.id}`}>
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
                                <Select onValueChange={handleCityChange} value={data.city || undefined}>
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
                                    value={data.property_name || undefined}
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
                                {errors.property_name && <p className="mt-1 text-sm text-red-600">{errors.property_name}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-green-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="unit_name" className="text-base font-semibold">
                                        Unit Name *
                                    </Label>
                                </div>
                                <Select
                                    onValueChange={handleUnitChange}
                                    value={data.unit_name || undefined}
                                    disabled={!data.property_name}
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
                                    value={data.vendor_name || undefined}
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
                                            {safeFormatDate(data.task_submission_date)}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={safeParseDateString(data.task_submission_date)}
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
                                            {safeFormatDate(data.any_scheduled_visits)}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={safeParseDateString(data.any_scheduled_visits)}
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
                                            {safeFormatDate(data.task_ending_date)}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={safeParseDateString(data.task_ending_date)}
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

                            {/* Task Details */}
                            <div className="rounded-lg border-l-4 border-l-indigo-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="assigned_tasks" className="text-base font-semibold">
                                        Assigned Tasks *
                                    </Label>
                                </div>
                                <textarea
                                    ref={assignedTasksRef}
                                    id="assigned_tasks"
                                    value={data.assigned_tasks}
                                    onChange={handleAssignedTasksChange}
                                    rows={3}
                                    placeholder="Describe the assigned tasks..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                    {/* Action Buttons */}
                    <DrawerFooter>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
                                Cancel
                            </Button>
                            <Button type="submit" onClick={submit} disabled={processing} className="flex-1">
                                {processing ? 'Updating…' : 'Update Task'}
                            </Button>
                        </div>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}