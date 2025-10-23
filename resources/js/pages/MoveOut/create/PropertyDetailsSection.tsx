import FormField from './FormField';
import TextInputField from './TextInputField';
import TextAreaField from './TextAreaField';
import RadioGroupField from './RadioGroupField';
import { MoveOutFormData } from '@/types/move-out';

interface Props {
    data: MoveOutFormData;
    errors: Partial<Record<keyof MoveOutFormData, string>>;
    onDataChange: (field: keyof MoveOutFormData, value: any) => void;
}

export default function PropertyDetailsSection({
    data,
    errors,
    onDataChange,
}: Props) {
    return (
        <>
            <FormField
                label="Lease Status"
                borderColor="yellow"
                error={errors.lease_status}
            >
                <TextInputField
                    id="lease_status"
                    value={data.lease_status}
                    onChange={(e) => onDataChange('lease_status', e.target.value)}
                    placeholder="Enter lease status"
                />
            </FormField>

            <FormField
                label="Keys Location"
                borderColor="cyan"
                error={errors.keys_location}
            >
                <TextInputField
                    id="keys_location"
                    value={data.keys_location}
                    onChange={(e) => onDataChange('keys_location', e.target.value)}
                    placeholder="Enter keys location"
                />
            </FormField>

            <FormField
                label="Utilities Under Our Name"
                borderColor="indigo"
                error={errors.utilities_under_our_name}
            >
                <RadioGroupField
                    value={data.utilities_under_our_name}
                    onValueChange={(value) => onDataChange('utilities_under_our_name', value as "" | "Yes" | "No")}
                    name="utilities_under_our_name"
                    options={[
                        { value: 'Yes', label: 'Yes' },
                        { value: 'No', label: 'No' }
                    ]}
                />
            </FormField>

            <FormField
                label="Utility Type"
                borderColor="purple"
                error={errors.utility_type}
            >
                <TextAreaField
                    id="utility_type"
                    value={data.utility_type}
                    onChange={(e) => onDataChange('utility_type', e.target.value)}
                    placeholder="Enter utility type details"
                    minHeight="80px"
                />
            </FormField>

            <FormField
                label="Walkthrough"
                borderColor="emerald"
                error={errors.walkthrough}
            >
                <RadioGroupField
                    value={data.walkthrough}
                    onValueChange={(value) => onDataChange('walkthrough', value as "" | "Yes" | "No")}
                    name="walkthrough"
                    options={[
                        { value: 'Yes', label: 'Yes' },
                        { value: 'No', label: 'No' }
                    ]}
                />
            </FormField>

            <FormField
                label="Repairs"
                borderColor="lime"
                error={errors.repairs}
            >
                <TextAreaField
                    id="repairs"
                    value={data.repairs}
                    onChange={(e) => onDataChange('repairs', e.target.value)}
                    placeholder="Enter repair details"
                    minHeight="80px"
                />
            </FormField>

            <FormField
                label="Send Back Security Deposit"
                borderColor="amber"
                error={errors.send_back_security_deposit}
            >
                <TextInputField
                    id="send_back_security_deposit"
                    value={data.send_back_security_deposit}
                    onChange={(e) => onDataChange('send_back_security_deposit', e.target.value)}
                    placeholder="Enter security deposit details"
                />
            </FormField>

            <FormField
                label="Notes"
                borderColor="slate"
                error={errors.notes}
            >
                <TextAreaField
                    id="notes"
                    value={data.notes}
                    onChange={(e) => onDataChange('notes', e.target.value)}
                    placeholder="Enter additional notes"
                    minHeight="100px"
                />
            </FormField>
        </>
    );
}
