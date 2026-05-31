<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NoteComment extends Model
{
    use HasFactory;

    protected $fillable = [
        'note_id', 'user_id', 'body', 'status', 'parent_id',
    ];

    public function note()
    {
        return $this->belongsTo(Note::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function replies()
    {
        return $this->hasMany(NoteComment::class, 'parent_id')->where('status', 'active');
    }
}
