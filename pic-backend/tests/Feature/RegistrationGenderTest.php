<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationGenderTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_saves_and_returns_selected_gender(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'name' => 'Alex Example',
            'email' => 'alex@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'date_of_birth' => now()->subYears(20)->toDateString(),
            'gender' => 'female',
        ])
            ->assertCreated()
            ->assertJsonPath('user.gender', 'female');

        $this->assertDatabaseHas('users', [
            'email' => 'alex@example.com',
            'gender' => 'female',
        ]);
    }

    public function test_registration_rejects_unsupported_gender(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'name' => 'Alex Example',
            'email' => 'alex@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'date_of_birth' => now()->subYears(20)->toDateString(),
            'gender' => 'unsupported',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('gender');
    }
}
