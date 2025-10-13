import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
// import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup } from '@/components/ui/radioGroup';
import { VendorTaskTracker, VendorTaskTrackerFormData } from '@/types/vendor-task-tracker';
import { useForm } from '@inertiajs/react';
import { format, parse, isValid } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';

interface CityOption {
    id: number;
    city: string;
}

interface PropertyOption {
    id: number;
    property_name: string;
    city?: string;
}

interface UnitOption {
    id: number;
    unit_name: string;
    property_name?: string;
    city?: string;
}

interface VendorOption {
    id: number;
    vendor_name: string;
    city?: string;
}

interface Props {
    task: VendorTaskTracker;
    cities: CityOption[];
    properties: PropertyOption[];
    units: UnitOption[];
    vendors: VendorOption[];
    unitsByCity: Record<string, UnitOption[]>;
    propertiesByCity: Record<string, PropertyOption[]>;
    unitsByProperty: Record<string, Record<string, UnitOption[]>>;
    vendorsByCity: Record<string, VendorOption[]>;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function VendorTaskTrackerEditDrawer({ 
    task,
    cities,
    // properties,
    units,
    vendors,
    unitsByCity, 
    propertiesByCity,
    unitsByProperty,
    vendorsByCity,
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
    const [availableUnits, setAvailableUnits] = useState<UnitOption[]>([]);
    const [availableProperties, setAvailableProperties] = useState<PropertyOption[]>([]);
    const [availableVendors, setAvailableVendors] = useState<VendorOption[]>([]);
    
    // Helper state to track selected names for UI display
    const [selectedCity, setSelectedCity] = useState<string>(task.city || '');
    const [selectedProperty, setSelectedProperty] = useState<string>(task.property_name || '');
    const [, setSelectedUnit] = useState<string>(task.unit_name || '');
    const [, setSelectedVendor] = useState<string>(task.vendor_name || '');

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

    // Helper function to find vendor ID from vendor name
    const findVendorIdByName = (vendorName: string): string => {
        const vendor = vendors.find(v => v.vendor_name === vendorName);
        return vendor ? vendor.id.toString() : '';
    };

    // Helper function to find unit ID from unit name
    const findUnitIdByName = (unitName: string): string => {
        const unit = units.find(u => u.unit_name === unitName);
        return unit ? unit.id.toString() : '';
    };

    const { data, setData, put, processing, errors } = useForm<VendorTaskTrackerFormData>({
        vendor_id: findVendorIdByName(task.vendor_name || ''),
        unit_id: findUnitIdByName(task.unit_name || ''),
        task_submission_date: task.task_submission_date ?? '',
        assigned_tasks: task.assigned_tasks ?? '',
        any_scheduled_visits: task.any_scheduled_visits ?? '',
        notes: task.notes ?? '',
        task_ending_date: task.task_ending_date ?? '',
        status: task.status ?? '',
        urgent: task.urgent ?? 'No',
    });

    // Initialize available options when component mounts or task changes
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

    const handleCityChange = (cityName: string) => {
        setSelectedCity(cityName);
        setSelectedProperty('');
        setSelectedUnit('');
        setSelectedVendor('');
        setData('unit_id', '');
        setData('vendor_id', '');
        setValidationError('');
        setUnitValidationError('');
        setVendorValidationError('');

        if (cityName) {
            // Set available properties for the selected city
            if (propertiesByCity[cityName]) {
                setAvailableProperties(propertiesByCity[cityName]);
            } else {
                setAvailableProperties([]);
            }

            // Set available vendors for the selected city
            if (vendorsByCity[cityName]) {
                setAvailableVendors(vendorsByCity[cityName]);
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

    const handlePropertyChange = (propertyName: string) => {
        setSelectedProperty(propertyName);
        setSelectedUnit('');
        setData('unit_id', '');
        setUnitValidationError('');

        if (selectedCity && propertyName && unitsByProperty[selectedCity] && unitsByProperty[selectedCity][propertyName]) {
            setAvailableUnits(unitsByProperty[selectedCity][propertyName]);
        } else {
            setAvailableUnits([]);
        }
    };

    const handleUnitChange = (unitId: string) => {
        const selectedUnitOption = availableUnits.find(unit => unit.id.toString() === unitId);
        if (selectedUnitOption) {
            setSelectedUnit(selectedUnitOption.unit_name);
            setData('unit_id', unitId);
            setUnitValidationError('');
        }
    };

    const handleVendorChange = (vendorId: string) => {
        const selectedVendorOption = availableVendors.find(vendor => vendor.id.toString() === vendorId);
        if (selectedVendorOption) {
            setSelectedVendor(selectedVendorOption.vendor_name);
            setData('vendor_id', vendorId);
            setVendorValidationError('');
        }
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
        if (!selectedCity || selectedCity.trim() === '') {
            setValidationError('Please select a city before submitting the form.');
            if (cityRef.current) {
                cityRef.current.focus();
                cityRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        // Validate unit_id is not empty
        if (!data.unit_id || data.unit_id.trim() === '') {
            setUnitValidationError('Please select a unit before submitting the form.');
            if (unitRef.current) {
                unitRef.current.focus();
                unitRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        // Validate vendor_id is not empty
        if (!data.vendor_id || data.vendor_id.trim() === '') {
            setVendorValidationError('Please select a vendor before submitting the form.');
            if (vendorRef.current) {
                vendorRef.current.focus();
                vendorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        // Validate task_submission_date is not empty
        if (!data.task_submission_date || data.task_submission_date.trim() === '') {
            setTaskSubmissionDateValidationError('Please select a task submission date before submitting the form.');
            if (taskSubmissionDateRef.current) {
                taskSubmissionDateRef.current.focus();
                taskSubmissionDateRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        // Validate assigned_tasks is not empty
        if (!data.assigned_tasks || data.assigned_tasks.trim() === '') {
            setAssignedTasksValidationError('Please enter assigned tasks before submitting the form.');
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
            vendor_id: findVendorIdByName(task.vendor_name || ''),
            unit_id: findUnitIdByName(task.unit_name || ''),
            task_submission_date: task.task_submission_date ?? '',
            assigned_tasks: task.assigned_tasks ?? '',
            any_scheduled_visits: task.any_scheduled_visits ?? '',
            notes: task.notes ?? '',
            task_ending_date: task.task_ending_date ?? '',
            status: task.status ?? '',
            urgent: task.urgent ?? 'No',
        });
        
        // Reset display state
        setSelectedCity(task.city || '');
        setSelectedProperty(task.property_name || '');
        setSelectedUnit(task.unit_name || '');
        setSelectedVendor(task.vendor_name || '');
        
        setValidationError('');
        setUnitValidationError('');
        setVendorValidationError('');
        setTaskSubmissionDateValidationError('');
        setAssignedTasksValidationError('');
        
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
                                <Select onValueChange={handleCityChange} value={selectedCity}>
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
                                {errors.vendor_id && <p className="mt-1 text-sm text-red-600">{errors.vendor_id}</p>}
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
                                    value={selectedProperty}
                                    disabled={!selectedCity}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select property" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableProperties?.map((property) => (
                                            <SelectItem key={property.id} value={property.property_name}>
                                                {property.property_name}
                                            </SelectItem>
                                        )) || []}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="rounded-lg border-l-4 border-l-green-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="unit_name" className="text-base font-semibold">
                                        Unit Name *
                                    </Label>
                                </div>
                                <Select
                                    onValueChange={handleUnitChange}
                                    value={data.unit_id}
                                    disabled={!selectedProperty}
                                >
                                    <SelectTrigger ref={unitRef}>
                                        <SelectValue placeholder="Select unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableUnits?.map((unit) => (
                                            <SelectItem key={unit.id} value={unit.id.toString()}>
                                                {unit.unit_name}
                                            </SelectItem>
                                        )) || []}
                                    </SelectContent>
                                </Select>
                                {errors.unit_id && <p className="mt-1 text-sm text-red-600">{errors.unit_id}</p>}
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
                                    value={data.vendor_id}
                                    disabled={!selectedCity}
                                >
                                    <SelectTrigger ref={vendorRef}>
                                        <SelectValue placeholder="Select vendor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableVendors?.map((vendor) => (
                                            <SelectItem key={vendor.id} value={vendor.id.toString()}>
                                                {vendor.vendor_name}
                                            </SelectItem>
                                        )) || []}
                                    </SelectContent>
                                </Select>
                                {errors.vendor_id && <p className="mt-1 text-sm text-red-600">{errors.vendor_id}</p>}
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
