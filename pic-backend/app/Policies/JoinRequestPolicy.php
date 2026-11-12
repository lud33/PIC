<?php

namespace App\Policies;

use App\Models\JoinRequest;
use App\Models\User;

class JoinRequestPolicy
{
    /** Only the PIC owner (receiver) can accept or decline */
    public function manage(User $user, JoinRequest $joinRequest): bool
    {
        return $user->id === $joinRequest->receiver_id;
    }
}
