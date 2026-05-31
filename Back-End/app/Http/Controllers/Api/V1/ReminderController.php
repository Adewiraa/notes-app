<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Note;
use App\Models\NoteReminder;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReminderController extends Controller
{
    public function __construct(private readonly AuditService $audit) {}

    /** POST /api/v1/notes/{uuid}/reminders */
    public function store(Request $request, string $uuid): JsonResponse
    {
        $note = Note::forUser($request->user())->where('uuid', $uuid)->firstOrFail();

        $data = $request->validate([
            'due_at'      => 'required|date|after:now',
            'timezone'    => 'string|max:100',
            'repeat_rule' => 'nullable|string|max:255',
        ]);

        $reminder = NoteReminder::create([
            'note_id'     => $note->id,
            'user_id'     => $request->user()->id,
            'due_at'      => $data['due_at'],
            'timezone'    => $data['timezone'] ?? 'UTC',
            'repeat_rule' => $data['repeat_rule'] ?? null,
            'status'      => 'pending',
        ]);

        $this->audit->log($note, 'REMINDER_SET', [], $reminder->toArray(), $request);

        return response()->json(['data' => $reminder], 201);
    }

    /** PATCH /api/v1/reminders/{id} */
    public function update(Request $request, int $id): JsonResponse
    {
        $reminder = NoteReminder::where('id', $id)->where('user_id', $request->user()->id)->firstOrFail();

        $data = $request->validate([
            'due_at'      => 'date|after:now',
            'timezone'    => 'string|max:100',
            'repeat_rule' => 'nullable|string|max:255',
        ]);

        $reminder->update($data);
        return response()->json(['data' => $reminder]);
    }

    /** POST /api/v1/reminders/{id}/complete */
    public function complete(Request $request, int $id): JsonResponse
    {
        $reminder = NoteReminder::where('id', $id)->where('user_id', $request->user()->id)->firstOrFail();
        $reminder->update(['status' => 'completed', 'completed_at' => now()]);
        $this->audit->log($reminder->note, 'REMINDER_COMPLETED', [], [], $request);
        return response()->json(['message' => 'Reminder marked as completed.', 'data' => $reminder]);
    }
}
