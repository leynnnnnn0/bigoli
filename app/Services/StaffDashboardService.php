<?php

namespace App\Services;

use App\Models\PerkClaim;
use App\Models\Staff;
use App\Models\StampCode;
use Illuminate\Database\Eloquent\Builder;

class StaffDashboardService
{
    public function data(Staff $staff, array $input, IssueStampService $issueStamps): array
    {
        $businessId = $staff->business_id;
        $claims = PerkClaim::query()->whereHas('loyalty_card', fn (Builder $cards) => $cards->where('business_id', $businessId));
        $stats = (clone $claims)
            ->selectRaw('COUNT(*) as total, COALESCE(SUM(CASE WHEN is_redeemed = 0 THEN 1 ELSE 0 END), 0) as available, COALESCE(SUM(CASE WHEN is_redeemed = 1 THEN 1 ELSE 0 END), 0) as redeemed')
            ->first();

        return array_merge($issueStamps->staffPageData($staff, $input), [
            'perkClaims' => (clone $claims)->with([
                'customer:id,username,email', 'perk:id,reward,details,stampNumber', 'loyalty_card:id,name,logo',
                'redeemed_by:id,username', 'redeemed_by_staff:id,username',
            ])->latest()->limit(50)->get(),
            'stampCodes' => StampCode::with(['loyalty_card:id,name', 'customer:id,username,email'])
                ->withTrashed()->where('staff_id', $staff->id)->where('business_id', $businessId)
                ->where(fn (Builder $query) => $query->where('is_offline_code', false)->orWhereNotNull('used_at'))
                ->latest()->limit(50)->get(),
            'stats' => ['total' => (int) $stats->total, 'available' => (int) $stats->available, 'redeemed' => (int) $stats->redeemed],
        ]);
    }
}
