<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'          => ['sometimes', 'string', 'max:100'],
            'gender'        => ['sometimes', 'required', 'string', 'in:female,male,neutral'],
            'avatar_style'  => ['required_with:avatar_seed', 'string', 'in:lorelei,adventurer,pixel-art,bottts'],
            'avatar_seed'   => ['required_with:avatar_style', 'string', 'max:100'],
            'bio'           => ['sometimes', 'nullable', 'string', 'max:500'],
            'location'      => ['sometimes', 'nullable', 'string', 'max:150'],
            'interests'     => ['sometimes', 'nullable', 'array'],
            'interests.*'   => ['string', 'max:50'],
            'profile_photo' => ['sometimes', 'nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:3072'],
        ];
    }
}
