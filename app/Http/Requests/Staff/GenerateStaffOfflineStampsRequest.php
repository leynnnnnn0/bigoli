<?php

namespace App\Http\Requests\Staff;

use Illuminate\Foundation\Http\FormRequest;

class GenerateStaffOfflineStampsRequest extends FormRequest
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
