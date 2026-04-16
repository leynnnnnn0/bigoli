import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import { Head, router } from '@inertiajs/react';
import {
    Award,
    Calendar,
    Check,
    Eye,
    LogOut,
    MapPin,
    Menu,
    QrCode,
    Search,
    Sparkles,
    Ticket,
    Undo2,
    User,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import LOGO from '../../../../images/mainLogo.png';

interface StampCode {
    code: string;
    qr_url: string;
    created_at: string;
}

interface LoyaltyCard {
    id: number;
    name: string;
    logo?: string;
}

interface Branch {
    id: number;
    name: string;
}

interface PerkClaim {
    id: number;
    customer_id: number;
    loyalty_card_id: number;
    perk_id: number;
    stamps_at_claim: number;
    is_redeemed: boolean;
    redeemed_at: string | null;
    remarks: string | null;
    created_at: string;
    customer: {
        id: number;
        username: string;
        email: string;
    };
    perk: {
        id: number;
        reward: string;
        details: string | null;
        stampNumber: number;
    };
    loyalty_card: {
        id: number;
        name: string;
        logo: string | null;
    };
    redeemed_by?: {
        id: number;
        username: string;
    };
}

interface StampCodeRecord {
    id: number;
    code: string;
    customer: {
        username: string;
        email: string;
    } | null;
    used_at: string | null;
    is_expired: boolean;
    created_at: string;
    loyalty_card: {
        name: string;
    };
}

interface Props {
    code?: {
        success: boolean;
        code: string;
        qr_url: string;
        created_at: string;
    };
    cards?: LoyaltyCard[];
    branches?: Branch[];
    loyalty_card_id?: string;
    branch_id?: string;
    perkClaims?: PerkClaim[];
    stampCodes?: StampCodeRecord[];
    stats?: {
        total: number;
        available: number;
        redeemed: number;
    };
}

export default function Index({
    code,
    cards = [],
    branches = [],
    loyalty_card_id,
    branch_id,
    perkClaims = [],
    stampCodes = [],
    stats,
}: Props) {
    const [loading, setLoading] = useState(false);
    const [downloadingOffline, setDownloadingOffline] = useState(false);
    const [selectedBranchId, setSelectedBranchId] = useState<string>(
        branch_id ?? '',
    );
    const [selectedCardId, setSelectedCardId] = useState<string>(
        loyalty_card_id?.toString() ||
            (cards.length > 0 ? cards[0].id.toString() : ''),
    );
    const [error, setError] = useState<string | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Perk Claims state
    const [selectedClaim, setSelectedClaim] = useState<PerkClaim | null>(null);
    const [redeemDialogOpen, setRedeemDialogOpen] = useState(false);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [remarks, setRemarks] = useState('');
    const [processing, setProcessing] = useState(false);
    const [perkSearch, setPerkSearch] = useState('');

    // Stamp Codes state
    const [codeSearch, setCodeSearch] = useState('');
    const [activeTab, setActiveTab] = useState('issue-stamp');

    useEffect(() => {
        if (loyalty_card_id) setSelectedCardId(loyalty_card_id.toString());
    }, [loyalty_card_id]);

    useEffect(() => {
        if (branch_id) setSelectedBranchId(branch_id);
    }, [branch_id]);

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
        setLoading(true);
        setError(null);
        router.get('/staff/dashboard', {
            loyalty_card_id: selectedCardId,
            branch_id: selectedBranchId || undefined,
        });
        setLoading(false);
    };

    const generateNewCode = generateCode;

    const downloadOfflineStamps = async () => {
        if (!selectedCardId) {
            setError('Please select a loyalty card');
            return;
        }
        setDownloadingOffline(true);
        setError(null);
        try {
            const params = new URLSearchParams({ id: selectedCardId });
            if (selectedBranchId) params.append('branch_id', selectedBranchId);
            const response = await fetch(
                `/staff/generate-offline?${params.toString()}`,
                {
                    method: 'GET',
                    headers: { Accept: 'application/pdf' },
                },
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

    // Reusable branch + card selectors (mirrors Business Issue Stamp page)
    const BranchAndCardSelectors = () => (
        <div className="space-y-4">
            {/* Branch Selector — only shown if staff has a branch assigned */}
            {branches.length > 0 && (
                <div>
                    <Label className="mb-2 block text-sm font-semibold text-gray-700">
                        <span className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4" />
                            Branch
                        </span>
                    </Label>
                    <Select
                        value={selectedBranchId}
                        onValueChange={handleBranchChange}
                    >
                        <SelectTrigger className="h-12 w-full">
                            <SelectValue placeholder="Select your branch" />
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
                    <p className="mt-1 text-xs text-gray-400">
                        {selectedBranchId
                            ? 'Showing cards available at this branch and cards available everywhere.'
                            : 'Showing cards available at all branches.'}
                    </p>
                </div>
            )}

            {/* Loyalty Card Selector */}
            <div>
                <Label className="mb-2 block text-sm font-semibold text-gray-700">
                    Select Loyalty Card
                </Label>
                {cards.length > 0 ? (
                    <Select
                        value={selectedCardId}
                        onValueChange={setSelectedCardId}
                    >
                        <SelectTrigger className="h-12 w-full">
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
                        No loyalty cards available
                        {branches.length > 0
                            ? ' for the selected branch.'
                            : '. Contact administrator.'}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <>
            <Head title="Staff Dashboard" />

            <div className="min-h-screen bg-white">
                {/* Top Navigation */}
                <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-center gap-3">
                                <img
                                    src={LOGO}
                                    alt="business logo"
                                    className="h-12"
                                />
                            </div>

                            {/* Desktop Navigation */}
                            <div className="hidden items-center gap-4 md:flex">
                                {/* Show assigned branch badge in nav */}
                                {branches.length > 0 && selectedBranchId && (
                                    <div className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-600">
                                        <MapPin className="h-3.5 w-3.5 text-blue-500" />
                                        <span>
                                            {
                                                branches.find(
                                                    (b) =>
                                                        b.id.toString() ===
                                                        selectedBranchId,
                                                )?.name
                                            }
                                        </span>
                                    </div>
                                )}
                                <Button
                                    variant="ghost"
                                    onClick={handleLogout}
                                    className="flex items-center gap-2"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </Button>
                            </div>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() =>
                                    setMobileMenuOpen(!mobileMenuOpen)
                                }
                                className="rounded-lg p-2 hover:bg-gray-100 md:hidden"
                            >
                                {mobileMenuOpen ? (
                                    <X className="h-6 w-6" />
                                ) : (
                                    <Menu className="h-6 w-6" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="border-t border-gray-200 bg-white md:hidden">
                            <div className="space-y-2 px-4 py-3">
                                {branches.length > 0 && selectedBranchId && (
                                    <div className="flex items-center gap-2 py-2 text-sm text-gray-600">
                                        <MapPin className="h-4 w-4 text-blue-500" />
                                        <span>
                                            Branch:{' '}
                                            {
                                                branches.find(
                                                    (b) =>
                                                        b.id.toString() ===
                                                        selectedBranchId,
                                                )?.name
                                            }
                                        </span>
                                    </div>
                                )}
                                <Button
                                    variant="ghost"
                                    onClick={handleLogout}
                                    className="w-full justify-start gap-2"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </Button>
                            </div>
                        </div>
                    )}
                </nav>

                {/* Main Content */}
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Welcome Section */}
                    <div className="mb-8">
                        <h2 className="mb-2 text-3xl font-bold text-gray-900">
                            Welcome Back! 👋
                        </h2>
                        <p className="text-gray-600">
                            Manage customer loyalty and rewards
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="mb-8 hidden grid-cols-1 gap-6 md:grid md:grid-cols-3">
                        <Card className="shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-black">
                                            Total Claims
                                        </p>
                                        <p className="mt-2 text-4xl font-bold">
                                            {stats?.total || 0}
                                        </p>
                                    </div>
                                    <Award className="h-12 w-12 text-blue-200" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-black">
                                            Available
                                        </p>
                                        <p className="mt-2 text-4xl font-bold">
                                            {stats?.available || 0}
                                        </p>
                                    </div>
                                    <Sparkles className="h-12 w-12 text-green-200" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-black">
                                            Redeemed
                                        </p>
                                        <p className="mt-2 text-4xl font-bold">
                                            {stats?.redeemed || 0}
                                        </p>
                                    </div>
                                    <Check className="h-12 w-12 text-purple-200" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tabs Section */}
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="space-y-6"
                    >
                        <TabsList className="grid w-full grid-cols-3 bg-white p-1 shadow-sm">
                            <TabsTrigger
                                value="issue-stamp"
                                className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                            >
                                <QrCode className="h-4 w-4" />
                                <span className="hidden sm:inline">
                                    Issue Stamp
                                </span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="perk-claims"
                                className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white"
                            >
                                <Award className="h-4 w-4" />
                                <span className="hidden sm:inline">
                                    Perk Claims
                                </span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="stamp-codes"
                                className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                            >
                                <Ticket className="h-4 w-4" />
                                <span className="hidden sm:inline">
                                    Stamp Codes
                                </span>
                            </TabsTrigger>
                        </TabsList>

                        {/* ISSUE STAMP TAB */}
                        <TabsContent value="issue-stamp" className="space-y-6">
                            {!code?.success ? (
                                <Card className="border-0 shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <QrCode className="h-5 w-5" />
                                            Generate New Stamp Code
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6 p-6">
                                        <BranchAndCardSelectors />

                                        {error && (
                                            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                                                <span className="font-semibold">
                                                    Error:
                                                </span>{' '}
                                                {error}
                                            </div>
                                        )}

                                        {/* <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <Button
                                                onClick={generateCode}
                                                disabled={
                                                    loading ||
                                                    cards.length === 0 ||
                                                    !selectedCardId
                                                }
                                                className="h-12 bg-primary"
                                            >
                                                <QrCode className="mr-2 h-5 w-5" />
                                                {loading
                                                    ? 'Generating...'
                                                    : 'Generate Code'}
                                            </Button>

                                            <Button
                                                onClick={downloadOfflineStamps}
                                                disabled={
                                                    downloadingOffline ||
                                                    cards.length === 0 ||
                                                    !selectedCardId
                                                }
                                                variant="outline"
                                                className="h-12 border-2"
                                            >
                                                <Ticket className="mr-2 h-5 w-5" />
                                                {downloadingOffline
                                                    ? 'Generating...'
                                                    : 'Download 8 Tickets'}
                                            </Button>
                                        </div>

                                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
                                            <p className="mb-1 font-semibold">
                                                💡 Quick Tip
                                            </p>
                                            <p>
                                                Offline stamps are perfect for
                                                events or areas without
                                                internet. Print 8 tickets at
                                                once!
                                            </p>
                                        </div> */}
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card className="border-0 shadow-lg">
                                    <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500">
                                                <Check className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <CardTitle>
                                                    Code Generated Successfully!
                                                    🎉
                                                </CardTitle>
                                                <p className="mt-1 text-sm text-gray-600">
                                                    Generated on{' '}
                                                    {code?.created_at}
                                                </p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6 p-6">
                                        <div className="rounded-xl border-2 border-gray-200 bg-white p-6">
                                            <div className="flex flex-col items-center">
                                                <img
                                                    src={code?.qr_url}
                                                    alt="QR Code"
                                                    className="h-72 w-72 rounded-lg shadow-lg"
                                                />
                                                <div className="mt-6 text-center">
                                                    <p className="mb-2 text-sm text-gray-600">
                                                        Or enter manually:
                                                    </p>
                                                    <div className="inline-block rounded-lg bg-gray-100 px-8 py-4">
                                                        <p className="font-mono text-3xl font-bold tracking-wider text-gray-900">
                                                            {code?.code}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                                            <p className="mb-1 text-sm font-semibold text-yellow-800">
                                                ⚠️ Important
                                            </p>
                                            <p className="text-sm text-yellow-700">
                                                Code expires in 15 minutes if
                                                unused.
                                            </p>
                                        </div>

                                        <BranchAndCardSelectors />

                                        {error && (
                                            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                                                <span className="font-semibold">
                                                    Error:
                                                </span>{' '}
                                                {error}
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <Button
                                                onClick={generateNewCode}
                                                disabled={!selectedCardId}
                                                className="h-12 bg-gradient-to-r from-blue-600 to-indigo-600"
                                            >
                                                <QrCode className="mr-2 h-5 w-5" />
                                                Generate New
                                            </Button>
                                            {/* <Button
                                                onClick={downloadOfflineStamps}
                                                disabled={
                                                    downloadingOffline ||
                                                    !selectedCardId
                                                }
                                                variant="outline"
                                                className="h-12 border-2"
                                            >
                                                <Ticket className="mr-2 h-5 w-5" />
                                                Download Tickets
                                            </Button> */}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        {/* PERK CLAIMS TAB */}
                        <TabsContent value="perk-claims" className="space-y-6">
                            <Card className="border-0 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Award className="h-5 w-5" />
                                        Customer Perk Claims
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 p-6">
                                    <div className="relative">
                                        <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                                        <Input
                                            type="text"
                                            placeholder="Search by customer, reward, or card..."
                                            value={perkSearch}
                                            onChange={(e) =>
                                                setPerkSearch(e.target.value)
                                            }
                                            className="h-12 pl-10"
                                        />
                                    </div>

                                    {/* Desktop Table */}
                                    <div className="hidden overflow-x-auto rounded-lg border lg:block">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-gray-50">
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
                                                                className="hover:bg-gray-50"
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
                                                            <p>
                                                                No perk claims
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
                                        {filteredPerkClaims.length > 0 ? (
                                            filteredPerkClaims.map((claim) => (
                                                <Card
                                                    key={claim.id}
                                                    className="shadow-md"
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
                                                                <Ticket className="h-4 w-4 text-gray-400" />
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
                                            <div className="py-12 text-center text-gray-500">
                                                <Award className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                                                <p>No perk claims found.</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* STAMP CODES TAB */}
                        <TabsContent value="stamp-codes" className="space-y-6">
                            <Card className="border-0 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Ticket className="h-5 w-5" />
                                        Stamp Code History
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 p-6">
                                    <div className="relative">
                                        <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                                        <Input
                                            type="text"
                                            placeholder="Search stamp codes or customers..."
                                            value={codeSearch}
                                            onChange={(e) =>
                                                setCodeSearch(e.target.value)
                                            }
                                            className="h-12 pl-10"
                                        />
                                    </div>

                                    {/* Desktop Table */}
                                    <div className="hidden overflow-x-auto rounded-lg border lg:block">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-gray-50">
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
                                                                className="hover:bg-gray-50"
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
                                                            <Ticket className="mx-auto mb-3 h-12 w-12 text-gray-300" />
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
                                                        className="shadow-md"
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
                                            <div className="py-12 text-center text-gray-500">
                                                <Ticket className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                                                <p>No stamp codes found.</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
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
