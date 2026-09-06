<?php

namespace App\Services;

use App\Models\StampCode;
use Illuminate\Database\Eloquent\Builder;

class StampCodeExpirationService
{
    public function expire(?int $businessId = null): int
    {
        return StampCode::query()
            ->when($businessId, fn (Builder $query, int $id) => $query->where('business_id', $id))
            ->whereNull('used_at')
            ->where('created_at', '<=', now()->subMinutes(15))
            ->where('is_offline_code', false)
            ->where('is_expired', false)
            ->update(['is_expired' => true]);
    }
}
