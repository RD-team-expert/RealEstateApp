import FormSection from './FormSection';
import DatePickerField from './DatePickerField';
import { MoveOutFormData } from '@/types/move-out';

// Define the calendar states type explicitly
type CalendarStatesType = {
    move_out_date: boolean;
    date_lease_ending_on_buildium: boolean;
    date_utility_put_under_our_name: boolean;
};

interface MoveOutDateFieldsProps {
    data: MoveOutFormData;
    errors: Partial<Record<keyof MoveOutFormData, string>>;
    calendarStates: CalendarStatesType;
    onCalendarToggle: (field: keyof CalendarStatesType) => void;
    onDateChange: (field: keyof MoveOutFormData, value: string) => void;
}

export default function MoveOutDateFields({
    data,
    errors,
    calendarStates,
    onCalendarToggle,
    onDateChange
}: MoveOutDateFieldsProps) {
    return (
        <>
            {/* Move Out Date */}
            <FormSection
                borderColor="border-l-red-500"
                label="Move Out Date"
                htmlFor="move_out_date"
                error={errors.move_out_date}
            >
                <DatePickerField
                    value={data.move_out_date}
                    onChange={(date) => onDateChange('move_out_date', date)}
                    open={calendarStates.move_out_date}
                    onOpenChange={() => onCalendarToggle('move_out_date')}
                />
            </FormSection>

            {/* Date Lease Ending on Buildium */}
            <FormSection
                borderColor="border-l-teal-500"
                label="Date Lease Ending on Buildium"
                htmlFor="date_lease_ending_on_buildium"
                error={errors.date_lease_ending_on_buildium}
            >
                <DatePickerField
                    value={data.date_lease_ending_on_buildium}
                    onChange={(date) => onDateChange('date_lease_ending_on_buildium', date)}
                    open={calendarStates.date_lease_ending_on_buildium}
                    onOpenChange={() => onCalendarToggle('date_lease_ending_on_buildium')}
                />
            </FormSection>

            {/* Date Utility Put Under Our Name */}
            <FormSection
                borderColor="border-l-pink-500"
                label="Date Utility Put Under Our Name"
                htmlFor="date_utility_put_under_our_name"
                error={errors.date_utility_put_under_our_name}
            >
                <DatePickerField
                    value={data.date_utility_put_under_our_name}
                    onChange={(date) => onDateChange('date_utility_put_under_our_name', date)}
                    open={calendarStates.date_utility_put_under_our_name}
                    onOpenChange={() => onCalendarToggle('date_utility_put_under_our_name')}
                />
            </FormSection>
        </>
    );
}
