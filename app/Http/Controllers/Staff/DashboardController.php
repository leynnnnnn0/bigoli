<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Http\Requests\Staff\GenerateStaffOfflineStampsRequest;
use App\Http\Requests\Staff\RecordStaffCustomerScanRequest;
use App\Http\Requests\Staff\RedeemStaffPerkClaimRequest;
use App\Http\Requests\Staff\StaffDashboardRequest;
use App\Models\PerkClaim;
use App\Services\IssueStampService;
use App\Services\LoyaltyStampService;
use App\Services\PerkClaimService;
use App\Services\StaffDashboardService;
use App\Services\StampCodeService;
use Barryvdh\DomPDF\Facade\Pdf;
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

    public function generateOfflineStamps(GenerateStaffOfflineStampsRequest $request, IssueStampService $issueStamps)
    {
        $staff = Auth::guard('staff')->user();
        $data = $issueStamps->offlineStamps($staff->business, $request->integer('id'), null, $staff->id, $staff->branch_id);
        $pdf = Pdf::loadView('pdf.offline-stamps', $data);
        $pdf->setPaper('a4', 'portrait');

        return $pdf->download('loyalty-stamps-'.now()->format('Y-m-d').'.pdf');
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
