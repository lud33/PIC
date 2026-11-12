<?php

namespace App\Policies;

use App\Models\PicPost;
use App\Models\User;

class PicPostPolicy
{
    public function view(User $user, PicPost $pic): bool
    {
        // Public-ish: anyone authenticated can view, blocked users excluded in query layer
        return true;
    }

    public function update(User $user, PicPost $pic): bool
    {
        return $user->id === $pic->user_id;
    }

    public function delete(User $user, PicPost $pic): bool
    {
        return $user->id === $pic->user_id;
    }

    public function deactivate(User $user, PicPost $pic): bool
    {
        return $user->id === $pic->user_id;
    }

    public function manageParticipants(User $user, PicPost $pic): bool
    {
        return $user->id === $pic->user_id;
    }
}
