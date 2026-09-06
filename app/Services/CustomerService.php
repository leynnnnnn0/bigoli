<?php

namespace App\Services;

use App\Models\Business;
use App\Models\Customer;

class CustomerService
{
    public function pageData(Business $business, array $filters): array
    {
        $search = $filters['search'] ?? null;

        return [
            'customers' => $business->customers()
                ->select(['id', 'business_id', 'username', 'email', 'created_at'])
                ->when($search, fn ($query, string $term) => $query->where(fn ($customers) => $customers
                    ->where('username', 'like', "%{$term}%")
                    ->orWhere('email', 'like', "%{$term}%")))
                ->latest()
                ->paginate(10)
                ->withQueryString(),
            'filters' => ['search' => $search],
        ];
    }

    public function find(Business $business, int $customerId): Customer
    {
        return $business->customers()
            ->with([
                'stamp_codes:id,customer_id,loyalty_card_id,branch_id,code,used_at,is_expired',
                'stamp_codes.loyalty_card:id,name',
                'stamp_codes.branch:id,name',
            ])
            ->findOrFail($customerId);
    }
}
