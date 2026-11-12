<?php

namespace App\Policies;

use App\Models\Conversation;
use App\Models\User;

class ConversationPolicy
{
    private function isParticipant(User $user, Conversation $conversation): bool
    {
        return $conversation->user_one_id !== null
            && $conversation->user_two_id !== null
            && in_array($user->id, [$conversation->user_one_id, $conversation->user_two_id], true)
            && $conversation->participants()->where('user_id', $user->id)->exists();
    }

    public function view(User $user, Conversation $conversation): bool
    {
        return $this->isParticipant($user, $conversation);
    }

    public function sendMessage(User $user, Conversation $conversation): bool
    {
        return $this->isParticipant($user, $conversation);
    }
}
