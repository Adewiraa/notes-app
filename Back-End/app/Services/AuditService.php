<?php

namespace App\Services;

use App\Models\Note;
use App\Models\NoteAuditLog;
use Illuminate\Http\Request;

class AuditService
{
    public function log(
        Note $note,
        string $action,
        array $oldValues = [],
        array $newValues = [],
        ?Request $request = null
    ): void {
        NoteAuditLog::create([
            'note_id'    => $note->id,
            'actor_id'   => auth()->id(),
            'action'     => $action,
            'old_values' => $oldValues ?: null,
            'new_values' => $newValues ?: null,
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
            'created_at' => now(),
        ]);
    }
}
