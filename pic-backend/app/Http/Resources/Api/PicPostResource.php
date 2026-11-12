<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PicPostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $participantsCount = $this->participants_count ?? $this->participants()->count();
        $availableSlots    = max(0, $this->people_needed - $participantsCount);

        return [
            'id'                => $this->id,
            'event_name'        => $this->event_name,
            'description'       => $this->description,
            'location'          => $this->location,
            'event_date'        => $this->event_date->toDateString(),
            'event_time'        => $this->event_time,
            'people_needed'     => $this->people_needed,
            'status'            => $this->status,
            'category'          => $this->category,
            'cover_image'       => $this->cover_image
                ? asset('storage/' . $this->cover_image)
                : null,
            'participants_count'=> $participantsCount,
            'available_slots'   => $availableSlots,
            'created_at'        => $this->created_at->toISOString(),
            'owner'             => $this->whenLoaded('owner', fn () =>
                new UserResource($this->owner->loadMissing('profile'))
            ),
            'participants'      => $this->whenLoaded('participantUsers', fn () =>
                UserResource::collection($this->participantUsers->each->loadMissing('profile'))
            ),
        ];
    }
}
