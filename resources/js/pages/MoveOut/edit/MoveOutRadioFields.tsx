import { RadioGroup } from '@/components/ui/radioGroup';
import FormSection from './FormSection';
import { MoveOutFormData } from '@/types/move-out';

interface MoveOutRadioFieldsProps {
    data: MoveOutFormData;
    errors: Partial<Record<keyof MoveOutFormData, string>>;
    onFieldChange: (field: keyof MoveOutFormData, value: string) => void;
}

export default function MoveOutRadioFields({
    data,
    errors,
    onFieldChange
}: MoveOutRadioFieldsProps) {
    return (
        <>
            {/* Utilities Under Our Name */}
            <FormSection
                borderColor="border-l-indigo-500"
                label="Utilities Under Our Name"
                htmlFor="utilities_under_our_name"
                error={errors.utilities_under_our_name}
            >
                <RadioGroup
                    value={data.utilities_under_our_name}
                    onValueChange={(value) => onFieldChange('utilities_under_our_name', value)}
                    name="utilities_under_our_name"
                    options={[
                        { value: 'Yes', label: 'Yes' },
                        { value: 'No', label: 'No' }
                    ]}
                />
            </FormSection>

            {/* Cleaning */}
            <FormSection
                borderColor="border-l-violet-500"
                label="Cleaning"
                htmlFor="cleaning"
                error={errors.cleaning}
            >
                <RadioGroup
                    value={data.cleaning}
                    onValueChange={(value) => onFieldChange('cleaning', value)}
                    name="cleaning"
                    options={[
                        { value: 'cleaned', label: 'Cleaned' },
                        { value: 'uncleaned', label: 'Uncleaned' }
                    ]}
                />
            </FormSection>

            {/* Move Out Form */}
            <FormSection
                borderColor="border-l-fuchsia-500"
                label="Move Out Form"
                htmlFor="move_out_form"
                error={errors.move_out_form}
            >
                <RadioGroup
                    value={data.move_out_form}
                    onValueChange={(value) => onFieldChange('move_out_form', value)}
                    name="move_out_form"
                    options={[
                        { value: 'filled', label: 'Filled' },
                        { value: 'not filled', label: 'Not Filled' }
                    ]}
                />
            </FormSection>
        </>
    );
}
