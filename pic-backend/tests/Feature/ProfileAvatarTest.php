<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileAvatarTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_save_generated_avatar_style_and_seed(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->putJson('/api/v1/profile', [
                'avatar_style' => 'pixel-art',
                'avatar_seed' => 'account-42-pixel-art-bit',
            ])
            ->assertOk()
            ->assertJsonPath('user.profile.avatar_style', 'pixel-art')
            ->assertJsonPath('user.profile.avatar_seed', 'account-42-pixel-art-bit');

        $this->assertDatabaseHas('profiles', [
            'user_id' => $user->id,
            'avatar_style' => 'pixel-art',
            'avatar_seed' => 'account-42-pixel-art-bit',
            'profile_photo' => null,
        ]);
    }

    public function test_avatar_style_must_be_supported_and_seed_must_be_paired(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->putJson('/api/v1/profile', ['avatar_style' => 'unknown'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('avatar_style');

        $this->actingAs($user)
            ->putJson('/api/v1/profile', ['avatar_style' => 'lorelei'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('avatar_seed');

        $this->actingAs($user)
            ->putJson('/api/v1/profile', ['avatar_seed' => 'only-a-seed'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('avatar_style');
    }
}
