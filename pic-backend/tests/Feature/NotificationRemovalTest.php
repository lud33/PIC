<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class NotificationRemovalTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_remove_own_notification_but_not_another_users(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $notificationId = (string) Str::uuid();

        DB::table('notifications')->insert([
            'id' => $notificationId,
            'type' => 'test',
            'notifiable_type' => User::class,
            'notifiable_id' => $owner->id,
            'data' => json_encode(['message' => 'Test notification']),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->actingAs($otherUser)
            ->deleteJson("/api/v1/notifications/{$notificationId}")
            ->assertNotFound();

        $this->assertDatabaseHas('notifications', ['id' => $notificationId]);

        $this->actingAs($owner)
            ->deleteJson("/api/v1/notifications/{$notificationId}")
            ->assertOk()
            ->assertJsonPath('message', 'Notification removed.');

        $this->assertDatabaseMissing('notifications', ['id' => $notificationId]);
    }
}
