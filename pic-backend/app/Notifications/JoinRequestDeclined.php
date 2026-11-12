<?php

namespace App\Notifications;

use App\Models\JoinRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class JoinRequestDeclined extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly JoinRequest $joinRequest) {}

    public function via(object $notifiable): array { return ['database']; }

    public function toArray(object $notifiable): array
    {
        return [
            'message'        => "Your request to join {$this->joinRequest->picPost->event_name} was not accepted.",
            'join_request_id'=> $this->joinRequest->id,
            'pic_post_id'    => $this->joinRequest->pic_post_id,
            'event_name'     => $this->joinRequest->picPost->event_name,
        ];
    }
}
