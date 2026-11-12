<?php

namespace Tests\Feature;

use App\Models\PicPost;
use App\Models\User;
use App\Models\JoinRequest;
use App\Notifications\JoinRequestReceived;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class JoinRequestFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_reschedule_and_reactivate_deactivated_pic(): void
    {
        $owner = User::factory()->create();
        $pic = PicPost::create([
            'user_id' => $owner->id,
            'event_name' => 'Rescheduled concert',
            'description' => 'An outdoor concert.',
            'location' => 'Central Park',
            'event_date' => now()->addWeek()->toDateString(),
            'event_time' => '18:00:00',
            'people_needed' => 3,
            'status' => 'active',
        ]);

        $this->actingAs($owner)
            ->postJson("/api/v1/pics/{$pic->id}/deactivate")
            ->assertOk()
            ->assertJsonPath('data.status', 'deactivated');

        $newDate = now()->addWeeks(2)->toDateString();
        $this->actingAs($owner)
            ->putJson("/api/v1/pics/{$pic->id}", ['event_date' => $newDate])
            ->assertOk()
            ->assertJsonPath('data.event_date', $newDate)
            ->assertJsonPath('data.status', 'deactivated');

        $this->actingAs($owner)
            ->postJson("/api/v1/pics/{$pic->id}/activate")
            ->assertOk()
            ->assertJsonPath('data.status', 'active');

        $this->assertDatabaseHas('pic_posts', [
            'id' => $pic->id,
            'status' => 'active',
        ]);
    }

    public function test_full_pic_accepts_new_requests_after_owner_adds_capacity(): void
    {
        $owner = User::factory()->create();
        $firstMember = User::factory()->create();
        $waitingMember = User::factory()->create();
        $pic = PicPost::create([
            'user_id' => $owner->id,
            'event_name' => 'Full concert',
            'description' => 'An outdoor concert.',
            'location' => 'Central Park',
            'event_date' => now()->addWeek()->toDateString(),
            'event_time' => '18:00:00',
            'people_needed' => 1,
            'status' => 'active',
        ]);

        $firstRequest = $this->actingAs($firstMember)
            ->postJson("/api/v1/pics/{$pic->id}/join")
            ->assertCreated()
            ->json('data.id');

        $this->actingAs($owner)
            ->postJson("/api/v1/join-requests/{$firstRequest}/accept")
            ->assertOk();

        $this->assertDatabaseHas('pic_posts', ['id' => $pic->id, 'status' => 'full']);

        $this->actingAs($waitingMember)
            ->getJson('/api/v1/pics')
            ->assertOk()
            ->assertJsonFragment(['id' => $pic->id, 'status' => 'full']);

        $waitingRequest = $this->actingAs($waitingMember)
            ->postJson("/api/v1/pics/{$pic->id}/join")
            ->assertCreated()
            ->json('data.id');

        $this->actingAs($owner)
            ->putJson("/api/v1/pics/{$pic->id}", ['people_needed' => 2])
            ->assertOk()
            ->assertJsonPath('data.people_needed', 2)
            ->assertJsonPath('data.status', 'active');

        $this->actingAs($owner)
            ->postJson("/api/v1/join-requests/{$waitingRequest}/accept")
            ->assertOk()
            ->assertJsonPath('data.status', 'accepted');

        $this->assertDatabaseHas('pic_posts', ['id' => $pic->id, 'status' => 'full']);

        $this->actingAs($owner)
            ->postJson("/api/v1/pics/{$pic->id}/deactivate")
            ->assertOk()
            ->assertJsonPath('data.status', 'deactivated');
    }

    public function test_join_request_is_listed_notifies_pic_owner_and_can_be_accepted(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $pic = PicPost::create([
            'user_id' => $owner->id,
            'event_name' => 'Community concert',
            'description' => 'An outdoor concert.',
            'location' => 'Central Park',
            'event_date' => now()->addWeek()->toDateString(),
            'event_time' => '18:00:00',
            'people_needed' => 3,
            'status' => 'active',
        ]);

        $joinResponse = $this->actingAs($member)
            ->postJson("/api/v1/pics/{$pic->id}/join")
            ->assertCreated()
            ->assertJsonPath('data.status', 'pending');

        $requestId = $joinResponse->json('data.id');

        $this->assertDatabaseHas('notifications', [
            'notifiable_id' => $owner->id,
            'type' => JoinRequestReceived::class,
        ]);

        $this->actingAs($owner)
            ->getJson("/api/v1/pics/{$pic->id}/requests")
            ->assertOk()
            ->assertJsonPath('data.0.id', $requestId)
            ->assertJsonPath('data.0.sender.id', $member->id);

        $this->actingAs($owner)
            ->getJson('/api/v1/notifications')
            ->assertOk()
            ->assertJsonPath('data.0.type', 'JoinRequestReceived');

        $this->actingAs($owner)
            ->postJson("/api/v1/join-requests/{$requestId}/accept")
            ->assertOk()
            ->assertJsonPath('data.status', 'accepted');

        $this->assertDatabaseHas('pic_participants', [
            'pic_post_id' => $pic->id,
            'user_id' => $member->id,
        ]);

        $secondMember = User::factory()->create();
        $secondRequest = JoinRequest::create([
            'pic_post_id' => $pic->id,
            'sender_id' => $secondMember->id,
            'receiver_id' => $owner->id,
            'status' => 'pending',
        ]);

        $this->actingAs($owner)
            ->postJson("/api/v1/join-requests/{$secondRequest->id}/accept")
            ->assertOk();

        $this->actingAs($member)
            ->getJson('/api/v1/pics')
            ->assertOk()
            ->assertJsonFragment([
                'id' => $pic->id,
                'participants_count' => 2,
                'available_slots' => 1,
            ]);

        $this->assertDatabaseCount('conversations', 3);
        $this->assertDatabaseHas('conversations', [
            'pic_post_id' => $pic->id,
            'user_one_id' => min($owner->id, $member->id),
            'user_two_id' => max($owner->id, $member->id),
        ]);
        $this->assertDatabaseHas('conversations', [
            'pic_post_id' => $pic->id,
            'user_one_id' => min($member->id, $secondMember->id),
            'user_two_id' => max($member->id, $secondMember->id),
        ]);

        $memberConversations = $this->actingAs($member)
            ->getJson('/api/v1/conversations')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->json('data');

        foreach ($memberConversations as $conversation) {
            $this->assertCount(2, $conversation['participants']);
            $this->assertContains($member->id, array_column($conversation['participants'], 'id'));
        }

        $this->actingAs($member)
            ->getJson("/api/v1/conversations/{$memberConversations[0]['id']}")
            ->assertOk();

        $outsider = User::factory()->create();
        $this->actingAs($outsider)
            ->getJson("/api/v1/conversations/{$memberConversations[0]['id']}")
            ->assertForbidden();
    }
}
