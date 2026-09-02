<?php

namespace App\Http\Requests\Business;

use Illuminate\Foundation\Http\FormRequest;

class ReplyToTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'message' => ['required', 'string'],
            'images' => ['nullable', 'array'],
            'images.*' => ['image', 'max:5120'],
        ];
    }
}
