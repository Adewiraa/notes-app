<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Note;
use App\Models\NoteAttachment;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class AttachmentController extends Controller
{
    public function __construct(private readonly AuditService $audit) {}

    /**
     * @OA\Post(path="/api/v1/notes/{uuid}/attachments", tags={"Attachments"}, security={{"bearerAuth":{}}},
     *   @OA\Parameter(name="uuid", in="path", required=true, @OA\Schema(type="string")),
     *   @OA\RequestBody(
     *     @OA\MediaType(mediaType="multipart/form-data",
     *       @OA\Schema(@OA\Property(property="file", type="string", format="binary"))
     *     )
     *   ),
     *   @OA\Response(response=201, description="Attachment berhasil diunggah")
     * )
     */
    public function store(Request $request, string $uuid): JsonResponse
    {
        $note = Note::where('uuid', $uuid)->firstOrFail();
        // Hanya owner/admin/editor yang bisa mengupload
        $user = $request->user();
        abort_unless($note->owner_id === $user->id || $user->isAdmin(), 403);

        $request->validate([
            'file' => 'required|file|max:5120|mimes:jpg,jpeg,png,pdf,docx',
        ]);

        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $mimeType = $file->getClientMimeType();
        $sizeBytes = $file->getSize();

        // Simpan file di folder secure 'attachments'
        $path = $file->store('attachments');
        $checksum = hash_file('sha256', storage_path('app/' . $path));

        $attachment = NoteAttachment::create([
            'note_id'     => $note->id,
            'uploaded_by' => $user->id,
            'file_name'   => $originalName,
            'file_path'   => $path,
            'mime_type'   => $mimeType,
            'size_bytes'  => $sizeBytes,
            'checksum'    => $checksum,
            'status'      => 'active',
        ]);

        $this->audit->log($note, 'ATTACHMENT_UPLOADED', [], $attachment->toArray(), $request);

        return response()->json(['data' => $attachment], 201);
    }

    /**
     * @OA\Get(path="/api/v1/attachments/{id}/download", tags={"Attachments"}, security={{"bearerAuth":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="Download file")
     * )
     */
    public function download(Request $request, int $id): BinaryFileResponse|JsonResponse
    {
        $attachment = NoteAttachment::findOrFail($id);
        $note = $attachment->note;
        $user = $request->user();

        // Validasi hak akses sebelum download
        abort_unless(
            $note->owner_id === $user->id || 
            $user->isAdmin() || 
            $note->visibility === 'public', 
            403, 
            'Forbidden: Anda tidak memiliki hak untuk mengunduh lampiran ini.'
        );

        if (!Storage::exists($attachment->file_path)) {
            return response()->json(['message' => 'File fisik tidak ditemukan.'], 404);
        }

        return response()->download(storage_path('app/' . $attachment->file_path), $attachment->file_name);
    }
}
