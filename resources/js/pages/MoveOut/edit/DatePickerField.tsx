import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, parse, isValid } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

interface DatePickerFieldProps {
    value: string;
    onChange: (date: string) => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    placeholder?: string;
}

// Safe date parsing function
const parseDate = (dateString: string | null | undefined): Date | undefined => {
    if (!dateString || dateString.trim() === '') {
        return undefined;
    }
    
    try {
        const parsedDate = parse(dateString, 'yyyy-MM-dd', new Date());
        if (isValid(parsedDate)) {
            return parsedDate;
        }
        
        const directDate = new Date(dateString);
        if (isValid(directDate)) {
            return directDate;
        }
        
        return undefined;
    } catch (error) {
        console.warn('Date parsing error:', error);
        return undefined;
    }
};

export default function DatePickerField({
    value,
    onChange,
    open,
    onOpenChange,
    placeholder = 'Pick a date'
}: DatePickerFieldProps) {
    const handleDateSelect = (date: Date | undefined) => {
        if (date && isValid(date)) {
            onChange(format(date, 'yyyy-MM-dd'));
            onOpenChange(false);
        }
    };

    const displayValue = value && value.trim() !== ''
        ? (() => {
            const parsedDate = parseDate(value);
            return parsedDate ? format(parsedDate, 'PPP') : placeholder;
        })()
        : placeholder;

    return (
        <Popover open={open} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {displayValue}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={parseDate(value)}
                    onSelect={handleDateSelect}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
}
