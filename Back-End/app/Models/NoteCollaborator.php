<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NoteCollaborator extends Model
{
    use HasFactory;

    protected $fillable = [
        'note_id', 'subject_type', 'subject_id',
        'permission', 'invited_by', 'accepted_at', 'revoked_at',
    ];

    protected $casts = [
        'accepted_at' => 'datetime',
        'revoked_at'  => 'datetime',
    ];

    public function note()
    {
        return $this->belongsTo(Note::class);
    }

    public function inviter()
    {
        return $this->belongsTo(User::class, 'invited_by');
    }
}
