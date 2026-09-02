<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;

class CustomerAuthPageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'token' => ['nullable', 'string', 'exists:businesses,qr_token'],
            'business' => ['nullable', 'string', 'exists:businesses,qr_token'],
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
            'data.is_demo' => ['nullable', 'boolean'],
        ];
    }
}
