import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup } from '@/components/ui/radioGroup';
import { Textarea } from '@/components/ui/textarea';
import { MoveOutFormData } from '@/types/move-out';

interface MoveOutDetailsFieldsProps {
    data: MoveOutFormData;
    errors: Partial<Record<keyof MoveOutFormData, string>>;
    onDataChange: <K extends keyof MoveOutFormData>(field: K, value: MoveOutFormData[K]) => void;
}

export function MoveOutDetailsFields({ data, errors, onDataChange }: MoveOutDetailsFieldsProps) {
    return (
        <>
            {/* Lease Status */}
            <div className="rounded-lg border-l-4 border-l-yellow-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="lease_status" className="text-base font-semibold">
                        Lease Status
                    </Label>
                </div>
                <Input
                    id="lease_status"
                    value={data.lease_status}
                    onChange={(e) => onDataChange('lease_status', e.target.value)}
                    placeholder="Enter lease status"
                />
                {errors.lease_status && <p className="mt-1 text-sm text-red-600">{errors.lease_status}</p>}
            </div>

            {/* Keys Location */}
            <div className="rounded-lg border-l-4 border-l-cyan-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="keys_location" className="text-base font-semibold">
                        Keys Location
                    </Label>
                </div>
                <Input
                    id="keys_location"
                    value={data.keys_location}
                    onChange={(e) => onDataChange('keys_location', e.target.value)}
                    placeholder="Enter keys location"
                />
                {errors.keys_location && <p className="mt-1 text-sm text-red-600">{errors.keys_location}</p>}
            </div>

            {/* Utilities */}
            <div className="rounded-lg border-l-4 border-l-indigo-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="utilities_under_our_name" className="text-base font-semibold">
                        Utilities Under Our Name
                    </Label>
                </div>
                <RadioGroup
                    value={data.utilities_under_our_name}
                    onValueChange={(value) => onDataChange('utilities_under_our_name', value as "" | "Yes" | "No")}
                    name="utilities_under_our_name"
                    options={[
                        { value: 'Yes', label: 'Yes' },
                        { value: 'No', label: 'No' }
                    ]}
                />
                {errors.utilities_under_our_name && <p className="mt-1 text-sm text-red-600">{errors.utilities_under_our_name}</p>}
            </div>

            {/* Utility Type */}
            <div className="rounded-lg border-l-4 border-l-purple-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="utility_type" className="text-base font-semibold">
                        Utility Type
                    </Label>
                </div>
                <Textarea
                    id="utility_type"
                    value={data.utility_type}
                    onChange={(e) => onDataChange('utility_type', e.target.value)}
                    placeholder="Enter utility type details"
                    className="min-h-[80px]"
                />
                {errors.utility_type && <p className="mt-1 text-sm text-red-600">{errors.utility_type}</p>}
            </div>

            {/* Walkthrough */}
            <div className="rounded-lg border-l-4 border-l-emerald-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="walkthrough" className="text-base font-semibold">
                        Walkthrough
                    </Label>
                </div>
                <RadioGroup
                    value={data.walkthrough}
                    onValueChange={(value) => onDataChange('walkthrough', value as "" | "Yes" | "No")}
                    name="walkthrough"
                    options={[
                        { value: 'Yes', label: 'Yes' },
                        { value: 'No', label: 'No' }
                    ]}
                />
                {errors.walkthrough && <p className="mt-1 text-sm text-red-600">{errors.walkthrough}</p>}
            </div>

            {/* Repairs */}
            <div className="rounded-lg border-l-4 border-l-lime-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="repairs" className="text-base font-semibold">
                        Repairs
                    </Label>
                </div>
                <Textarea
                    id="repairs"
                    value={data.repairs}
                    onChange={(e) => onDataChange('repairs', e.target.value)}
                    placeholder="Enter repair details"
                    className="min-h-[80px]"
                />
                {errors.repairs && <p className="mt-1 text-sm text-red-600">{errors.repairs}</p>}
            </div>

            {/* Send Back Security Deposit */}
            <div className="rounded-lg border-l-4 border-l-amber-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="send_back_security_deposit" className="text-base font-semibold">
                        Send Back Security Deposit
                    </Label>
                </div>
                <Input
                    id="send_back_security_deposit"
                    value={data.send_back_security_deposit}
                    onChange={(e) => onDataChange('send_back_security_deposit', e.target.value)}
                    placeholder="Enter security deposit details"
                />
                {errors.send_back_security_deposit && <p className="mt-1 text-sm text-red-600">{errors.send_back_security_deposit}</p>}
            </div>

            {/* Notes */}
            <div className="rounded-lg border-l-4 border-l-slate-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="notes" className="text-base font-semibold">
                        Notes
                    </Label>
                </div>
                <Textarea
                    id="notes"
                    value={data.notes}
                    onChange={(e) => onDataChange('notes', e.target.value)}
                    placeholder="Enter additional notes"
                    className="min-h-[100px]"
                />
                {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
            </div>
        </>
    );
}
