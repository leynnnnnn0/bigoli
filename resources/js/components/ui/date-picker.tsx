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
import {
    type Matcher,
    type MonthCaptionProps,
    useDayPicker,
} from 'react-day-picker';

const monthNames = Array.from({ length: 12 }, (_, month) =>
    format(new Date(2000, month, 1), 'MMMM'),
);

function UnrestrictedMonthCaption({
    calendarMonth,
    displayIndex,
    ...props
}: MonthCaptionProps) {
    void displayIndex;

    const { goToMonth } = useDayPicker();
    const displayedMonth = calendarMonth.date;
    const [yearInput, setYearInput] = React.useState(() =>
        String(displayedMonth.getFullYear()),
    );

    React.useEffect(() => {
        setYearInput(String(displayedMonth.getFullYear()));
    }, [displayedMonth]);

    const goTo = (month: number, year: number) => {
        if (!Number.isInteger(year) || year < 1 || year > 9999) return false;

        const nextMonth = new Date(displayedMonth);
        nextMonth.setDate(1);
        nextMonth.setMonth(month);
        nextMonth.setFullYear(year);
        goToMonth(nextMonth);

        return true;
    };

    const commitYear = () => {
        if (!goTo(displayedMonth.getMonth(), Number(yearInput))) {
            setYearInput(String(displayedMonth.getFullYear()));
        }
    };

    return (
        <div
            {...props}
            className={cn(
                'relative flex h-8 items-center justify-center gap-1',
                props.className,
            )}
        >
            <select
                aria-label="Calendar month"
                value={displayedMonth.getMonth()}
                onChange={(event) =>
                    goTo(
                        Number(event.target.value),
                        displayedMonth.getFullYear(),
                    )
                }
                className="h-8 rounded-md border border-input bg-background px-2 text-sm"
            >
                {monthNames.map((month, index) => (
                    <option key={month} value={index}>
                        {month}
                    </option>
                ))}
            </select>
            <input
                type="number"
                aria-label="Calendar year"
                value={yearInput}
                onChange={(event) => setYearInput(event.target.value)}
                onBlur={commitYear}
                onKeyDown={(event) => {
                    if (event.key === 'Enter') commitYear();
                }}
                className="h-8 w-20 rounded-md border border-input bg-background px-2 text-sm"
            />
        </div>
    );
}

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
    const hasUnrestrictedNavigation =
        captionLayout === 'label' && !startMonth && !endMonth;

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
                        components={
                            hasUnrestrictedNavigation
                                ? {
                                      MonthCaption:
                                          UnrestrictedMonthCaption,
                                  }
                                : undefined
                        }
                        autoFocus
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}

export { DatePicker };
