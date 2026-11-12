<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class CreatePicRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'event_name'    => ['required', 'string', 'max:150'],
            'description'   => ['required', 'string', 'max:1000'],
            'location'      => ['required', 'string', 'max:255'],
            'event_date'    => ['required', 'date', 'after:today'],
            'event_time'    => ['required', 'date_format:H:i'],
            'people_needed' => ['required', 'integer', 'min:1', 'max:20'],
            'category'      => ['sometimes', 'nullable', 'string', 'max:60'],
        ];
    }
}
