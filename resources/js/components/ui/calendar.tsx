import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';
import { DayPicker } from 'react-day-picker';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
    className,
    classNames,
    components,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn('p-3', className)}
            classNames={{
                months: 'flex flex-col gap-4 sm:flex-row',
                month: 'space-y-4',
                month_caption: 'relative flex h-7 items-center justify-center',
                caption_label:
                    'text-sm font-medium [&:has(select)]:sr-only',
                dropdowns: 'flex items-center justify-center gap-1',
                dropdown_root: 'relative rounded-md border border-input',
                dropdown:
                    'absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed',
                months_dropdown:
                    'h-8 appearance-none bg-background px-2 pr-7 text-sm',
                years_dropdown:
                    'h-8 appearance-none bg-background px-2 pr-7 text-sm',
                nav: 'absolute inset-x-0 top-3 flex items-center justify-between px-3',
                button_previous: cn(
                    buttonVariants({ variant: 'outline' }),
                    'size-7 bg-transparent p-0 opacity-60 hover:opacity-100',
                ),
                button_next: cn(
                    buttonVariants({ variant: 'outline' }),
                    'size-7 bg-transparent p-0 opacity-60 hover:opacity-100',
                ),
                month_grid: 'w-full border-collapse space-y-1',
                weekdays: 'flex',
                weekday:
                    'w-9 rounded-md text-center text-[0.8rem] font-normal text-muted-foreground',
                week: 'mt-2 flex w-full',
                day: 'relative size-9 p-0 text-center text-sm focus-within:relative focus-within:z-20',
                day_button: cn(
                    buttonVariants({ variant: 'ghost' }),
                    'size-9 p-0 font-normal aria-selected:opacity-100',
                ),
                selected:
                    'rounded-md bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
                today: 'rounded-md bg-accent text-accent-foreground',
                outside:
                    'text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
                disabled: 'text-muted-foreground opacity-50',
                hidden: 'invisible',
                ...classNames,
            }}
            components={{
                Chevron: ({ orientation, className: iconClassName, ...iconProps }) => {
                    const Icon =
                        orientation === 'left'
                            ? ChevronLeft
                            : orientation === 'right'
                              ? ChevronRight
                              : ChevronDown;

                    return (
                        <Icon
                            className={cn('size-4', iconClassName)}
                            {...iconProps}
                        />
                    );
                },
                ...components,
            }}
            {...props}
        />
    );
}

export { Calendar };
