<?php

namespace App\Services;

use App\Models\Business;
use App\Models\Customer;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CustomerAuthService
{
    public function login(Request $request, array $credentials): bool
    {
        $key = $this->loginThrottleKey($request, $credentials['email']);
        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);
            throw ValidationException::withMessages(['email' => trans('auth.throttle', ['seconds' => $seconds, 'minutes' => ceil($seconds / 60)])]);
        }

        if (! Auth::guard('customer')->attempt([
            'email' => $credentials['email'],
            'password' => $credentials['password'],
        ], $credentials['remember'] ?? false)) {
            RateLimiter::hit($key);
            throw ValidationException::withMessages(['email' => __('auth.failed')]);
        }

        $request->session()->regenerate();
        RateLimiter::clear($key);

        return true;
    }

    public function register(array $data): Customer
    {
        $business = $this->registrationBusiness();

        return Customer::create([
            'business_id' => $business->id, 'branch_id' => $data['branch_id'],
            'username' => $data['username'], 'email' => $data['email'], 'password' => Hash::make($data['password']),
        ]);
    }

    public function loginPageData(?string $token, bool $isDemo): array
    {
        return ['business' => $token ? Business::where('qr_token', $token)->firstOrFail() : null, 'status' => session('status'), 'isDemo' => $isDemo];
    }

    public function registrationPageData(string $token, ?int $branchId): array
    {
        $business = $this->registrationBusiness();

        if ($token !== '' && ! hash_equals($business->qr_token, $token)) {
            abort(404);
        }

        if ($branchId && ! $business->branches()->whereKey($branchId)->exists()) {
            throw ValidationException::withMessages(['branch_id' => 'Please select a valid branch.']);
        }

        return [
            'business' => $business->only(['id', 'name']),
            'branches' => $business->branches()->orderBy('name')->get(['id', 'name']),
            'branch_id' => $branchId,
        ];
    }

    public function sendResetLink(Request $request, string $email): string
    {
        $key = 'password-reset:'.$request->ip();
        if (RateLimiter::tooManyAttempts($key, 3)) {
            $seconds = RateLimiter::availableIn($key);
            throw ValidationException::withMessages(['email' => trans('passwords.throttled', ['seconds' => $seconds, 'minutes' => ceil($seconds / 60)])]);
        }

        $status = Password::broker('customers')->sendResetLink(['email' => $email]);
        RateLimiter::hit($key, 60);

        if ($status !== Password::RESET_LINK_SENT) {
            throw ValidationException::withMessages(['email' => [__($status)]]);
        }

        return $status;
    }

    public function resetPassword(array $data): string
    {
        $status = Password::broker('customers')->reset(
            $data,
            function (Customer $customer, string $password) {
                $customer->forceFill(['password' => Hash::make($password)])
                    ->setRememberToken(Str::random(60));
                $customer->save();
                event(new PasswordReset($customer));
            },
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages(['email' => [__($status)]]);
        }

        return $status;
    }

    private function loginThrottleKey(Request $request, string $email): string
    {
        return strtolower($email).'|'.$request->ip();
    }

    private function registrationBusiness(): Business
    {
        return Business::query()->oldest('id')->firstOrFail();
    }
}
