<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Note;
use App\Models\NoteChecklistItem;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChecklistItemController extends Controller
{
    public function __construct(private readonly AuditService $audit) {}

    /** POST /api/v1/notes/{uuid}/checklist-items */
    public function store(Request $request, string $uuid): JsonResponse
    {
        $note = Note::forUser($request->user())->where('uuid', $uuid)->firstOrFail();
        abort_unless($note->owner_id === $request->user()->id || $request->user()->isAdmin(), 403);

        $data = $request->validate([
            'content'    => 'required|string',
            'is_checked' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $item = NoteChecklistItem::create([
            'note_id'    => $note->id,
            'content'    => $data['content'],
            'is_checked' => $data['is_checked'] ?? false,
            'sort_order' => $data['sort_order'] ?? 0,
        ]);

        $this->audit->log($note, 'CHECKLIST_ITEM_ADDED', [], $item->toArray(), $request);

        return response()->json(['data' => $item], 201);
    }

    /** PATCH /api/v1/checklist-items/{id} */
    public function update(Request $request, int $id): JsonResponse
    {
        $item = NoteChecklistItem::findOrFail($id);
        $note = $item->note;
        abort_unless($note->owner_id === $request->user()->id || $request->user()->isAdmin(), 403);

        $data = $request->validate([
            'content'    => 'string',
            'is_checked' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $old = $item->toArray();
        $item->update(array_merge($data, [
            'checked_at' => ($data['is_checked'] ?? $item->is_checked) ? now() : null,
        ]));
        $this->audit->log($note, 'CHECKLIST_ITEM_UPDATED', $old, $item->toArray(), $request);

        return response()->json(['data' => $item]);
    }

    /** DELETE /api/v1/checklist-items/{id} */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $item = NoteChecklistItem::findOrFail($id);
        $note = $item->note;
        abort_unless($note->owner_id === $request->user()->id || $request->user()->isAdmin(), 403);
        $item->delete();
        $this->audit->log($note, 'CHECKLIST_ITEM_DELETED', $item->toArray(), [], $request);
        return response()->json(['message' => 'Item deleted.']);
    }
}
