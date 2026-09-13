<?php

namespace App\Http\Requests\Staff;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StaffDashboardRequest extends FormRequest
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
            'reference_number' => ['nullable', 'string', 'max:255'],
            'tab' => ['nullable', Rule::in(['issue-stamp', 'perk-claims', 'stamp-codes'])],
            'rewards_page' => ['nullable', 'integer', 'min:1'],
            'codes_page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
