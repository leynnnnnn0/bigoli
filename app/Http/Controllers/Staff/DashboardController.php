<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Http\Requests\Staff\RecordStaffCustomerScanRequest;
use App\Http\Requests\Staff\RedeemStaffPerkClaimRequest;
use App\Http\Requests\Staff\StaffDashboardRequest;
use App\Models\PerkClaim;
use App\Services\IssueStampService;
use App\Services\LoyaltyStampService;
use App\Services\PerkClaimService;
use App\Services\StaffDashboardService;
use App\Services\StampCodeService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(StaffDashboardRequest $request, StaffDashboardService $dashboard, IssueStampService $issueStamps)
    {
        return Inertia::render('Staff/Dashboard/Index', $dashboard->data(
            Auth::guard('staff')->user(),
            $request->validated(),
            $issueStamps,
        ));
    }

    public function recordCustomerScan(RecordStaffCustomerScanRequest $request, StampCodeService $stampCodes, LoyaltyStampService $loyaltyStamps)
    {
        return back()->with($stampCodes->recordStaffCustomerScan(
            Auth::guard('staff')->user(),
            $request->validated(),
            $loyaltyStamps,
        ));
    }

    public function markAsRedeemed(RedeemStaffPerkClaimRequest $request, PerkClaim $perkClaim, PerkClaimService $perkClaims)
    {
        $staff = Auth::guard('staff')->user();
        if (! $perkClaims->redeem($perkClaim, $staff->business_id, null, $staff->id, $request->validated('remarks'))) {
            return back()->withErrors(['error' => 'This perk has already been redeemed.']);
        }

        return back()->with('success', 'Perk marked as redeemed successfully.');
    }

    public function undoRedeem(PerkClaim $perkClaim, PerkClaimService $perkClaims)
    {
        $staff = Auth::guard('staff')->user();
        if (! $perkClaims->undoRedemption($perkClaim, $staff->business_id)) {
            return back()->withErrors(['error' => 'This perk is not redeemed yet.']);
        }

        return back()->with('success', 'Perk redemption undone successfully.');
    }
}
