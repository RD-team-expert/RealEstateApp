import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, parse } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

interface Props {
    value: string;
    isOpen: boolean;
    onOpenChange: () => void;
    onDateSelect: (date: Date | undefined) => void;
}

export default function DatePickerField({ value, isOpen, onOpenChange, onDateSelect }: Props) {
    return (
        <Popover open={isOpen} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value ? format(parse(value, 'yyyy-MM-dd', new Date()), 'PPP') : <span>Pick a date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={value ? parse(value, 'yyyy-MM-dd', new Date()) : undefined}
                    onSelect={onDateSelect}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
}
