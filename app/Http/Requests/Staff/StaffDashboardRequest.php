<?php

namespace App\Http\Requests\Staff;

use Illuminate\Foundation\Http\FormRequest;

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
        ];
    }
}
