<?php

namespace Tests\Feature;

use App\Models\PicPost;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PassedPicTest extends TestCase
{
    use RefreshDatabase;

    public function test_past_pic_is_visible_before_scheduled_job_updates_its_status(): void
    {
        $owner = User::factory()->create();
        $pastPic = PicPost::create([
            'user_id' => $owner->id,
            'event_name' => 'Yesterday event',
            'description' => 'An event that has already passed.',
            'location' => 'Central Park',
            'event_date' => today()->subDay()->toDateString(),
            'event_time' => '18:00:00',
            'people_needed' => 3,
            'status' => 'active',
        ]);
        PicPost::create([
            'user_id' => $owner->id,
            'event_name' => 'Upcoming event',
            'description' => 'An event that has not passed.',
            'location' => 'Central Park',
            'event_date' => today()->addDay()->toDateString(),
            'event_time' => '18:00:00',
            'people_needed' => 3,
            'status' => 'active',
        ]);

        $this->actingAs($owner)
            ->getJson('/api/v1/passed')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $pastPic->id)
            ->assertJsonPath('data.0.status', 'active');
    }
}
