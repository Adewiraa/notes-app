<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NoteChecklistItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'note_id', 'content', 'is_checked', 'checked_at', 'sort_order',
    ];

    protected $casts = [
        'is_checked' => 'boolean',
        'checked_at' => 'datetime',
    ];

    public function note()
    {
        return $this->belongsTo(Note::class);
    }
}
