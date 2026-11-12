<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ConversationController;
use App\Http\Controllers\Api\JoinRequestController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PicPostController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\SafetyController;
use Illuminate\Support\Facades\Route;

// ── Auth (public) ─────────────────────────────────────────────────────────────
Route::prefix('v1')->group(function () {

    Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
    Route::post('/auth/login',    [AuthController::class, 'login'])->middleware('throttle:6,1');

    // ── Authenticated ──────────────────────────────────────────────────────────
    Route::middleware('auth:sanctum')->group(function () {

        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/me',           [AuthController::class, 'me']);

        // Profile
        Route::get('/profile',  [ProfileController::class, 'show']);
        Route::put('/profile',  [ProfileController::class, 'update']);

        // PICs — Discover + CRUD
        Route::get('/pics',          [PicPostController::class, 'index']);
        Route::post('/pics',         [PicPostController::class, 'store']);
        Route::get('/pics/{pic}',    [PicPostController::class, 'show']);
        Route::put('/pics/{pic}',    [PicPostController::class, 'update']);
        Route::delete('/pics/{pic}', [PicPostController::class, 'destroy']);
        Route::post('/pics/{pic}/deactivate', [PicPostController::class, 'deactivate']);
        Route::post('/pics/{pic}/activate', [PicPostController::class, 'activate']);

        // My PICs + passed history
        Route::get('/my-pics', [PicPostController::class, 'myPics']);
        Route::get('/passed',  [PicPostController::class, 'passed']);
        Route::get('/passed/{pic}', [PicPostController::class, 'passedShow']);

        // Join requests
        Route::post('/pics/{pic}/join',          [JoinRequestController::class, 'store'])->middleware('throttle:5,1');
        Route::get('/pics/{pic}/my-request',     [JoinRequestController::class, 'myRequest']);
        Route::get('/pics/{pic}/requests',       [JoinRequestController::class, 'index']);
        Route::post('/join-requests/{joinRequest}/accept',  [JoinRequestController::class, 'accept']);
        Route::post('/join-requests/{joinRequest}/decline', [JoinRequestController::class, 'decline']);

        // Participants
        Route::post('/pics/{pic}/leave',                    [PicPostController::class, 'leave']);
        Route::delete('/pics/{pic}/participants/{user}',    [PicPostController::class, 'removeParticipant']);

        // Conversations + messages
        Route::get('/conversations',                                     [ConversationController::class, 'index']);
        Route::get('/conversations/{conversation}',                      [ConversationController::class, 'show']);
        Route::get('/conversations/{conversation}/messages',             [ConversationController::class, 'messages']);
        Route::post('/conversations/{conversation}/messages',            [ConversationController::class, 'sendMessage'])->middleware('throttle:60,1');

        // Notifications
        Route::get('/notifications',                               [NotificationController::class, 'index']);
        Route::post('/notifications/{notification}/read',          [NotificationController::class, 'markRead']);
        Route::post('/notifications/read-all',                     [NotificationController::class, 'markAllRead']);
        Route::delete('/notifications/{notification}',             [NotificationController::class, 'destroy']);

        // Safety
        Route::post('/users/{user}/block',  [SafetyController::class, 'block']);
        Route::delete('/users/{user}/block',[SafetyController::class, 'unblock']);
        Route::post('/users/{user}/report', [SafetyController::class, 'report'])->middleware('throttle:5,1');
    });
});
