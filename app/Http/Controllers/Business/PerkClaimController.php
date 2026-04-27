<?php

namespace App\Http\Controllers\Business;

use App\Http\Controllers\Controller;
use App\Models\PerkClaim;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PerkClaimController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $status = $request->input('status'); // 'all', 'available', 'redeemed'

        $perkClaims = PerkClaim::with([
                'customer:id,username,email',
                'perk:id,reward,details,stampNumber',
                'loyalty_card:id,name,logo',
                'redeemed_by:id,username',
                'redeemed_by_staff:id,username',
            ])
            ->whereHas('loyalty_card', function ($query) {
                $query->where('business_id', Auth::user()->business->id);
            })
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->whereHas('customer', function ($subQ) use ($search) {
                        $subQ->where('username', 'like', "%{$search}%")
                             ->orWhere('email', 'like', "%{$search}%");
                    })
                    ->orWhereHas('perk', function ($subQ) use ($search) {
                        $subQ->where('reward', 'like', "%{$search}%");
                    })
                    ->orWhereHas('loyalty_card', function ($subQ) use ($search) {
                        $subQ->where('name', 'like', "%{$search}%");
                    });
                });
            })
            ->when($status === 'available', function ($query) {
                $query->where('is_redeemed', false);
            })
            ->when($status === 'redeemed', function ($query) {
                $query->where('is_redeemed', true);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();


          

        $stats = [
            'total' => PerkClaim::whereHas('loyalty_card', function ($query) {
                $query->where('business_id', Auth::user()->business->id);
            })->count(),
            'available' => PerkClaim::whereHas('loyalty_card', function ($query) {
                $query->where('business_id', Auth::user()->business->id);
            })->where('is_redeemed', false)->count(),
            'redeemed' => PerkClaim::whereHas('loyalty_card', function ($query) {
                $query->where('business_id', Auth::user()->business->id);
            })->where('is_redeemed', true)->count(),
        ];

        return Inertia::render('Business/PerkClaim/Index', [
            'perkClaims' => $perkClaims,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'stats' => $stats,
        ]);
    }

    public function markAsRedeemed(Request $request, PerkClaim $perkClaim)
    {
        if ($perkClaim->loyalty_card->business_id !== Auth::user()->business->id) {
            abort(403, 'Unauthorized action.');
        }

        if ($perkClaim->is_redeemed) {
            return back()->with('error', 'This perk has already been redeemed.');
        }

        $validated = $request->validate([
            'remarks' => 'nullable|string|max:500',
        ]);

        dd('test');

        try {
            DB::transaction(function () use ($perkClaim, $validated) {
                $perkClaim->update([
                    'is_redeemed' => true,
                    'redeemed_at' => now(),
                    'redeemed_by' => Auth::guard('staff')->check() ? null : Auth::id(),
                    'redeemed_by_staff_id' => Auth::guard('staff')->check() ? Auth::id() : null,
                    'remarks' => $validated['remarks'] ?? null,
                ]);

                dd(Auth::guard('staff')->check() ? null : Auth::id());
            });

            return back()->with('success', 'Perk marked as redeemed successfully.');
        } catch (\Exception $e) {
            dd($e);
            return back()->with('error', 'Failed to mark perk as redeemed. Please try again.');
        }
    }

    public function undoRedeem(PerkClaim $perkClaim)
    {
        // Verify the perk claim belongs to this business
        if ($perkClaim->loyalty_card->business_id !== Auth::user()->business->id) {
            abort(403, 'Unauthorized action.');
        }

        if (!$perkClaim->is_redeemed) {
            return back()->with('error', 'This perk is not redeemed yet.');
        }

        try {
            DB::transaction(function () use ($perkClaim) {
                $perkClaim->update([
                    'is_redeemed' => false,
                    'redeemed_at' => null,
                    'redeemed_by' => null,
                    'remarks' => null,
                    'redeemed_by_staff_id' => null,
                ]);
            });

            return back()->with('success', 'Perk redemption undone successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to undo redemption. Please try again.');
        }
    }
}