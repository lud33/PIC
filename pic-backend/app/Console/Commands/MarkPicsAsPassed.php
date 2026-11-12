<?php

namespace App\Console\Commands;

use App\Models\PicPost;
use Illuminate\Console\Command;

class MarkPicsAsPassed extends Command
{
    protected $signature   = 'pics:mark-passed';
    protected $description = 'Mark PICs whose event date has passed as "passed".';

    public function handle(): int
    {
        $updated = PicPost::whereIn('status', ['active', 'full', 'deactivated'])
            ->whereDate('event_date', '<', today())
            ->update(['status' => 'passed']);

        $this->info("Marked {$updated} PIC(s) as passed.");

        return Command::SUCCESS;
    }
}
