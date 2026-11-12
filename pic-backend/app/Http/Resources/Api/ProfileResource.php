<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'profile_photo' => $this->profile_photo
                ? asset('storage/' . $this->profile_photo)
                : null,
            'avatar_style'  => $this->avatar_style,
            'avatar_seed'   => $this->avatar_seed,
            'bio'           => $this->bio,
            'location'      => $this->location,
            'interests'     => $this->interests ?? [],
        ];
    }
}
