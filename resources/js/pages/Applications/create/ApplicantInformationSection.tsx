import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
    name: string;
    coSigner: string;
    onNameChange: (name: string) => void;
    onCoSignerChange: (coSigner: string) => void;
    errors: {
        name?: string;
        co_signer?: string;
    };
    validationErrors: {
        name?: string;
        co_signer?: string;
    };
}

export function ApplicantInformationSection({
    name,
    coSigner,
    onNameChange,
    onCoSignerChange,
    errors,
    validationErrors,
}: Props) {
    return (
        <>
            {/* Name */}
            <div className="rounded-lg border-l-4 border-l-orange-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="name" className="text-base font-semibold">
                        Name *
                    </Label>
                </div>
                <Input
                    id="name"
                    value={name}
                    onChange={(e) => onNameChange(e.target.value)}
                    placeholder="Enter applicant name"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                {validationErrors.name && <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>}
            </div>

            {/* Co-signer */}
            <div className="rounded-lg border-l-4 border-l-emerald-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="co_signer" className="text-base font-semibold">
                        Co-signer *
                    </Label>
                </div>
                <Input
                    id="co_signer"
                    value={coSigner}
                    onChange={(e) => onCoSignerChange(e.target.value)}
                    placeholder="Enter co-signer name"
                />
                {errors.co_signer && <p className="mt-1 text-sm text-red-600">{errors.co_signer}</p>}
                {validationErrors.co_signer && <p className="mt-1 text-sm text-red-600">{validationErrors.co_signer}</p>}
            </div>
        </>
    );
}
