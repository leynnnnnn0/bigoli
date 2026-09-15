<?php

namespace App\Http\Requests\Business;

use Illuminate\Foundation\Http\FormRequest;

class RecordCustomerScanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_qr' => ['required', 'string'],
            'loyalty_card_id' => ['required', 'integer', 'exists:loyalty_cards,id'],
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
            'transaction_number' => ['required', 'string', 'max:255'],
            'amount_spent' => ['required', 'numeric', 'decimal:0,2', 'min:0'],
        ];
    }
}
