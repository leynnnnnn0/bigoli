<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetSessionLifetime
{
    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $accountType = match (true) {
            $request->is('customer', 'customer/*', 'stamps', 'stamps/*') => 'customer',
            $request->is('staff', 'staff/*') => 'staff',
            default => 'business',
        };

        config(['session.lifetime' => config("session.account_lifetimes.{$accountType}")]);

        return $next($request);
    }
}
