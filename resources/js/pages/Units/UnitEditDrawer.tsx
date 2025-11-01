import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { Unit } from '@/types/unit';
import { PropertyInfoWithoutInsurance } from '@/types/PropertyInfoWithoutInsurance';
import { useForm } from '@inertiajs/react';
import { format, parse, isValid } from 'date-fns';
import React, { useState, useRef, useEffect } from 'react';
import CityPropertySelector from './edit/CityPropertySelector';
import UnitDetailsFields from './edit/UnitDetailsFields';
import LeaseInformationFields from './edit/LeaseInformationFields';
import FinancialFields from './edit/FinancialFields';
import UtilitiesFields from './edit/UtilitiesFields';
import InsuranceFields from './edit/InsuranceFields';
import CalculatedValuesDisplay from './edit/CalculatedValuesDisplay';

interface Props {
    unit: Unit;
    cities: Array<{ id: number; city: string }>;
    properties: PropertyInfoWithoutInsurance[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

// Safe date parsing function
const parseDate = (dateString: string | null | undefined): Date | undefined => {
    if (!dateString || dateString.trim() === '') {
        return undefined;
    }
    
    try {
        const parsedDate = parse(dateString, 'yyyy-MM-dd', new Date());
        if (isValid(parsedDate)) {
            return parsedDate;
        }
        
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

export default function UnitEditDrawer({ unit, cities, properties, open, onOpenChange, onSuccess }: Props) {
    const propertyRef = useRef<HTMLButtonElement>(null!);
    const unitNameRef = useRef<HTMLInputElement>(null!);
    const [validationError, setValidationError] = useState<string>('');
    const [propertyValidationError, setPropertyValidationError] = useState<string>('');
    const [unitNameValidationError, setUnitNameValidationError] = useState<string>('');
    const [availableProperties, setAvailableProperties] = useState<PropertyInfoWithoutInsurance[]>([]);
    const [selectedCityId, setSelectedCityId] = useState<string>('');
    
    const [calendarStates, setCalendarStates] = useState({
        lease_start: false,
        lease_end: false,
        insurance_expiration_date: false,
    });

    const setCalendarOpen = (field: keyof typeof calendarStates, open: boolean) => {
        setCalendarStates((prev) => ({ ...prev, [field]: open }));
    };

    const { data, setData, put, processing, errors } = useForm({
        property_id: unit.property_id?.toString() || '',
        unit_name: unit.unit_name || '',
        tenants: unit.tenants || '',
        lease_start: formatDateForInput(unit.lease_start),
        lease_end: formatDateForInput(unit.lease_end),
        count_beds: unit.count_beds?.toString() || '',
        count_baths: unit.count_baths?.toString() || '',
        lease_status: unit.lease_status || '',
        monthly_rent: unit.monthly_rent?.toString() || '',
        recurring_transaction: unit.recurring_transaction || '',
        utility_status: unit.utility_status || '',
        account_number: unit.account_number || '',
        insurance: unit.insurance || '',
        insurance_expiration_date: formatDateForInput(unit.insurance_expiration_date),
    });

    // Initialize selected city ID based on unit's property
    useEffect(() => {
        if (open && unit.property_id && properties) {
            const unitProperty = properties.find(p => p.id === unit.property_id);
            if (unitProperty && unitProperty.city_id) {
                setSelectedCityId(unitProperty.city_id.toString());
            }
        }
    }, [open, unit.property_id, properties]);

    // Filter properties when city is selected
    useEffect(() => {
        if (selectedCityId && properties) {
            const filteredProperties = properties.filter(
                property => property.city_id?.toString() === selectedCityId
            );
            setAvailableProperties(filteredProperties);
            
            if (data.property_id && !filteredProperties.find(p => p.id.toString() === data.property_id)) {
                setData('property_id', '');
            }
        } else {
            setAvailableProperties([]);
        }
    }, [selectedCityId, properties]);

    // Reset form data when unit changes
    useEffect(() => {
        if (unit) {
            setData({
                property_id: unit.property_id?.toString() || '',
                unit_name: unit.unit_name || '',
                tenants: unit.tenants || '',
                lease_start: formatDateForInput(unit.lease_start),
                lease_end: formatDateForInput(unit.lease_end),
                count_beds: unit.count_beds?.toString() || '',
                count_baths: unit.count_baths?.toString() || '',
                lease_status: unit.lease_status || '',
                monthly_rent: unit.monthly_rent?.toString() || '',
                recurring_transaction: unit.recurring_transaction || '',
                utility_status: unit.utility_status || '',
                account_number: unit.account_number || '',
                insurance: unit.insurance || '',
                insurance_expiration_date: formatDateForInput(unit.insurance_expiration_date),
            });
        }
    }, [unit]);

    const handleCityChange = (cityId: string) => {
        setSelectedCityId(cityId);
        setValidationError('');
        setPropertyValidationError('');
    };

    const handlePropertyChange = (propertyId: string) => {
        setData('property_id', propertyId);
        setPropertyValidationError('');
    };

    const handleUnitNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('unit_name', e.target.value);
        setUnitNameValidationError('');
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        setValidationError('');
        setPropertyValidationError('');
        setUnitNameValidationError('');
        
        let hasValidationErrors = false;
        
        if (!data.property_id || data.property_id.trim() === '') {
            setPropertyValidationError('Please select a property before submitting the form.');
            if (propertyRef.current) {
                propertyRef.current.focus();
                propertyRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        if (!data.unit_name || data.unit_name.trim() === '') {
            setUnitNameValidationError('Please enter a unit name before submitting the form.');
            if (unitNameRef.current) {
                unitNameRef.current.focus();
                unitNameRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        if (hasValidationErrors) {
            return;
        }
        
        put(route('units.update', unit.id), {
            onSuccess: () => {
                setValidationError('');
                setPropertyValidationError('');
                setUnitNameValidationError('');
                setCalendarStates({
                    lease_start: false,
                    lease_end: false,
                    insurance_expiration_date: false,
                });
                onOpenChange(false);
                onSuccess?.();
            },
        });
    };

    const handleCancel = () => {
        setData({
            property_id: unit.property_id?.toString() || '',
            unit_name: unit.unit_name || '',
            tenants: unit.tenants || '',
            lease_start: formatDateForInput(unit.lease_start),
            lease_end: formatDateForInput(unit.lease_end),
            count_beds: unit.count_beds?.toString() || '',
            count_baths: unit.count_baths?.toString() || '',
            lease_status: unit.lease_status || '',
            monthly_rent: unit.monthly_rent?.toString() || '',
            recurring_transaction: unit.recurring_transaction || '',
            utility_status: unit.utility_status || '',
            account_number: unit.account_number || '',
            insurance: unit.insurance || '',
            insurance_expiration_date: formatDateForInput(unit.insurance_expiration_date),
        });
        setValidationError('');
        setPropertyValidationError('');
        setUnitNameValidationError('');
        setCalendarStates({
            lease_start: false,
            lease_end: false,
            insurance_expiration_date: false,
        });
        onOpenChange(false);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
            <DrawerContent size="half" title={`Edit Unit - ${unit.unit_name}`}>
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-auto p-6">
                        <form onSubmit={submit} className="space-y-4">
                            {/* Note about calculated fields */}
                            <div className="mb-6 p-4 bg-secondary border border-border rounded-lg">
                                <p className="text-sm text-secondary-foreground">
                                    <strong>Note:</strong> Vacant, Listed, and Total Applications are automatically calculated based on your inputs.
                                </p>
                            </div>

                            <CityPropertySelector
                                cities={cities}
                                selectedCityId={selectedCityId}
                                onCityChange={handleCityChange}
                                availableProperties={availableProperties}
                                propertyId={data.property_id}
                                onPropertyChange={handlePropertyChange}
                                propertyRef={propertyRef}
                                validationError={validationError}
                                propertyValidationError={propertyValidationError}
                                propertyError={errors.property_id}
                            />

                            <UnitDetailsFields
                                unitName={data.unit_name}
                                onUnitNameChange={handleUnitNameChange}
                                unitNameRef={unitNameRef}
                                unitNameError={errors.unit_name}
                                unitNameValidationError={unitNameValidationError}
                                tenants={data.tenants}
                                onTenantsChange={(value) => setData('tenants', value)}
                                tenantsError={errors.tenants}
                            />

                            <LeaseInformationFields
                                leaseStart={data.lease_start}
                                onLeaseStartChange={(value) => setData('lease_start', value)}
                                leaseStartOpen={calendarStates.lease_start}
                                onLeaseStartOpenChange={(open) => setCalendarOpen('lease_start', open)}
                                leaseStartError={errors.lease_start}
                                leaseEnd={data.lease_end}
                                onLeaseEndChange={(value) => setData('lease_end', value)}
                                leaseEndOpen={calendarStates.lease_end}
                                onLeaseEndOpenChange={(open) => setCalendarOpen('lease_end', open)}
                                leaseEndError={errors.lease_end}
                                countBeds={data.count_beds}
                                onCountBedsChange={(value) => setData('count_beds', value)}
                                countBedsError={errors.count_beds}
                                countBaths={data.count_baths}
                                onCountBathsChange={(value) => setData('count_baths', value)}
                                countBathsError={errors.count_baths}
                                leaseStatus={data.lease_status}
                                onLeaseStatusChange={(value) => setData('lease_status', value)}
                                leaseStatusError={errors.lease_status}
                            />

                            <FinancialFields
                                monthlyRent={data.monthly_rent}
                                onMonthlyRentChange={(value) => setData('monthly_rent', value)}
                                monthlyRentError={errors.monthly_rent}
                                recurringTransaction={data.recurring_transaction}
                                onRecurringTransactionChange={(value) => setData('recurring_transaction', value)}
                                recurringTransactionError={errors.recurring_transaction}
                            />

                            <UtilitiesFields
                                utilityStatus={data.utility_status}
                                onUtilityStatusChange={(value) => setData('utility_status', value)}
                                utilityStatusError={errors.utility_status}
                                accountNumber={data.account_number}
                                onAccountNumberChange={(value) => setData('account_number', value)}
                                accountNumberError={errors.account_number}
                            />

                            <InsuranceFields
                                insurance={data.insurance}
                                onInsuranceChange={(value) => setData('insurance', value)}
                                insuranceError={errors.insurance}
                                insuranceExpirationDate={data.insurance_expiration_date}
                                onInsuranceExpirationDateChange={(value) => setData('insurance_expiration_date', value)}
                                insuranceExpirationOpen={calendarStates.insurance_expiration_date}
                                onInsuranceExpirationOpenChange={(open) => setCalendarOpen('insurance_expiration_date', open)}
                                insuranceExpirationDateError={errors.insurance_expiration_date}
                            />

                            <CalculatedValuesDisplay unit={unit} />
                        </form>
                    </div>

                    <DrawerFooter className="border-t bg-background">
                        <div className="flex gap-2">
                            <Button
                                type="submit"
                                onClick={submit}
                                disabled={processing}
                                className="flex-1"
                            >
                                {processing ? 'Updating...' : 'Update Unit'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                disabled={processing}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                        </div>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
