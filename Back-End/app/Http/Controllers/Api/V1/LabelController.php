<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\NoteLabel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LabelController extends Controller
{
    /** GET /api/v1/labels */
    public function index(Request $request): JsonResponse
    {
        $labels = NoteLabel::where('owner_id', $request->user()->id)
            ->orWhere('scope', 'global')
            ->get();
        return response()->json(['data' => $labels]);
    }

    /** POST /api/v1/labels */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'      => 'required|string|max:100',
            'color_key' => 'nullable|string|max:50',
            'scope'     => 'in:personal,department,global',
        ]);

        // hanya admin yang bisa buat label global
        if (($data['scope'] ?? 'personal') === 'global') {
            abort_unless($request->user()->isAdmin(), 403, 'Hanya admin yang dapat membuat label global.');
        }

        $label = NoteLabel::create([
            'owner_id'  => $request->user()->id,
            'name'      => $data['name'],
            'color_key' => $data['color_key'] ?? null,
            'scope'     => $data['scope'] ?? 'personal',
        ]);

        return response()->json(['data' => $label], 201);
    }

    /** PATCH /api/v1/labels/{id} */
    public function update(Request $request, int $id): JsonResponse
    {
        $label = NoteLabel::findOrFail($id);
        abort_unless($label->owner_id === $request->user()->id || $request->user()->isAdmin(), 403);

        $data = $request->validate([
            'name'      => 'string|max:100',
            'color_key' => 'nullable|string|max:50',
        ]);

        $label->update($data);
        return response()->json(['data' => $label]);
    }

    /** DELETE /api/v1/labels/{id} */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $label = NoteLabel::findOrFail($id);
        abort_unless($label->owner_id === $request->user()->id || $request->user()->isAdmin(), 403);
        $label->delete();
        return response()->json(['message' => 'Label deleted.']);
    }
}
