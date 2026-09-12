<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EnsureStaffIsActive
{
    public function handle(Request $request, Closure $next)
    {
        $staff = $request->user('staff');
        if (! $staff || ! $staff->is_active) {
            Auth::guard('staff')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            if ($request->expectsJson()) {
                return response()->json(['message' => 'This staff account is inactive.'], 403);
            }

            return redirect()->route('staff.login')->withErrors(['username' => 'This staff account is inactive.']);
        }

        return $next($request);
    }
}
