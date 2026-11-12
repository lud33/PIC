<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\JoinRequestResource;
use App\Http\Resources\Api\PicPostResource;
use App\Models\Conversation;
use App\Models\JoinRequest;
use App\Models\PicPost;
use App\Notifications\JoinRequestAccepted;
use App\Notifications\JoinRequestDeclined;
use App\Notifications\JoinRequestReceived;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class JoinRequestController extends Controller
{
    // ── Get current user's own request for a PIC ───────────────────────────

    public function myRequest(Request $request, PicPost $pic): JsonResponse
    {
        $joinRequest = JoinRequest::where('pic_post_id', $pic->id)
            ->where('sender_id', $request->user()->id)
            ->latest()
            ->first();

        if (! $joinRequest) {
            return response()->json(['data' => null]);
        }

        return response()->json(['data' => new JoinRequestResource($joinRequest)]);
    }

    // ── List requests for a PIC (owner only) ─────────────────────────────────

    public function index(Request $request, PicPost $pic): AnonymousResourceCollection
    {
        $this->authorize('manageParticipants', $pic);

        $requests = $pic->joinRequests()
            ->with(['sender.profile'])
            ->where('status', 'pending')
            ->latest()
            ->get();

        return JoinRequestResource::collection($requests);
    }

    // ── Send a join request ───────────────────────────────────────────────────

    public function store(Request $request, PicPost $pic): JsonResponse
    {
        $user = $request->user();

        // Business rule checks
        if ($pic->user_id === $user->id) {
            return response()->json(['message' => 'You cannot join your own PIC.'], 422);
        }
        if (! in_array($pic->status, ['active', 'full'])) {
            return response()->json(['message' => 'This PIC is not accepting requests.'], 422);
        }
        if ($pic->event_date->isPast()) {
            return response()->json(['message' => 'This event has already passed.'], 422);
        }
        if ($pic->participants()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'You are already a participant.'], 422);
        }

        // Duplicate request check (DB unique constraint is the final guard)
        $existing = JoinRequest::where('pic_post_id', $pic->id)
            ->where('sender_id', $user->id)
            ->first();

        if ($existing) {
            if ($existing->status === 'pending') {
                return response()->json(['message' => 'You already have a pending request for this PIC.'], 409);
            }
            // Cancelled/declined — allow re-request by updating
            $existing->update(['status' => 'pending']);
            $joinRequest = $existing->fresh()->load(['sender.profile', 'picPost']);
        } else {
            $joinRequest = JoinRequest::create([
                'pic_post_id' => $pic->id,
                'sender_id'   => $user->id,
                'receiver_id' => $pic->user_id,
                'status'      => 'pending',
            ]);
            $joinRequest->load(['sender.profile', 'picPost']);
        }

        // Notify the owner
        $pic->owner->notify(new JoinRequestReceived($joinRequest));

        return response()->json(['data' => new JoinRequestResource($joinRequest)], 201);
    }

    // ── Accept ────────────────────────────────────────────────────────────────

    public function accept(Request $request, JoinRequest $joinRequest): JsonResponse
    {
        $this->authorize('manage', $joinRequest);

        if ($joinRequest->status !== 'pending') {
            return response()->json(['message' => 'This request is no longer pending.'], 422);
        }

        $pic = $joinRequest->picPost;

        // Atomic acceptance — lock the PIC row to prevent race conditions
        DB::transaction(function () use ($joinRequest, $pic) {
            // Re-fetch with lock inside transaction
            $lockedPic = PicPost::lockForUpdate()->find($pic->id);

            if (! in_array($lockedPic->status, ['active', 'full'])) {
                abort(422, 'This PIC is no longer available.');
            }
            if ($lockedPic->isFull()) {
                abort(422, 'This PIC is already full.');
            }
            if ($lockedPic->participants()->where('user_id', $joinRequest->sender_id)->exists()) {
                abort(422, 'This user is already a participant.');
            }

            // Accept
            $joinRequest->update(['status' => 'accepted']);

            // Create participant record
            $lockedPic->participants()->create([
                'user_id'   => $joinRequest->sender_id,
                'joined_at' => now(),
            ]);

            // Update status if now full
            if ($lockedPic->isFull()) {
                $lockedPic->update(['status' => 'full']);
            }

            // Each accepted participant gets a separate conversation with every existing attendee.
            $existingAttendeeIds = $lockedPic->participants()
                ->where('user_id', '!=', $joinRequest->sender_id)
                ->pluck('user_id')
                ->push($lockedPic->user_id)
                ->unique();

            foreach ($existingAttendeeIds as $attendeeId) {
                $userOneId = min($attendeeId, $joinRequest->sender_id);
                $userTwoId = max($attendeeId, $joinRequest->sender_id);

                $conversation = Conversation::firstOrCreate([
                    'pic_post_id' => $lockedPic->id,
                    'user_one_id' => $userOneId,
                    'user_two_id' => $userTwoId,
                ]);
                $conversation->participants()->syncWithoutDetaching([$userOneId, $userTwoId]);
            }
        });

        $joinRequest->load(['sender.profile', 'picPost']);
        $joinRequest->sender->notify(new JoinRequestAccepted($joinRequest));

        return response()->json(['data' => new JoinRequestResource($joinRequest)]);
    }

    // ── Decline ───────────────────────────────────────────────────────────────

    public function decline(Request $request, JoinRequest $joinRequest): JsonResponse
    {
        $this->authorize('manage', $joinRequest);

        if ($joinRequest->status !== 'pending') {
            return response()->json(['message' => 'This request is no longer pending.'], 422);
        }

        $joinRequest->update(['status' => 'declined']);
        $joinRequest->load(['sender.profile', 'picPost']);
        $joinRequest->sender->notify(new JoinRequestDeclined($joinRequest));

        return response()->json(['data' => new JoinRequestResource($joinRequest)]);
    }
}
