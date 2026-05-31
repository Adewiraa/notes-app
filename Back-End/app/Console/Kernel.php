<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Jalankan pemicu pengingat setiap 1 menit
        $schedule->job(new \App\Jobs\ReminderDueJob)->everyMinute();

        // Jalankan housekeeping harian
        $schedule->job(new \App\Jobs\TrashRetentionJob)->daily();
        $schedule->job(new \App\Jobs\AttachmentCleanupJob)->daily();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
