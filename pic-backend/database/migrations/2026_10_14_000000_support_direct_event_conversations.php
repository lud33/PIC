<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->index('pic_post_id');
        });

        Schema::table('conversations', function (Blueprint $table) {
            $table->dropUnique('conversations_pic_post_id_unique');
            $table->foreignId('user_one_id')->nullable()->after('pic_post_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('user_two_id')->nullable()->after('user_one_id')->constrained('users')->restrictOnDelete();
            $table->unique(['pic_post_id', 'user_one_id', 'user_two_id'], 'conversations_pic_users_unique');
        });

        $existingConversations = DB::table('conversations')
            ->join('conversation_participants', 'conversations.id', '=', 'conversation_participants.conversation_id')
            ->select('conversations.id', 'conversations.pic_post_id', 'conversations.created_at', 'conversations.updated_at')
            ->groupBy('conversations.id', 'conversations.pic_post_id', 'conversations.created_at', 'conversations.updated_at')
            ->havingRaw('COUNT(conversation_participants.user_id) >= 2')
            ->get();

        foreach ($existingConversations as $existingConversation) {
            $userIds = DB::table('conversation_participants')
                ->where('conversation_id', $existingConversation->id)
                ->orderBy('user_id')
                ->pluck('user_id');

            if ($userIds->count() === 2) {
                DB::table('conversations')
                    ->where('id', $existingConversation->id)
                    ->update([
                        'user_one_id' => $userIds[0],
                        'user_two_id' => $userIds[1],
                    ]);
            }

            for ($firstIndex = 0; $firstIndex < $userIds->count() - 1; $firstIndex++) {
                for ($secondIndex = $firstIndex + 1; $secondIndex < $userIds->count(); $secondIndex++) {
                    $userOneId = $userIds[$firstIndex];
                    $userTwoId = $userIds[$secondIndex];
                    $directConversation = DB::table('conversations')
                        ->where('pic_post_id', $existingConversation->pic_post_id)
                        ->where('user_one_id', $userOneId)
                        ->where('user_two_id', $userTwoId)
                        ->first();

                    if ($directConversation) {
                        continue;
                    }

                    $conversationId = DB::table('conversations')->insertGetId([
                        'pic_post_id' => $existingConversation->pic_post_id,
                        'user_one_id' => $userOneId,
                        'user_two_id' => $userTwoId,
                        'created_at' => $existingConversation->created_at,
                        'updated_at' => $existingConversation->updated_at,
                    ]);

                    DB::table('conversation_participants')->insert([
                        [
                            'conversation_id' => $conversationId,
                            'user_id' => $userOneId,
                            'created_at' => $existingConversation->created_at,
                            'updated_at' => $existingConversation->updated_at,
                        ],
                        [
                            'conversation_id' => $conversationId,
                            'user_id' => $userTwoId,
                            'created_at' => $existingConversation->created_at,
                            'updated_at' => $existingConversation->updated_at,
                        ],
                    ]);
                }
            }

        }
    }

    public function down(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->dropUnique('conversations_pic_users_unique');
            $table->dropForeign(['user_one_id']);
            $table->dropForeign(['user_two_id']);
            $table->dropColumn(['user_one_id', 'user_two_id']);
            $table->unique('pic_post_id');
        });

        Schema::table('conversations', function (Blueprint $table) {
            $table->dropIndex(['pic_post_id']);
        });
    }
};
