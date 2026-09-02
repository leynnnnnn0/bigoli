<?php

namespace App\Services;

use App\Models\Branch;
use App\Models\Business;

class BranchService
{
    public function pageData(Business $business, array $filters): array
    {
        $search = $filters['search'] ?? null;

        return [
            'branches' => $business->branches()
                ->when($search, fn ($query, string $term) => $query->where('name', 'like', "%{$term}%"))
                ->latest()
                ->get(['id', 'business_id', 'name', 'address', 'remarks', 'created_at']),
            'filters' => ['search' => $search],
        ];
    }

    public function create(Business $business, array $data): Branch
    {
        return $business->branches()->create($data);
    }

    public function update(Business $business, Branch $branch, array $data): void
    {
        $this->ensureOwnedBy($business, $branch);
        $branch->update($data);
    }

    public function delete(Business $business, Branch $branch): ?string
    {
        $this->ensureOwnedBy($business, $branch);

        if ($branch->loyaltyCards()->exists()) {
            return 'Cannot delete branch because it has loyalty cards linked to it.';
        }
        if ($branch->stampCodes()->exists()) {
            return 'Cannot delete branch because it has stamp codes linked to it.';
        }

        $branch->delete();

        return null;
    }

    private function ensureOwnedBy(Business $business, Branch $branch): void
    {
        abort_unless($branch->business_id === $business->id, 403);
    }
}
