<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Http\Requests\Business\BranchIndexRequest;
use App\Http\Requests\Business\StoreBranchRequest;
use App\Http\Requests\Business\UpdateBranchRequest;
use App\Services\BranchService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BranchController extends Controller
{
    public function index(BranchIndexRequest $request, BranchService $branches)
    {
        return Inertia::render('Business/Branch/Index', $branches->pageData(
            Auth::user()->business,
            $request->validated(),
        ));
    }

    public function store(StoreBranchRequest $request, BranchService $branches)
    {
        $branches->create(Auth::user()->business, $request->validated());

        return redirect()->back()->with('success', 'Branch created successfully');
    }

    public function update(UpdateBranchRequest $request, Branch $branch, BranchService $branches)
    {
        $branches->update(Auth::user()->business, $branch, $request->validated());

        return redirect()->back()->with('success', 'Branch updated successfully');
    }

    public function destroy(Branch $branch, BranchService $branches)
    {
        if ($message = $branches->delete(Auth::user()->business, $branch)) {
            return back()->with('error', $message);
        }

        return back()->with('success', 'Branch deleted successfully');
    }
}
