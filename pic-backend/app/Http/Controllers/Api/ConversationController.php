<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\SendMessageRequest;
use App\Http\Resources\Api\ConversationResource;
use App\Http\Resources\Api\MessageResource;
use App\Models\Conversation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ConversationController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $userId = $request->user()->id;

        $conversations = Conversation::with(['picPost.owner.profile', 'participants.profile'])
            ->withAggregate('latestMessage', 'created_at')
            ->where(function ($query) use ($userId) {
                $query->where('user_one_id', $userId)
                    ->orWhere('user_two_id', $userId);
            })
            ->orderByDesc('latest_message_created_at')
            ->orderByDesc('created_at')
            ->paginate(20);

        return ConversationResource::collection($conversations);
    }

    public function show(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorize('view', $conversation);

        $conversation->load(['picPost.owner.profile', 'participants.profile', 'latestMessage']);

        return response()->json(['data' => new ConversationResource($conversation)]);
    }

    public function messages(Request $request, Conversation $conversation): AnonymousResourceCollection
    {
        $this->authorize('view', $conversation);

        $messages = $conversation->messages()
            ->with('sender.profile')
            ->orderBy('created_at')
            ->cursorPaginate(50);

        return MessageResource::collection($messages);
    }

    public function sendMessage(SendMessageRequest $request, Conversation $conversation): JsonResponse
    {
        $this->authorize('sendMessage', $conversation);

        $message = $conversation->messages()->create([
            'user_id' => $request->user()->id,
            'message' => $request->message,
        ]);

        $message->load('sender.profile');

        return response()->json(['data' => new MessageResource($message)], 201);
    }
}
