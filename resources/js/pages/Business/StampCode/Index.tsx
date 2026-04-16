import ModuleHeading from '@/components/module-heading';
import Pagination from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import {
    ArrowDownUp,
    ChevronDown,
    ChevronUp,
    Download,
    Eye,
    Filter,
    Search,
    SlidersHorizontal,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Paginated<T> {
    data: T[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface StampCode {
    id: number;
    code: string;
    reference_number: string | null;
    is_offline_code: boolean;
    customer: { username: string; email: string } | null;
    branch: { name: string } | null;
    staff: { email: string } | null;
    user: { email: string } | null;
    used_at: string | null;
    is_expired: boolean;
    created_at: string;
    loyalty_card: { name: string };
}

interface LoyaltyCard {
    id: number;
    name: string;
}
interface Branch {
    id: number;
    name: string;
}

interface Filters {
    search?: string;
    status?: string;
    type?: string;
    loyalty_card_id?: string;
    branch_id?: string;
    assigned?: string;
    date_from?: string;
    date_to?: string;
    used_from?: string;
    used_to?: string;
    sort_by?: string;
    sort_dir?: string;
}

interface Props {
    stampCodes: Paginated<StampCode>;
    loyaltyCards: LoyaltyCard[];
    branches: Branch[];
    filters: Filters;
}

const EMPTY = 'all';

export default function Index({
    stampCodes,
    loyaltyCards,
    branches,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCode, setSelectedCode] = useState<StampCode | null>(null);

    const [status, setStatus] = useState(filters.status || EMPTY);
    const [type, setType] = useState(filters.type || EMPTY);
    const [loyaltyCardId, setLoyaltyCardId] = useState(
        filters.loyalty_card_id || EMPTY,
    );
    const [branchId, setBranchId] = useState(filters.branch_id || EMPTY);
    const [assigned, setAssigned] = useState(filters.assigned || EMPTY);
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [usedFrom, setUsedFrom] = useState(filters.used_from || '');
    const [usedTo, setUsedTo] = useState(filters.used_to || '');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
    const [sortDir, setSortDir] = useState(filters.sort_dir || 'desc');

    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const buildParams = (overrides: Partial<Filters> = {}): Filters => {
        const params: Filters = {};
        const val = (v: string) => (v && v !== EMPTY ? v : undefined);

        if (search) params.search = search;
        if (val(status)) params.status = status;
        if (val(type)) params.type = type;
        if (val(loyaltyCardId)) params.loyalty_card_id = loyaltyCardId;
        if (val(branchId)) params.branch_id = branchId;
        if (val(assigned)) params.assigned = assigned;
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
        if (usedFrom) params.used_from = usedFrom;
        if (usedTo) params.used_to = usedTo;
        params.sort_by = sortBy;
        params.sort_dir = sortDir;

        return { ...params, ...overrides };
    };

    const navigate = (params: Filters) => {
        router.get('/business/stamp-codes', params as Record<string, string>, {
            preserveState: true,
            replace: true,
        });
    };

    // Debounced search
    useEffect(() => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            navigate(buildParams({ search: search || undefined }));
        }, 300);
        return () => {
            if (searchTimeout.current) clearTimeout(searchTimeout.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const applyFilters = () => navigate(buildParams());

    const resetFilters = () => {
        setSearch('');
        setStatus(EMPTY);
        setType(EMPTY);
        setLoyaltyCardId(EMPTY);
        setBranchId(EMPTY);
        setAssigned(EMPTY);
        setDateFrom('');
        setDateTo('');
        setUsedFrom('');
        setUsedTo('');
        setSortBy('created_at');
        setSortDir('desc');
        navigate({});
    };

    const toggleSort = (col: string) => {
        const newDir = sortBy === col && sortDir === 'desc' ? 'asc' : 'desc';
        setSortBy(col);
        setSortDir(newDir);
        navigate(buildParams({ sort_by: col, sort_dir: newDir }));
    };

    const handlePageChange = (url: string | null) => {
        if (url) router.get(url, {}, { preserveState: true });
    };

    const buildExportUrl = () => {
        const params = buildParams();
        const qs = new URLSearchParams(
            Object.fromEntries(
                Object.entries(params).filter(([, v]) => v !== undefined),
            ) as Record<string, string>,
        ).toString();
        return `/business/stamp-codes/export${qs ? '?' + qs : ''}`;
    };

    const activeFilterCount = [
        status !== EMPTY,
        type !== EMPTY,
        loyaltyCardId !== EMPTY,
        branchId !== EMPTY,
        assigned !== EMPTY,
        dateFrom,
        dateTo,
        usedFrom,
        usedTo,
    ].filter(Boolean).length;

    const formatDate = (d: string | null) => {
        if (!d) return 'N/A';
        return new Date(d).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (sc: StampCode) => {
        if (sc.is_expired)
            return <Badge className="bg-red-500 text-white">Expired</Badge>;
        if (sc.used_at)
            return <Badge className="bg-green-500 text-white">Used</Badge>;
        return <Badge variant="default">Active</Badge>;
    };

    const SortIcon = ({ col }: { col: string }) => {
        if (sortBy !== col)
            return (
                <ArrowDownUp className="ml-1 inline h-3 w-3 text-gray-300" />
            );
        return sortDir === 'asc' ? (
            <ChevronUp className="ml-1 inline h-3 w-3" />
        ) : (
            <ChevronDown className="ml-1 inline h-3 w-3" />
        );
    };

    const SortableHead = ({ col, label }: { col: string; label: string }) => (
        <TableHead
            className="cursor-pointer whitespace-nowrap select-none hover:bg-gray-50"
            onClick={() => toggleSort(col)}
        >
            {label}
            <SortIcon col={col} />
        </TableHead>
    );

    return (
        <AppLayout>
            <Head title="Stamp Codes" />
            <ModuleHeading
                title="Stamp Codes"
                description="Manage your issued stamp codes."
            />

            <div className="mt-4 sm:mt-6 sm:px-0">
                {/* Toolbar */}
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search codes, reference numbers, customers..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className="relative gap-2"
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                            <span className="hidden sm:inline">Filters</span>
                            {activeFilterCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                                    {activeFilterCount}
                                </span>
                            )}
                        </Button>
                        <a href={buildExportUrl()}>
                            <Button variant="outline" className="gap-2">
                                <Download className="h-4 w-4" />
                                <span className="hidden sm:inline">Export</span>
                            </Button>
                        </a>
                    </div>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <div className="mb-4 rounded-xl border bg-gray-50 p-4 shadow-sm">
                        <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Filter className="h-4 w-4" />
                                Filters
                                {activeFilterCount > 0 && (
                                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                                        {activeFilterCount} active
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={resetFilters}
                                className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500"
                            >
                                <X className="h-3 w-3" /> Reset all
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {/* Status */}
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                    Status
                                </label>
                                <Select
                                    value={status}
                                    onValueChange={setStatus}
                                >
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={EMPTY}>
                                            All statuses
                                        </SelectItem>
                                        <SelectItem value="active">
                                            Active
                                        </SelectItem>
                                        <SelectItem value="used">
                                            Used
                                        </SelectItem>
                                        <SelectItem value="expired">
                                            Expired
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Type */}
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                    Type
                                </label>
                                <Select value={type} onValueChange={setType}>
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="All types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={EMPTY}>
                                            All types
                                        </SelectItem>
                                        <SelectItem value="online">
                                            Online
                                        </SelectItem>
                                        <SelectItem value="offline">
                                            Offline
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Assignment */}
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                    Assignment
                                </label>
                                <Select
                                    value={assigned}
                                    onValueChange={setAssigned}
                                >
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="All" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={EMPTY}>
                                            All
                                        </SelectItem>
                                        <SelectItem value="assigned">
                                            Assigned
                                        </SelectItem>
                                        <SelectItem value="unassigned">
                                            Unassigned
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Loyalty Card */}
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                    Loyalty Card
                                </label>
                                <Select
                                    value={loyaltyCardId}
                                    onValueChange={setLoyaltyCardId}
                                >
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="All cards" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={EMPTY}>
                                            All cards
                                        </SelectItem>
                                        {loyaltyCards.map((lc) => (
                                            <SelectItem
                                                key={lc.id}
                                                value={String(lc.id)}
                                            >
                                                {lc.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Branch */}
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                    Branch
                                </label>
                                <Select
                                    value={branchId}
                                    onValueChange={setBranchId}
                                >
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="All branches" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={EMPTY}>
                                            All branches
                                        </SelectItem>
                                        {branches.map((b) => (
                                            <SelectItem
                                                key={b.id}
                                                value={String(b.id)}
                                            >
                                                {b.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Sort By */}
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                    Sort By
                                </label>
                                <Select
                                    value={sortBy}
                                    onValueChange={setSortBy}
                                >
                                    <SelectTrigger className="bg-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="created_at">
                                            Created At
                                        </SelectItem>
                                        <SelectItem value="used_at">
                                            Used At
                                        </SelectItem>
                                        <SelectItem value="code">
                                            Code
                                        </SelectItem>
                                        <SelectItem value="is_expired">
                                            Expiry
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Sort Direction */}
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                    Sort Direction
                                </label>
                                <Select
                                    value={sortDir}
                                    onValueChange={setSortDir}
                                >
                                    <SelectTrigger className="bg-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="desc">
                                            Newest First
                                        </SelectItem>
                                        <SelectItem value="asc">
                                            Oldest First
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Created From */}
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                    Created From
                                </label>
                                <Input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) =>
                                        setDateFrom(e.target.value)
                                    }
                                    className="bg-white"
                                />
                            </div>

                            {/* Created To */}
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                    Created To
                                </label>
                                <Input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="bg-white"
                                />
                            </div>

                            {/* Used From */}
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                    Used From
                                </label>
                                <Input
                                    type="date"
                                    value={usedFrom}
                                    onChange={(e) =>
                                        setUsedFrom(e.target.value)
                                    }
                                    className="bg-white"
                                />
                            </div>

                            {/* Used To */}
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                    Used To
                                </label>
                                <Input
                                    type="date"
                                    value={usedTo}
                                    onChange={(e) => setUsedTo(e.target.value)}
                                    className="bg-white"
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={resetFilters}
                            >
                                Reset
                            </Button>
                            <Button size="sm" onClick={applyFilters}>
                                Apply Filters
                            </Button>
                        </div>
                    </div>
                )}

                {/* Results summary */}
                <div className="mb-3 flex items-center justify-between text-sm text-gray-500">
                    <span>
                        Showing {stampCodes.from ?? 0}–{stampCodes.to ?? 0} of{' '}
                        {stampCodes.total} results
                    </span>
                </div>

                {/* ── Mobile Card View ── */}
                <div className="block space-y-3 lg:hidden">
                    {stampCodes.data.length > 0 ? (
                        stampCodes.data.map((sc) => (
                            <div
                                key={sc.id}
                                className="rounded-xl border bg-white p-4 shadow-sm"
                            >
                                <div className="mb-3 flex items-start justify-between gap-2">
                                    <div>
                                        <p className="text-xs text-gray-400">
                                            {sc.loyalty_card.name}
                                        </p>
                                        <p className="font-mono text-sm font-semibold break-all">
                                            {sc.code}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        {getStatusBadge(sc)}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setSelectedCode(sc)}
                                        >
                                            <Eye className="h-4 w-4 text-gray-500" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <span className="text-gray-400">
                                            Customer
                                        </span>
                                        <p className="truncate font-medium text-gray-800">
                                            {sc.customer ? (
                                                sc.customer.username
                                            ) : (
                                                <span className="text-gray-400">
                                                    Unassigned
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">
                                            Branch
                                        </span>
                                        <p className="truncate font-medium text-gray-800">
                                            {sc.branch?.name ?? (
                                                <span className="text-gray-400">
                                                    N/A
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">
                                            Type
                                        </span>
                                        <p className="font-medium text-gray-800">
                                            {sc.is_offline_code
                                                ? 'Offline'
                                                : 'Online'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">
                                            Created
                                        </span>
                                        <p className="font-medium text-gray-800">
                                            {formatDate(sc.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="rounded-xl border bg-white p-8 text-center text-gray-500">
                            No stamp codes found.
                        </div>
                    )}
                </div>

                {/* ── Desktop Table View ── */}
                <div className="hidden overflow-x-auto rounded-xl border lg:block">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50">
                                <TableHead>Loyalty Card</TableHead>
                                <SortableHead col="code" label="Code" />
                                <TableHead>Customer</TableHead>
                                <TableHead>Branch</TableHead>
                                <SortableHead col="is_expired" label="Status" />
                                <TableHead>Type</TableHead>
                                <SortableHead col="used_at" label="Used At" />
                                <SortableHead
                                    col="created_at"
                                    label="Created At"
                                />
                                <TableHead className="text-right">
                                    Action
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {stampCodes.data.length > 0 ? (
                                stampCodes.data.map((sc) => (
                                    <TableRow
                                        key={sc.id}
                                        className="hover:bg-gray-50/50"
                                    >
                                        <TableCell className="max-w-[120px] truncate">
                                            {sc.loyalty_card.name}
                                        </TableCell>
                                        <TableCell className="font-mono font-medium">
                                            {sc.code}
                                        </TableCell>
                                        <TableCell>
                                            {sc.customer ? (
                                                <div>
                                                    <p className="font-medium">
                                                        {sc.customer.username}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {sc.customer.email}
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">
                                                    Unassigned
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {sc.branch?.name ?? (
                                                <span className="text-gray-400">
                                                    N/A
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(sc)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {sc.is_offline_code
                                                    ? 'Offline'
                                                    : 'Online'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600">
                                            {formatDate(sc.used_at)}
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600">
                                            {formatDate(sc.created_at)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    setSelectedCode(sc)
                                                }
                                            >
                                                <Eye className="h-4 w-4 text-gray-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={9}
                                        className="py-10 text-center text-gray-400"
                                    >
                                        No stamp codes found. Try adjusting your
                                        filters.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {stampCodes.last_page > 1 && <Pagination data={stampCodes} />}
            </div>

            {/* ── Detail Dialog ── */}
            <Dialog
                open={!!selectedCode}
                onOpenChange={() => setSelectedCode(null)}
            >
                <DialogContent className="w-full max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                            Stamp Code Details
                            {selectedCode && getStatusBadge(selectedCode)}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedCode && (
                        <div className="space-y-4">
                            <div className="rounded-lg bg-gray-50 p-4 text-center">
                                <p className="mb-1 text-xs text-gray-500">
                                    Code
                                </p>
                                <p className="font-mono text-2xl font-bold tracking-widest text-gray-900">
                                    {selectedCode.code}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {[
                                    {
                                        label: 'Loyalty Card',
                                        value: selectedCode.loyalty_card.name,
                                    },
                                    {
                                        label: 'Reference Number',
                                        value:
                                            selectedCode.reference_number ??
                                            'N/A',
                                    },
                                    {
                                        label: 'Generated By',
                                        value:
                                            selectedCode.staff?.email ??
                                            selectedCode.user?.email ??
                                            'N/A',
                                    },
                                    {
                                        label: 'Branch',
                                        value:
                                            selectedCode.branch?.name ?? 'N/A',
                                    },
                                ].map(({ label, value }) => (
                                    <div key={label}>
                                        <p className="mb-1 text-xs font-medium tracking-wide text-gray-500 uppercase">
                                            {label}
                                        </p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {value}
                                        </p>
                                    </div>
                                ))}

                                <div>
                                    <p className="mb-1 text-xs font-medium tracking-wide text-gray-500 uppercase">
                                        Type
                                    </p>
                                    <Badge variant="outline">
                                        {selectedCode.is_offline_code
                                            ? 'Offline'
                                            : 'Online'}
                                    </Badge>
                                </div>

                                <div>
                                    <p className="mb-1 text-xs font-medium tracking-wide text-gray-500 uppercase">
                                        Customer
                                    </p>
                                    {selectedCode.customer ? (
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {selectedCode.customer.username}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {selectedCode.customer.email}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400">
                                            Unassigned
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <p className="mb-1 text-xs font-medium tracking-wide text-gray-500 uppercase">
                                        Used At
                                    </p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {formatDate(selectedCode.used_at)}
                                    </p>
                                </div>

                                <div>
                                    <p className="mb-1 text-xs font-medium tracking-wide text-gray-500 uppercase">
                                        Created At
                                    </p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {formatDate(selectedCode.created_at)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
