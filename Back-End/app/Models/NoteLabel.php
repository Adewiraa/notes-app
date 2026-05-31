<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NoteLabel extends Model
{
    use HasFactory;

    protected $fillable = [
        'owner_id', 'name', 'color_key', 'scope', 'department_id',
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function notes()
    {
        return $this->belongsToMany(Note::class, 'note_label_map', 'label_id', 'note_id');
    }
}
