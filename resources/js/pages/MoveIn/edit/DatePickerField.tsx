import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, isValid, parse } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

interface DatePickerFieldProps {
    value: string;
    onChange: (date: string) => void;
    placeholder?: string;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

// Helper function to safely parse dates
const safeParseDateString = (dateString: string | null | undefined): Date | undefined => {
    if (!dateString || dateString.trim() === '') {
        return undefined;
    }

    try {
        const parsedDate = parse(dateString, 'yyyy-MM-dd', new Date());
        return isValid(parsedDate) ? parsedDate : undefined;
    } catch (error) {
        console.warn('Failed to parse date:', dateString, error);
        return undefined;
    }
};

// Helper function to safely format dates for display
const safeFormatDate = (dateString: string | null | undefined): string => {
    const parsedDate = safeParseDateString(dateString);
    if (!parsedDate) {
        return 'Pick a date';
    }

    try {
        return format(parsedDate, 'PPP');
    } catch (error) {
        console.warn('Failed to format date:', dateString, error);
        return 'Pick a date';
    }
};

export default function DatePickerField({ 
    value, 
    onChange, 
    isOpen,
    onOpenChange 
}: DatePickerFieldProps) {
    return (
        <Popover open={isOpen} onOpenChange={onOpenChange} modal={false}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${!value && 'text-muted-foreground'}`}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {safeFormatDate(value)}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                <Calendar
                    mode="single"
                    selected={safeParseDateString(value)}
                    onSelect={(date) => {
                        if (date) {
                            onChange(format(date, 'yyyy-MM-dd'));
                            onOpenChange(false);
                        }
                    }}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
}
