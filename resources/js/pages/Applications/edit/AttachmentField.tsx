import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
    currentAttachmentName: string | null;
    onAttachmentChange: (file: File | null) => void;
    error?: string;
}

export function AttachmentField({ currentAttachmentName, onAttachmentChange, error }: Props) {
    return (
        <div className="rounded-lg border-l-4 border-l-yellow-500 p-4">
            <div className="mb-2">
                <Label htmlFor="attachment" className="text-base font-semibold">
                    Attachment
                </Label>
            </div>

            {/* Current attachment display */}
            {currentAttachmentName && (
                <div className="mb-3 rounded border bg-muted p-2">
                    <p className="text-sm text-muted-foreground">Current attachment:</p>
                    <p className="font-medium">{currentAttachmentName}</p>
                </div>
            )}

            <Input
                id="attachment"
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => onAttachmentChange(e.target.files?.[0] || null)}
                className="cursor-pointer file:cursor-pointer file:border-0 file:bg-transparent file:text-sm file:font-medium"
            />
            <p className="mt-1 text-xs text-muted-foreground">
                Accepted formats: PDF, Word documents, and images (max 10MB)
                {currentAttachmentName && ' • Upload a new file to replace the current attachment'}
            </p>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
}
