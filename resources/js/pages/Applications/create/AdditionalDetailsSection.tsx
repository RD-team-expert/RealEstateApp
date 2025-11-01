import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React from 'react';

interface Props {
    stageInProgress: string;
    notes: string;
    attachment: File | null;
    onStageInProgressChange: (value: string) => void;
    onNotesChange: (value: string) => void;
    onAttachmentChange: (file: File | null) => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
    errors: {
        stage_in_progress?: string;
        notes?: string;
        attachment?: string;
    };
}

export function AdditionalDetailsSection({
    stageInProgress,
    notes,
    onStageInProgressChange,
    onNotesChange,
    onAttachmentChange,
    fileInputRef,
    errors,
}: Props) {
    return (
        <>
            {/* Stage in Progress */}
            <div className="rounded-lg border-l-4 border-l-pink-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="stage_in_progress" className="text-base font-semibold">
                        Stage in Progress
                    </Label>
                </div>
                <Input
                    id="stage_in_progress"
                    value={stageInProgress}
                    onChange={(e) => onStageInProgressChange(e.target.value)}
                    placeholder="e.g., Document Review, Background Check, etc."
                />
                {errors.stage_in_progress && <p className="mt-1 text-sm text-red-600">{errors.stage_in_progress}</p>}
            </div>

            {/* Notes */}
            <div className="rounded-lg border-l-4 border-l-red-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="notes" className="text-base font-semibold">
                        Notes
                    </Label>
                </div>
                <textarea
                    id="notes"
                    className="resize-vertical min-h-[100px] w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={notes}
                    onChange={(e) => onNotesChange(e.target.value)}
                    placeholder="Add any additional notes..."
                    rows={4}
                />
                {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
            </div>

            {/* Attachment */}
            <div className="rounded-lg border-l-4 border-l-yellow-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="attachment" className="text-base font-semibold">
                        Attachment
                    </Label>
                </div>
                <Input
                    id="attachment"
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => onAttachmentChange(e.target.files?.[0] || null)}
                    ref={fileInputRef}
                    className="cursor-pointer file:cursor-pointer file:border-0 file:bg-transparent file:text-sm file:font-medium"
                />
                <p className="mt-1 text-xs text-muted-foreground">Accepted formats: PDF, Word documents, and images (max 10MB)</p>
                {errors.attachment && <p className="mt-1 text-sm text-red-600">{errors.attachment}</p>}
            </div>
        </>
    );
}
