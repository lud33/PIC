<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileGenderTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_update_gender_from_profile(): void
    {
        $user = User::factory()->create(['gender' => 'neutral']);

        $this->actingAs($user)
            ->putJson('/api/v1/profile', ['gender' => 'female'])
            ->assertOk()
            ->assertJsonPath('user.gender', 'female');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'gender' => 'female',
        ]);
    }

    public function test_profile_update_rejects_unsupported_gender(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->putJson('/api/v1/profile', ['gender' => 'unsupported'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('gender');
    }
}
