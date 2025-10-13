import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup } from '@/components/ui/radioGroup';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { format, isValid, parse } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

// Types for hierarchical data structure
interface CityData {
    id: number;
    name: string;
}

interface PropertyData {
    id: number;
    name: string;
    city_id: number;
}

interface UnitData {
    id: number;
    name: string;
    property_id: number;
}

interface Application {
    id: number;
    name: string;
    co_signer: string;
    unit_id: number;
    status: string | null;
    date: string | null;
    stage_in_progress: string | null;
    notes: string | null;
    attachment_name: string | null;
    attachment_path: string | null;
    // Display properties (added by controller)
    city?: string;
    property?: string;
    unit_name?: string;
    selected_city_id?: number;
    selected_property_id?: number;
}

type ApplicationFormData = {
    unit_id: number | null;
    name: string;
    co_signer: string;
    status: string;
    date: string;
    stage_in_progress: string;
    notes: string;
    attachment: File | null;
};

interface Props {
    application: Application;
    cities: CityData[];
    properties: Record<string, PropertyData[]>;
    units: Record<string, UnitData[]>;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function ApplicationEditDrawer({ application, cities, properties, units, open, onOpenChange, onSuccess }: Props) {
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

    const [selectedCityId, setSelectedCityId] = useState<number | null>(application.selected_city_id || null);
    const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(application.selected_property_id || null);
    const [availableProperties, setAvailableProperties] = useState<PropertyData[]>([]);
    const [availableUnits, setAvailableUnits] = useState<UnitData[]>([]);
    const [calendarOpen, setCalendarOpen] = useState(false);

    // Derive selected city and property from the record if not explicitly provided
    const deriveSelectionFromRecord = (): { cityId: number | null; propertyId: number | null } => {
        let propertyId: number | null = application.selected_property_id ?? null;
        let cityId: number | null = application.selected_city_id ?? null;

        // If propertyId missing, attempt to find it by locating the unit in the units mapping
        if ((!propertyId || isNaN(propertyId)) && application.unit_id) {
            for (const [propIdStr, unitList] of Object.entries(units || {})) {
                if (unitList?.some((u) => u.id === application.unit_id)) {
                    propertyId = parseInt(propIdStr, 10);
                    break;
                }
            }
        }

        // If cityId missing, attempt to find it by locating the property in the properties mapping
        if ((!cityId || isNaN(cityId)) && propertyId) {
            for (const [cityIdStr, propertyList] of Object.entries(properties || {})) {
                if (propertyList?.some((p) => p.id === propertyId)) {
                    cityId = parseInt(cityIdStr, 10);
                    break;
                }
            }
        }

        return { cityId: cityId ?? null, propertyId: propertyId ?? null };
    };

    // Safe date parsing function to prevent RangeError
    const parseDate = (dateString: string | null | undefined): Date | undefined => {
        if (!dateString || dateString.trim() === '') {
            return undefined;
        }

        try {
            // Try parsing as YYYY-MM-DD format first
            const parsedDate = parse(dateString, 'yyyy-MM-dd', new Date());
            if (isValid(parsedDate)) {
                return parsedDate;
            }

            // Try parsing as a regular Date
            const directDate = new Date(dateString);
            if (isValid(directDate)) {
                return directDate;
            }

            return undefined;
        } catch (error) {
            console.warn('Date parsing error:', error);
            return undefined;
        }
    };

    // Safe date formatting function
    const formatDateForInput = (dateString: string | null | undefined): string => {
        if (!dateString || dateString.trim() === '') {
            return '';
        }

        const parsedDate = parseDate(dateString);
        if (parsedDate && isValid(parsedDate)) {
            return format(parsedDate, 'yyyy-MM-dd');
        }

        return '';
    };

    const { data, setData, put, processing, errors } = useForm<ApplicationFormData>({
        unit_id: application.unit_id,
        name: application.name || '',
        co_signer: application.co_signer || '',
        status: application.status || 'New',
        date: formatDateForInput(application.date),
        stage_in_progress: application.stage_in_progress || '',
        notes: application.notes || '',
        attachment: null,
    });

    // Initialize form data when application changes
    useEffect(() => {
        if (application && open) {
            const { cityId, propertyId } = deriveSelectionFromRecord();

            setSelectedCityId(cityId);
            setSelectedPropertyId(propertyId);

            // Set available properties for the city
            if (cityId && properties[cityId]) {
                setAvailableProperties(properties[cityId]);
            } else {
                setAvailableProperties([]);
            }

            // Set available units for the property
            if (propertyId && units[propertyId]) {
                setAvailableUnits(units[propertyId]);
            } else {
                setAvailableUnits([]);
            }

            // Update form data
            setData({
                unit_id: application.unit_id,
                name: application.name || '',
                co_signer: application.co_signer || '',
                status: application.status || 'New',
                date: formatDateForInput(application.date),
                stage_in_progress: application.stage_in_progress || '',
                notes: application.notes || '',
                attachment: null,
            });
        }
    }, [application, open, properties, units]);

    // Reset form when drawer closes
    useEffect(() => {
        if (!open) {
            setValidationErrors({});
        }
    }, [open]);

    // Handle city selection
    const handleCityChange = (cityId: string) => {
        const selectedId = parseInt(cityId);
        setSelectedCityId(selectedId);
        setSelectedPropertyId(null);
        setData('unit_id', null);
        setValidationErrors((prev) => ({ ...prev, city: undefined, property: undefined, unit: undefined }));

        // Get properties for selected city
        if (properties[selectedId]) {
            setAvailableProperties(properties[selectedId]);
        } else {
            setAvailableProperties([]);
        }
        setAvailableUnits([]);
    };

    // Handle property selection
    const handlePropertyChange = (propertyId: string) => {
        const selectedId = parseInt(propertyId);
        setSelectedPropertyId(selectedId);
        setData('unit_id', null);
        setValidationErrors((prev) => ({ ...prev, property: undefined, unit: undefined }));

        // Get units for selected property
        if (units[selectedId]) {
            setAvailableUnits(units[selectedId]);
        } else {
            setAvailableUnits([]);
        }
    };

    const handleUnitChange = (unitId: string) => {
        const selectedId = parseInt(unitId);
        setData('unit_id', selectedId);
        setValidationErrors((prev) => ({ ...prev, unit: undefined }));
    };

    const handleNameChange = (name: string) => {
        setData('name', name);
        setValidationErrors((prev) => ({ ...prev, name: undefined }));
    };

    const handleCoSignerChange = (coSigner: string) => {
        setData('co_signer', coSigner);
        setValidationErrors((prev) => ({ ...prev, co_signer: undefined }));
    };

    const handleStatusChange = (status: string) => {
        setData('status', status);
        setValidationErrors((prev) => ({ ...prev, status: undefined }));
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        // Clear any previous validation errors
        setValidationErrors({});

        let hasValidationErrors = false;
        const newValidationErrors: typeof validationErrors = {};

        // Validate required fields
        if (!selectedCityId) {
            newValidationErrors.city = 'Please select a city before submitting the form.';
            if (cityRef.current) {
                cityRef.current.focus();
                cityRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }

        if (!selectedPropertyId) {
            newValidationErrors.property = 'Please select a property before submitting the form.';
            if (!hasValidationErrors && propertyRef.current) {
                propertyRef.current.focus();
                propertyRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }

        if (!data.unit_id) {
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

        put(route('applications.update', application.id), {
            onSuccess: () => {
                setValidationErrors({});
                onOpenChange(false);
                onSuccess?.();
            },
        });
    };

    const handleCancel = () => {
        setValidationErrors({});
        onOpenChange(false);
    };

    // Safe date display for calendar
    const getSelectedDate = (): Date | undefined => {
        return parseDate(data.date);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
            <DrawerContent size="half" title={`Edit Application - ${application.name}`}>
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
                                <Select onValueChange={handleCityChange} value={selectedCityId?.toString() || ''}>
                                    <SelectTrigger ref={cityRef}>
                                        <SelectValue placeholder="Select city" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {cities?.map((city) => (
                                            <SelectItem key={city.id} value={city.id.toString()}>
                                                {city.name}
                                            </SelectItem>
                                        )) || []}
                                    </SelectContent>
                                </Select>
                                {errors.unit_id && <p className="mt-1 text-sm text-red-600">{errors.unit_id}</p>}

                                {validationErrors.city && <p className="mt-1 text-sm text-red-600">{validationErrors.city}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-green-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="property" className="text-base font-semibold">
                                        Property *
                                    </Label>
                                </div>
                                <Select onValueChange={handlePropertyChange} value={selectedPropertyId?.toString() || ''} disabled={!selectedCityId}>
                                    <SelectTrigger ref={propertyRef}>
                                        <SelectValue placeholder="Select property" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableProperties?.map((property) => (
                                            <SelectItem key={property.id} value={property.id.toString()}>
                                                {property.name}
                                            </SelectItem>
                                        )) || []}
                                    </SelectContent>
                                </Select>
                                {errors.unit_id && <p className="mt-1 text-sm text-red-600">{errors.unit_id}</p>}
                                {validationErrors.property && <p className="mt-1 text-sm text-red-600">{validationErrors.property}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-purple-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="unit" className="text-base font-semibold">
                                        Unit *
                                    </Label>
                                </div>
                                <Select onValueChange={handleUnitChange} value={data.unit_id?.toString() || ''} disabled={!selectedPropertyId}>
                                    <SelectTrigger ref={unitRef}>
                                        <SelectValue placeholder="Select unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableUnits?.map((unit) => (
                                            <SelectItem key={unit.id} value={unit.id.toString()}>
                                                {unit.name}
                                            </SelectItem>
                                        )) || []}
                                    </SelectContent>
                                </Select>
                                {errors.unit_id && <p className="mt-1 text-sm text-red-600">{errors.unit_id}</p>}
                                {validationErrors.unit && <p className="mt-1 text-sm text-red-600">{validationErrors.unit}</p>}
                            </div>

                            {/* Current Selection Display */}
                            <div className="rounded-lg bg-muted/50 p-4">
                                <div className="text-sm text-muted-foreground">
                                    <p>
                                        <strong>Current Selection:</strong>
                                    </p>
                                    <p>City: {application.city || 'N/A'}</p>
                                    <p>Property: {application.property || 'N/A'}</p>
                                    <p>Unit: {application.unit_name || 'N/A'}</p>
                                </div>
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
                                        { value: 'Undecided', label: 'Undecided' },
                                        { value: 'Rejected', label: 'Rejected' },
                                        { value: 'Pending', label: 'Pending' },
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
                                <Popover open={calendarOpen} onOpenChange={setCalendarOpen} modal={false}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`w-full justify-start text-left font-normal ${!data.date && 'text-muted-foreground'}`}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {data.date && getSelectedDate() ? format(getSelectedDate()!, 'PPP') : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Calendar
                                            mode="single"
                                            selected={getSelectedDate()}
                                            onSelect={(date) => {
                                                if (date && isValid(date)) {
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
                                    className="resize-vertical min-h-[100px] w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
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

                                {/* Current attachment display */}
                                {application.attachment_name && (
                                    <div className="mb-3 rounded border bg-muted p-2">
                                        <p className="text-sm text-muted-foreground">Current attachment:</p>
                                        <p className="font-medium">{application.attachment_name}</p>
                                    </div>
                                )}

                                <Input
                                    id="attachment"
                                    type="file"
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    onChange={(e) => setData('attachment', e.target.files?.[0] || null)}
                                    className="cursor-pointer file:cursor-pointer file:border-0 file:bg-transparent file:text-sm file:font-medium"
                                />
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Accepted formats: PDF, Word documents, and images (max 10MB)
                                    {application.attachment_name && ' • Upload a new file to replace the current attachment'}
                                </p>
                                {errors.attachment && <p className="mt-1 text-sm text-red-600">{errors.attachment}</p>}
                            </div>
                        </form>
                    </div>

                    <DrawerFooter>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing} onClick={submit}>
                                {processing ? 'Updating…' : 'Update Application'}
                            </Button>
                        </div>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
