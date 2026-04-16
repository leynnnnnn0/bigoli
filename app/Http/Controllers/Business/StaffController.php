<?php

namespace App\Http\Controllers\Business;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class StaffController extends Controller
{
    public function index(Request $request)
    {
        $query = Staff::query()->with('branchRelation');

        $query->where('business_id', Auth::user()->business->id);

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('branchRelation', fn($b) => $b->where('name', 'like', "%{$search}%"))
                    ->orWhere('username', 'like', "%{$search}%")
                    ->orWhere('remarks', 'like', "%{$search}%");
            });
        }

        $staffs = $query->orderBy('created_at', 'desc')->get();

        $branches = \App\Models\Branch::where('business_id', Auth::user()->business->id)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Business/Staff/Index', [
            'staffs' => $staffs,
            'branches' => $branches,
            'filters' => [
                'search' => $request->search,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'username' => 'required|string|max:255|unique:staff,username',
            'password' => 'required|string|min:8',
            'confirm_password' => 'required|string|same:password',
            'remarks' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        Staff::create([
            'business_id' => Auth::user()->business->id,
            'branch_id' => $validated['branch_id'],
            'username' => $validated['username'],
            'password' => Hash::make($validated['password']),
            'remarks' => $validated['remarks'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->back()->with('success', 'Staff created successfully');
    }

    public function update(Request $request, Staff $staff)
    {
        $validated = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'username' => [
                'required',
                'string',
                'max:255',
                Rule::unique('staff', 'username')->ignore($staff->id),
            ],
            'password' => 'nullable|string|min:8',
            'remarks' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $data = [
            'branch_id' => $validated['branch_id'],
            'username' => $validated['username'],
            'remarks' => $validated['remarks'] ?? null,
            'is_active' => $validated['is_active'],
        ];

        if (!empty($validated['password'])) {
            $data['password'] = Hash::make($validated['password']);
        }

        $staff->update($data);

        return redirect()->back()->with('success', 'Staff updated successfully');
    }

    public function destroy(Staff $staff)
    {
        $staff->delete();

        return redirect()->back()->with('success', 'Staff deleted successfully');
    }
}