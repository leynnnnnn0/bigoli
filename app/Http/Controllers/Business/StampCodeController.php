<?php

namespace App\Http\Controllers\Business;

use App\Exports\StampCodesExport;
use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\CompletedLoyaltyCard;
use App\Models\LoyaltyCard;
use App\Models\PerkClaim;
use App\Models\StampCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class StampCodeController extends Controller
{
    private function buildQuery(Request $request)
    {
        $businessId = Auth::user()->business->id;

        $query = StampCode::with(['customer:id,username,email', 'loyalty_card:id,name', 'branch:id,name', 'user:id,email', 'staff:id,email'])
            ->where('business_id', $businessId);

        // Search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                    ->orWhere('reference_number', 'like', "%{$search}%")
                    ->orWhereHas(
                        'customer',
                        fn($cq) =>
                        $cq->where('username', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%")
                    );
            });
        }

        // Status filter
        if ($status = $request->input('status')) {
            match ($status) {
                'used'    => $query->whereNotNull('used_at')->where('is_expired', false),
                'expired' => $query->where('is_expired', true),
                'active'  => $query->whereNull('used_at')->where('is_expired', false),
                default   => null,
            };
        }

        // Type filter
        if ($request->filled('type')) {
            $query->where('is_offline_code', $request->input('type') === 'offline');
        }

        // Loyalty card filter
        if ($loyaltyCardId = $request->input('loyalty_card_id')) {
            $query->where('loyalty_card_id', $loyaltyCardId);
        }

        // Branch filter
        if ($branchId = $request->input('branch_id')) {
            $query->where('branch_id', $branchId);
        }

        // Assignment filter
        if ($assigned = $request->input('assigned')) {
            match ($assigned) {
                'assigned'   => $query->whereNotNull('customer_id'),
                'unassigned' => $query->whereNull('customer_id'),
                default      => null,
            };
        }

        // Date range filters
        if ($dateFrom = $request->input('date_from')) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo = $request->input('date_to')) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        // Used date range
        if ($usedFrom = $request->input('used_from')) {
            $query->whereDate('used_at', '>=', $usedFrom);
        }
        if ($usedTo = $request->input('used_to')) {
            $query->whereDate('used_at', '<=', $usedTo);
        }

        // Sort
        $sortBy  = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');
        $allowedSorts = ['created_at', 'used_at', 'code', 'is_expired'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        }

        return $query;
    }
    
    public function index(Request $request)
    {
        $businessId = Auth::user()->business->id;

        $stampCodes = $this->buildQuery($request)
            ->paginate(10)
            ->withQueryString();

        $loyaltyCards = LoyaltyCard::where('business_id', $businessId)
            ->select('id', 'name')->get();

        $branches = Branch::where('business_id', $businessId)
            ->select('id', 'name')->get();

        return Inertia::render('Business/StampCode/Index', [
            'stampCodes'  => $stampCodes,
            'loyaltyCards' => $loyaltyCards,
            'branches'    => $branches,
            'filters'     => $request->only([
                'search',
                'status',
                'type',
                'loyalty_card_id',
                'branch_id',
                'assigned',
                'date_from',
                'date_to',
                'used_from',
                'used_to',
                'sort_by',
                'sort_dir',
            ]),
        ]);
    }

    public function export(Request $request)
    {
        $query = $this->buildQuery($request);
        return Excel::download(new StampCodesExport($query), 'stamp-codes-' . now()->format('Y-m-d') . '.xlsx');
    }
    public function record(Request $request)
    {
       
        $validated = $request->validate([
            'code' => [
                'required',
                'string',
                'exists:stamp_codes,code',
                function ($attribute, $value, $fail) {
                    $stampCode = StampCode::where('code', $value)->first();
                    if (!$stampCode) {
                        $fail('The stamp code is invalid for this loyalty card.');
                    } elseif ($stampCode->is_expired) {
                        $fail('This stamp code has expired.');
                    } elseif ($stampCode->used_at !== null) {
                        $fail('This stamp code has already been used.');
                    }elseif(Auth::guard('customer')->user()->business_id != $stampCode->business_id){
                        $fail('This stamp code does not belong to this business');
                    }
                },
            ],
            'loyalty_card_id' => 'required|exists:loyalty_cards,id'
        ]);



        $stampCode = StampCode::where('code', $validated['code'])
            ->whereNull('used_at')
            ->where('is_expired', false)
            ->first();

          

        if (!$stampCode) {
            return response()->json(['success' => false, 'message' => 'Invalid or expired stamp code.'], 400);
        }

        $customerId = Auth::guard('customer')->user()->id;
        $loyaltyCardId = $validated['loyalty_card_id'];

        try {
            return DB::transaction(function () use ($stampCode, $customerId) {
                // Update the stamp code
                $stampCode->update([
                    'customer_id' => $customerId,
                    'used_at' => now(),
                ]);

                // Count total stamps for this customer on this loyalty card
                $totalStamps = StampCode::where('customer_id', $customerId)
                    ->where('loyalty_card_id', $stampCode->loyalty_card_id)
                    ->whereNotNull('used_at')
                    ->count();

                // Get the loyalty card
                $loyaltyCard = LoyaltyCard::with('perks')->find($stampCode->loyalty_card_id);

                // Check for newly unlocked perks
                $newlyUnlockedPerks = [];
                $perksToUnlock = $loyaltyCard->perks->where('stampNumber', $totalStamps);

                foreach ($perksToUnlock as $perk) {
                    // Check if perk hasn't been claimed yet
                    $existingClaim = PerkClaim::where('customer_id', $customerId)
                        ->where('perk_id', $perk->id)
                        ->first();

                    if (!$existingClaim) {
                        PerkClaim::create([
                            'customer_id' => $customerId,
                            'loyalty_card_id' => $stampCode->loyalty_card_id,
                            'perk_id' => $perk->id,
                            'stamps_at_claim' => $totalStamps,
                            'is_redeemed' => false,
                        ]);

                        $newlyUnlockedPerks[] = $perk->reward;
                    }
                }

                // Check if card is complete
                if ($totalStamps >= $loyaltyCard->stampsNeeded) {
                    // Get all stamps for this completion
                    $usedStamps = StampCode::where('customer_id', $customerId)
                        ->where('loyalty_card_id', $stampCode->loyalty_card_id)
                        ->whereNotNull('used_at')
                        ->get();

                    // Count previous completions
                    $previousCompletions = CompletedLoyaltyCard::where('customer_id', $customerId)
                        ->where('loyalty_card_id', $stampCode->loyalty_card_id)
                        ->count();

                    // Create stamps data array
                    $stampsData = $usedStamps->map(function ($stamp) {
                        return [
                            'id' => $stamp->id,
                            'code' => $stamp->code,
                            'used_at' => $stamp->used_at,
                        ];
                    })->toArray();

                    // Create completion record
                    CompletedLoyaltyCard::create([
                        'customer_id' => $customerId,
                        'loyalty_card_id' => $stampCode->loyalty_card_id,
                        'stamps_collected' => $totalStamps,
                        'completed_at' => now(),
                        'card_cycle' => $previousCompletions + 1,
                        'stamps_data' => json_encode($stampsData),
                    ]);

                    // Delete used stamps
                    StampCode::where('customer_id', $customerId)
                        ->where('loyalty_card_id', $stampCode->loyalty_card_id)
                        ->whereNotNull('used_at')
                        ->delete();

                    $message = 'Congratulations! You completed your loyalty card!';
                    if (!empty($newlyUnlockedPerks)) {
                        $message .= ' New rewards unlocked: ' . implode(', ', $newlyUnlockedPerks);
                    }

                    return back()->with([
                        'success' => true,
                        'active_card_id' => $stampCode->loyalty_card_id,
                        'card_completed' => true,
                        'message' => $message,
                        'cycle_number' => $previousCompletions + 1,
                        'newly_unlocked_perks' => $newlyUnlockedPerks
                    ]);
                }

                $message = 'Stamp recorded successfully!';
                if (!empty($newlyUnlockedPerks)) {
                    $message .= ' New rewards unlocked: ' . implode(', ', $newlyUnlockedPerks);
                }

                return back()->with([
                    'success' => true,
                    'active_card_id' => $stampCode->loyalty_card_id,
                    'card_completed' => false,
                    'message' => $message,
                    'stamps_remaining' => $loyaltyCard->stampsNeeded - $totalStamps,
                    'newly_unlocked_perks' => $newlyUnlockedPerks
                ]);
            });
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to record stamp. Please try again.']);
        }
    }
}
