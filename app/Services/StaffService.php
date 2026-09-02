<?php

namespace App\Services;

use App\Models\Branch;
use App\Models\Business;
use App\Models\Staff;
use Illuminate\Support\Facades\Hash;

class StaffService
{
    public function indexData(Business $business, ?string $search): array
    {
        $staffs = $business->staffs()
            ->with('branchRelation:id,name')
            ->when($search, function ($query, string $search) {
                $query->where(function ($staff) use ($search) {
                    $staff->where('username', 'like', "%{$search}%")
                        ->orWhere('remarks', 'like', "%{$search}%")
                        ->orWhereHas('branchRelation', fn ($branch) => $branch->where('name', 'like', "%{$search}%"));
                });
            })
            ->latest()
            ->get();

        return [
            'staffs' => $staffs,
            'branches' => $business->branches()->orderBy('name')->get(['id', 'name']),
            'filters' => ['search' => $search],
        ];
    }

    public function create(Business $business, array $attributes): Staff
    {
        $this->ensureBranchBelongsToBusiness($business, (int) $attributes['branch_id']);

        return $business->staffs()->create([
            'branch_id' => $attributes['branch_id'],
            'username' => $attributes['username'],
            'password' => Hash::make($attributes['password']),
            'remarks' => $attributes['remarks'] ?? null,
            'is_active' => $attributes['is_active'] ?? true,
        ]);
    }

    public function update(Business $business, Staff $staff, array $attributes): void
    {
        $this->ensureStaffBelongsToBusiness($business, $staff);
        $this->ensureBranchBelongsToBusiness($business, (int) $attributes['branch_id']);

        $data = [
            'branch_id' => $attributes['branch_id'],
            'username' => $attributes['username'],
            'remarks' => $attributes['remarks'] ?? null,
            'is_active' => $attributes['is_active'] ?? true,
        ];

        if (! empty($attributes['password'])) {
            $data['password'] = Hash::make($attributes['password']);
        }

        $staff->update($data);
    }

    public function delete(Business $business, Staff $staff): void
    {
        $this->ensureStaffBelongsToBusiness($business, $staff);
        $staff->delete();
    }

    private function ensureBranchBelongsToBusiness(Business $business, int $branchId): void
    {
        abort_unless($business->branches()->whereKey($branchId)->exists(), 403);
    }

    private function ensureStaffBelongsToBusiness(Business $business, Staff $staff): void
    {
        abort_unless((int) $staff->business_id === (int) $business->id, 403);
    }
}
