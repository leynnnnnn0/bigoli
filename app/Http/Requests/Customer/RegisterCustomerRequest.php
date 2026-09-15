<?php

namespace App\Http\Requests\Customer;

use App\Models\Business;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $businessId = Business::query()->oldest('id')->value('id');

        return [
            'branch_id' => ['required', 'integer', Rule::exists('branches', 'id')->where('business_id', $businessId)],
            'username' => ['required', 'string', 'max:255', 'unique:customers,username'],
            'email' => ['required', 'email', 'unique:customers,email'],
            'date_of_birth' => ['required', 'date', 'before_or_equal:today'],
            'phone_number' => ['required', 'string', 'max:30'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ];
    }
}
