<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'conversation_id' => $this->conversation_id,
            'message'         => $this->message,
            'created_at'      => $this->created_at->toISOString(),
            'sender'          => $this->whenLoaded('sender', fn () =>
                new UserResource($this->sender->loadMissing('profile'))
            ),
        ];
    }
}
