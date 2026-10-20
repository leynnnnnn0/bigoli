import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, isValid, parseISO } from 'date-fns';
import { CalendarDays, X } from 'lucide-react';
import * as React from 'react';
import type { Matcher } from 'react-day-picker';

interface DatePickerProps {
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    id?: string;
    className?: string;
    disabled?: Matcher | Matcher[];
    startMonth?: Date;
    endMonth?: Date;
    captionLayout?: 'label' | 'dropdown' | 'dropdown-months' | 'dropdown-years';
    required?: boolean;
    invalid?: boolean;
    clearable?: boolean;
}

function parseDate(value?: string) {
    if (!value) return undefined;

    const parsed = parseISO(value);
    return isValid(parsed) ? parsed : undefined;
}

function DatePicker({
    value,
    onChange,
    placeholder = 'Pick a date',
    id,
    className,
    disabled,
    startMonth,
    endMonth,
    captionLayout = 'label',
    required,
    invalid,
    clearable = false,
}: DatePickerProps) {
    const [open, setOpen] = React.useState(false);
    const selected = parseDate(value);

    return (
        <div className="relative w-full">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id={id}
                        type="button"
                        variant="outline"
                        aria-invalid={invalid}
                        aria-required={required}
                        className={cn(
                            'w-full justify-start bg-background text-left font-normal',
                            !selected && 'text-muted-foreground',
                            selected && clearable && 'pr-9',
                            className,
                        )}
                    >
                        <CalendarDays className="size-4" />
                        {selected ? format(selected, 'PPP') : placeholder}
                    </Button>
                </PopoverTrigger>
                {selected && clearable && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Clear date"
                        className="absolute top-1/2 right-0.5 z-10 -translate-y-1/2 text-muted-foreground"
                        onClick={() => onChange('')}
                    >
                        <X className="size-3.5" />
                    </Button>
                )}
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={selected}
                        defaultMonth={selected}
                        onSelect={(date) => {
                            if (!date) return;
                            onChange(format(date, 'yyyy-MM-dd'));
                            setOpen(false);
                        }}
                        disabled={disabled}
                        startMonth={startMonth}
                        endMonth={endMonth}
                        captionLayout={captionLayout}
                        autoFocus
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}

export { DatePicker };
