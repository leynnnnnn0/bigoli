<?php

namespace App\Services;

use App\Models\Business;
use App\Models\LoyaltyCard;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Validation\ValidationException;

class CardTemplateService
{
    public function indexData(Business $business): array
    {
        return ['cardTemplates' => $business->loyaltyCards()->with('perks')->latest()->get()];
    }

    public function show(Business $business, int $cardId): LoyaltyCard
    {
        return $business->loyaltyCards()->with('perks')->findOrFail($cardId);
    }

    public function formData(Business $business, ?int $cardId = null): array
    {
        return array_filter([
            'cardTemplate' => $cardId ? $business->loyaltyCards()->with(['perks' => fn ($query) => $query->withExists('claims'), 'branches:id,name'])->findOrFail($cardId) : null,
            'branches' => $business->branches()->orderBy('name')->get(['id', 'name']),
        ], fn ($value, string $key) => $key !== 'cardTemplate' || $value !== null, ARRAY_FILTER_USE_BOTH);
    }

    public function create(Business $business, array $data): LoyaltyCard
    {
        $this->ensureBranchesBelongToBusiness($business, $data['branch_ids'] ?? []);

        return DB::transaction(function () use ($business, $data) {
            $card = $business->loyaltyCards()->create($this->cardAttributes($data, []));
            $this->syncPerks($card, $data['perks'] ?? []);
            $card->branches()->sync($data['branch_ids'] ?? []);

            return $card;
        });
    }

    public function update(Business $business, int $cardId, array $data): LoyaltyCard
    {
        $this->ensureBranchesBelongToBusiness($business, $data['branch_ids'] ?? []);

        return DB::transaction(function () use ($business, $cardId, $data) {
            $card = $business->loyaltyCards()->lockForUpdate()->findOrFail($cardId);
            $this->ensureEarnedPerksUnchanged($card, $data['perks'] ?? []);
            $oldImages = $this->imagePaths($card);
            $card->update($this->cardAttributes($data, $oldImages));
            $this->syncPerks($card, $data['perks'] ?? []);
            $card->branches()->sync($data['branch_ids'] ?? []);

            foreach (array_filter(array_diff($oldImages, $this->imagePaths($card->fresh()))) as $path) {
                $this->deleteImage($path);
            }

            return $card;
        });
    }

    public function delete(Business $business, int $cardId): void
    {
        $images = DB::transaction(function () use ($business, $cardId) {
            $card = $business->loyaltyCards()->lockForUpdate()->findOrFail($cardId);
            $this->ensureEarnedPerksUnchanged($card, []);
            $images = $this->imagePaths($card);
            $card->delete();

            return $images;
        });
        foreach (array_filter($images) as $path) {
            $this->deleteImage($path);
        }
    }

    private function cardAttributes(array $data, array $currentImages): array
    {
        return [
            'logo' => $this->imagePath($data, 'logo', 'card-logos', $currentImages['logo'] ?? null),
            'name' => $data['name'], 'heading' => $data['heading'], 'subheading' => $data['subheading'] ?? null,
            'stampsNeeded' => $data['stampsNeeded'], 'valid_until' => $data['valid_until'], 'mechanics' => $data['mechanics'],
            'backgroundColor' => $data['backgroundColor'] ?? '#FFFFFF', 'textColor' => $data['textColor'] ?? '#000000',
            'stampColor' => $data['stampColor'] ?? '#FF0000', 'stampFilledColor' => $data['stampFilledColor'] ?? '#FF0000',
            'stampEmptyColor' => $data['stampEmptyColor'] ?? '#CCCCCC',
            'stampImage' => $this->imagePath($data, 'stampImage', 'stamp-images', $currentImages['stampImage'] ?? null),
            'backgroundImage' => $this->imagePath($data, 'backgroundImage', 'card-backgrounds', $currentImages['backgroundImage'] ?? null),
            'footer' => $data['footer'] ?? null, 'stampShape' => $data['stampShape'],
        ];
    }

    private function syncPerks(LoyaltyCard $card, array $perks): void
    {
        $keptIds = [];
        foreach ($perks as $perkData) {
            $perk = null;
            if (isset($perkData['id'])) {
                $perk = $card->perks()->find($perkData['id']);
                if (! $perk) {
                    throw ValidationException::withMessages(['perks' => 'A selected perk does not belong to this card.']);
                }
            }

            $attributes = [
                'stampNumber' => $perkData['stampNumber'], 'reward' => $perkData['reward'],
                'color' => $perkData['color'] ?? $perk?->color ?? '#000000', 'details' => $perkData['details'] ?? null,
            ];
            if ($perk) {
                $perk->update($attributes);
            } else {
                $perk = $card->perks()->create($attributes);
            }
            $keptIds[] = $perk->id;
        }
        $card->perks()->whereNotIn('id', $keptIds)->delete();
    }

    private function ensureEarnedPerksUnchanged(LoyaltyCard $card, array $perks): void
    {
        $submitted = collect($perks)->keyBy('id');
        foreach ($card->perks()->whereHas('claims')->get() as $perk) {
            $input = $submitted->get($perk->id);
            if (! $input
                || (int) $input['stampNumber'] !== (int) $perk->stampNumber
                || $input['reward'] !== $perk->reward
                || ($input['details'] ?? '') !== ($perk->details ?? '')
                || ($input['color'] ?? $perk->color) !== $perk->color) {
                throw ValidationException::withMessages([
                    'perks' => 'This perk has already been earned and cannot be changed or removed. This preserves customers’ rewards and redemption history. Create a new card for different rewards.',
                ]);
            }
        }
    }

    private function ensureBranchesBelongToBusiness(Business $business, array $branchIds): void
    {
        if (count($branchIds) !== $business->branches()->whereIn('id', $branchIds)->count()) {
            throw ValidationException::withMessages(['branch_ids' => 'One or more selected branches are invalid.']);
        }
    }

    private function imagePath(array $data, string $field, string $folder, ?string $currentPath): ?string
    {
        if (! array_key_exists($field, $data)) {
            return $currentPath;
        }
        if (! $data[$field]) {
            return null;
        }
        if ($data[$field] === $currentPath || $data[$field] === '/'.$currentPath) {
            return $currentPath;
        }

        if (! preg_match('/^data:image\/(jpg|jpeg|png|gif|webp);base64,/', $data[$field], $matches)) {
            throw ValidationException::withMessages([$field => 'Please provide a valid image.']);
        }
        $image = base64_decode(substr($data[$field], strpos($data[$field], ',') + 1), true);
        if ($image === false) {
            throw ValidationException::withMessages([$field => 'The image could not be decoded.']);
        }

        $directory = public_path($folder);
        File::ensureDirectoryExists($directory);
        $path = $folder.'/'.uniqid('', true).'.'.strtolower($matches[1]);
        File::put(public_path($path), $image);

        return $path;
    }

    private function imagePaths(LoyaltyCard $card): array
    {
        return [
            'logo' => $card->logo,
            'stampImage' => $card->stampImage,
            'backgroundImage' => $card->backgroundImage,
        ];
    }

    private function deleteImage(string $path): void
    {
        File::delete(public_path($path));
    }
}
