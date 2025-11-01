import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, parse } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

interface Props {
    leaseStart: string;
    leaseEnd: string;
    calendarStates: {
        lease_start: boolean;
        lease_end: boolean;
    };
    onLeaseStartChange: (value: string) => void;
    onLeaseEndChange: (value: string) => void;
    onCalendarOpenChange: (field: 'lease_start' | 'lease_end', open: boolean) => void;
    errors: {
        lease_start?: string;
        lease_end?: string;
    };
}

export default function LeaseDates({
    leaseStart,
    leaseEnd,
    calendarStates,
    onLeaseStartChange,
    onLeaseEndChange,
    onCalendarOpenChange,
    errors
}: Props) {
    return (
        <>
            <div className="rounded-lg border-l-4 border-l-emerald-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="lease_start" className="text-base font-semibold">
                        Lease Start
                    </Label>
                </div>
                <Popover
                    open={calendarStates.lease_start}
                    onOpenChange={(open) => onCalendarOpenChange('lease_start', open)}
                    modal={false}
                >
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={`w-full justify-start text-left font-normal ${!leaseStart && 'text-muted-foreground'}`}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {leaseStart
                                ? format(parse(leaseStart, 'yyyy-MM-dd', new Date()), 'PPP')
                                : 'Pick a date'}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                        <Calendar
                            mode="single"
                            selected={leaseStart ? parse(leaseStart, 'yyyy-MM-dd', new Date()) : undefined}
                            onSelect={(date) => {
                                if (date) {
                                    onLeaseStartChange(format(date, 'yyyy-MM-dd'));
                                    onCalendarOpenChange('lease_start', false);
                                }
                            }}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
                {errors.lease_start && <p className="mt-1 text-sm text-red-600">{errors.lease_start}</p>}
            </div>

            <div className="rounded-lg border-l-4 border-l-teal-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="lease_end" className="text-base font-semibold">
                        Lease End
                    </Label>
                </div>
                <Popover
                    open={calendarStates.lease_end}
                    onOpenChange={(open) => onCalendarOpenChange('lease_end', open)}
                    modal={false}
                >
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={`w-full justify-start text-left font-normal ${!leaseEnd && 'text-muted-foreground'}`}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {leaseEnd
                                ? format(parse(leaseEnd, 'yyyy-MM-dd', new Date()), 'PPP')
                                : 'Pick a date'}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="z-[60] w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                        <Calendar
                            mode="single"
                            selected={leaseEnd ? parse(leaseEnd, 'yyyy-MM-dd', new Date()) : undefined}
                            onSelect={(date) => {
                                if (date) {
                                    onLeaseEndChange(format(date, 'yyyy-MM-dd'));
                                    onCalendarOpenChange('lease_end', false);
                                }
                            }}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
                {errors.lease_end && <p className="mt-1 text-sm text-red-600">{errors.lease_end}</p>}
            </div>
        </>
    );
}
