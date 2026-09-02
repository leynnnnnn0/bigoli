<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\CustomerAuthPageRequest;
use App\Http\Requests\Customer\CustomerLoginRequest;
use App\Http\Requests\Customer\RegisterCustomerRequest;
use App\Http\Requests\Customer\ResetCustomerPasswordRequest;
use App\Http\Requests\Customer\SendCustomerResetLinkRequest;
use App\Services\CustomerAuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CustomerAuthController extends Controller
{
    public function index(CustomerAuthPageRequest $request, CustomerAuthService $customerAuth)
    {
        return Inertia::render('Customer/Auth/Login', $customerAuth->loginPageData(
            $request->validated('token'),
            $request->boolean('data.is_demo'),
        ));
    }

    public function login(CustomerLoginRequest $request, CustomerAuthService $customerAuth)
    {
        $customerAuth->login($request, $request->validated());

        return redirect()->intended(route('customer.dashboard'));
    }

    public function showRegister(CustomerAuthPageRequest $request, CustomerAuthService $customerAuth)
    {
        return Inertia::render('Customer/Auth/Register', $customerAuth->registrationPageData(
            (string) $request->validated('business'),
            $request->integer('branch_id') ?: null,
        ));
    }

    public function register(RegisterCustomerRequest $request, CustomerAuthService $customerAuth)
    {
        $customer = $customerAuth->register($request->validated());
        Auth::guard('customer')->login($customer);

        return redirect()->route('customer.dashboard');
    }

    public function logout(Request $request)
    {
        Auth::guard('customer')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('customer.login');
    }

    public function showForgotPassword()
    {
        return Inertia::render('Customer/Auth/ForgotPassword', ['status' => session('status')]);
    }

    public function sendResetLink(SendCustomerResetLinkRequest $request, CustomerAuthService $customerAuth)
    {
        return back()->with('status', __($customerAuth->sendResetLink($request, $request->validated('email'))));
    }

    public function showResetPassword(Request $request, string $token)
    {
        return Inertia::render('Customer/Auth/ResetPassword', ['email' => $request->email, 'token' => $token]);
    }

    public function resetPassword(ResetCustomerPasswordRequest $request, CustomerAuthService $customerAuth)
    {
        $status = $customerAuth->resetPassword($request->validated());

        return redirect()->route('customer.login')->with('status', __($status));
    }

    public function getGuide()
    {
        return Inertia::render('Customer/Auth/Guide');
    }
}
