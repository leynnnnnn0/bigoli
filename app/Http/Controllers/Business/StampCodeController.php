<?php

namespace App\Http\Controllers\Business;

use App\Exports\StampCodesExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Business\RecordCustomerScanRequest;
use App\Http\Requests\Business\StampCodeIndexRequest;
use App\Http\Requests\Customer\RedeemStampCodeRequest;
use App\Services\LoyaltyStampService;
use App\Services\StampCodeService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class StampCodeController extends Controller
{
    public function index(StampCodeIndexRequest $request, StampCodeService $stampCodes)
    {
        return Inertia::render('Business/StampCode/Index', $stampCodes->pageData(
            Auth::user()->business,
            $request->validated(),
        ));
    }

    public function export(StampCodeIndexRequest $request, StampCodeService $stampCodes)
    {
        return Excel::download(
            new StampCodesExport($stampCodes->query(Auth::user()->business->id, $request->validated())),
            'stamp-codes-'.now()->format('Y-m-d').'.xlsx',
        );
    }

    public function record(RedeemStampCodeRequest $request, StampCodeService $stampCodes, LoyaltyStampService $loyaltyStamps)
    {
        $result = $stampCodes->redeemForCustomer(
            Auth::guard('customer')->user(),
            $request->validated('code'),
            $loyaltyStamps,
        );

        if (! $result) {
            return back()->withErrors(['code' => 'Invalid or already used stamp code.']);
        }

        return back()->with($result);
    }

    public function recordCustomerScan(RecordCustomerScanRequest $request, StampCodeService $stampCodes, LoyaltyStampService $loyaltyStamps)
    {
        return back()->with($stampCodes->recordCustomerScan(
            Auth::user()->business,
            (int) Auth::id(),
            $request->validated(),
            $loyaltyStamps,
        ));
    }
}
