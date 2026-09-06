<?php

namespace App\Http\Requests\Business;

use Illuminate\Foundation\Http\FormRequest;

class IssueStampRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
            'loyalty_card_id' => ['nullable', 'integer', 'exists:loyalty_cards,id'],
            'reference_number' => ['required_with:loyalty_card_id', 'nullable', 'string', 'max:255'],
        ];
    }
}
