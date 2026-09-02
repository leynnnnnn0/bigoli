<?php

namespace App\Services;

use App\Models\Business;
use App\Models\QrCode;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Validation\ValidationException;

class QRStudioService
{
    public function pageData(Business $business, ?int $branchId): array
    {
        $this->ensureBranchBelongsToBusiness($business, $branchId);

        return [
            'qrCode' => $business->qr_code,
            'branches' => $business->branches()->orderBy('name')->get(['id', 'name']),
            'branch_id' => $branchId,
        ];
    }

    public function update(Business $business, array $data, ?UploadedFile $logo, ?UploadedFile $backgroundImage): QrCode
    {
        $this->ensureBranchBelongsToBusiness($business, $data['branch_id'] ?? null);
        $qrCode = $business->qr_code;
        $oldLogo = $qrCode?->logo;
        $oldBackground = $qrCode?->background_image;

        $settings = [
            'heading' => $data['heading'], 'subheading' => $data['subheading'],
            'background_color' => $data['backgroundColor'], 'text_color' => $data['textColor'],
            'branch_id' => $data['branch_id'] ?? null,
        ];
        if ($logo) {
            $settings['logo'] = $this->storeImage($logo, 'uploads/qr-codes/logos');
        } elseif ($data['remove_logo'] ?? false) {
            $settings['logo'] = null;
        }
        if ($backgroundImage) {
            $settings['background_image'] = $this->storeImage($backgroundImage, 'uploads/qr-codes/backgrounds');
        } elseif ($data['remove_background_image'] ?? false) {
            $settings['background_image'] = null;
        }

        $qrCode = $business->qr_code()->updateOrCreate([], $settings);
        if (($logo || ($data['remove_logo'] ?? false)) && $oldLogo !== $qrCode->logo) {
            $this->deleteImage($oldLogo);
        }
        if (($backgroundImage || ($data['remove_background_image'] ?? false)) && $oldBackground !== $qrCode->background_image) {
            $this->deleteImage($oldBackground);
        }

        return $qrCode;
    }

    public function downloadData(Business $business): array
    {
        $qrCode = $business->qr_code()->firstOrCreate([], [
            'heading' => 'Taylora', 'subheading' => 'Join our loyalty program by scanning the QR code',
        ]);
        $url = $business->subdomain
            ? $business->subdomain.'/customer/register/?business='.$business->qr_token
            : 'https://stampbayan.com/customer/register?business='.$business->qr_token;
        if ($qrCode->branch_id) {
            $url .= '&branch_id='.$qrCode->branch_id;
        }

        $qrImage = file_get_contents('https://api.qrserver.com/v1/create-qr-code/?size=500x500&data='.urlencode($url));

        return [
            'heading' => $qrCode->heading ?? 'Loyalty Program',
            'subheading' => $qrCode->subheading ?? 'Join our loyalty program by scanning the QR code',
            'backgroundColor' => $qrCode->background_color ?? '#FFFFFF',
            'textColor' => $qrCode->text_color ?? '#000000',
            'qrUrl' => $url,
            'qrCodeBase64' => 'data:image/png;base64,'.base64_encode($qrImage),
            'logoBase64' => $this->imageBase64($qrCode->logo),
            'backgroundImageBase64' => $this->imageBase64($qrCode->background_image),
        ];
    }

    private function ensureBranchBelongsToBusiness(Business $business, ?int $branchId): void
    {
        if ($branchId && ! $business->branches()->whereKey($branchId)->exists()) {
            throw ValidationException::withMessages(['branch_id' => 'Please select a valid branch.']);
        }
    }

    private function storeImage(UploadedFile $image, string $directory): string
    {
        File::ensureDirectoryExists(public_path($directory));
        $filename = uniqid('', true).'.'.strtolower($image->extension());
        $image->move(public_path($directory), $filename);

        return $directory.'/'.$filename;
    }

    private function deleteImage(?string $path): void
    {
        if ($path) {
            File::delete(public_path($path));
        }
    }

    private function imageBase64(?string $path): ?string
    {
        $path = $path ? public_path($path) : null;
        if (! $path || ! File::exists($path)) {
            return null;
        }

        return 'data:image/'.pathinfo($path, PATHINFO_EXTENSION).';base64,'.base64_encode(File::get($path));
    }
}
