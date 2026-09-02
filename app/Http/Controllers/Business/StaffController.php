<?php

namespace App\Http\Controllers\Business;

use App\Http\Controllers\Controller;
use App\Http\Requests\Business\StoreStaffRequest;
use App\Http\Requests\Business\UpdateStaffRequest;
use App\Models\Staff;
use App\Services\StaffService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StaffController extends Controller
{
    public function index(Request $request, StaffService $staffs)
    {
        return Inertia::render('Business/Staff/Index', $staffs->indexData(
            Auth::user()->business,
            $request->string('search')->trim()->toString() ?: null,
        ));
    }

    public function store(StoreStaffRequest $request, StaffService $staffs)
    {
        $staffs->create(Auth::user()->business, $request->validated());

        return redirect()->back()->with('success', 'Staff created successfully');
    }

    public function update(UpdateStaffRequest $request, Staff $staff, StaffService $staffs)
    {
        $staffs->update(Auth::user()->business, $staff, $request->validated());

        return redirect()->back()->with('success', 'Staff updated successfully');
    }

    public function destroy(Staff $staff, StaffService $staffs)
    {
        $staffs->delete(Auth::user()->business, $staff);

        return redirect()->back()->with('success', 'Staff deleted successfully');
    }
}
