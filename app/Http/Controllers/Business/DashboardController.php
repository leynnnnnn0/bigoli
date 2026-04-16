<?php

namespace App\Http\Controllers\Business;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $business = Auth::user()->business;
        $branches = $business->branches()->orderBy('name')->get(['id', 'name']);

        // Resolve selected branch (null = all branches)
        $branchId = $request->branch_id ?? null;
        $branchFilter = fn($q) => $branchId
            ? $q->where('branch_id', $branchId)
            : $q;

        // Customers scope
        $customersQuery = fn() => $branchId
            ? $business->customers()->where('branch_id', $branchId)
            : $business->customers();

        // StampCodes scope
        $stampsQuery = fn() => $branchId
            ? $business->stampCodes()->where('branch_id', $branchId)
            : $business->stampCodes();

        $customersCount = $customersQuery()->count();

        $newCustomersThisMonth = $customersQuery()
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        $newCustomersLastMonth = $customersQuery()
            ->whereMonth('created_at', now()->subMonth()->month)
            ->whereYear('created_at', now()->subMonth()->year)
            ->count();

        $percentageChange = $newCustomersLastMonth > 0
            ? (($newCustomersThisMonth - $newCustomersLastMonth) / $newCustomersLastMonth) * 100
            : ($newCustomersThisMonth > 0 ? 100 : 0);

        $stampsUsedCountThisMonth = $stampsQuery()
            ->whereNotNull('used_at')
            ->whereMonth('used_at', now()->month)
            ->whereYear('used_at', now()->year)
            ->count();

        $stampsUsedLastMonth = $stampsQuery()
            ->whereNotNull('used_at')
            ->whereMonth('used_at', now()->subMonth()->month)
            ->whereYear('used_at', now()->subMonth()->year)
            ->count();

        $percentageChangeOnStamps = $stampsUsedLastMonth > 0
            ? (($stampsUsedCountThisMonth - $stampsUsedLastMonth) / $stampsUsedLastMonth) * 100
            : ($stampsUsedCountThisMonth > 0 ? 100 : 0);

        // Stamps by day of week (last 30 days)
        $stampsByDayOfWeek = $stampsQuery()
            ->whereNotNull('used_at')
            ->where('used_at', '>=', now()->subDays(30))
            ->select(DB::raw('DAYNAME(used_at) as day_name, COUNT(*) as stamps'))
            ->groupBy('day_name')
            ->get()
            ->mapWithKeys(fn($item) => [$item->day_name => $item->stamps]);

        $daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        $stampsByDay = collect($daysOfWeek)->map(fn($day) => [
            'day' => $day,
            'stamps' => $stampsByDayOfWeek[$day] ?? 0,
        ])->values();

        // Repeat customer rate (last 8 weeks)
        $repeatCustomerRate = collect(range(7, 0))->map(function ($weeksAgo) use ($stampsQuery) {
            $startOfWeek = now()->subWeeks($weeksAgo)->startOfWeek();
            $endOfWeek   = now()->subWeeks($weeksAgo)->endOfWeek();

            $customersThisWeek = $stampsQuery()
                ->whereNotNull('used_at')
                ->whereBetween('used_at', [$startOfWeek, $endOfWeek])
                ->pluck('customer_id')
                ->unique();

            $visitCounts = $stampsQuery()
                ->whereNotNull('used_at')
                ->whereBetween('used_at', [$startOfWeek, $endOfWeek])
                ->whereIn('customer_id', $customersThisWeek)
                ->select('customer_id', DB::raw('COUNT(DISTINCT DATE(used_at)) as visit_count'))
                ->groupBy('customer_id')
                ->get();

            return [
                'week'      => 'Week ' . (8 - $weeksAgo),
                'oneVisit'  => $visitCounts->where('visit_count', 1)->count(),
                'twoToFive' => $visitCounts->whereBetween('visit_count', [2, 5])->count(),
                'sixPlus'   => $visitCounts->where('visit_count', '>=', 6)->count(),
            ];
        });

        return Inertia::render('Business/Dashboard/Index', [
            'customersCount'             => $customersCount,
            'newCustomersThisMonth'      => $newCustomersThisMonth,
            'percentageChange'           => round($percentageChange, 1),
            'stampsUsedCountThisMonth'   => $stampsUsedCountThisMonth,
            'percentageChangeOnStamps'   => round($percentageChangeOnStamps, 1),
            'stampsByDayOfWeek'          => $stampsByDay,
            'repeatCustomerRate'         => $repeatCustomerRate,
            'branches'                   => $branches,
            'selectedBranchId'           => $branchId ? (int) $branchId : null,
        ]);
    }
}