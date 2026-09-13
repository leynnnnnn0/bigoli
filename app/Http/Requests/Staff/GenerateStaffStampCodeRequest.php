<?php

namespace App\Http\Requests\Staff;

use Illuminate\Foundation\Http\FormRequest;

class GenerateStaffStampCodeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
            'loyalty_card_id' => ['required', 'integer', 'exists:loyalty_cards,id'],
            'reference_number' => ['required', 'string', 'max:255'],
        ];
    }
}
