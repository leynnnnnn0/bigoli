<?php

namespace App\Services;

use App\Models\Business;
use App\Models\Staff;
use App\Models\StampCode;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class IssueStampService
{
    public function pageData(Business $business, array $input, int $userId): array
    {
        $branchId = $input['branch_id'] ?? null;
        if ($branchId) {
            abort_unless($business->branches()->whereKey($branchId)->exists(), 403);
        }

        $cards = $this->activeCards($business, $branchId)->get(['id', 'name', 'minimum_amount_spent']);
        $cardId = $input['loyalty_card_id'] ?? null;
        $code = $cardId && $cards->contains('id', $cardId)
            ? $this->generate($business, $cardId, $branchId, $input['transaction_number'] ?? null, $input['amount_spent'] ?? 0, $userId)
            : $this->emptyCode();

        return [
            'code' => $code,
            'cards' => $cards,
            'branches' => $business->branches()->orderBy('name')->get(['id', 'name']),
            'loyalty_card_id' => $cardId,
            'branch_id' => $branchId,
            'transaction_number' => $input['transaction_number'] ?? null,
            'amount_spent' => $input['amount_spent'] ?? 0,
        ];
    }

    public function staffPageData(Staff $staff, array $input): array
    {
        $business = $staff->business;
        $branchId = $staff->branch_id;
        abort_unless(! $branchId || ! isset($input['branch_id']) || (int) $input['branch_id'] === $branchId, 403);

        $cards = $this->activeCards($business, $branchId)->get(['id', 'name', 'logo', 'minimum_amount_spent']);
        $cardId = $input['loyalty_card_id'] ?? null;

        return [
            'code' => $this->emptyCode(),
            'cards' => $cards,
            'branches' => $business->branches()->when($branchId, fn ($query) => $query->whereKey($branchId))->get(['id', 'name']),
            'loyalty_card_id' => $cardId,
            'branch_id' => $branchId ? (string) $branchId : null,
            'transaction_number' => $input['transaction_number'] ?? null,
            'amount_spent' => $input['amount_spent'] ?? 0,
        ];
    }

    public function generateForStaff(Staff $staff, array $input): array
    {
        $business = $staff->business;
        $branchId = $staff->branch_id;

        abort_unless(
            ! $branchId || ! isset($input['branch_id']) || (int) $input['branch_id'] === $branchId,
            403,
        );

        $cardId = (int) $input['loyalty_card_id'];
        abort_unless($this->activeCards($business, $branchId)->whereKey($cardId)->exists(), 403);

        return array_merge(
            $this->generate($business, $cardId, $branchId, $input['transaction_number'], $input['amount_spent'], null, $staff->id),
            [
                'loyalty_card_id' => (string) $cardId,
                'branch_id' => $branchId ? (string) $branchId : null,
                'transaction_number' => $input['transaction_number'],
                'amount_spent' => $input['amount_spent'],
            ],
        );
    }

    private function activeCards(Business $business, ?int $branchId)
    {
        return $business->loyaltyCards()
            ->whereDate('valid_until', '>', today())
            ->when(
                $branchId,
                fn ($query) => $query->where(fn ($cards) => $cards
                    ->whereHas('branches', fn ($branches) => $branches->whereKey($branchId))
                    ->orWhereDoesntHave('branches')),
                fn ($query) => $query->whereDoesntHave('branches'),
            );
    }

    private function generate(Business $business, int $cardId, ?int $branchId, ?string $transactionNumber, float|int|string $amountSpent, ?int $userId, ?int $staffId = null): array
    {
        $card = $business->loyaltyCards()->findOrFail($cardId);
        $this->ensureMinimumAmountSpent($card->minimum_amount_spent, $amountSpent);

        $stampCode = StampCode::create([
            'user_id' => $userId,
            'staff_id' => $staffId,
            'business_id' => $business->id,
            'loyalty_card_id' => $cardId,
            'branch_id' => $branchId,
            'code' => $this->uniqueCodes(1)[0],
            'is_expired' => false,
            'transaction_number' => $transactionNumber,
            'amount_spent' => $amountSpent,
        ]);

        return [
            'success' => true,
            'code' => $stampCode->code,
            'qr_url' => 'https://api.qrserver.com/v1/create-qr-code/?size=500x500&data='.$stampCode->code,
            'created_at' => $stampCode->created_at->format('M d, Y h:i A'),
        ];
    }

    private function ensureMinimumAmountSpent(float|int|string $minimum, float|int|string $amountSpent): void
    {
        if ((float) $amountSpent < (float) $minimum) {
            throw ValidationException::withMessages([
                'amount_spent' => 'Minimum amount spent should be '.number_format((float) $minimum, 2).' to generate a stamp.',
            ]);
        }
    }

    private function uniqueCodes(int $count): array
    {
        $codes = [];
        while (count($codes) < $count) {
            $code = Str::upper(Str::random(8));
            if (! in_array($code, $codes, true) && ! StampCode::where('code', $code)->exists()) {
                $codes[] = $code;
            }
        }

        return $codes;
    }

    private function emptyCode(): array
    {
        return ['success' => false, 'code' => '', 'qr_url' => '', 'created_at' => ''];
    }
}
