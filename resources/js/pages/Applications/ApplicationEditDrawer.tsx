import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { CityPropertyUnitSelector } from './edit/CityPropertyUnitSelector';
import { ApplicantInformationFields } from './edit/ApplicantInformationFields';
import { StatusAndDateFields } from './edit/StatusAndDateFields';
import { StageAndNotesFields } from './edit/StageAndNotesFields';
import { AttachmentField } from './edit/AttachmentField';
import { CurrentSelectionDisplay } from './edit/CurrentSelectionDisplay';

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

    // Safe date formatting function
    const formatDateForInput = (dateString: string | null | undefined): string => {
        if (!dateString || dateString.trim() === '') {
            return '';
        }

        try {
            const parsedDate = new Date(dateString);
            if (parsedDate && !isNaN(parsedDate.getTime())) {
                return format(parsedDate, 'yyyy-MM-dd');
            }
            return '';
        } catch (error) {
            console.warn('Date parsing error:', error);
            return '';
        }
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

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        // Clear any previous validation errors
        setValidationErrors({});

        let hasValidationErrors = false;
        const newValidationErrors: typeof validationErrors = {};

        // Validate required fields
        if (!selectedCityId) {
            newValidationErrors.city = 'Please select a city before submitting the form.';
            hasValidationErrors = true;
        }

        if (!selectedPropertyId) {
            newValidationErrors.property = 'Please select a property before submitting the form.';
            hasValidationErrors = true;
        }

        if (!data.unit_id) {
            newValidationErrors.unit = 'Please select a unit before submitting the form.';
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

    return (
        <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
            <DrawerContent size="half" title={`Edit Application - ${application.name}`}>
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-auto p-6">
                        <form onSubmit={submit} className="space-y-4">
                            <CityPropertyUnitSelector
                                cities={cities}
                                selectedCityId={selectedCityId}
                                selectedPropertyId={selectedPropertyId}
                                selectedUnitId={data.unit_id}
                                availableProperties={availableProperties}
                                availableUnits={availableUnits}
                                onCityChange={handleCityChange}
                                onPropertyChange={handlePropertyChange}
                                onUnitChange={handleUnitChange}
                                errors={errors}
                                validationErrors={validationErrors}
                            />

                            <CurrentSelectionDisplay
                                city={application.city}
                                property={application.property}
                                unitName={application.unit_name}
                            />

                            <ApplicantInformationFields
                                name={data.name}
                                coSigner={data.co_signer}
                                onNameChange={(name) => {
                                    setData('name', name);
                                    setValidationErrors((prev) => ({ ...prev, name: undefined }));
                                }}
                                onCoSignerChange={(coSigner) => {
                                    setData('co_signer', coSigner);
                                    setValidationErrors((prev) => ({ ...prev, co_signer: undefined }));
                                }}
                                errors={errors}
                                validationErrors={validationErrors}
                            />

                            <StatusAndDateFields
                                status={data.status}
                                date={data.date}
                                onStatusChange={(status) => {
                                    setData('status', status);
                                    setValidationErrors((prev) => ({ ...prev, status: undefined }));
                                }}
                                onDateChange={(date) => setData('date', date)}
                                errors={errors}
                                validationErrors={validationErrors}
                            />

                            <StageAndNotesFields
                                stageInProgress={data.stage_in_progress}
                                notes={data.notes}
                                onStageChange={(stage) => setData('stage_in_progress', stage)}
                                onNotesChange={(notes) => setData('notes', notes)}
                                errors={errors}
                            />

                            <AttachmentField
                                currentAttachmentName={application.attachment_name}
                                onAttachmentChange={(file) => setData('attachment', file)}
                                error={errors.attachment}
                            />
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
