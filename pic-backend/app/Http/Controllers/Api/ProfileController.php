<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\UpdateProfileRequest;
use App\Http\Resources\Api\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        return response()->json([
            'user' => new UserResource($request->user()->load('profile')),
        ]);
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user    = $request->user();
        $profile = $user->profile ?? $user->profile()->create([]);

        // Update name on user if provided
        if ($request->has('name')) {
            $user->update(['name' => $request->name]);
        }

        if ($request->has('gender')) {
            $user->update(['gender' => $request->gender]);
        }

        $profileData = $request->only(['bio', 'location', 'interests', 'avatar_style', 'avatar_seed']);

        // Handle photo upload
        if ($request->hasFile('profile_photo')) {
            // Delete old photo
            if ($profile->profile_photo) {
                Storage::disk('public')->delete($profile->profile_photo);
            }
            $path = $request->file('profile_photo')
                ->store('profile-photos/' . $user->id, 'public');
            $profileData['profile_photo'] = $path;
        }

        $profile->update($profileData);

        return response()->json([
            'user' => new UserResource($user->fresh()->load('profile')),
        ]);
    }
}
