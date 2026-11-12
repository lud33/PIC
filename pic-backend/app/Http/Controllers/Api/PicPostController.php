<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\CreatePicRequest;
use App\Http\Requests\Api\UpdatePicRequest;
use App\Http\Resources\Api\PicPostResource;
use App\Models\PicPost;
use App\Models\User;
use App\Notifications\ParticipantRemoved;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PicPostController extends Controller
{
    // ── Discover ──────────────────────────────────────────────────────────────

    public function index(Request $request): AnonymousResourceCollection
    {
        $blockedIds = $request->user()->blockedUserIds();

        $query = PicPost::with(['owner.profile'])
            ->withCount('participants')
            ->whereIn('status', ['active', 'full'])
            ->whereDate('event_date', '>=', today())
            ->whereNotIn('user_id', $blockedIds)
            ->when($request->category, fn ($q, $v) => $q->where('category', $v))
            ->when($request->location,  fn ($q, $v) => $q->where('location', 'like', "%{$v}%"))
            ->when($request->date,      fn ($q, $v) => $q->whereDate('event_date', $v))
            ->orderByRaw('CASE WHEN user_id = ? THEN 0 ELSE 1 END', [$request->user()->id])
            ->orderBy('event_date')
            ->orderBy('created_at', 'desc');

        $perPage = min((int) $request->get('per_page', 20), 50);

        return PicPostResource::collection($query->paginate($perPage));
    }

    // ── CRUD ──────────────────────────────────────────────────────────────────

    public function store(CreatePicRequest $request): JsonResponse
    {
        $pic = $request->user()->picPosts()->create($request->validated());

        return response()->json(
            ['data' => new PicPostResource($pic->load(['owner.profile']))],
            201
        );
    }

    public function show(Request $request, PicPost $pic): JsonResponse
    {
        $pic->loadCount('participants');
        $pic->load(['owner.profile', 'participantUsers.profile']);

        return response()->json(['data' => new PicPostResource($pic)]);
    }

    public function update(UpdatePicRequest $request, PicPost $pic): JsonResponse
    {
        $this->authorize('update', $pic);

        $data = $request->validated();
        $participantCount = $pic->participants()->count();

        if (isset($data['people_needed']) && $data['people_needed'] < $participantCount) {
            return response()->json([
                'message' => 'Capacity cannot be lower than the current participant count.',
            ], 422);
        }

        $pic->update($data);

        if (in_array($pic->status, ['active', 'full'])) {
            $pic->update(['status' => $pic->isFull() ? 'full' : 'active']);
        }

        $pic = $pic->fresh()
            ->load(['owner.profile', 'participantUsers.profile'])
            ->loadCount('participants');

        return response()->json(['data' => new PicPostResource($pic)]);
    }

    public function destroy(Request $request, PicPost $pic): JsonResponse
    {
        $this->authorize('delete', $pic);
        $pic->delete();

        return response()->json(null, 204);
    }

    // ── Deactivate ────────────────────────────────────────────────────────────

    public function deactivate(Request $request, PicPost $pic): JsonResponse
    {
        $this->authorize('deactivate', $pic);

        if (! in_array($pic->status, ['active', 'full'])) {
            return response()->json(['message' => 'This PIC cannot be deactivated.'], 422);
        }

        $pic->update(['status' => 'deactivated']);

        return response()->json(['data' => new PicPostResource($pic->fresh()->load(['owner.profile']))]);
    }

    public function activate(Request $request, PicPost $pic): JsonResponse
    {
        $this->authorize('deactivate', $pic);

        if (! in_array($pic->status, ['deactivated', 'passed'])) {
            return response()->json(['message' => 'This PIC is not deactivated.'], 422);
        }

        if ($pic->event_date->lt(today())) {
            return response()->json(['message' => 'Change the PIC date to a future date before activating it.'], 422);
        }

        $pic->update(['status' => $pic->isFull() ? 'full' : 'active']);
        $pic = $pic->fresh()
            ->load(['owner.profile', 'participantUsers.profile'])
            ->loadCount('participants');

        return response()->json(['data' => new PicPostResource($pic)]);
    }

    // ── My PICs ───────────────────────────────────────────────────────────────

    public function myPics(Request $request): AnonymousResourceCollection
    {
        $pics = PicPost::with(['owner.profile'])
            ->withCount('participants')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(20);

        return PicPostResource::collection($pics);
    }

    // ── Passed history ────────────────────────────────────────────────────────

    public function passed(Request $request): AnonymousResourceCollection
    {
        $userId = $request->user()->id;

        $pics = PicPost::with(['owner.profile'])
            ->withCount('participants')
            ->where(function ($q) {
                $q->where('status', 'passed')
                  ->orWhereDate('event_date', '<', today());
            })
            ->where(function ($q) use ($userId) {
                $q->where('user_id', $userId)
                  ->orWhereHas('participants', fn ($p) => $p->where('user_id', $userId));
            })
            ->latest('event_date')
            ->paginate(20);

        return PicPostResource::collection($pics);
    }

    public function passedShow(Request $request, PicPost $pic): JsonResponse
    {
        $userId = $request->user()->id;
        $isOwner       = $pic->user_id === $userId;
        $isParticipant = $pic->participants()->where('user_id', $userId)->exists();

        if (! $isOwner && ! $isParticipant) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        $pic->loadCount('participants');
        $pic->load(['owner.profile', 'participantUsers.profile']);

        return response()->json(['data' => new PicPostResource($pic)]);
    }

    // ── Participants ──────────────────────────────────────────────────────────

    public function leave(Request $request, PicPost $pic): JsonResponse
    {
        $user = $request->user();

        $participant = $pic->participants()->where('user_id', $user->id)->first();
        if (! $participant) {
            return response()->json(['message' => 'You are not a participant of this PIC.'], 422);
        }

        $participant->delete();

        // Reopen if was full
        if ($pic->status === 'full') {
            $pic->update(['status' => 'active']);
        }

        return response()->json(['message' => 'You have left the PIC.']);
    }

    public function removeParticipant(Request $request, PicPost $pic, User $user): JsonResponse
    {
        $this->authorize('manageParticipants', $pic);

        $participant = $pic->participants()->where('user_id', $user->id)->first();
        if (! $participant) {
            return response()->json(['message' => 'User is not a participant.'], 422);
        }

        $participant->delete();

        // Reopen if was full
        if ($pic->status === 'full') {
            $pic->update(['status' => 'active']);
        }

        $user->notify(new ParticipantRemoved($pic));

        return response()->json(['message' => 'Participant removed.']);
    }
}
