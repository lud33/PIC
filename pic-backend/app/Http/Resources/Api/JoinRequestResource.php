<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JoinRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'status'     => $this->status,
            'created_at' => $this->created_at->toISOString(),
            'pic'        => $this->whenLoaded('picPost', fn () => new PicPostResource($this->picPost)),
            'sender'     => $this->whenLoaded('sender', fn () =>
                new UserResource($this->sender->loadMissing('profile'))
            ),
        ];
    }
}
