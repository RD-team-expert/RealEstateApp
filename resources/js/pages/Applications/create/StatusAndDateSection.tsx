import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup } from '@/components/ui/radioGroup';
import { format, parse } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';

interface Props {
    status: string;
    date: string;
    onStatusChange: (status: string) => void;
    onDateChange: (date: string) => void;
    errors: {
        status?: string;
        date?: string;
    };
    validationErrors: {
        status?: string;
    };
}

export function StatusAndDateSection({
    status,
    date,
    onStatusChange,
    onDateChange,
    errors,
    validationErrors,
}: Props) {
    const [calendarOpen, setCalendarOpen] = useState(false);

    return (
        <>
            {/* Status */}
            <div className="rounded-lg border-l-4 border-l-teal-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="status" className="text-base font-semibold">
                        Status *
                    </Label>
                </div>
                <RadioGroup
                    value={status}
                    onValueChange={onStatusChange}
                    name="status"
                    options={[
                        { value: 'New', label: 'New' },
                        { value: 'Approved', label: 'Approved' },
                        { value: 'Undecided', label: 'Undecided' },
                        { value: 'Rejected', label: 'Rejected' },
                        { value: 'Pending', label: 'Pending' },
                    ]}
                />
                {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
                {validationErrors.status && <p className="mt-1 text-sm text-red-600">{validationErrors.status}</p>}
            </div>

            {/* Date */}
            <div className="rounded-lg border-l-4 border-l-indigo-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="date" className="text-base font-semibold">
                        Date
                    </Label>
                </div>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen} modal={false}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={`w-full justify-start text-left font-normal ${!date && 'text-muted-foreground'}`}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(parse(date, 'yyyy-MM-dd', new Date()), 'PPP') : 'Pick a date'}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                        <Calendar
                            mode="single"
                            selected={date ? parse(date, 'yyyy-MM-dd', new Date()) : undefined}
                            onSelect={(selectedDate) => {
                                if (selectedDate) {
                                    onDateChange(format(selectedDate, 'yyyy-MM-dd'));
                                    setCalendarOpen(false);
                                }
                            }}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
                {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
            </div>
        </>
    );
}
