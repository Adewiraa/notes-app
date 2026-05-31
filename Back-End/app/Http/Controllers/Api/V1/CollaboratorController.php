<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Note;
use App\Models\NoteCollaborator;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CollaboratorController extends Controller
{
    public function __construct(private readonly AuditService $audit) {}

    /**
     * @OA\Post(path="/api/v1/notes/{uuid}/collaborators", tags={"Collaborators"}, security={{"bearerAuth":{}}},
     *   @OA\Parameter(name="uuid", in="path", required=true, @OA\Schema(type="string")),
     *   @OA\RequestBody(@OA\JsonContent(required={"subject_type","subject_id","permission"},
     *     @OA\Property(property="subject_type", type="string", enum={"user","role","department"}),
     *     @OA\Property(property="subject_id", type="integer"),
     *     @OA\Property(property="permission", type="string", enum={"viewer","editor","commenter"})
     *   )),
     *   @OA\Response(response=201, description="Collaborator berhasil ditambahkan")
     * )
     */
    public function store(Request $request, string $uuid): JsonResponse
    {
        $note = Note::where('uuid', $uuid)->firstOrFail();
        abort_unless($note->owner_id === $request->user()->id || $request->user()->isAdmin(), 403);

        $data = $request->validate([
            'subject_type' => 'required|in:user,role,department',
            'subject_id'   => 'required|integer',
            'permission'   => 'required|in:viewer,editor,commenter',
        ]);

        $collaborator = NoteCollaborator::updateOrCreate(
            [
                'note_id' => $note->id,
                'subject_type' => $data['subject_type'],
                'subject_id' => $data['subject_id']
            ],
            [
                'permission' => $data['permission'],
                'invited_by' => $request->user()->id,
                'revoked_at' => null
            ]
        );

        $this->audit->log($note, 'NOTE_SHARED', [], $collaborator->toArray(), $request);

        return response()->json(['data' => $collaborator], 201);
    }

    /**
     * @OA\Delete(path="/api/v1/collaborators/{id}", tags={"Collaborators"}, security={{"bearerAuth":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="Akses kolaborator dicabut")
     * )
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $collaborator = NoteCollaborator::findOrFail($id);
        $note         = $collaborator->note;
        abort_unless($note->owner_id === $request->user()->id || $request->user()->isAdmin(), 403);

        $collaborator->update(['revoked_at' => now()]);
        $this->audit->log($note, 'NOTE_SHARE_REVOKED', $collaborator->toArray(), [], $request);

        return response()->json(['message' => 'Access revoked.']);
    }
}
