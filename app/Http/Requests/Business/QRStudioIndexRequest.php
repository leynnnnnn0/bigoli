<?php

namespace App\Http\Requests\Business;

use Illuminate\Foundation\Http\FormRequest;

class QRStudioIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return ['branch_id' => ['nullable', 'integer', 'exists:branches,id']];
    }
}
