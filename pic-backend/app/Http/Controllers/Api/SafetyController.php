<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ReportUserRequest;
use App\Models\Block;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SafetyController extends Controller
{
    public function block(Request $request, User $user): JsonResponse
    {
        $blocker = $request->user();

        if ($blocker->id === $user->id) {
            return response()->json(['message' => 'You cannot block yourself.'], 422);
        }

        Block::firstOrCreate([
            'blocker_id' => $blocker->id,
            'blocked_id' => $user->id,
        ]);

        return response()->json(['message' => 'User blocked.']);
    }

    public function unblock(Request $request, User $user): JsonResponse
    {
        Block::where('blocker_id', $request->user()->id)
            ->where('blocked_id', $user->id)
            ->delete();

        return response()->json(['message' => 'User unblocked.']);
    }

    public function report(ReportUserRequest $request, User $user): JsonResponse
    {
        $reporter = $request->user();

        if ($reporter->id === $user->id) {
            return response()->json(['message' => 'You cannot report yourself.'], 422);
        }

        $reporter->reports()->create([
            'reported_user_id' => $user->id,
            'pic_post_id'      => $request->pic_post_id,
            'reason'           => $request->reason,
            'description'      => $request->description,
        ]);

        return response()->json(['message' => 'Report submitted. Thank you.'], 201);
    }
}
