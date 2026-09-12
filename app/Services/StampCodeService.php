<?php

namespace App\Services;

use App\Models\Branch;
use App\Models\Business;
use App\Models\Customer;
use App\Models\LoyaltyCard;
use App\Models\Staff;
use App\Models\StampCode;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class StampCodeService
{
    public function pageData(Business $business, array $filters): array
    {
        return [
            'stampCodes' => $this->query($business->id, $filters)->paginate(10)->withQueryString(),
            'loyaltyCards' => $business->loyaltyCards()->orderBy('name')->get(['id', 'name']),
            'branches' => $business->branches()->orderBy('name')->get(['id', 'name']),
            'filters' => $filters,
        ];
    }

    public function query(int $businessId, array $filters): Builder
    {
        return StampCode::query()
            ->with(['customer:id,username,email', 'loyalty_card:id,name', 'branch:id,name', 'user:id,email', 'staff:id,username'])
            ->withTrashed()
            ->where('business_id', $businessId)
            ->where(fn (Builder $query) => $query->where('is_offline_code', false)->orWhereNotNull('used_at'))
            ->when($filters['search'] ?? null, fn (Builder $query, string $term) => $query->where(function (Builder $codes) use ($term) {
                $codes->where('code', 'like', "%{$term}%")
                    ->orWhere('reference_number', 'like', "%{$term}%")
                    ->orWhereHas('customer', fn (Builder $customers) => $customers
                        ->where('username', 'like', "%{$term}%")
                        ->orWhere('email', 'like', "%{$term}%"));
            }))
            ->when(($filters['status'] ?? null) === 'used', fn (Builder $query) => $query->whereNotNull('used_at'))
            ->when(($filters['status'] ?? null) === 'active', fn (Builder $query) => $query->whereNull('used_at')->where('is_offline_code', false))
            ->when($filters['loyalty_card_id'] ?? null, fn (Builder $query, int $cardId) => $query->where('loyalty_card_id', $cardId))
            ->when($filters['branch_id'] ?? null, fn (Builder $query, int $branchId) => $query->where('branch_id', $branchId))
            ->when(($filters['assigned'] ?? null) === 'assigned', fn (Builder $query) => $query->whereNotNull('customer_id'))
            ->when(($filters['assigned'] ?? null) === 'unassigned', fn (Builder $query) => $query->whereNull('customer_id'))
            ->when($filters['date_from'] ?? null, fn (Builder $query, string $date) => $query->whereDate('created_at', '>=', $date))
            ->when($filters['date_to'] ?? null, fn (Builder $query, string $date) => $query->whereDate('created_at', '<=', $date))
            ->when($filters['used_from'] ?? null, fn (Builder $query, string $date) => $query->whereDate('used_at', '>=', $date))
            ->when($filters['used_to'] ?? null, fn (Builder $query, string $date) => $query->whereDate('used_at', '<=', $date))
            ->orderBy($filters['sort_by'] ?? 'created_at', ($filters['sort_dir'] ?? 'desc') === 'asc' ? 'asc' : 'desc');
    }

    public function redeemForCustomer(Customer $customer, string $code, LoyaltyStampService $loyaltyStamps): ?array
    {
        $cardId = StampCode::where('code', $code)->where('business_id', $customer->business_id)->value('loyalty_card_id');
        if (! $cardId) {
            return null;
        }

        return DB::transaction(function () use ($customer, $code, $loyaltyStamps, $cardId) {
            // All stamp writers and template edits lock the card first. This serializes
            // milestone counting and completion, even when different codes are used.
            $card = LoyaltyCard::where('business_id', $customer->business_id)
                ->whereKey($cardId)
                ->lockForUpdate()->first();
            if (! $card || $card->is_expired) {
                return null;
            }

            $stampCode = StampCode::where('code', $code)
                ->where('business_id', $customer->business_id)
                ->where('loyalty_card_id', $card->id)
                ->whereNull('used_at')
                ->where('is_offline_code', false)
                ->lockForUpdate()
                ->first();

            if (! $stampCode) {
                return null;
            }

            $stampCode->update(['customer_id' => $customer->id, 'used_at' => now()]);

            return $loyaltyStamps->apply($stampCode, $customer->id);
        }, 3);
    }

    public function recordCustomerScan(Business $business, int $userId, array $input, LoyaltyStampService $loyaltyStamps): array
    {
        $customer = $this->customerFromQrPayload($input['customer_qr']);
        if (! $customer || $customer->business_id !== $business->id) {
            throw ValidationException::withMessages(['customer_qr' => 'This customer QR code is invalid for this business.']);
        }

        $branchId = $input['branch_id'] ?? null;
        if ($branchId && ! Branch::where('business_id', $business->id)->whereKey($branchId)->exists()) {
            throw ValidationException::withMessages(['branch_id' => 'Please select a valid branch.']);
        }

        return DB::transaction(function () use ($business, $userId, $input, $loyaltyStamps, $customer, $branchId) {
            $card = $business->loyaltyCards()
                ->whereDate('valid_until', '>', today())
                ->whereKey($input['loyalty_card_id'])
                ->lockForUpdate()->first();

            // Relationship reads happen after the lock, otherwise MySQL can establish
            // an old repeatable-read snapshot while waiting for the card lock.
            if (! $card || ($branchId && $card->branches()->exists() && ! $card->branches()->whereKey($branchId)->exists())) {
                throw ValidationException::withMessages(['loyalty_card_id' => 'Please select a valid loyalty card.']);
            }

            $stampCode = StampCode::create([
                'user_id' => $userId,
                'business_id' => $business->id,
                'customer_id' => $customer->id,
                'loyalty_card_id' => $card->id,
                'branch_id' => $branchId,
                'reference_number' => $input['reference_number'],
                'code' => $this->scanCode(),
                'used_at' => now(),
                'is_expired' => false,
                'is_offline_code' => false,
            ]);

            return $loyaltyStamps->apply($stampCode, $customer->id);
        }, 3);
    }

    public function recordStaffCustomerScan(Staff $staff, array $input, LoyaltyStampService $loyaltyStamps): array
    {
        $business = $staff->business;
        $customer = $this->customerFromQrPayload($input['customer_qr']);
        if (! $customer || $customer->business_id !== $business->id) {
            throw ValidationException::withMessages(['customer_qr' => 'This customer QR code is invalid for this business.']);
        }

        return DB::transaction(function () use ($staff, $business, $input, $loyaltyStamps, $customer) {
            $card = $business->loyaltyCards()
                ->whereDate('valid_until', '>', today())
                ->whereKey($input['loyalty_card_id'])
                ->lockForUpdate()->first();
            if (! $card || ($card->branches()->exists() && ! $card->branches()->whereKey($staff->branch_id)->exists())) {
                throw ValidationException::withMessages(['loyalty_card_id' => 'Please select a valid loyalty card.']);
            }

            $stampCode = StampCode::create([
                'staff_id' => $staff->id, 'business_id' => $business->id, 'customer_id' => $customer->id,
                'loyalty_card_id' => $card->id, 'branch_id' => $staff->branch_id, 'reference_number' => $input['reference_number'],
                'code' => $this->scanCode(), 'used_at' => now(), 'is_expired' => false, 'is_offline_code' => false,
            ]);

            return $loyaltyStamps->apply($stampCode, $customer->id);
        }, 3);
    }

    private function customerFromQrPayload(string $payload): ?Customer
    {
        $parts = explode(':', $payload);
        if (count($parts) !== 5 || $parts[0] !== 'stampbayan' || $parts[1] !== 'customer') {
            return null;
        }

        [, , $customerId, $businessId, $signature] = $parts;
        $expected = substr(hash_hmac('sha256', "{$customerId}|{$businessId}", config('app.key')), 0, 24);

        if (! hash_equals($expected, $signature)) {
            return null;
        }

        return Customer::whereKey($customerId)->where('business_id', $businessId)->first();
    }

    private function scanCode(): string
    {
        do {
            $code = 'SCAN-'.Str::upper(Str::random(16));
        } while (StampCode::where('code', $code)->exists());

        return $code;
    }
}
