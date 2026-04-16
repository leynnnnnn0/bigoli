import SummaryBox from '@/components/summary-box';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

interface Branch {
    id: number;
    name: string;
}

interface Props {
    customersCount: number;
    newCustomersThisMonth: number;
    percentageChange: number;
    stampsUsedCountThisMonth: number;
    percentageChangeOnStamps: number;
    stampsByDayOfWeek: Array<{ day: string; stamps: number }>;
    repeatCustomerRate: Array<{
        week: string;
        oneVisit: number;
        twoToFive: number;
        sixPlus: number;
    }>;
    branches: Branch[];
    selectedBranchId: number | null;
}

export default function Index({
    customersCount,
    newCustomersThisMonth,
    percentageChange,
    stampsUsedCountThisMonth,
    percentageChangeOnStamps,
    stampsByDayOfWeek,
    repeatCustomerRate,
    branches,
    selectedBranchId,
}: Props) {
    const hasBranches = branches.length > 0;

    const handleBranchChange = (value: string) => {
        router.get(
            '/business/dashboard',
            { branch_id: value === 'all' ? undefined : value },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const selectedBranchName = branches.find(
        (b) => b.id === selectedBranchId,
    )?.name;

    const dayChartConfig = {
        stamps: { label: 'Stamps Used', color: 'hsl(var(--chart-1))' },
    } satisfies ChartConfig;

    const retentionChartConfig = {
        oneVisit: { label: '1 Visit', color: 'hsl(var(--chart-3))' },
        twoToFive: { label: '2-5 Visits', color: 'hsl(var(--chart-2))' },
        sixPlus: { label: '6+ Visits', color: 'hsl(var(--chart-1))' },
    } satisfies ChartConfig;

    const mostPopularDay = stampsByDayOfWeek.reduce(
        (prev, curr) => (curr.stamps > prev.stamps ? curr : prev),
        stampsByDayOfWeek[0],
    );

    return (
        <AppLayout>
            <Head title="Business Dashboard" />

            <div className="space-y-4 md:space-y-6">
                {/* Branch filter — only shown when branches exist */}
                {hasBranches && (
                    <div className="flex items-center gap-3">
                        <span className="text-sm whitespace-nowrap text-muted-foreground">
                            Viewing:
                        </span>
                        <Select
                            value={
                                selectedBranchId
                                    ? String(selectedBranchId)
                                    : 'all'
                            }
                            onValueChange={handleBranchChange}
                        >
                            <SelectTrigger className="w-52">
                                <SelectValue placeholder="All branches" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All branches
                                </SelectItem>
                                {branches.map((b) => (
                                    <SelectItem key={b.id} value={String(b.id)}>
                                        {b.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {selectedBranchName && (
                            <span className="text-sm text-muted-foreground">
                                — {selectedBranchName}
                            </span>
                        )}
                    </div>
                )}

                {/* Summary boxes */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
                    <SummaryBox
                        title="Total Customers"
                        subtitle="Customers with loyalty cards."
                        count={customersCount}
                        percentage="100"
                    />
                    <SummaryBox
                        title="New Customers"
                        subtitle="Newly registered customers for this month."
                        count={newCustomersThisMonth}
                        percentage={percentageChange}
                    />
                    <SummaryBox
                        title="Stamps Given"
                        subtitle="Total stamps used by customers this month."
                        count={stampsUsedCountThisMonth}
                        percentage={percentageChangeOnStamps}
                    />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 gap-4 md:gap-5 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Traffic by Day</CardTitle>
                            <CardDescription>
                                Stamps used per day of the week
                                {selectedBranchName &&
                                    ` · ${selectedBranchName}`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={dayChartConfig}>
                                <BarChart
                                    accessibilityLayer
                                    data={stampsByDayOfWeek}
                                >
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="day"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent />}
                                    />
                                    <Bar
                                        dataKey="stamps"
                                        fill="var(--color-stamps)"
                                        radius={8}
                                    />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                        <CardFooter className="flex-col items-start gap-2 text-sm">
                            <div className="flex gap-2 leading-none font-medium">
                                Busiest day: {mostPopularDay?.day}{' '}
                                <TrendingUp className="h-4 w-4" />
                            </div>
                            <div className="leading-none text-muted-foreground">
                                Plan staffing and inventory based on peak days
                            </div>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Visit Frequency</CardTitle>
                            <CardDescription>
                                How often customers return (Weekly)
                                {selectedBranchName &&
                                    ` · ${selectedBranchName}`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={retentionChartConfig}>
                                <BarChart
                                    accessibilityLayer
                                    data={repeatCustomerRate}
                                >
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="week"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent />}
                                    />
                                    <Bar
                                        dataKey="oneVisit"
                                        fill="var(--color-oneVisit)"
                                        radius={[0, 0, 4, 4]}
                                        stackId="a"
                                    />
                                    <Bar
                                        dataKey="twoToFive"
                                        fill="var(--color-twoToFive)"
                                        radius={[0, 0, 0, 0]}
                                        stackId="a"
                                    />
                                    <Bar
                                        dataKey="sixPlus"
                                        fill="var(--color-sixPlus)"
                                        radius={[4, 4, 0, 0]}
                                        stackId="a"
                                    />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                        <CardFooter className="flex-col items-start gap-2 text-sm">
                            <div className="flex gap-2 leading-none font-medium">
                                Track repeat customer behavior{' '}
                                <TrendingUp className="h-4 w-4" />
                            </div>
                            <div className="leading-none text-muted-foreground">
                                Higher repeat visits indicate strong customer
                                loyalty
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
