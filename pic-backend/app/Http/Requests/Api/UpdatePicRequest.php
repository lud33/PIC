<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePicRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'event_name'    => ['sometimes', 'string', 'max:150'],
            'description'   => ['sometimes', 'string', 'max:1000'],
            'location'      => ['sometimes', 'string', 'max:255'],
            'event_date'    => ['sometimes', 'date', 'after:today'],
            'event_time'    => ['sometimes', 'date_format:H:i'],
            'people_needed' => ['sometimes', 'integer', 'min:1', 'max:20'],
            'category'      => ['sometimes', 'nullable', 'string', 'max:60'],
        ];
    }
}
