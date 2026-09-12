<?php

namespace App\Services;

use App\Models\PerkClaim;
use Illuminate\Database\Eloquent\Builder;

class PerkClaimService
{
    public function pageData(int $businessId, array $filters): array
    {
        $search = $filters['search'] ?? null;
        $status = $filters['status'] ?? null;
        $claims = $this->forBusiness($businessId);

        $perkClaims = (clone $claims)
            ->with([
                'customer:id,username,email',
                'perk:id,reward,details,stampNumber',
                'loyalty_card:id,name,logo',
                'redeemed_by:id,username',
                'redeemed_by_staff:id,username',
            ])
            ->when($search, fn (Builder $query, string $term) => $query->where(function (Builder $claims) use ($term) {
                $claims->whereHas('customer', fn (Builder $customers) => $customers
                    ->where('username', 'like', "%{$term}%")
                    ->orWhere('email', 'like', "%{$term}%"))
                    ->orWhereHas('perk', fn (Builder $perks) => $perks->where('reward', 'like', "%{$term}%"))
                    ->orWhereHas('loyalty_card', fn (Builder $cards) => $cards->where('name', 'like', "%{$term}%"));
            }))
            ->when($status === 'available', fn (Builder $query) => $query->where('is_redeemed', false))
            ->when($status === 'redeemed', fn (Builder $query) => $query->where('is_redeemed', true))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $stats = (clone $claims)
            ->selectRaw('COUNT(*) as total, COALESCE(SUM(CASE WHEN is_redeemed = 0 THEN 1 ELSE 0 END), 0) as available, COALESCE(SUM(CASE WHEN is_redeemed = 1 THEN 1 ELSE 0 END), 0) as redeemed')
            ->first();

        return [
            'perkClaims' => $perkClaims,
            'filters' => ['search' => $search, 'status' => $status],
            'stats' => [
                'total' => (int) $stats->total,
                'available' => (int) $stats->available,
                'redeemed' => (int) $stats->redeemed,
            ],
        ];
    }

    public function redeem(PerkClaim $perkClaim, int $businessId, ?int $userId, ?int $staffId, ?string $remarks): bool
    {
        $this->ensureBelongsToBusiness($perkClaim, $businessId);

        // Check and change state in one statement, including for stale model instances.
        $updated = PerkClaim::whereKey($perkClaim->id)->where('is_redeemed', false)->update([
            'is_redeemed' => true,
            'redeemed_at' => now(),
            'redeemed_by' => $userId,
            'redeemed_by_staff_id' => $staffId,
            'remarks' => $remarks,
        ]);

        $perkClaim->refresh();

        return $updated === 1;
    }

    public function undoRedemption(PerkClaim $perkClaim, int $businessId): bool
    {
        $this->ensureBelongsToBusiness($perkClaim, $businessId);

        $updated = PerkClaim::whereKey($perkClaim->id)->where('is_redeemed', true)->update([
            'is_redeemed' => false,
            'redeemed_at' => null,
            'redeemed_by' => null,
            'redeemed_by_staff_id' => null,
            'remarks' => null,
        ]);

        $perkClaim->refresh();

        return $updated === 1;
    }

    private function forBusiness(int $businessId): Builder
    {
        return PerkClaim::query()->whereHas('loyalty_card', fn (Builder $cards) => $cards->where('business_id', $businessId));
    }

    private function ensureBelongsToBusiness(PerkClaim $perkClaim, int $businessId): void
    {
        $perkClaim->loadMissing('loyalty_card:id,business_id');

        abort_unless($perkClaim->loyalty_card?->business_id === $businessId, 403, 'Unauthorized action.');
    }
}
