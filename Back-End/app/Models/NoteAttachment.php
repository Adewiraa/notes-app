<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NoteAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'note_id', 'uploaded_by', 'file_name', 'file_path',
        'mime_type', 'size_bytes', 'checksum', 'status',
    ];

    public function note()
    {
        return $this->belongsTo(Note::class);
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
