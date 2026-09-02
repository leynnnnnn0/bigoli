<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\LoyaltyCard;
use App\Models\PerkClaim;
use App\Models\StampCode;
use App\Services\LoyaltyStampService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Auth as FacadesAuth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $staff = Auth::guard('staff')->user();
        $businessId = $staff->business_id;

        // Get branches assigned to this staff member only
        $branches = \App\Models\Branch::where('business_id', $businessId)
            ->where('id', $staff->branch_id)
            ->select('id', 'name')
            ->get();

        $selectedBranchId = $request->input('branch_id');

        // If staff has a branch assigned and no branch is selected yet, default to their branch
        if (!$selectedBranchId && $staff->branch_id) {
            $selectedBranchId = (string) $staff->branch_id;
        }

        // Get loyalty cards for this business, filtered by branch like Issue Stamp page
        $cardsQuery = LoyaltyCard::where('business_id', $businessId)
            ->whereDate('valid_until', '>', today());

        if ($selectedBranchId) {
            // Cards explicitly assigned to this branch OR cards with NO branch assignments (available everywhere)
            $cardsQuery->where(function ($q) use ($selectedBranchId) {
                $q->whereHas('branches', fn($b) => $b->where('branches.id', $selectedBranchId))
                    ->orWhereDoesntHave('branches');
            });
        } else {
            // No branch selected — show only cards available everywhere (no branch assignments)
            $cardsQuery->whereDoesntHave('branches');
        }

        $cards = $cardsQuery->select('id', 'name', 'logo')->get();

        // Generate code if loyalty_card_id is provided
        $code = [
            'success' => false,
            'code' => '',
            'qr_url' => '',
            'created_at' => ''
        ];

        if ($request->has('loyalty_card_id')) {
            $loyaltyCardId = $request->input('loyalty_card_id');

            // Validate that the card belongs to this business and is in filtered cards
            $cardExists = $cards->contains('id', $loyaltyCardId);

            if ($cardExists) {
                $code = $this->generateStampCode(
                    $loyaltyCardId,
                    $staff->id,
                    $businessId,
                    $selectedBranchId,
                    $request->input('reference_number')  
                );
            }
        }

        // Get perk claims
        $perkClaims = PerkClaim::with([
            'customer:id,username,email',
            'perk:id,reward,details,stampNumber',
            'loyalty_card:id,name,logo',
            'redeemed_by:id,username',
            'redeemed_by_staff:id,username',
        ])
            ->whereHas('loyalty_card', function ($query) use ($businessId) {
                $query->where('business_id', $businessId);
            })
            ->latest()
            ->limit(50)
            ->get();

        // Get stamp codes
        $stampCodes = StampCode::with(['loyalty_card:id,name', 'customer:id,username,email'])
        ->where('staff_id', Auth::id())
            ->where('business_id', $businessId)
            ->withTrashed()
            ->latest()
            ->limit(50)
            ->get();

        // Get stats
        $stats = [
            'total' => PerkClaim::whereHas('loyalty_card', function ($query) use ($businessId) {
                $query->where('business_id', $businessId);
            })->count(),
            'available' => PerkClaim::whereHas('loyalty_card', function ($query) use ($businessId) {
                $query->where('business_id', $businessId);
            })->where('is_redeemed', false)->count(),
            'redeemed' => PerkClaim::whereHas('loyalty_card', function ($query) use ($businessId) {
                $query->where('business_id', $businessId);
            })->where('is_redeemed', true)->count(),
        ];

        return Inertia::render('Staff/Dashboard/Index', [
            'code'            => $code,
            'cards'           => $cards,
            'branches'        => $branches,
            'loyalty_card_id' => $request->input('loyalty_card_id', null),
            'branch_id'       => $selectedBranchId,
            'reference_number' => $request->input('reference_number'),
            'perkClaims'      => $perkClaims,
            'stampCodes'      => $stampCodes,
            'stats'           => $stats,
        ]);
    }

    private function generateStampCode($loyaltyCardId, $staffId, $businessId,  $selectedBranchId = null, $referenceNumber = null)
    {
        // Expire old unused codes
        StampCode::whereNull('used_at')
            ->where('created_at', '<=', Carbon::now()->subMinutes(15))
            ->where('is_offline_code', false)
            ->update([
                'is_expired' => true
            ]);

        // Generate unique code
        do {
            $code = strtoupper(Str::random(8));
        } while (StampCode::where('code', $code)->exists());

        // Create stamp code
        $stampCode = StampCode::create([
            'user_id'          => Auth::guard('staff')->check() ? null : Auth::id(),
            'staff_id'         => Auth::guard('staff')->check() ? Auth::id() : null,
            'business_id'     => $businessId,
            'customer_id'     => null,
            'loyalty_card_id' => $loyaltyCardId,
            'branch_id'       => $selectedBranchId ?? null,
            'reference_number' => $referenceNumber,
            'code'            => $code,
            'used_at'         => null,
            'is_expired'      => false
        ]);

        return [
            'success'    => true,
            'code'       => $stampCode->code,
            'qr_url'     => "https://api.qrserver.com/v1/create-qr-code/?size=500x500&data={$stampCode->code}",
            'created_at' => $stampCode->created_at->format('M d, Y h:i A')
        ];
    }

    public function recordCustomerScan(Request $request, LoyaltyStampService $loyaltyStamps)
    {
        $validated = $request->validate([
            'customer_qr' => ['required', 'string'],
            'loyalty_card_id' => ['required', 'integer', 'exists:loyalty_cards,id'],
            'reference_number' => ['required', 'string', 'max:255'],
        ]);

        $staff = Auth::guard('staff')->user();
        $customer = $this->customerFromQrPayload($validated['customer_qr']);

        if (! $customer || (int) $customer->business_id !== (int) $staff->business_id) {
            return back()->withErrors(['customer_qr' => 'This customer QR code is invalid for this business.']);
        }

        $card = LoyaltyCard::where('business_id', $staff->business_id)
            ->whereDate('valid_until', '>', today())
            ->whereKey($validated['loyalty_card_id'])
            ->where(function ($cards) use ($staff) {
                $cards->whereDoesntHave('branches')
                    ->orWhereHas('branches', fn ($branches) => $branches->whereKey($staff->branch_id));
            })
            ->first();

        if (! $card) {
            return back()->withErrors(['loyalty_card_id' => 'Please select a valid loyalty card.']);
        }

        return DB::transaction(function () use ($staff, $customer, $card, $validated, $loyaltyStamps) {
            $stampCode = StampCode::create([
                'staff_id' => $staff->id,
                'business_id' => $staff->business_id,
                'customer_id' => $customer->id,
                'loyalty_card_id' => $card->id,
                'branch_id' => $staff->branch_id,
                'reference_number' => $validated['reference_number'],
                'code' => 'SCAN-'.Str::upper(Str::random(16)),
                'used_at' => now(),
                'is_expired' => false,
                'is_offline_code' => false,
            ]);

            return back()->with($loyaltyStamps->apply($stampCode, $customer->id));
        });
    }

    private function customerFromQrPayload(string $payload): ?Customer
    {
        $parts = explode(':', $payload);

        if (count($parts) !== 5 || $parts[0] !== 'stampbayan' || $parts[1] !== 'customer') {
            return null;
        }

        [, , $customerId, $businessId, $signature] = $parts;
        $expected = substr(hash_hmac('sha256', "{$customerId}|{$businessId}", config('app.key')), 0, 24);

        if (! hash_equals($expected, $signature)) {
            return null;
        }

        return Customer::whereKey($customerId)->where('business_id', $businessId)->first();
    }

    public function generateOfflineStamps(Request $request)
    {
        $staff = Auth::guard('staff')->user();
        $businessId = $staff->business_id;
        $loyaltyCardId = $request->input('id');

        // Validate loyalty card belongs to business
        $card = LoyaltyCard::where('id', $loyaltyCardId)
            ->where('business_id', $businessId)
            ->first();

        if (!$card) {
            abort(403, 'Unauthorized');
        }

        // Get business info for registration link
        $business = $staff->business;
        $registrationLink = "https://stampbayan.com/customer/register?business=" . $business->qr_token;

        // Generate 8 unique codes and save to database
        $tickets = [];
        $stampCodesToInsert = [];

        for ($i = 0; $i < 8; $i++) {
            do {
                $code = strtoupper(Str::random(8));
            } while (
                StampCode::where('code', $code)->exists() ||
                in_array($code, array_column($tickets, 'code'))
            );

            // Prepare data for database insertion
            $stampCodesToInsert[] = [
                'user_id'         => $staff->id,
                'business_id'     => $businessId,
                'loyalty_card_id' => $loyaltyCardId,
                'branch_id'       => $staff->branch_id ?? null,
                'code'            => $code,
                'is_offline_code' => true,
                'created_at'      => now(),
                'updated_at'      => now()
            ];

            // Generate QR code and convert to base64
            $qrImageUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' . urlencode($registrationLink);
            $qrImageData = file_get_contents($qrImageUrl);
            $qrCodeBase64 = 'data:image/png;base64,' . base64_encode($qrImageData);

            $tickets[] = [
                'code'           => $code,
                'qr_code_base64' => $qrCodeBase64
            ];
        }

        // Bulk insert all stamp codes into database
        StampCode::insert($stampCodesToInsert);

        $html = view('pdf.offline-stamps', [
            'tickets'          => $tickets,
            'registrationLink' => $registrationLink,
            'businessName'     => $business->name
        ])->render();

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html);
        $pdf->setPaper('a4', 'portrait');

        return $pdf->download('loyalty-stamps-' . date('Y-m-d') . '.pdf');
    }

    public function markAsRedeemed(Request $request, PerkClaim $perkClaim)
    {
        $staff = Auth::guard('staff')->user();
        $businessId = $staff->business_id;

        // Verify the perk claim belongs to this business
        if ($perkClaim->loyalty_card->business_id !== $businessId) {
            abort(403, 'Unauthorized action.');
        }

        if ($perkClaim->is_redeemed) {
            return back()->withErrors(['error' => 'This perk has already been redeemed.']);
        }

        $validated = $request->validate([
            'remarks' => 'nullable|string|max:500',
        ]);

        try {
            DB::transaction(function () use ($perkClaim, $validated) {
                $perkClaim->update([
                    'is_redeemed' => true,
                    'redeemed_at' => now(),
                    'redeemed_by' => null,
                    'redeemed_by_staff_id' => Auth::guard('staff')->id(),
                    'remarks'     => $validated['remarks'] ?? null,
                ]);
            });

            return back()->with('success', 'Perk marked as redeemed successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to mark perk as redeemed. Please try again.']);
        }
    }

    public function undoRedeem(PerkClaim $perkClaim)
    {
        $staff = Auth::guard('staff')->user();
        $businessId = $staff->business_id;

        // Verify the perk claim belongs to this business
        if ($perkClaim->loyalty_card->business_id !== $businessId) {
            abort(403, 'Unauthorized action.');
        }

        if (!$perkClaim->is_redeemed) {
            return back()->withErrors(['error' => 'This perk is not redeemed yet.']);
        }

        try {
            DB::transaction(function () use ($perkClaim) {
                $perkClaim->update([
                    'is_redeemed' => false,
                    'redeemed_at' => null,
                    'redeemed_by' => null,
                    'redeemed_by_staff_id' => null,
                    'remarks'     => null,
                ]);
            });

            return back()->with('success', 'Perk redemption undone successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to undo redemption. Please try again.']);
        }
    }
}
