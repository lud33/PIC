<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConversationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $latestMsg = $this->latestMessage->first();

        return [
            'id'           => $this->id,
            'pic'          => $this->whenLoaded('picPost', fn () => new PicPostResource($this->picPost)),
            'participants' => $this->whenLoaded('participants', fn () =>
                UserResource::collection($this->participants->each->loadMissing('profile'))
            ),
            'last_message' => $latestMsg ? new MessageResource($latestMsg) : null,
            'created_at'   => $this->created_at->toISOString(),
        ];
    }
}
