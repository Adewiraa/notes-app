<?php

namespace App\Jobs;

use App\Models\NoteNotification;
use App\Models\NoteReminder;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ReminderDueJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        DB::transaction(function () {
            // Dapatkan seluruh reminder pending yang due_at <= saat ini
            $dueReminders = NoteReminder::where('status', 'pending')
                ->where('due_at', '<=', now())
                ->with(['note', 'user'])
                ->get();

            foreach ($dueReminders as $reminder) {
                // Buat notifikasi in-app
                NoteNotification::create([
                    'user_id' => $reminder->user_id,
                    'note_id' => $reminder->note_id,
                    'type'    => 'REMINDER',
                    'title'   => 'Pengingat Catatan: ' . ($reminder->note->title ?? 'Tanpa Judul'),
                    'body'    => Str::limit($reminder->note->content ?? 'Checklist item pengingat.', 150),
                ]);

                // Update status reminder ke triggered
                $reminder->update([
                    'status'       => 'triggered',
                    'triggered_at' => now(),
                ]);
            }
        });
    }
}
