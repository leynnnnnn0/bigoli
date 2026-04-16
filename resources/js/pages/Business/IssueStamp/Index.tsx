import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface LoyaltyCard {
    id: number;
    name: string;
}

interface Branch {
    id: number;
    name: string;
}

interface SelectorsProps {
    branches: Branch[];
    cards: LoyaltyCard[];
    selectedBranchId: string;
    selectedCardId: string;
    onBranchChange: (value: string) => void;
    onClearBranch: () => void;
    onCardChange: (value: string) => void;
}

function BranchAndCardSelectors({
    branches,
    cards,
    selectedBranchId,
    selectedCardId,
    onBranchChange,
    onClearBranch,
    onCardChange,
}: SelectorsProps) {
    return (
        <div className="mb-6 space-y-4">
            {branches.length > 0 && (
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Select Branch{' '}
                        <span className="font-normal text-gray-400">
                            (optional)
                        </span>
                    </label>
                    <div className="flex gap-2">
                        <Select
                            value={selectedBranchId}
                            onValueChange={onBranchChange}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="All branches (no filter)" />
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
                        {selectedBranchId && (
                            <button
                                type="button"
                                onClick={onClearBranch}
                                className="shrink-0 rounded-lg border border-gray-300 px-3 text-sm text-gray-500 hover:bg-gray-50"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                    <p className="mt-1 text-[8px] text-gray-400">
                        {selectedBranchId
                            ? 'Showing cards available at this branch and cards available everywhere.'
                            : 'Showing cards available at all branches (no branch restriction).'}
                    </p>
                </div>
            )}

            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Select Loyalty Card
                </label>
                {cards.length > 0 ? (
                    <Select value={selectedCardId} onValueChange={onCardChange}>
                        <SelectTrigger className="w-full">
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
                ) : branches.length > 0 ? (
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
                        No loyalty cards available for the selected branch.{' '}
                        {selectedBranchId && (
                            <button
                                type="button"
                                onClick={onClearBranch}
                                className="underline"
                            >
                                Clear branch filter
                            </button>
                        )}{' '}
                        to see cards available everywhere.
                    </div>
                ) : (
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
                        No loyalty cards available. Go to Create Template Page
                        to create one.
                    </div>
                )}
            </div>
        </div>
    );
}

interface Props {
    code: {
        success: boolean;
        code: string;
        qr_url: string;
        created_at: string;
    };
    cards: LoyaltyCard[];
    branches: Branch[];
    loyalty_card_id?: string;
    branch_id?: string;
    reference_number?: string
}

export default function Index({
    code,
    cards,
    branches,
    loyalty_card_id,
    branch_id,
    reference_number,
}: Props) {
    const [referenceNumber, setReferenceNumber] = useState<string>(reference_number ?? '');
    const [loading, setLoading] = useState(false);
    const [downloadingOffline, setDownloadingOffline] = useState(false);
    const [selectedBranchId, setSelectedBranchId] = useState<string>(
        branch_id ?? '',
    );
    const [selectedCardId, setSelectedCardId] = useState<string>(
        loyalty_card_id ?? '',
    );
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (loyalty_card_id) setSelectedCardId(loyalty_card_id);
    }, [loyalty_card_id]);

    const handleBranchChange = (value: string) => {
        setSelectedBranchId(value);
        setSelectedCardId('');
        router.get(
            '/business/issue-stamp',
            { branch_id: value },
            { preserveScroll: true, replace: true },
        );
    };

    const handleClearBranch = () => {
        setSelectedBranchId('');
        setSelectedCardId('');
        router.get(
            '/business/issue-stamp',
            {},
            { preserveScroll: true, replace: true },
        );
    };

    const generateCode = () => {
        if (!selectedCardId) {
            setError('Please select a loyalty card');
            return;
        }
        if (!referenceNumber) {
            setError('Please enter a reference number');
            return;
        }
        setLoading(true);
        setError(null);
        router.get('/business/issue-stamp', {
            loyalty_card_id: selectedCardId,
            branch_id: selectedBranchId || undefined,
            reference_number: referenceNumber,
        });
        setLoading(false);
    };

    const downloadOfflineStamps = async () => {
        if (!selectedCardId) {
            setError('Please select a loyalty card');
            return;
        }
        setDownloadingOffline(true);
        setError(null);
        try {
            const response = await fetch(
                `/business/issue-stamps/generate-offline?id=${selectedCardId}`,
                { method: 'GET', headers: { Accept: 'application/pdf' } },
            );
            if (!response.ok)
                throw new Error('Failed to generate offline stamps');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `loyalty-stamps-${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            setError('Failed to download offline stamps. Please try again.');
        } finally {
            setDownloadingOffline(false);
        }
    };

    const sharedSelectorsProps = {
        branches,
        cards,
        selectedBranchId,
        selectedCardId,
        onBranchChange: handleBranchChange,
        onClearBranch: handleClearBranch,
        onCardChange: setSelectedCardId,
    };

    return (
        <AppLayout>
            <Head title="Issue Stamp" />
            <div className="mx-auto w-full max-w-2xl sm:mt-6 sm:px-6 md:mt-8 lg:px-8">
                {!code.success ? (
                    <div className="rounded-lg bg-white p-6 shadow sm:p-8">
                        <div className="mb-6 text-center">
                            <div className="mb-4 sm:mb-6">
                                <svg
                                    className="mx-auto h-16 w-16 text-gray-400 sm:h-20 sm:w-20"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                            </div>
                            <h3 className="mb-2 text-lg font-semibold text-gray-900 sm:text-xl">
                                Ready to Issue a Stamp?
                            </h3>
                            <p className="mb-6 px-2 text-sm text-gray-600 sm:text-base">
                                Select a loyalty card and generate a unique code
                                for your customer.
                            </p>
                        </div>

                        <BranchAndCardSelectors {...sharedSelectorsProps} />

                        <div className="mb-6">
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Reference Number
                            </label>
                            <Input
                                type="text"
                                value={referenceNumber}
                                onChange={(e) =>
                                    setReferenceNumber(e.target.value)
                                }
                                placeholder="Enter reference number (required)"
                                className="w-full"
                            />
                        </div>

                        {error && (
                            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <div className="space-y-3">
                            <button
                                onClick={generateCode}
                                disabled={
                                    loading ||
                                    !selectedCardId ||
                                    !referenceNumber
                                }
                                className="w-full rounded-lg bg-accent px-6 py-3 font-medium text-white transition-colors hover:bg-accent/70 disabled:cursor-not-allowed disabled:bg-accent/60"
                            >
                                {loading ? 'Generating...' : 'Generate Code'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-lg bg-white p-6 shadow sm:p-8">
                        <div className="mb-4 text-center sm:mb-6">
                            <div className="mb-3 inline-block rounded-full bg-green-100 p-2 sm:mb-4">
                                <svg
                                    className="h-6 w-6 text-green-600 sm:h-8 sm:w-8"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                            <h3 className="mb-1 text-lg font-semibold text-gray-900 sm:text-xl">
                                Code Generated Successfully
                            </h3>
                            <p className="text-xs text-gray-500 sm:text-sm">
                                Generated on {code.created_at}
                            </p>
                        </div>

                        <div className="mb-4 border-t border-b border-gray-200 py-4 sm:mb-6 sm:py-6">
                            <div className="mb-4 flex justify-center sm:mb-6">
                                <img
                                    src={code.qr_url}
                                    alt="QR Code"
                                    className="h-48 w-48 rounded-lg border-2 border-gray-200 sm:h-56 sm:w-56 md:h-64 md:w-64"
                                />
                            </div>
                            <div className="px-2 text-center">
                                <p className="mb-2 text-xs text-gray-600 sm:text-sm">
                                    Or enter code manually:
                                </p>
                                <div className="inline-block rounded-lg bg-gray-100 px-4 py-2 sm:px-6 sm:py-3">
                                    <p className="font-mono text-xl font-bold tracking-wider break-all text-gray-900 sm:text-2xl md:text-3xl">
                                        {code.code}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 sm:mb-6 sm:p-4">
                            <div className="flex items-start">
                                <svg
                                    className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0 text-yellow-600 sm:mr-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                                <div>
                                    <p className="text-xs font-medium text-yellow-800 sm:text-sm">
                                        Important
                                    </p>
                                    <p className="mt-1 text-xs text-yellow-700 sm:text-sm">
                                        This code will expire in 15 minutes if
                                        not used. Customer must scan or enter
                                        the code in their app.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <BranchAndCardSelectors {...sharedSelectorsProps} />

                        <div className="mb-6">
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Reference Number
                            </label>
                            <Input
                                type="text"
                                value={referenceNumber}
                                onChange={(e) =>
                                    setReferenceNumber(e.target.value)
                                }
                                placeholder="Enter reference number (required)"
                                className="w-full"
                            />
                        </div>

                        {error && (
                            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <div className="space-y-3">
                            <button
                                onClick={generateCode}
                                disabled={!selectedCardId || !referenceNumber}
                                className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/70 disabled:cursor-not-allowed disabled:bg-accent/60 sm:px-6 sm:py-3 sm:text-base"
                            >
                                Generate New Code
                            </button>
                        </div>
                    </div>
                )}

                <div className="mt-4 px-2 text-center text-xs text-gray-500 sm:mt-6 sm:text-sm">
                    <p>
                        Customer should open their app and scan the QR code or
                        enter the code manually.
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
