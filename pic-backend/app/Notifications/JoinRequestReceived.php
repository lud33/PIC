<?php

namespace App\Notifications;

use App\Models\JoinRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class JoinRequestReceived extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly JoinRequest $joinRequest) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'message'        => "{$this->joinRequest->sender->name} wants to join your {$this->joinRequest->picPost->event_name} PIC.",
            'join_request_id'=> $this->joinRequest->id,
            'pic_post_id'    => $this->joinRequest->pic_post_id,
            'sender_id'      => $this->joinRequest->sender_id,
            'sender_name'    => $this->joinRequest->sender->name,
            'sender_gender'  => $this->joinRequest->sender->gender ?? 'neutral',
            'sender_avatar_style' => $this->joinRequest->sender->profile?->avatar_style,
            'sender_avatar_seed'  => $this->joinRequest->sender->profile?->avatar_seed,
            'event_name'     => $this->joinRequest->picPost->event_name,
        ];
    }
}
