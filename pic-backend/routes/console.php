<?php

use App\Console\Commands\MarkPicsAsPassed;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Mark past PICs as "passed" — runs every hour, idempotent
Schedule::command(MarkPicsAsPassed::class)->hourly()->withoutOverlapping();
