<?php

namespace App\Http\Requests\Business;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCardTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $nameRule = Rule::unique('loyalty_cards', 'name')
            ->where('business_id', $this->user()->business->id)
            ->ignore($this->route('card_template'));

        return [
            'logo' => ['nullable', 'string'], 'name' => ['required', 'string', 'max:255', $nameRule],
            'heading' => ['required', 'string', 'max:255'], 'subheading' => ['nullable', 'string', 'max:255'],
            'valid_until' => ['required', 'date'], 'stampsNeeded' => ['required', 'integer', 'min:1'],
            'mechanics' => ['required', 'string', 'max:500'],
            'backgroundColor' => ['nullable', 'string', 'max:7'], 'textColor' => ['nullable', 'string', 'max:7'],
            'stampColor' => ['nullable', 'string', 'max:7'], 'stampFilledColor' => ['nullable', 'string', 'max:7'],
            'stampEmptyColor' => ['nullable', 'string', 'max:7'], 'stampImage' => ['nullable', 'string'],
            'backgroundImage' => ['nullable', 'string'], 'footer' => ['nullable', 'string', 'max:255'],
            'stampShape' => ['required', 'string', Rule::in(['circle', 'square', 'star', 'hexagon'])],
            'perks' => ['nullable', 'array'], 'perks.*.id' => ['nullable', 'integer', 'distinct', 'exists:perks,id'],
            'perks.*.stampNumber' => ['required_with:perks', 'integer', 'min:1', 'lte:stampsNeeded', 'distinct'],
            'perks.*.reward' => ['required_with:perks', 'string', 'max:255'], 'perks.*.color' => ['nullable', 'string', 'max:7'],
            'perks.*.details' => ['nullable', 'string', 'max:1000'],
            'branch_ids' => ['nullable', 'array'], 'branch_ids.*' => ['integer', 'exists:branches,id'],
        ];
    }
}
