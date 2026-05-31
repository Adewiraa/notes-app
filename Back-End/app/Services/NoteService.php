<?php

namespace App\Services;

use App\Models\Note;
use App\Models\NoteChecklistItem;
use App\Models\NoteColor;
use App\Models\NoteLabel;
use Illuminate\Support\Facades\DB;

class NoteService
{
    public function __construct(private readonly AuditService $audit) {}

    public function create(array $data, int $ownerId): Note
    {
        return DB::transaction(function () use ($data, $ownerId) {
            $this->validateColor($data['color_key'] ?? 'default');

            $note = Note::create([
                'owner_id'   => $ownerId,
                'title'      => $data['title'] ?? null,
                'content'    => $data['content'] ?? null,
                'note_type'  => $data['note_type'] ?? 'text',
                'color_key'  => $data['color_key'] ?? 'default',
                'visibility' => $data['visibility'] ?? 'private',
                'status'     => 'active',
                'sort_order' => $data['sort_order'] ?? 0,
            ]);

            // Checklist items
            if (!empty($data['checklist_items'])) {
                $this->syncChecklistItems($note, $data['checklist_items']);
            }

            // Labels
            if (!empty($data['label_ids'])) {
                $this->syncLabels($note, $data['label_ids'], $ownerId);
            }

            $this->audit->log($note, 'NOTE_CREATED', [], $note->toArray(), request());

            return $note->load(['checklistItems', 'labels', 'owner']);
        });
    }

    public function update(Note $note, array $data): Note
    {
        return DB::transaction(function () use ($note, $data) {
            if (isset($data['color_key'])) {
                $this->validateColor($data['color_key']);
            }

            $oldValues = $note->only(['title', 'content', 'color_key', 'visibility', 'note_type']);

            $note->update(array_filter([
                'title'      => $data['title'] ?? $note->title,
                'content'    => $data['content'] ?? $note->content,
                'note_type'  => $data['note_type'] ?? $note->note_type,
                'color_key'  => $data['color_key'] ?? $note->color_key,
                'visibility' => $data['visibility'] ?? $note->visibility,
            ], fn($v) => $v !== null));

            if (isset($data['checklist_items'])) {
                $this->syncChecklistItems($note, $data['checklist_items']);
            }

            if (isset($data['label_ids'])) {
                $this->syncLabels($note, $data['label_ids'], $note->owner_id);
            }

            $newValues = $note->fresh()->only(['title', 'content', 'color_key', 'visibility', 'note_type']);
            $this->audit->log($note, 'NOTE_UPDATED', $oldValues, $newValues, request());

            return $note->load(['checklistItems', 'labels', 'owner']);
        });
    }

    public function pin(Note $note, bool $pin): Note
    {
        $note->update([
            'is_pinned' => $pin,
            'pinned_at' => $pin ? now() : null,
        ]);
        $this->audit->log($note, $pin ? 'NOTE_PINNED' : 'NOTE_UNPINNED', [], [], request());
        return $note;
    }

    public function archive(Note $note, bool $archive): Note
    {
        $note->update([
            'archived_at' => $archive ? now() : null,
            'status'      => $archive ? 'archived' : 'active',
        ]);
        $this->audit->log($note, $archive ? 'NOTE_ARCHIVED' : 'NOTE_UNARCHIVED', [], [], request());
        return $note;
    }

    public function trash(Note $note): Note
    {
        $note->update(['trashed_at' => now(), 'status' => 'trashed']);
        $this->audit->log($note, 'NOTE_TRASHED', [], [], request());
        return $note;
    }

    public function restore(Note $note): Note
    {
        $note->update(['trashed_at' => null, 'status' => 'active']);
        $this->audit->log($note, 'NOTE_RESTORED', [], [], request());
        return $note;
    }

    public function forceDelete(Note $note): void
    {
        $this->audit->log($note, 'NOTE_FORCE_DELETED', $note->toArray(), [], request());
        $note->forceDelete();
    }

    private function syncChecklistItems(Note $note, array $items): void
    {
        foreach ($items as $i => $item) {
            if (isset($item['id'])) {
                NoteChecklistItem::where('id', $item['id'])->where('note_id', $note->id)
                    ->update([
                        'content'    => $item['content'],
                        'is_checked' => $item['is_checked'] ?? false,
                        'checked_at' => ($item['is_checked'] ?? false) ? now() : null,
                        'sort_order' => $item['sort_order'] ?? $i,
                    ]);
            } else {
                NoteChecklistItem::create([
                    'note_id'    => $note->id,
                    'content'    => $item['content'],
                    'is_checked' => $item['is_checked'] ?? false,
                    'sort_order' => $item['sort_order'] ?? $i,
                ]);
            }
        }
    }

    private function syncLabels(Note $note, array $labelIds, int $ownerId): void
    {
        $validIds = NoteLabel::whereIn('id', $labelIds)
            ->where(fn($q) => $q->where('owner_id', $ownerId)->orWhere('scope', 'global'))
            ->pluck('id');
        $note->labels()->sync($validIds);
    }

    private function validateColor(string $key): void
    {
        if (!NoteColor::where('key', $key)->where('is_active', true)->exists()) {
            abort(422, "Color '{$key}' is not valid.");
        }
    }
}
