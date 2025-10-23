import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import FormSection from './FormSection';
import { MoveOutFormData } from '@/types/move-out';

interface MoveOutTextFieldsProps {
    data: MoveOutFormData;
    errors: Partial<Record<keyof MoveOutFormData, string>>;
    onFieldChange: (field: keyof MoveOutFormData, value: string) => void;
}

export default function MoveOutTextFields({
    data,
    errors,
    onFieldChange
}: MoveOutTextFieldsProps) {
    return (
        <>
            {/* Lease Status */}
            <FormSection
                borderColor="border-l-yellow-500"
                label="Lease Status"
                htmlFor="lease_status"
                error={errors.lease_status}
            >
                <Input
                    id="lease_status"
                    value={data.lease_status}
                    onChange={(e) => onFieldChange('lease_status', e.target.value)}
                    placeholder="Enter lease status"
                />
            </FormSection>

            {/* Keys Location */}
            <FormSection
                borderColor="border-l-cyan-500"
                label="Keys Location"
                htmlFor="keys_location"
                error={errors.keys_location}
            >
                <Input
                    id="keys_location"
                    value={data.keys_location}
                    onChange={(e) => onFieldChange('keys_location', e.target.value)}
                    placeholder="Enter keys location"
                />
            </FormSection>

            {/* Walkthrough */}
            <FormSection
                borderColor="border-l-emerald-500"
                label="Walkthrough"
                htmlFor="walkthrough"
                error={errors.walkthrough}
            >
                <Textarea
                    id="walkthrough"
                    value={data.walkthrough}
                    onChange={(e) => onFieldChange('walkthrough', e.target.value)}
                    placeholder="Enter walkthrough details"
                    className="min-h-[100px]"
                />
            </FormSection>

            {/* Repairs */}
            <FormSection
                borderColor="border-l-lime-500"
                label="Repairs"
                htmlFor="repairs"
                error={errors.repairs}
            >
                <Textarea
                    id="repairs"
                    value={data.repairs}
                    onChange={(e) => onFieldChange('repairs', e.target.value)}
                    placeholder="Enter repair details"
                    className="min-h-[80px]"
                />
            </FormSection>

            {/* Send Back Security Deposit */}
            <FormSection
                borderColor="border-l-amber-500"
                label="Send Back Security Deposit"
                htmlFor="send_back_security_deposit"
                error={errors.send_back_security_deposit}
            >
                <Input
                    id="send_back_security_deposit"
                    value={data.send_back_security_deposit}
                    onChange={(e) => onFieldChange('send_back_security_deposit', e.target.value)}
                    placeholder="Enter security deposit details"
                />
            </FormSection>

            {/* Notes */}
            <FormSection
                borderColor="border-l-slate-500"
                label="Notes"
                htmlFor="notes"
                error={errors.notes}
            >
                <Textarea
                    id="notes"
                    value={data.notes}
                    onChange={(e) => onFieldChange('notes', e.target.value)}
                    placeholder="Enter additional notes"
                    className="min-h-[100px]"
                />
            </FormSection>

            {/* List the Unit */}
            <FormSection
                borderColor="border-l-rose-500"
                label="List the Unit"
                htmlFor="list_the_unit"
                error={errors.list_the_unit}
            >
                <Input
                    id="list_the_unit"
                    value={data.list_the_unit}
                    onChange={(e) => onFieldChange('list_the_unit', e.target.value)}
                    placeholder="Enter unit listing details"
                />
            </FormSection>
        </>
    );
}
