<?php

namespace App\Services;

use App\Models\Business;
use Illuminate\Support\Carbon;

class BusinessDashboardService
{
    public function data(Business $business, ?int $branchId): array
    {
        $now = now();
        $thisMonthStart = $now->copy()->startOfMonth();
        $nextMonthStart = $thisMonthStart->copy()->addMonth();
        $lastMonthStart = $thisMonthStart->copy()->subMonth();

        $customers = $business->customers()->when($branchId, fn ($query) => $query->where('branch_id', $branchId));
        $customerStats = $customers->selectRaw(
            'COUNT(*) as total, '.
            'SUM(CASE WHEN created_at >= ? AND created_at < ? THEN 1 ELSE 0 END) as current_month, '.
            'SUM(CASE WHEN created_at >= ? AND created_at < ? THEN 1 ELSE 0 END) as previous_month',
            [$thisMonthStart, $nextMonthStart, $lastMonthStart, $thisMonthStart],
        )->first();

        $stamps = $business->stampCodes()->withTrashed()
            ->when($branchId, fn ($query) => $query->where('branch_id', $branchId))
            ->whereNotNull('used_at');
        $stampStats = $stamps->selectRaw(
            'SUM(CASE WHEN used_at >= ? AND used_at < ? THEN 1 ELSE 0 END) as current_month, '.
            'SUM(CASE WHEN used_at >= ? AND used_at < ? THEN 1 ELSE 0 END) as previous_month',
            [$thisMonthStart, $nextMonthStart, $lastMonthStart, $thisMonthStart],
        )->first();

        $lastThirtyDays = $business->stampCodes()->withTrashed()
            ->when($branchId, fn ($query) => $query->where('branch_id', $branchId))
            ->whereNotNull('used_at')
            ->where('used_at', '>=', $now->copy()->subDays(30))
            ->get(['used_at']);

        $stampsByDay = $this->stampsByDay($lastThirtyDays);
        $repeatCustomerRate = $this->repeatCustomerRate(
            $business->stampCodes()->withTrashed()
                ->when($branchId, fn ($query) => $query->where('branch_id', $branchId))
                ->whereNotNull('used_at')
                ->where('used_at', '>=', $now->copy()->subWeeks(7)->startOfWeek())
                ->get(['customer_id', 'used_at']),
            $now,
        );

        $newCustomers = (int) $customerStats->current_month;
        $previousCustomers = (int) $customerStats->previous_month;
        $usedStamps = (int) $stampStats->current_month;
        $previousStamps = (int) $stampStats->previous_month;

        return [
            'customersCount' => (int) $customerStats->total,
            'newCustomersThisMonth' => $newCustomers,
            'percentageChange' => $this->percentageChange($newCustomers, $previousCustomers),
            'stampsUsedCountThisMonth' => $usedStamps,
            'percentageChangeOnStamps' => $this->percentageChange($usedStamps, $previousStamps),
            'stampsByDayOfWeek' => $stampsByDay,
            'repeatCustomerRate' => $repeatCustomerRate,
            'branches' => $business->branches()->orderBy('name')->get(['id', 'name']),
            'selectedBranchId' => $branchId,
        ];
    }

    private function percentageChange(int $current, int $previous): float
    {
        return round($previous > 0 ? (($current - $previous) / $previous) * 100 : ($current > 0 ? 100 : 0), 1);
    }

    private function stampsByDay($stamps): array
    {
        $counts = $stamps->groupBy(fn ($stamp) => Carbon::parse($stamp->used_at)->format('l'))
            ->map(fn ($group) => $group->count());

        return collect(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
            ->map(fn (string $day) => ['day' => $day, 'stamps' => $counts[$day] ?? 0])
            ->values()
            ->all();
    }

    private function repeatCustomerRate($stamps, Carbon $now): array
    {
        return collect(range(7, 0))->map(function (int $weeksAgo) use ($stamps, $now) {
            $start = $now->copy()->subWeeks($weeksAgo)->startOfWeek();
            $end = $start->copy()->endOfWeek();
            $visits = $stamps->filter(fn ($stamp) => $stamp->used_at->betweenIncluded($start, $end))
                ->filter(fn ($stamp) => $stamp->customer_id !== null)
                ->groupBy('customer_id')
                ->map(fn ($customerStamps) => $customerStamps->pluck('used_at')->map(fn ($usedAt) => $usedAt->toDateString())->unique()->count());

            return [
                'week' => 'Week '.(8 - $weeksAgo),
                'oneVisit' => $visits->filter(fn (int $count) => $count === 1)->count(),
                'twoToFive' => $visits->filter(fn (int $count) => $count >= 2 && $count <= 5)->count(),
                'sixPlus' => $visits->filter(fn (int $count) => $count >= 6)->count(),
            ];
        })->all();
    }
}
