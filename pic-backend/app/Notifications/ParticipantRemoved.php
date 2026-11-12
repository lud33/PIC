<?php

namespace App\Notifications;

use App\Models\PicPost;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class ParticipantRemoved extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly PicPost $picPost) {}

    public function via(object $notifiable): array { return ['database']; }

    public function toArray(object $notifiable): array
    {
        return [
            'message'     => "You have been removed from the {$this->picPost->event_name} PIC.",
            'pic_post_id' => $this->picPost->id,
            'event_name'  => $this->picPost->event_name,
        ];
    }
}
