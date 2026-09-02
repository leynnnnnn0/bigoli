<?php

namespace App\Http\Controllers\Business;

use App\Http\Controllers\Controller;
use App\Http\Requests\Business\QRStudioIndexRequest;
use App\Http\Requests\Business\UpdateQRStudioRequest;
use App\Services\QRStudioService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class QRStudioController extends Controller
{
    public function index(QRStudioIndexRequest $request, QRStudioService $qrStudio)
    {
        return Inertia::render('Business/QRStudio/Index', $qrStudio->pageData(
            Auth::user()->business,
            $request->integer('branch_id') ?: null,
        ));
    }

    public function download(QRStudioService $qrStudio)
    {
        $pdf = Pdf::loadView('pdf.qr-code', $qrStudio->downloadData(Auth::user()->business));
        $pdf->setPaper('letter', 'portrait');

        return $pdf->download('qr-code.pdf');
    }

    public function update(UpdateQRStudioRequest $request, QRStudioService $qrStudio)
    {
        $qrStudio->update(
            Auth::user()->business,
            $request->validated(),
            $request->file('logo'),
            $request->file('backgroundImage'),
        );

        return back()->with('success', 'QR Code settings saved successfully!');
    }
}
