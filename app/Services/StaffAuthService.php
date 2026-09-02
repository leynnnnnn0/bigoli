<?php

namespace App\Services;

use App\Models\Staff;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class StaffAuthService
{
    public function login(Request $request, array $credentials): void
    {
        $key = $this->throttleKey($request, $credentials['username']);
        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);
            throw ValidationException::withMessages(['username' => trans('auth.throttle', ['seconds' => $seconds, 'minutes' => ceil($seconds / 60)])]);
        }

        $staff = Staff::where('username', $credentials['username'])->first();
        if (! $staff || ! $staff->is_active || ! Auth::guard('staff')->attempt([
            'username' => $credentials['username'],
            'password' => $credentials['password'],
        ], $credentials['remember'] ?? false)) {
            RateLimiter::hit($key);
            throw ValidationException::withMessages(['username' => __('auth.failed')]);
        }

        $request->session()->regenerate();
        RateLimiter::clear($key);
    }

    private function throttleKey(Request $request, string $username): string
    {
        return strtolower($username).'|'.$request->ip();
    }
}
