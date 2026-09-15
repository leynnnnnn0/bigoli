<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Http\Requests\Staff\GenerateStaffStampCodeRequest;
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
        $input = $request->validated();
        $generatedCode = $request->session()->get('generated_code');

        if (is_array($generatedCode)) {
            $input['loyalty_card_id'] = $generatedCode['loyalty_card_id'];
            $input['branch_id'] = $generatedCode['branch_id'];
            $input['transaction_number'] = $generatedCode['transaction_number'];
            $input['amount_spent'] = $generatedCode['amount_spent'];
        }

        $data = $dashboard->data(
            Auth::guard('staff')->user(),
            $input,
            $issueStamps,
        );

        if (is_array($generatedCode)) {
            $data['code'] = $generatedCode;
        }

        return Inertia::render('Staff/Dashboard/Index', $data);
    }

    public function generateCode(GenerateStaffStampCodeRequest $request, IssueStampService $issueStamps)
    {
        $code = $issueStamps->generateForStaff(
            Auth::guard('staff')->user(),
            $request->validated(),
        );

        return to_route('staff.dashboard', ['tab' => 'issue-stamp'])
            ->with('generated_code', $code);
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
