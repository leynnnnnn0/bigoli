import { BranchAndCardSelectors } from '@/components/branch-card-selectors';
import { CustomerQrScanner } from '@/components/customer-qr-scanner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import type {
    BranchOption,
    LoyaltyCardOption,
    PerkClaim,
    StampCodeRecord,
} from '@/types/stampbayan';
import { cn } from '@/lib/utils';
import { Head, router } from '@inertiajs/react';
import {
    Award,
    Calendar,
    Check,
    CreditCard,
    Eye,
    Gift,
    History,
    Home,
    LogOut,
    MapPin,
    QrCode,
    Search,
    Sparkles,
    Undo2,
    User,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import LOGO from '../../../../images/mainLogo.png';

interface Props {
    code?: {
        success: boolean;
        code: string;
        qr_url: string;
        created_at: string;
    };
    cards?: LoyaltyCardOption[];
    branches?: BranchOption[];
    loyalty_card_id?: string;
    branch_id?: string;
    perkClaims?: PerkClaim[];
    stampCodes?: StampCodeRecord[];
    stats?: {
        total: number;
        available: number;
        redeemed: number;
    };
    reference_number?: string;
}

const tabItems = [
    { id: 'issue-stamp', label: 'Issue', desktopLabel: 'Issue Stamp', icon: Home },
    { id: 'perk-claims', label: 'Rewards', desktopLabel: 'Perk Claims', icon: Gift },
    { id: 'stamp-codes', label: 'Codes', desktopLabel: 'Stamp Codes', icon: History },
] as const;

type StaffTab = (typeof tabItems)[number]['id'];

function StaffStatCard({
    label,
    value,
    icon: Icon,
    tone,
}: {
    label: string;
    value: number;
    icon: typeof Award;
    tone: 'blue' | 'green' | 'violet';
}) {
    const tones = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        violet: 'bg-violet-50 text-violet-600',
    };

    return (
        <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-gray-100 sm:p-5">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-semibold tracking-wide text-gray-400 uppercase sm:text-xs">
                        {label}
                    </p>
                    <p className="mt-1 text-2xl font-bold text-gray-900 sm:mt-2 sm:text-3xl">
                        {value}
                    </p>
                </div>
                <div
                    className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12 sm:rounded-2xl',
                        tones[tone],
                    )}
                >
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
            </div>
        </div>
    );
}

function SectionShell({
    title,
    description,
    icon: Icon,
    children,
}: {
    title: string;
    description?: string;
    icon: typeof Award;
    children: ReactNode;
}) {
    return (
        <Card className="overflow-hidden border-0 bg-white shadow-sm ring-1 ring-gray-100 sm:rounded-2xl">
            <CardHeader className="border-b border-gray-100 px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-base font-bold text-gray-900">
                            {title}
                        </CardTitle>
                        {description && (
                            <CardDescription className="text-sm text-gray-400">
                                {description}
                            </CardDescription>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-5 p-5">{children}</CardContent>
        </Card>
    );
}

function EmptyState({
    icon: Icon,
    title,
    description,
}: {
    icon: typeof Award;
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-gray-100">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50">
                <Icon className="h-7 w-7 text-gray-300" />
            </div>
            <h3 className="font-bold text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-400">{description}</p>
        </div>
    );
}

export default function Index({
    code,
    cards = [],
    branches = [],
    loyalty_card_id,
    branch_id,
    reference_number,
    perkClaims = [],
    stampCodes = [],
    stats,
}: Props) {
    const [referenceNumber, setReferenceNumber] = useState<string>(
        reference_number ?? '',
    );

    const [loading, setLoading] = useState(false);
    const [selectedBranchId, setSelectedBranchId] = useState<string>(
        branch_id ?? '',
    );
    const [selectedCardId, setSelectedCardId] = useState<string>(
        loyalty_card_id?.toString() ||
            (cards.length > 0 ? cards[0].id.toString() : ''),
    );
    const [error, setError] = useState<string | null>(null);

    // Perk Claims state
    const [selectedClaim, setSelectedClaim] = useState<PerkClaim | null>(null);
    const [redeemDialogOpen, setRedeemDialogOpen] = useState(false);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [remarks, setRemarks] = useState('');
    const [processing, setProcessing] = useState(false);
    const [perkSearch, setPerkSearch] = useState('');

    // Stamp Codes state
    const [codeSearch, setCodeSearch] = useState('');
    const [activeTab, setActiveTab] = useState<StaffTab>('issue-stamp');

    // When branch changes, reload so server returns filtered cards
    const handleBranchChange = (value: string) => {
        setSelectedBranchId(value);
        setSelectedCardId('');
        router.get(
            '/staff/dashboard',
            { branch_id: value },
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
        router.get('/staff/dashboard', {
            loyalty_card_id: selectedCardId,
            branch_id: selectedBranchId || undefined,
            reference_number: referenceNumber, // ← add
        });
        setLoading(false);
    };

    const generateNewCode = generateCode;

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleViewDetails = (claim: PerkClaim) => {
        setSelectedClaim(claim);
        setDetailDialogOpen(true);
    };

    const handleRedeemClick = (claim: PerkClaim) => {
        setSelectedClaim(claim);
        setRemarks('');
        setRedeemDialogOpen(true);
    };

    const handleMarkAsRedeemed = () => {
        if (!selectedClaim) return;
        setProcessing(true);
        router.post(
            `/staff/perk-claims/${selectedClaim.id}/redeem`,
            { remarks },
            {
                onSuccess: () => {
                    toast.success('Perk marked as redeemed successfully!');
                    setRedeemDialogOpen(false);
                    setRemarks('');
                    setSelectedClaim(null);
                },
                onError: () => {
                    toast.error('Failed to mark perk as redeemed.');
                },
                onFinish: () => {
                    setProcessing(false);
                },
            },
        );
    };

    const handleUndoRedeem = (claim: PerkClaim) => {
        if (!confirm('Are you sure you want to undo this redemption?')) return;
        router.post(
            `/staff/perk-claims/${claim.id}/undo`,
            {},
            {
                onSuccess: () => {
                    toast.success('Redemption undone successfully!');
                },
                onError: () => {
                    toast.error('Failed to undo redemption.');
                },
            },
        );
    };

    const handleLogout = () => {
        router.post('/staff/logout');
    };

    const getStatusBadge = (stampCode: StampCodeRecord) => {
        if (stampCode.is_expired) {
            return <Badge className="bg-red-500 text-white">Expired</Badge>;
        }
        if (stampCode.used_at) {
            return <Badge className="bg-green-500 text-white">Used</Badge>;
        }
        return <Badge variant="default">Active</Badge>;
    };

    const filteredPerkClaims = perkClaims.filter(
        (claim) =>
            claim.customer.username
                .toLowerCase()
                .includes(perkSearch.toLowerCase()) ||
            claim.perk.reward
                .toLowerCase()
                .includes(perkSearch.toLowerCase()) ||
            claim.loyalty_card.name
                .toLowerCase()
                .includes(perkSearch.toLowerCase()),
    );

    const filteredStampCodes = stampCodes.filter(
        (code) =>
            code.code.toLowerCase().includes(codeSearch.toLowerCase()) ||
            code.customer?.username
                .toLowerCase()
                .includes(codeSearch.toLowerCase()) ||
            code.loyalty_card.name
                .toLowerCase()
                .includes(codeSearch.toLowerCase()),
    );

    const branchAndCardSelectors = (
        <BranchAndCardSelectors
            branches={branches}
            cards={cards}
            selectedBranchId={selectedBranchId}
            selectedCardId={selectedCardId}
            onBranchChange={handleBranchChange}
            onCardChange={setSelectedCardId}
            tone="staff"
        />
    );
    const selectedBranch = branches.find(
        (branch) => branch.id.toString() === selectedBranchId,
    );

    return (
        <>
            <Head title="Staff Dashboard" />

            <div className="flex min-h-screen flex-col bg-gray-50">
                <header className="sticky top-0 z-40 border-b border-gray-100 bg-white shadow-sm">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6">
                        <div className="flex items-center gap-8">
                            <img
                                src={LOGO}
                                alt="business logo"
                                className="h-10 w-auto"
                            />
                            <nav className="hidden gap-8 sm:flex">
                                {tabItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={cn(
                                            'border-b-2 pb-1 text-sm font-semibold transition-colors',
                                            activeTab === item.id
                                                ? 'border-primary text-primary'
                                                : 'border-transparent text-gray-500 hover:text-gray-900',
                                        )}
                                    >
                                        {item.desktopLabel}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        <div className="flex items-center gap-3">
                            {selectedBranch && (
                                <div className="hidden items-center gap-2 rounded-full bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-600 ring-1 ring-gray-100 sm:flex">
                                    <MapPin className="h-3.5 w-3.5 text-primary" />
                                    <span>{selectedBranch.name}</span>
                                </div>
                            )}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200">
                                        <User className="h-5 w-5 text-gray-600" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>
                                        Staff Account
                                    </DropdownMenuLabel>
                                    {selectedBranch && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuLabel className="flex items-center gap-2 text-xs font-normal text-gray-500">
                                                <MapPin className="h-3.5 w-3.5" />
                                                {selectedBranch.name}
                                            </DropdownMenuLabel>
                                        </>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="mx-auto w-full max-w-7xl flex-1 px-0 pb-24 sm:px-6 sm:py-8 sm:pb-8">
                    {/* Tabs Section */}
                    <Tabs
                        value={activeTab}
                        onValueChange={(value) =>
                            setActiveTab(value as StaffTab)
                        }
                        className="space-y-4 px-4 pt-4 sm:px-0 sm:pt-0"
                    >
                        <TabsList className="hidden w-full grid-cols-3 rounded-2xl bg-white p-1 shadow-sm ring-1 ring-gray-100 sm:grid">
                            {tabItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <TabsTrigger
                                        key={item.id}
                                        value={item.id}
                                        className="flex items-center gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white"
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span>{item.desktopLabel}</span>
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>

                        {/* ISSUE STAMP TAB */}
                        <TabsContent value="issue-stamp" className="space-y-6">
                            {!code?.success ? (
                                <SectionShell
                                    title="Generate Stamp Code"
                                    description="Create a one-time code for the customer to scan or enter."
                                    icon={QrCode}
                                >
                                    {branchAndCardSelectors}

                                    <div>
                                        <Label className="mb-2 block text-sm font-semibold text-gray-700">
                                            Reference Number
                                        </Label>
                                        <Input
                                            type="text"
                                            value={referenceNumber}
                                            onChange={(e) =>
                                                setReferenceNumber(
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Enter receipt or order reference"
                                            className="h-12 rounded-xl border-gray-200 bg-gray-50"
                                        />
                                    </div>

                                    {error && (
                                        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
                                            <span className="font-semibold">
                                                Error:
                                            </span>{' '}
                                            {error}
                                        </div>
                                    )}

                                    <Button
                                        onClick={generateCode}
                                        disabled={
                                            loading ||
                                            cards.length === 0 ||
                                            !selectedCardId ||
                                            !referenceNumber
                                        }
                                        className="h-12 rounded-xl bg-primary text-white hover:bg-primary/80 w-full"
                                    >
                                        <QrCode className="mr-2 h-5 w-5" />
                                        {loading
                                            ? 'Generating...'
                                            : 'Generate Code'}
                                    </Button>
                                    <CustomerQrScanner
                                        endpoint="/staff/scan-customer"
                                        data={{ loyalty_card_id: selectedCardId, reference_number: referenceNumber }}
                                        disabled={!selectedCardId || !referenceNumber}
                                    />
                                </SectionShell>
                            ) : (
                                <SectionShell
                                    title="Code Generated"
                                    description={`Generated on ${code?.created_at}`}
                                    icon={Check}
                                >
                                    <div className="rounded-2xl bg-gray-50 p-4 ring-1 ring-gray-100">
                                        <div className="flex flex-col items-center">
                                            <img
                                                src={code?.qr_url}
                                                alt="QR Code"
                                                className="aspect-square w-full max-w-72 rounded-2xl bg-white p-3 shadow-sm"
                                            />
                                            <div className="mt-5 text-center">
                                                <p className="mb-2 text-sm text-gray-500">
                                                    Manual code
                                                </p>
                                                <div className="inline-block rounded-2xl bg-white px-6 py-3 shadow-sm ring-1 ring-gray-100">
                                                    <p className="font-mono text-2xl font-bold tracking-wider text-gray-900 sm:text-3xl">
                                                        {code?.code}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-yellow-100 bg-yellow-50 p-4 text-sm text-yellow-800">
                                        This code expires in 15 minutes if it is
                                        not used.
                                    </div>

                                    {branchAndCardSelectors}

                                    <div>
                                        <Label className="mb-2 block text-sm font-semibold text-gray-700">
                                            Reference Number
                                        </Label>
                                        <Input
                                            type="text"
                                            value={referenceNumber}
                                            onChange={(e) =>
                                                setReferenceNumber(
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Enter receipt or order reference"
                                            className="h-12 rounded-xl border-gray-200 bg-gray-50"
                                        />
                                    </div>

                                    {error && (
                                        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
                                            <span className="font-semibold">
                                                Error:
                                            </span>{' '}
                                            {error}
                                        </div>
                                    )}

                                    <Button
                                        onClick={generateNewCode}
                                        disabled={
                                            !selectedCardId || !referenceNumber
                                        }
                                        className="h-12 rounded-xl bg-primary text-white hover:bg-primary/80"
                                    >
                                        <QrCode className="mr-2 h-5 w-5" />
                                        Generate New
                                    </Button>
                                    <CustomerQrScanner
                                        endpoint="/staff/scan-customer"
                                        data={{ loyalty_card_id: selectedCardId, reference_number: referenceNumber }}
                                        disabled={!selectedCardId || !referenceNumber}
                                    />
                                </SectionShell>
                            )}
                        </TabsContent>

                        {/* PERK CLAIMS TAB */}
                        <TabsContent value="perk-claims" className="space-y-6">
                            <div className="grid grid-cols-3 gap-2 sm:gap-4">
                                <StaffStatCard
                                    label="Total Claims"
                                    value={stats?.total || 0}
                                    icon={Award}
                                    tone="blue"
                                />
                                <StaffStatCard
                                    label="Available"
                                    value={stats?.available || 0}
                                    icon={Sparkles}
                                    tone="green"
                                />
                                <StaffStatCard
                                    label="Redeemed"
                                    value={stats?.redeemed || 0}
                                    icon={Check}
                                    tone="violet"
                                />
                            </div>

                            <SectionShell
                                title="Customer Perk Claims"
                                description="Review available rewards and mark redemptions."
                                icon={Award}
                            >
                                    <div className="relative">
                                        <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                                        <Input
                                            type="text"
                                            placeholder="Search by customer, reward, or card..."
                                            value={perkSearch}
                                            onChange={(e) =>
                                                setPerkSearch(e.target.value)
                                            }
                                            className="h-12 rounded-xl border-gray-200 bg-gray-50 pl-10"
                                        />
                                    </div>

                                    {/* Desktop Table */}
                                    <div className="hidden overflow-x-auto rounded-2xl border border-gray-100 lg:block">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-gray-50/80">
                                                    <TableHead className="font-semibold">
                                                        Customer
                                                    </TableHead>
                                                    <TableHead className="font-semibold">
                                                        Reward
                                                    </TableHead>
                                                    <TableHead className="font-semibold">
                                                        Card
                                                    </TableHead>
                                                    <TableHead className="font-semibold">
                                                        Status
                                                    </TableHead>
                                                    <TableHead className="font-semibold">
                                                        Actions
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredPerkClaims.length >
                                                0 ? (
                                                    filteredPerkClaims.map(
                                                        (claim) => (
                                                            <TableRow
                                                                key={claim.id}
                                                                className="hover:bg-gray-50/80"
                                                            >
                                                                <TableCell>
                                                                    <div className="font-medium">
                                                                        {
                                                                            claim
                                                                                .customer
                                                                                .username
                                                                        }
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">
                                                                        {
                                                                            claim
                                                                                .customer
                                                                                .email
                                                                        }
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="font-medium">
                                                                    {
                                                                        claim
                                                                            .perk
                                                                            .reward
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
                                                                    {
                                                                        claim
                                                                            .loyalty_card
                                                                            .name
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
                                                                    {claim.is_redeemed ? (
                                                                        <Badge className="bg-gray-500">
                                                                            Redeemed
                                                                        </Badge>
                                                                    ) : (
                                                                        <Badge className="bg-green-500">
                                                                            Available
                                                                        </Badge>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex gap-2">
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            onClick={() =>
                                                                                handleViewDetails(
                                                                                    claim,
                                                                                )
                                                                            }
                                                                        >
                                                                            <Eye className="h-4 w-4" />
                                                                        </Button>
                                                                        {!claim.is_redeemed ? (
                                                                            <Button
                                                                                size="sm"
                                                                                onClick={() =>
                                                                                    handleRedeemClick(
                                                                                        claim,
                                                                                    )
                                                                                }
                                                                                className="bg-green-600 hover:bg-green-700"
                                                                            >
                                                                                <Check className="h-4 w-4" />
                                                                            </Button>
                                                                        ) : (
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                onClick={() =>
                                                                                    handleUndoRedeem(
                                                                                        claim,
                                                                                    )
                                                                                }
                                                                            >
                                                                                <Undo2 className="h-4 w-4" />
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        ),
                                                    )
                                                ) : (
                                                    <TableRow>
                                                        <TableCell
                                                            colSpan={5}
                                                            className="py-12 text-center text-gray-500"
                                                        >
                                                            <Award className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                                                            <p>No perk claims found.</p>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Mobile Cards */}
                                    <div className="space-y-4 lg:hidden">
                                        {filteredPerkClaims.length > 0 ? (
                                            filteredPerkClaims.map((claim) => (
                                                <Card
                                                    key={claim.id}
                                                    className="border-0 shadow-sm ring-1 ring-gray-100"
                                                >
                                                    <CardContent className="space-y-3 p-4">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <p className="text-base font-semibold">
                                                                    {
                                                                        claim
                                                                            .customer
                                                                            .username
                                                                    }
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {
                                                                        claim
                                                                            .customer
                                                                            .email
                                                                    }
                                                                </p>
                                                            </div>
                                                            {claim.is_redeemed ? (
                                                                <Badge className="bg-gray-500">
                                                                    Redeemed
                                                                </Badge>
                                                            ) : (
                                                                <Badge className="bg-green-500">
                                                                    Available
                                                                </Badge>
                                                            )}
                                                        </div>

                                                        <div className="space-y-2 text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <Award className="h-4 w-4 text-gray-400" />
                                                                <span className="font-medium">
                                                                    {
                                                                        claim
                                                                            .perk
                                                                            .reward
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <CreditCard className="h-4 w-4 text-gray-400" />
                                                                <span>
                                                                    {
                                                                        claim
                                                                            .loyalty_card
                                                                            .name
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Sparkles className="h-4 w-4 text-gray-400" />
                                                                <span>
                                                                    {
                                                                        claim.stamps_at_claim
                                                                    }{' '}
                                                                    stamps
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="flex gap-2 pt-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    handleViewDetails(
                                                                        claim,
                                                                    )
                                                                }
                                                                className="flex-1"
                                                            >
                                                                <Eye className="mr-1 h-4 w-4" />
                                                                Details
                                                            </Button>
                                                            {!claim.is_redeemed ? (
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        handleRedeemClick(
                                                                            claim,
                                                                        )
                                                                    }
                                                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                                                >
                                                                    <Check className="mr-1 h-4 w-4" />
                                                                    Redeem
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() =>
                                                                        handleUndoRedeem(
                                                                            claim,
                                                                        )
                                                                    }
                                                                    className="flex-1"
                                                                >
                                                                    <Undo2 className="mr-1 h-4 w-4" />
                                                                    Undo
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))
                                        ) : (
                                            <EmptyState
                                                icon={Award}
                                                title="No perk claims"
                                                description="Unlocked customer rewards will appear here."
                                            />
                                        )}
                                    </div>
                            </SectionShell>
                        </TabsContent>

                        {/* STAMP CODES TAB */}
                        <TabsContent value="stamp-codes" className="space-y-6">
                            <SectionShell
                                title="Stamp Code History"
                                description="Search recent codes and customer usage."
                                icon={History}
                            >
                                    <div className="relative">
                                        <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                                        <Input
                                            type="text"
                                            placeholder="Search stamp codes or customers..."
                                            value={codeSearch}
                                            onChange={(e) =>
                                                setCodeSearch(e.target.value)
                                            }
                                            className="h-12 rounded-xl border-gray-200 bg-gray-50 pl-10"
                                        />
                                    </div>

                                    {/* Desktop Table */}
                                    <div className="hidden overflow-x-auto rounded-2xl border border-gray-100 lg:block">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-gray-50/80">
                                                    <TableHead className="font-semibold">
                                                        Card
                                                    </TableHead>
                                                    <TableHead className="font-semibold">
                                                        Code
                                                    </TableHead>
                                                    <TableHead className="font-semibold">
                                                        Customer
                                                    </TableHead>
                                                    <TableHead className="font-semibold">
                                                        Status
                                                    </TableHead>
                                                    <TableHead className="font-semibold">
                                                        Created
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredStampCodes.length >
                                                0 ? (
                                                    filteredStampCodes.map(
                                                        (stampCode) => (
                                                            <TableRow
                                                                key={
                                                                    stampCode.id
                                                                }
                                                                className="hover:bg-gray-50/80"
                                                            >
                                                                <TableCell className="font-medium">
                                                                    {
                                                                        stampCode
                                                                            .loyalty_card
                                                                            .name
                                                                    }
                                                                </TableCell>
                                                                <TableCell className="font-mono text-sm">
                                                                    {
                                                                        stampCode.code
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
                                                                    {stampCode.customer ? (
                                                                        <div>
                                                                            <div className="font-medium">
                                                                                {
                                                                                    stampCode
                                                                                        .customer
                                                                                        .username
                                                                                }
                                                                            </div>
                                                                            <div className="text-xs text-gray-500">
                                                                                {
                                                                                    stampCode
                                                                                        .customer
                                                                                        .email
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-gray-400">
                                                                            Unassigned
                                                                        </span>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {getStatusBadge(
                                                                        stampCode,
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="text-sm">
                                                                    {formatDate(
                                                                        stampCode.created_at,
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        ),
                                                    )
                                                ) : (
                                                    <TableRow>
                                                        <TableCell
                                                            colSpan={5}
                                                            className="py-12 text-center text-gray-500"
                                                        >
                                                            <History className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                                                            <p>
                                                                No stamp codes
                                                                found.
                                                            </p>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Mobile Cards */}
                                    <div className="space-y-4 lg:hidden">
                                        {filteredStampCodes.length > 0 ? (
                                            filteredStampCodes.map(
                                                (stampCode) => (
                                                    <Card
                                                        key={stampCode.id}
                                                        className="border-0 shadow-sm ring-1 ring-gray-100"
                                                    >
                                                        <CardContent className="space-y-3 p-4">
                                                            <div className="flex items-start justify-between">
                                                                <div>
                                                                    <p className="font-mono text-base font-semibold">
                                                                        {
                                                                            stampCode.code
                                                                        }
                                                                    </p>
                                                                    <p className="mt-1 text-xs text-gray-500">
                                                                        {
                                                                            stampCode
                                                                                .loyalty_card
                                                                                .name
                                                                        }
                                                                    </p>
                                                                </div>
                                                                {getStatusBadge(
                                                                    stampCode,
                                                                )}
                                                            </div>

                                                            <div className="space-y-2 text-sm">
                                                                {stampCode.customer ? (
                                                                    <div>
                                                                        <div className="mb-1 flex items-center gap-2">
                                                                            <User className="h-4 w-4 text-gray-400" />
                                                                            <span className="font-medium">
                                                                                {
                                                                                    stampCode
                                                                                        .customer
                                                                                        .username
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                        <p className="ml-6 text-xs text-gray-500">
                                                                            {
                                                                                stampCode
                                                                                    .customer
                                                                                    .email
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-2">
                                                                        <User className="h-4 w-4 text-gray-400" />
                                                                        <span className="text-gray-400">
                                                                            Unassigned
                                                                        </span>
                                                                    </div>
                                                                )}

                                                                <div className="flex items-center gap-2">
                                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                                    <span>
                                                                        {formatDate(
                                                                            stampCode.created_at,
                                                                        )}
                                                                    </span>
                                                                </div>

                                                                {stampCode.used_at && (
                                                                    <div className="flex items-center gap-2">
                                                                        <Check className="h-4 w-4 text-gray-400" />
                                                                        <span>
                                                                            Used:{' '}
                                                                            {formatDate(
                                                                                stampCode.used_at,
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ),
                                            )
                                        ) : (
                                            <EmptyState
                                                icon={History}
                                                title="No stamp codes"
                                                description="Generated stamp codes will appear here."
                                            />
                                        )}
                                    </div>
                            </SectionShell>
                        </TabsContent>
                    </Tabs>
                </main>

                <nav className="fixed right-0 bottom-0 left-0 z-50 border-t border-gray-100 bg-white px-2 sm:hidden">
                    <div className="flex items-center justify-around">
                        {tabItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={cn(
                                        'flex flex-1 flex-col items-center gap-0.5 px-3 py-3 transition-colors',
                                        isActive
                                            ? 'text-primary'
                                            : 'text-gray-400',
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'relative rounded-xl p-1.5 transition-all',
                                            isActive && 'bg-primary/10',
                                        )}
                                    >
                                        <Icon className="h-5 w-5" />
                                        {item.id === 'perk-claims' &&
                                            (stats?.available || 0) > 0 && (
                                                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                                                    {stats?.available}
                                                </span>
                                            )}
                                    </div>
                                    <span className="text-[10px] font-semibold">
                                        {item.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </nav>
            </div>

            {/* Dialogs */}
            <Dialog open={redeemDialogOpen} onOpenChange={setRedeemDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Mark as Redeemed</DialogTitle>
                        <DialogDescription>
                            Confirm that this perk has been redeemed by the
                            customer.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedClaim && (
                        <div className="space-y-4">
                            <div className="space-y-2 rounded-lg bg-gray-50 p-4">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">
                                        Customer:
                                    </span>
                                    <span className="font-medium">
                                        {selectedClaim.customer.username}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">
                                        Reward:
                                    </span>
                                    <span className="font-medium">
                                        {selectedClaim.perk.reward}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="remarks">
                                    Remarks (Optional)
                                </Label>
                                <Textarea
                                    id="remarks"
                                    placeholder="Add any notes..."
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setRedeemDialogOpen(false)}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleMarkAsRedeemed}
                            disabled={processing}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {processing ? 'Processing...' : 'Mark as Redeemed'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl">
                            Perk Claim Details
                        </DialogTitle>
                    </DialogHeader>
                    {selectedClaim && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-lg bg-gray-50 p-4">
                                    <p className="mb-1 text-xs text-gray-600">
                                        Customer
                                    </p>
                                    <p className="text-lg font-semibold">
                                        {selectedClaim.customer.username}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {selectedClaim.customer.email}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-gray-50 p-4">
                                    <p className="mb-1 text-xs text-gray-600">
                                        Status
                                    </p>
                                    {selectedClaim.is_redeemed ? (
                                        <Badge className="mt-1 bg-gray-500">
                                            Redeemed
                                        </Badge>
                                    ) : (
                                        <Badge className="mt-1 bg-green-500">
                                            Available
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                <p className="mb-1 text-xs font-semibold text-blue-600">
                                    REWARD
                                </p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {selectedClaim.perk.reward}
                                </p>
                                {selectedClaim.perk.details && (
                                    <p className="mt-1 text-sm text-gray-600">
                                        {selectedClaim.perk.details}
                                    </p>
                                )}
                            </div>

                            <div className="rounded-lg bg-gray-50 p-4">
                                <p className="mb-1 text-xs text-gray-600">
                                    Loyalty Card
                                </p>
                                <div className="mt-1 flex items-center gap-2">
                                    {selectedClaim.loyalty_card.logo && (
                                        <img
                                            src={`/${selectedClaim.loyalty_card.logo}`}
                                            alt={
                                                selectedClaim.loyalty_card.name
                                            }
                                            className="h-10 w-10 rounded-full object-cover"
                                        />
                                    )}
                                    <span className="font-semibold">
                                        {selectedClaim.loyalty_card.name}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-lg bg-gray-50 p-4">
                                    <p className="mb-1 text-xs text-gray-600">
                                        Stamps at Claim
                                    </p>
                                    <p className="text-2xl font-semibold">
                                        {selectedClaim.stamps_at_claim}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-gray-50 p-4">
                                    <p className="mb-1 text-xs text-gray-600">
                                        Claimed At
                                    </p>
                                    <p className="text-sm font-semibold">
                                        {formatDate(selectedClaim.created_at)}
                                    </p>
                                </div>
                            </div>

                            {selectedClaim.is_redeemed && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                            <p className="mb-1 text-xs font-semibold text-green-600">
                                                Redeemed At
                                            </p>
                                            <p className="text-sm font-semibold">
                                                {selectedClaim.redeemed_at
                                                    ? formatDate(
                                                          selectedClaim.redeemed_at,
                                                      )
                                                    : 'N/A'}
                                            </p>
                                        </div>
                                        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                            <p className="mb-1 text-xs font-semibold text-green-600">
                                                Redeemed By
                                            </p>
                                            <p className="text-sm font-semibold">
                                                {selectedClaim.redeemed_by
                                                    ?.username || 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    {selectedClaim.remarks && (
                                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                                            <p className="mb-1 text-xs font-semibold text-yellow-600">
                                                REMARKS
                                            </p>
                                            <p className="text-sm text-gray-700">
                                                {selectedClaim.remarks}
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDetailDialogOpen(false)}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
