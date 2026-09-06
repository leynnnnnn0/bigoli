<?php

namespace App\Services;

use App\Models\Branch;
use App\Models\Business;
use App\Models\Customer;
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
            ->when($filters['search'] ?? null, fn (Builder $query, string $term) => $query->where(function (Builder $codes) use ($term) {
                $codes->where('code', 'like', "%{$term}%")
                    ->orWhere('reference_number', 'like', "%{$term}%")
                    ->orWhereHas('customer', fn (Builder $customers) => $customers
                        ->where('username', 'like', "%{$term}%")
                        ->orWhere('email', 'like', "%{$term}%"));
            }))
            ->when(($filters['status'] ?? null) === 'used', fn (Builder $query) => $query->whereNotNull('used_at'))
            ->when(($filters['status'] ?? null) === 'active', fn (Builder $query) => $query->whereNull('used_at'))
            ->when($filters['type'] ?? null, fn (Builder $query, string $type) => $query->where('is_offline_code', $type === 'offline'))
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
        return DB::transaction(function () use ($customer, $code, $loyaltyStamps) {
            $stampCode = StampCode::where('code', $code)
                ->where('business_id', $customer->business_id)
                ->whereNull('used_at')
                ->lockForUpdate()
                ->first();

            if (! $stampCode) {
                return null;
            }

            $stampCode->update(['customer_id' => $customer->id, 'used_at' => now()]);

            return $loyaltyStamps->apply($stampCode, $customer->id);
        });
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

        $card = $business->loyaltyCards()
            ->whereDate('valid_until', '>', today())
            ->whereKey($input['loyalty_card_id'])
            ->when($branchId, fn (Builder $query) => $query->where(fn (Builder $cards) => $cards
                ->whereHas('branches', fn (Builder $branches) => $branches->whereKey($branchId))
                ->orWhereDoesntHave('branches')))
            ->first();

        if (! $card) {
            throw ValidationException::withMessages(['loyalty_card_id' => 'Please select a valid loyalty card.']);
        }

        return DB::transaction(function () use ($business, $customer, $card, $branchId, $input, $userId, $loyaltyStamps) {
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
        });
    }

    public function recordStaffCustomerScan(Staff $staff, array $input, LoyaltyStampService $loyaltyStamps): array
    {
        $business = $staff->business;
        $customer = $this->customerFromQrPayload($input['customer_qr']);
        if (! $customer || $customer->business_id !== $business->id) {
            throw ValidationException::withMessages(['customer_qr' => 'This customer QR code is invalid for this business.']);
        }

        $card = $business->loyaltyCards()
            ->whereDate('valid_until', '>', today())
            ->whereKey($input['loyalty_card_id'])
            ->where(fn (Builder $cards) => $cards->whereDoesntHave('branches')
                ->orWhereHas('branches', fn (Builder $branches) => $branches->whereKey($staff->branch_id)))
            ->first();
        if (! $card) {
            throw ValidationException::withMessages(['loyalty_card_id' => 'Please select a valid loyalty card.']);
        }

        return DB::transaction(function () use ($staff, $business, $customer, $card, $input, $loyaltyStamps) {
            $stampCode = StampCode::create([
                'staff_id' => $staff->id, 'business_id' => $business->id, 'customer_id' => $customer->id,
                'loyalty_card_id' => $card->id, 'branch_id' => $staff->branch_id, 'reference_number' => $input['reference_number'],
                'code' => $this->scanCode(), 'used_at' => now(), 'is_expired' => false, 'is_offline_code' => false,
            ]);

            return $loyaltyStamps->apply($stampCode, $customer->id);
        });
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
