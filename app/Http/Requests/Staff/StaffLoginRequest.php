<?php

namespace App\Http\Requests\Staff;

use Illuminate\Foundation\Http\FormRequest;

class StaffLoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return ['username' => ['required', 'string'], 'password' => ['required', 'string'], 'remember' => ['nullable', 'boolean']];
    }
}
