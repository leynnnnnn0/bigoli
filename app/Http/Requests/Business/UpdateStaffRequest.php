<?php

namespace App\Http\Requests\Business;

use App\Models\Staff;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStaffRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        /** @var Staff $staff */
        $staff = $this->route('staff');

        return [
            'branch_id' => ['required', 'integer', 'exists:branches,id'],
            'username' => ['required', 'string', 'max:255', Rule::unique('staff', 'username')->ignore($staff)],
            'password' => ['nullable', 'string', 'min:8'],
            'remarks' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
