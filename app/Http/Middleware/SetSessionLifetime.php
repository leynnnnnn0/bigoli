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
        $host = $request->getHost();

        $accountType = match (true) {
            $host === config('portals.domains.customer') => 'customer',
            $host === config('portals.domains.staff') => 'staff',
            default => 'business',
        };

        config(['session.lifetime' => config("session.account_lifetimes.{$accountType}")]);

        return $next($request);
    }
}
