<?php

namespace App\Jobs;

use App\Models\NoteAttachment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class AttachmentCleanupJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        // Cari seluruh attachment yang statusnya 'removed'
        $orphanedAttachments = NoteAttachment::where('status', 'removed')->get();

        foreach ($orphanedAttachments as $attachment) {
            // Hapus file fisik dari storage jika ada
            if (Storage::exists($attachment->file_path)) {
                Storage::delete($attachment->file_path);
            }
            
            // Hapus metadata dari database
            $attachment->delete();
        }
    }
}
