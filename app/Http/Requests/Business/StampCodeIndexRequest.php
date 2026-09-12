<?php

namespace App\Http\Requests\Business;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StampCodeIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', Rule::in(['used', 'active'])],
            'loyalty_card_id' => ['nullable', 'integer', 'exists:loyalty_cards,id'],
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
            'assigned' => ['nullable', Rule::in(['assigned', 'unassigned'])],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
            'used_from' => ['nullable', 'date'],
            'used_to' => ['nullable', 'date'],
            'sort_by' => ['nullable', Rule::in(['created_at', 'used_at', 'code'])],
            'sort_dir' => ['nullable', Rule::in(['asc', 'desc'])],
        ];
    }
}
