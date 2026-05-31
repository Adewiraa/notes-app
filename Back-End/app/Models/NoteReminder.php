<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NoteReminder extends Model
{
    use HasFactory;

    protected $fillable = [
        'note_id', 'user_id', 'due_at', 'timezone',
        'repeat_rule', 'status', 'triggered_at', 'completed_at',
    ];

    protected $casts = [
        'due_at'       => 'datetime',
        'triggered_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function note()
    {
        return $this->belongsTo(Note::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
