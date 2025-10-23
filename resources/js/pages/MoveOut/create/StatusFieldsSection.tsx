import FormField from './FormField';
import TextInputField from './TextInputField';
import RadioGroupField from './RadioGroupField';
import { MoveOutFormData } from '@/types/move-out';

interface Props {
    data: MoveOutFormData;
    errors: Partial<Record<keyof MoveOutFormData, string>>;
    onDataChange: (field: keyof MoveOutFormData, value: any) => void;
}

export default function StatusFieldsSection({
    data,
    errors,
    onDataChange,
}: Props) {
    return (
        <>
            <FormField
                label="Cleaning"
                borderColor="violet"
                error={errors.cleaning}
            >
                <RadioGroupField
                    value={data.cleaning}
                    onValueChange={(value) => onDataChange('cleaning', value as "" | "cleaned" | "uncleaned")}
                    name="cleaning"
                    options={[
                        { value: 'cleaned', label: 'Cleaned' },
                        { value: 'uncleaned', label: 'Uncleaned' }
                    ]}
                />
            </FormField>

            <FormField
                label="List the Unit"
                borderColor="rose"
                error={errors.list_the_unit}
            >
                <TextInputField
                    id="list_the_unit"
                    value={data.list_the_unit}
                    onChange={(e) => onDataChange('list_the_unit', e.target.value)}
                    placeholder="Enter unit listing details"
                />
            </FormField>

            <FormField
                label="Move Out Form"
                borderColor="fuchsia"
                error={errors.move_out_form}
            >
                <RadioGroupField
                    value={data.move_out_form}
                    onValueChange={(value) => onDataChange('move_out_form', value as "" | "filled" | "not filled")}
                    name="move_out_form"
                    options={[
                        { value: 'filled', label: 'Filled' },
                        { value: 'not filled', label: 'Not Filled' }
                    ]}
                />
            </FormField>
        </>
    );
}
