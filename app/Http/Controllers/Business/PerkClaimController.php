<?php

namespace App\Http\Controllers\Business;

use App\Http\Controllers\Controller;
use App\Http\Requests\Business\PerkClaimIndexRequest;
use App\Http\Requests\Business\RedeemPerkClaimRequest;
use App\Models\PerkClaim;
use App\Services\PerkClaimService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PerkClaimController extends Controller
{
    private function currentBusinessId(): int
    {
        if (Auth::guard('staff')->check()) {
            return Auth::guard('staff')->user()->business_id;
        }

        return Auth::user()->business->id;
    }

    public function index(PerkClaimIndexRequest $request, PerkClaimService $perkClaims)
    {
        return Inertia::render('Business/PerkClaim/Index', $perkClaims->pageData(
            $this->currentBusinessId(),
            $request->validated(),
        ));
    }

    public function markAsRedeemed(RedeemPerkClaimRequest $request, PerkClaim $perkClaim, PerkClaimService $perkClaims)
    {
        if (! $perkClaims->redeem(
            $perkClaim,
            $this->currentBusinessId(),
            Auth::guard('staff')->check() ? null : Auth::id(),
            Auth::guard('staff')->id(),
            $request->validated('remarks'),
        )) {
            return back()->with('error', 'This perk has already been redeemed.');
        }

        return back()->with('success', 'Perk marked as redeemed successfully.');
    }

    public function undoRedeem(PerkClaim $perkClaim, PerkClaimService $perkClaims)
    {
        if (! $perkClaims->undoRedemption($perkClaim, $this->currentBusinessId())) {
            return back()->with('error', 'This perk is not redeemed yet.');
        }

        return back()->with('success', 'Perk redemption undone successfully.');
    }
}
