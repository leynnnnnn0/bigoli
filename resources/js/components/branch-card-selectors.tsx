import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { BranchOption, LoyaltyCardOption } from '@/types/stampbayan';
import { MapPin } from 'lucide-react';

interface BranchAndCardSelectorsProps {
    branches: BranchOption[];
    cards: LoyaltyCardOption[];
    selectedBranchId: string;
    selectedCardId: string;
    onBranchChange: (value: string) => void;
    onCardChange: (value: string) => void;
    onClearBranch?: () => void;
    tone?: 'business' | 'staff';
    className?: string;
}

export function BranchAndCardSelectors({
    branches,
    cards,
    selectedBranchId,
    selectedCardId,
    onBranchChange,
    onCardChange,
    onClearBranch,
    tone = 'business',
    className,
}: BranchAndCardSelectorsProps) {
    const isStaff = tone === 'staff';
    const labelClassName = cn(
        'mb-2 block text-sm text-gray-700',
        isStaff ? 'font-semibold' : 'font-medium',
    );
    const triggerClassName = cn('w-full', isStaff && 'h-12');

    return (
        <div className={cn('space-y-4', !isStaff && 'mb-6', className)}>
            {branches.length > 0 && (
                <div>
                    <Label className={labelClassName}>
                        {isStaff ? (
                            <span className="flex items-center gap-1.5">
                                <MapPin className="h-4 w-4" />
                                Branch
                            </span>
                        ) : (
                            <>
                                Select Branch{' '}
                                <span className="font-normal text-gray-400">
                                    (optional)
                                </span>
                            </>
                        )}
                    </Label>
                    <div className="flex gap-2">
                        <Select
                            value={selectedBranchId}
                            onValueChange={onBranchChange}
                        >
                            <SelectTrigger className={triggerClassName}>
                                <SelectValue
                                    placeholder={
                                        isStaff
                                            ? 'Select your branch'
                                            : 'All branches (no filter)'
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {branches.map((branch) => (
                                    <SelectItem
                                        key={branch.id}
                                        value={branch.id.toString()}
                                    >
                                        {branch.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {!isStaff && selectedBranchId && onClearBranch && (
                            <button
                                type="button"
                                onClick={onClearBranch}
                                className="shrink-0 rounded-lg border border-gray-300 px-3 text-sm text-gray-500 hover:bg-gray-50"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                    <p
                        className={cn(
                            'mt-1 text-gray-400',
                            isStaff ? 'text-xs' : 'text-[8px]',
                        )}
                    >
                        {selectedBranchId
                            ? 'Showing cards available at this branch and cards available everywhere.'
                            : isStaff
                              ? 'Showing cards available at all branches.'
                              : 'Showing cards available at all branches (no branch restriction).'}
                    </p>
                </div>
            )}

            <div>
                <Label className={labelClassName}>Select Loyalty Card</Label>
                {cards.length > 0 ? (
                    <Select value={selectedCardId} onValueChange={onCardChange}>
                        <SelectTrigger className={triggerClassName}>
                            <SelectValue placeholder="Select a loyalty card" />
                        </SelectTrigger>
                        <SelectContent>
                            {cards.map((card) => (
                                <SelectItem
                                    key={card.id}
                                    value={card.id.toString()}
                                >
                                    {card.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ) : (
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
                        {isStaff ? (
                            <>
                                No loyalty cards available
                                {branches.length > 0
                                    ? ' for the selected branch.'
                                    : '. Contact administrator.'}
                            </>
                        ) : branches.length > 0 ? (
                            <>
                                No loyalty cards available for the selected
                                branch.{' '}
                                {selectedBranchId && onClearBranch && (
                                    <button
                                        type="button"
                                        onClick={onClearBranch}
                                        className="underline"
                                    >
                                        Clear branch filter
                                    </button>
                                )}{' '}
                                to see cards available everywhere.
                            </>
                        ) : (
                            'No loyalty cards available. Go to Create Template Page to create one.'
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
