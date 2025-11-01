import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, isValid, parse } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';

interface Props {
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

export function WritDateSection({ value, onChange, error }: Props) {
    const [calendarOpen, setCalendarOpen] = useState(false);

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

    return (
        <div className="rounded-lg border-l-4 border-l-slate-500 p-4">
            <div className="mb-2">
                <Label htmlFor="writ_date" className="text-base font-semibold">
                    Writ Date
                </Label>
            </div>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen} modal={false}>
                <PopoverTrigger asChild>
                    <Button variant="outline" className={`w-full justify-start text-left font-normal ${!value && 'text-muted-foreground'}`}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {value && value.trim() !== ''
                            ? (() => {
                                  const parsedDate = parseDate(value);
                                  return parsedDate ? format(parsedDate, 'PPP') : 'Pick a date';
                              })()
                            : 'Pick a date'}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                    <Calendar
                        mode="single"
                        selected={parseDate(value)}
                        onSelect={(date) => {
                            if (date && isValid(date)) {
                                onChange(format(date, 'yyyy-MM-dd'));
                                setCalendarOpen(false);
                            }
                        }}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
}
