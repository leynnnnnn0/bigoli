<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Http\Requests\Staff\StaffLoginRequest;
use App\Services\StaffAuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StaffAuthController extends Controller
{
    public function index()
    {
        return Inertia::render('Staff/Auth/Login', ['status' => session('status')]);
    }

    public function login(StaffLoginRequest $request, StaffAuthService $staffAuth)
    {
        $staffAuth->login($request, $request->validated());

        return redirect()->intended(route('staff.dashboard'));
    }

    public function logout(Request $request)
    {
        Auth::guard('staff')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('staff.login');
    }
}
