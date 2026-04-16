<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class BranchController extends Controller
{
    public function index(Request $request)
    {
        $query = Branch::query();

        $query->where('business_id', Auth::user()->business->id);

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $branches = $query->orderBy('created_at', 'desc')->get();

        return Inertia::render('Business/Branch/Index', [
            'branches' => $branches,
            'filters' => [
                'search' => $request->search,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'remarks' => 'nullable|string',
        ]);

        $validated['business_id'] = Auth::user()->business->id;

        Branch::create($validated);

        return redirect()->back()->with('success', 'Branch created successfully');
    }

    public function update(Request $request, Branch $branch)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'remarks' => 'nullable|string',
        ]);

        $branch->update($validated);

        return redirect()->back()->with('success', 'Branch updated successfully');
    }

    public function destroy(Branch $branch)
    {
        if ($branch->loyaltyCards()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete branch because it has loyalty cards linked to it.');
        }

        if ($branch->stampCodes()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete branch because it has stamp codes linked to it.');
        }

        $branch->delete();
        return redirect()->back()->with('success', 'Branch deleted successfully');
    }
}
