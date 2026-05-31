<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Note;
use App\Services\NoteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class NoteController extends Controller
{
    public function __construct(private readonly NoteService $service) {}

    /**
     * @OA\Get(path="/api/v1/notes", tags={"Notes"}, security={{"bearerAuth":{}}},
     *   @OA\Parameter(name="filter[status]", in="query", @OA\Schema(type="string")),
     *   @OA\Parameter(name="filter[is_pinned]", in="query", @OA\Schema(type="boolean")),
     *   @OA\Parameter(name="filter[color_key]", in="query", @OA\Schema(type="string")),
     *   @OA\Parameter(name="search", in="query", @OA\Schema(type="string")),
     *   @OA\Parameter(name="per_page", in="query", @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="List notes")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = QueryBuilder::for(Note::class)
            ->forUser($user)
            ->allowedFilters([
                AllowedFilter::exact('status'),
                AllowedFilter::exact('is_pinned'),
                AllowedFilter::exact('color_key'),
                AllowedFilter::exact('note_type'),
                AllowedFilter::exact('visibility'),
            ])
            ->allowedSorts(['sort_order', 'created_at', 'updated_at', 'title', 'pinned_at'])
            ->defaultSort('-is_pinned', '-updated_at')
            ->with(['labels', 'checklistItems', 'reminders', 'attachments']);

        // keyword search
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%")
                  ->orWhereHas('checklistItems', fn($c) => $c->where('content', 'like', "%{$search}%"));
            });
        }

        // filter archived
        if ($request->query('archived') === 'true') {
            $query->archived();
        } elseif ($request->query('trashed') === 'true') {
            $query->trashed();
        } else {
            $query->active();
        }

        $perPage = min((int)($request->query('per_page', 20)), 100);
        $notes   = $query->paginate($perPage);

        return response()->json([
            'data'  => $notes->items(),
            'meta'  => [
                'page'     => $notes->currentPage(),
                'per_page' => $notes->perPage(),
                'total'    => $notes->total(),
            ],
            'links' => [
                'next' => $notes->nextPageUrl(),
                'prev' => $notes->previousPageUrl(),
            ],
        ]);
    }

    /**
     * @OA\Post(path="/api/v1/notes", tags={"Notes"}, security={{"bearerAuth":{}}},
     *   @OA\Response(response=201, description="Note dibuat")
     * )
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'                      => 'nullable|string|max:500',
            'content'                    => 'nullable|string',
            'note_type'                  => 'in:text,checklist,mixed',
            'color_key'                  => 'nullable|string|max:50',
            'visibility'                 => 'in:private,department,public',
            'sort_order'                 => 'integer',
            'label_ids'                  => 'array',
            'label_ids.*'                => 'integer|exists:note_labels,id',
            'checklist_items'            => 'array',
            'checklist_items.*.content'  => 'required|string',
            'checklist_items.*.is_checked' => 'boolean',
        ]);

        abort_if(
            empty($data['title']) && empty($data['content']) && empty($data['checklist_items']),
            422,
            'Note harus memiliki title, content, atau checklist item.'
        );

        $note = $this->service->create($data, $request->user()->id);

        return response()->json(['data' => $note], 201);
    }

    /**
     * @OA\Get(path="/api/v1/notes/{uuid}", tags={"Notes"}, security={{"bearerAuth":{}}},
     *   @OA\Parameter(name="uuid", in="path", required=true, @OA\Schema(type="string")),
     *   @OA\Response(response=200, description="Detail note")
     * )
     */
    public function show(Request $request, string $uuid): JsonResponse
    {
        $note = Note::forUser($request->user())->where('uuid', $uuid)
            ->with(['checklistItems', 'labels', 'reminders', 'attachments', 'collaborators', 'owner'])
            ->firstOrFail();

        return response()->json(['data' => $note]);
    }

    /**
     * @OA\Patch(path="/api/v1/notes/{uuid}", tags={"Notes"}, security={{"bearerAuth":{}}},
     *   @OA\Parameter(name="uuid", in="path", required=true, @OA\Schema(type="string")),
     *   @OA\Response(response=200, description="Note diupdate")
     * )
     */
    public function update(Request $request, string $uuid): JsonResponse
    {
        $note = $this->findOwnedNote($request, $uuid);

        $data = $request->validate([
            'title'                        => 'nullable|string|max:500',
            'content'                      => 'nullable|string',
            'note_type'                    => 'in:text,checklist,mixed',
            'color_key'                    => 'nullable|string|max:50',
            'visibility'                   => 'in:private,department,public',
            'label_ids'                    => 'array',
            'label_ids.*'                  => 'integer|exists:note_labels,id',
            'checklist_items'              => 'array',
            'checklist_items.*.id'         => 'nullable|integer',
            'checklist_items.*.content'    => 'required|string',
            'checklist_items.*.is_checked' => 'boolean',
        ]);

        $note = $this->service->update($note, $data);

        return response()->json(['data' => $note]);
    }

    /**
     * @OA\Delete(path="/api/v1/notes/{uuid}", tags={"Notes"}, security={{"bearerAuth":{}}},
     *   @OA\Parameter(name="uuid", in="path", required=true, @OA\Schema(type="string")),
     *   @OA\Response(response=200, description="Note dihapus ke trash")
     * )
     */
    public function destroy(Request $request, string $uuid): JsonResponse
    {
        $note = $this->findOwnedNote($request, $uuid);
        $this->service->trash($note);
        return response()->json(['message' => 'Note moved to trash.']);
    }

    /** POST /api/v1/notes/{uuid}/restore */
    public function restore(Request $request, string $uuid): JsonResponse
    {
        $note = Note::where('uuid', $uuid)->where('owner_id', $request->user()->id)->firstOrFail();
        $this->service->restore($note);
        return response()->json(['message' => 'Note restored.', 'data' => $note]);
    }

    /** DELETE /api/v1/notes/{uuid}/force */
    public function forceDelete(Request $request, string $uuid): JsonResponse
    {
        $note = Note::where('uuid', $uuid)->where('owner_id', $request->user()->id)->firstOrFail();
        abort_unless($request->user()->isAdmin() || $note->owner_id === $request->user()->id, 403);
        $this->service->forceDelete($note);
        return response()->json(['message' => 'Note permanently deleted.']);
    }

    /** POST /api/v1/notes/{uuid}/pin */
    public function pin(Request $request, string $uuid): JsonResponse
    {
        $note   = $this->findOwnedNote($request, $uuid);
        $pinned = !$note->is_pinned;
        $this->service->pin($note, $pinned);
        return response()->json(['message' => $pinned ? 'Note pinned.' : 'Note unpinned.', 'data' => $note]);
    }

    /** POST /api/v1/notes/{uuid}/archive */
    public function archive(Request $request, string $uuid): JsonResponse
    {
        $note     = $this->findOwnedNote($request, $uuid);
        $archived = is_null($note->archived_at);
        $this->service->archive($note, $archived);
        return response()->json(['message' => $archived ? 'Note archived.' : 'Note unarchived.', 'data' => $note]);
    }

    /**
     * @OA\Get(path="/api/v1/notes-summary", tags={"Notes"}, security={{"bearerAuth":{}}},
     *   @OA\Response(response=200, description="Dashboard summary")
     * )
     */
    public function summary(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $base   = Note::where('owner_id', $userId);

        return response()->json(['data' => [
            'active'        => (clone $base)->where('status', 'active')->whereNull('archived_at')->count(),
            'pinned'        => (clone $base)->where('is_pinned', true)->count(),
            'archived'      => (clone $base)->whereNotNull('archived_at')->count(),
            'trashed'       => (clone $base)->whereNotNull('trashed_at')->count(),
            'reminder_due'  => \App\Models\NoteReminder::where('user_id', $userId)
                                ->where('status', 'pending')->where('due_at', '<=', now())->count(),
            'shared_with_me'=> \App\Models\NoteCollaborator::where('subject_type', 'user')
                                ->where('subject_id', $userId)->whereNull('revoked_at')->count(),
        ]]);
    }

    private function findOwnedNote(Request $request, string $uuid): Note
    {
        $note = Note::where('uuid', $uuid)->firstOrFail();
        $user = $request->user();
        abort_unless(
            $note->owner_id === $user->id || $user->isAdmin(),
            403,
            'Forbidden: you do not own this note.'
        );
        return $note;
    }
}
