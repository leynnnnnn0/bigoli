<?php

namespace App\Services;

use App\Models\Business;
use App\Models\Staff;
use App\Models\StampCode;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class IssueStampService
{
    public function pageData(Business $business, array $input, int $userId): array
    {
        $branchId = $input['branch_id'] ?? null;
        if ($branchId) {
            abort_unless($business->branches()->whereKey($branchId)->exists(), 403);
        }

        $cards = $this->activeCards($business, $branchId)->get(['id', 'name']);
        $cardId = $input['loyalty_card_id'] ?? null;
        $code = $cardId && $cards->contains('id', $cardId)
            ? $this->generate($business, $cardId, $branchId, $input['reference_number'] ?? null, $userId)
            : $this->emptyCode();

        return [
            'code' => $code,
            'cards' => $cards,
            'branches' => $business->branches()->orderBy('name')->get(['id', 'name']),
            'loyalty_card_id' => $cardId,
            'branch_id' => $branchId,
            'reference_number' => $input['reference_number'] ?? null,
        ];
    }

    public function staffPageData(Staff $staff, array $input): array
    {
        $business = $staff->business;
        $branchId = $staff->branch_id;
        abort_unless(! $branchId || ! isset($input['branch_id']) || (int) $input['branch_id'] === $branchId, 403);

        $cards = $this->activeCards($business, $branchId)->get(['id', 'name', 'logo']);
        $cardId = $input['loyalty_card_id'] ?? null;
        $code = $cardId && $cards->contains('id', $cardId)
            ? $this->generate($business, $cardId, $branchId, $input['reference_number'] ?? null, null, $staff->id)
            : $this->emptyCode();

        return [
            'code' => $code,
            'cards' => $cards,
            'branches' => $business->branches()->when($branchId, fn ($query) => $query->whereKey($branchId))->get(['id', 'name']),
            'loyalty_card_id' => $cardId,
            'branch_id' => $branchId ? (string) $branchId : null,
            'reference_number' => $input['reference_number'] ?? null,
        ];
    }

    public function offlineStamps(Business $business, int $loyaltyCardId, ?int $userId, ?int $staffId = null, ?int $branchId = null): array
    {
        $loyaltyCard = $business->loyaltyCards()->findOrFail($loyaltyCardId);
        $registrationLink = $business->subdomain ?: 'https://stampbayan.com/customer/register?business='.$business->qr_token;
        $qrImage = file_get_contents('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data='.urlencode($registrationLink));
        $qrCodeBase64 = 'data:image/png;base64,'.base64_encode($qrImage);
        $codes = $this->uniqueCodes(8);

        StampCode::insert(collect($codes)->map(fn (string $code) => [
            'user_id' => $userId,
            'staff_id' => $staffId,
            'business_id' => $business->id,
            'loyalty_card_id' => $loyaltyCard->id,
            'branch_id' => $branchId,
            'code' => $code,
            'is_offline_code' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ])->all());

        return [
            'tickets' => collect($codes)->map(fn (string $code) => ['code' => $code, 'qr_code_base64' => $qrCodeBase64])->all(),
            'registrationLink' => $registrationLink,
            'businessName' => $business->name,
            'loyaltyCard' => $loyaltyCard,
        ];
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

    private function generate(Business $business, int $cardId, ?int $branchId, ?string $referenceNumber, ?int $userId, ?int $staffId = null): array
    {
        $business->stampCodes()
            ->whereNull('used_at')
            ->where('created_at', '<=', Carbon::now()->subMinutes(15))
            ->where('is_offline_code', false)
            ->update(['is_expired' => true]);

        $stampCode = StampCode::create([
            'user_id' => $userId,
            'staff_id' => $staffId,
            'business_id' => $business->id,
            'loyalty_card_id' => $cardId,
            'branch_id' => $branchId,
            'code' => $this->uniqueCodes(1)[0],
            'is_expired' => false,
            'reference_number' => $referenceNumber,
        ]);

        return [
            'success' => true,
            'code' => $stampCode->code,
            'qr_url' => 'https://api.qrserver.com/v1/create-qr-code/?size=500x500&data='.$stampCode->code,
            'created_at' => $stampCode->created_at->format('M d, Y h:i A'),
        ];
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
