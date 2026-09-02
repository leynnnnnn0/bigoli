<?php

namespace App\Http\Requests\Business;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TicketIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return ['status' => ['nullable', Rule::in(['all', 'open', 'in_progress', 'resolved', 'closed'])]];
    }
}
