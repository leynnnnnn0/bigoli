<?php

namespace App\Http\Controllers\Business;

use App\Http\Controllers\Controller;
use App\Http\Requests\Business\GenerateOfflineStampsRequest;
use App\Http\Requests\Business\IssueStampRequest;
use App\Services\IssueStampService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class IssueStampController extends Controller
{
    public function index(IssueStampRequest $request, IssueStampService $issueStamps)
    {
        return Inertia::render('Business/IssueStamp/Index', $issueStamps->pageData(
            Auth::user()->business,
            $request->validated(),
            (int) Auth::id(),
        ));
    }

    public function generateOfflineStamps(GenerateOfflineStampsRequest $request, IssueStampService $issueStamps)
    {
        $data = $issueStamps->offlineStamps(
            Auth::user()->business,
            $request->integer('id'),
            (int) Auth::id(),
        );

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadHTML(view('pdf.offline-stamps', $data)->render());
        $pdf->setPaper('a4', 'portrait');

        return $pdf->download('loyalty-stamps-'.now()->format('Y-m-d').'.pdf');
    }
}
