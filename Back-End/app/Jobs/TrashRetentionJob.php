<?php

namespace App\Jobs;

use App\Models\Note;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class TrashRetentionJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        // Cari catatan yang statusnya trashed dan tanggal trashed_at sudah melewati 30 hari yang lalu
        $expiredNotes = Note::onlyTrashed()
            ->where('status', 'trashed')
            ->where('trashed_at', '<=', now()->subDays(30))
            ->get();

        foreach ($expiredNotes as $note) {
            // Memicu force delete (hapus permanen beserta relasinya)
            $note->forceDelete();
        }
    }
}
