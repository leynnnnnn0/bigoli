<?php

namespace App\Http\Controllers\Business;

use App\Http\Controllers\Controller;
use App\Services\BusinessDashboardService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request, BusinessDashboardService $dashboard)
    {
        $business = Auth::user()->business;
        $branchId = $request->integer('branch_id') ?: null;

        return Inertia::render('Business/Dashboard/Index', $dashboard->data($business, $branchId));
    }
}
