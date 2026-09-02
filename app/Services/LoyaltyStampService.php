<?php

namespace App\Services;

use App\Models\CompletedLoyaltyCard;
use App\Models\LoyaltyCard;
use App\Models\PerkClaim;
use App\Models\StampCode;

class LoyaltyStampService
{
    /**
     * Apply the loyalty-card effects after a stamp has been assigned to a customer.
     * This is shared by customer-entered codes and staff-scanned customer QR codes.
     */
    public function apply(StampCode $stampCode, int $customerId): array
    {
        $totalStamps = StampCode::where('customer_id', $customerId)
            ->where('loyalty_card_id', $stampCode->loyalty_card_id)
            ->whereNotNull('used_at')
            ->count();

        $loyaltyCard = LoyaltyCard::with('perks')->findOrFail($stampCode->loyalty_card_id);
        $newlyUnlockedPerks = [];

        foreach ($loyaltyCard->perks->where('stampNumber', $totalStamps) as $perk) {
            PerkClaim::create([
                'customer_id' => $customerId,
                'loyalty_card_id' => $stampCode->loyalty_card_id,
                'perk_id' => $perk->id,
                'stamps_at_claim' => $totalStamps,
                'is_redeemed' => false,
            ]);

            $newlyUnlockedPerks[] = $perk->reward;
        }

        if ($totalStamps >= $loyaltyCard->stampsNeeded) {
            $usedStamps = StampCode::where('customer_id', $customerId)
                ->where('loyalty_card_id', $stampCode->loyalty_card_id)
                ->whereNotNull('used_at')
                ->get();

            $previousCompletions = CompletedLoyaltyCard::where('customer_id', $customerId)
                ->where('loyalty_card_id', $stampCode->loyalty_card_id)
                ->count();

            CompletedLoyaltyCard::create([
                'customer_id' => $customerId,
                'loyalty_card_id' => $stampCode->loyalty_card_id,
                'stamps_collected' => $totalStamps,
                'completed_at' => now(),
                'card_cycle' => $previousCompletions + 1,
                'stamps_data' => $usedStamps->map(fn (StampCode $stamp) => [
                    'id' => $stamp->id,
                    'code' => $stamp->code,
                    'used_at' => $stamp->used_at,
                ])->all(),
            ]);

            StampCode::where('customer_id', $customerId)
                ->where('loyalty_card_id', $stampCode->loyalty_card_id)
                ->whereNotNull('used_at')
                ->delete();

            $message = 'Congratulations! You completed your loyalty card!';
            if ($newlyUnlockedPerks) {
                $message .= ' New rewards unlocked: '.implode(', ', $newlyUnlockedPerks);
            }

            return [
                'success' => true,
                'active_card_id' => $stampCode->loyalty_card_id,
                'card_completed' => true,
                'message' => $message,
                'cycle_number' => $previousCompletions + 1,
                'newly_unlocked_perks' => $newlyUnlockedPerks,
            ];
        }

        $message = 'Stamp recorded successfully!';
        if ($newlyUnlockedPerks) {
            $message .= ' New rewards unlocked: '.implode(', ', $newlyUnlockedPerks);
        }

        return [
            'success' => true,
            'active_card_id' => $stampCode->loyalty_card_id,
            'card_completed' => false,
            'message' => $message,
            'stamps_remaining' => $loyaltyCard->stampsNeeded - $totalStamps,
            'newly_unlocked_perks' => $newlyUnlockedPerks,
        ];
    }
}
