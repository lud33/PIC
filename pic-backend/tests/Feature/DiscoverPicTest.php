<?php

namespace Tests\Feature;

use App\Models\PicPost;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DiscoverPicTest extends TestCase
{
    use RefreshDatabase;

    public function test_owners_upcoming_pic_is_included_ahead_of_other_events_in_discover(): void
    {
        $owner = User::factory()->create();
        $ownedPic = PicPost::create([
            'user_id' => $owner->id,
            'event_name' => 'My future event',
            'description' => 'An event I created.',
            'location' => 'Central Park',
            'event_date' => today()->addDays(30)->toDateString(),
            'event_time' => '18:00:00',
            'people_needed' => 3,
            'status' => 'active',
        ]);

        for ($day = 1; $day <= 20; $day++) {
            PicPost::create([
                'user_id' => User::factory()->create()->id,
                'event_name' => "Other event {$day}",
                'description' => 'An upcoming event.',
                'location' => 'Central Park',
                'event_date' => today()->addDays($day)->toDateString(),
                'event_time' => '18:00:00',
                'people_needed' => 3,
                'status' => 'active',
            ]);
        }

        $this->actingAs($owner)
            ->getJson('/api/v1/pics')
            ->assertOk()
            ->assertJsonFragment([
                'id' => $ownedPic->id,
                'event_name' => 'My future event',
            ]);
    }
}
