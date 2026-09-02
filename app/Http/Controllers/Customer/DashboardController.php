<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\UpdateCustomerPasswordRequest;
use App\Http\Requests\Customer\UpdateCustomerProfileRequest;
use App\Services\CustomerDashboardService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(CustomerDashboardService $dashboard)
    {
        return Inertia::render('Customer/Dashboard/Index', $dashboard->data(Auth::guard('customer')->user()));
    }

    public function updateProfile(UpdateCustomerProfileRequest $request, CustomerDashboardService $dashboard)
    {
        $customer = Auth::guard('customer')->user();
        if ($dashboard->isDemoCustomer($customer)) {
            return back()->withErrors(['error' => 'Demo account cannot make changes.']);
        }

        $dashboard->updateProfile($customer, $request->validated());

        return back()->with('flash', ['message' => 'Profile updated successfully', 'type' => 'success']);
    }

    public function updatePassword(UpdateCustomerPasswordRequest $request, CustomerDashboardService $dashboard)
    {
        $customer = Auth::guard('customer')->user();
        if ($dashboard->isDemoCustomer($customer)) {
            return back()->withErrors(['error' => 'Demo account cannot make changes.']);
        }

        $dashboard->updatePassword($customer, $request->validated());

        return back()->with('flash', ['message' => 'Password updated successfully', 'type' => 'success']);
    }
}
