<?php

namespace App\Http\Requests\Business;

use Illuminate\Foundation\Http\FormRequest;

class GenerateOfflineStampsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return ['id' => ['required', 'integer', 'exists:loyalty_cards,id']];
    }
}
