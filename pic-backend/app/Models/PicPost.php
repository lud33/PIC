<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class PicPost extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'event_name', 'description', 'location',
        'event_date', 'event_time', 'people_needed', 'status',
        'category', 'cover_image',
    ];

    protected function casts(): array
    {
        return [
            'event_date'   => 'date',
            'people_needed'=> 'integer',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function joinRequests(): HasMany
    {
        return $this->hasMany(JoinRequest::class);
    }

    public function participants(): HasMany
    {
        return $this->hasMany(PicParticipant::class);
    }

    public function participantUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'pic_participants')
                    ->withPivot('joined_at')
                    ->withTimestamps();
    }

    public function conversation(): HasOne
    {
        return $this->hasOne(Conversation::class);
    }

    /** Number of accepted participants */
    public function acceptedCount(): int
    {
        return $this->participants()->count();
    }

    /** How many slots are still open */
    public function availableSlots(): int
    {
        return max(0, $this->people_needed - $this->acceptedCount());
    }

    public function isFull(): bool
    {
        return $this->acceptedCount() >= $this->people_needed;
    }

    public function isAcceptingRequests(): bool
    {
        return $this->status === 'active' && !$this->isFull();
    }
}
