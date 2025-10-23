import FormField from './FormField';
import DatePickerField from './DatePickerField';
import { MoveOutFormData } from '@/types/move-out';
import { format } from 'date-fns';

interface Props {
    data: MoveOutFormData;
    errors: Partial<Record<keyof MoveOutFormData, string>>;
    calendarStates: {
        move_out_date: boolean;
        date_lease_ending_on_buildium: boolean;
        date_utility_put_under_our_name: boolean;
    };
    onCalendarToggle: (field: keyof Props['calendarStates']) => void;
    onDataChange: (field: keyof MoveOutFormData, value: any) => void;
}

export default function DateFieldsSection({
    data,
    errors,
    calendarStates,
    onCalendarToggle,
    onDataChange,
}: Props) {
    return (
        <>
            <FormField
                label="Move Out Date"
                borderColor="red"
                error={errors.move_out_date}
            >
                <DatePickerField
                    value={data.move_out_date}
                    isOpen={calendarStates.move_out_date}
                    onOpenChange={() => onCalendarToggle('move_out_date')}
                    onDateSelect={(date) => {
                        if (date) {
                            onDataChange('move_out_date', format(date, 'yyyy-MM-dd'));
                            onCalendarToggle('move_out_date');
                        }
                    }}
                />
            </FormField>

            <FormField
                label="Date Lease Ending on Buildium"
                borderColor="teal"
                error={errors.date_lease_ending_on_buildium}
            >
                <DatePickerField
                    value={data.date_lease_ending_on_buildium}
                    isOpen={calendarStates.date_lease_ending_on_buildium}
                    onOpenChange={() => onCalendarToggle('date_lease_ending_on_buildium')}
                    onDateSelect={(date) => {
                        if (date) {
                            onDataChange('date_lease_ending_on_buildium', format(date, 'yyyy-MM-dd'));
                            onCalendarToggle('date_lease_ending_on_buildium');
                        }
                    }}
                />
            </FormField>

            <FormField
                label="Date Utility Put Under Our Name"
                borderColor="pink"
                error={errors.date_utility_put_under_our_name}
            >
                <DatePickerField
                    value={data.date_utility_put_under_our_name}
                    isOpen={calendarStates.date_utility_put_under_our_name}
                    onOpenChange={() => onCalendarToggle('date_utility_put_under_our_name')}
                    onDateSelect={(date) => {
                        if (date) {
                            onDataChange('date_utility_put_under_our_name', format(date, 'yyyy-MM-dd'));
                            onCalendarToggle('date_utility_put_under_our_name');
                        }
                    }}
                />
            </FormField>
        </>
    );
}
