<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'name'           => $this->name,
            'gender'         => $this->gender ?? 'neutral',
            'age'            => $this->date_of_birth
                                    ? (int) $this->date_of_birth->diffInYears(now())
                                    : null,
            'profile'        => $this->whenLoaded('profile', fn () => new ProfileResource($this->profile)),
        ];
    }
}
