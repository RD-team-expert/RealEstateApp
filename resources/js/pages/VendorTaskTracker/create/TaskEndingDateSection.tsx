import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, parse } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

interface TaskEndingDateSectionProps {
    taskEndingDate: string;
    calendarOpen: boolean;
    onCalendarOpenChange: (open: boolean) => void;
    onDateChange: (date: string) => void;
    errors: Partial<Record<string, string>>; // Changed from Record<string, string>

}

export default function TaskEndingDateSection({
    taskEndingDate,
    calendarOpen,
    onCalendarOpenChange,
    onDateChange,
    errors
}: TaskEndingDateSectionProps) {
    return (
        <div className="rounded-lg border-l-4 border-l-teal-500 p-4">
            <div className="mb-2">
                <Label htmlFor="task_ending_date" className="text-base font-semibold">
                    Task Ending Date
                </Label>
            </div>
            <Popover
                open={calendarOpen}
                onOpenChange={onCalendarOpenChange}
                modal={false}
            >
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${!taskEndingDate && 'text-muted-foreground'}`}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {taskEndingDate
                            ? format(parse(taskEndingDate, 'yyyy-MM-dd', new Date()), 'PPP')
                            : 'Pick a date'}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                    <Calendar
                        mode="single"
                        selected={taskEndingDate ? parse(taskEndingDate, 'yyyy-MM-dd', new Date()) : undefined}
                        onSelect={(date) => {
                            if (date) {
                                onDateChange(format(date, 'yyyy-MM-dd'));
                                onCalendarOpenChange(false);
                            }
                        }}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
            {errors.task_ending_date && <p className="mt-1 text-sm text-red-600">{errors.task_ending_date}</p>}
        </div>
    );
}
