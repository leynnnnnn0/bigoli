<?php

namespace App\Http\Controllers\Business;

use App\Http\Controllers\Controller;
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
}
