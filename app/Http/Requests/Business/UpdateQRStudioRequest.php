<?php

namespace App\Http\Requests\Business;

use Illuminate\Foundation\Http\FormRequest;

class UpdateQRStudioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'heading' => ['required', 'string', 'max:100'],
            'subheading' => ['required', 'string', 'max:500'],
            'backgroundColor' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'textColor' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'logo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:5120'],
            'backgroundImage' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:10240'],
            'remove_logo' => ['nullable', 'boolean'],
            'remove_background_image' => ['nullable', 'boolean'],
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
        ];
    }
}
