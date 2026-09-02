<?php

namespace App\Services;

use App\Models\CompletedLoyaltyCard;
use App\Models\Customer;
use App\Models\LoyaltyCard;
use App\Models\PerkClaim;
use App\Models\StampCode;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Support\Facades\Hash;

class CustomerDashboardService
{
    public function data(Customer $customer): array
    {
        return [
            'cardTemplates' => LoyaltyCard::with('perks')->where('business_id', $customer->business_id)->whereDate('valid_until', '>', today())->get(),
            'stampCodes' => StampCode::where('customer_id', $customer->id)->whereNotNull('used_at')->latest('used_at')->get(['id', 'customer_id', 'loyalty_card_id', 'code', 'used_at']),
            'completedCards' => CompletedLoyaltyCard::where('customer_id', $customer->id)
                ->with('loyaltyCard:id,name')->recent()->get()
                ->map(fn (CompletedLoyaltyCard $completed) => [
                    'id' => $completed->id, 'loyalty_card_id' => $completed->loyalty_card_id,
                    'loyalty_card_name' => $completed->loyaltyCard->name, 'stamps_collected' => $completed->stamps_collected,
                    'completed_at' => $completed->completed_at, 'card_cycle' => $completed->card_cycle, 'stamps_data' => $completed->stamps_data,
                ]),
            'customerName' => $this->greeting().', '.strtoupper($customer->username),
            'perkClaims' => PerkClaim::where('customer_id', $customer->id)->with('perk', 'loyalty_card')->latest()->get(),
            'customer' => $customer,
            'customerQrSvg' => $this->customerQrSvg($customer->id, $customer->business_id),
        ];
    }

    public function updateProfile(Customer $customer, array $data): void
    {
        $customer->update(['username' => $data['username']]);
    }

    public function updatePassword(Customer $customer, array $data): void
    {
        $customer->update(['password' => Hash::make($data['password'])]);
    }

    public function isDemoCustomer(Customer $customer): bool
    {
        return $customer->email === 'customer@gmail.com';
    }

    private function customerQrSvg(int $customerId, int $businessId): string
    {
        $signature = substr(hash_hmac('sha256', "{$customerId}|{$businessId}", config('app.key')), 0, 24);
        $renderer = new ImageRenderer(new RendererStyle(260), new SvgImageBackEnd());

        return (new Writer($renderer))->writeString("stampbayan:customer:{$customerId}:{$businessId}:{$signature}");
    }

    private function greeting(): string
    {
        return match (true) {
            now()->hour < 12 => 'Good morning',
            now()->hour < 18 => 'Good afternoon',
            default => 'Good evening',
        };
    }
}
