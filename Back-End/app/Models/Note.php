<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Note extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid', 'owner_id', 'title', 'content', 'note_type',
        'color_key', 'visibility', 'status', 'is_pinned',
        'pinned_at', 'archived_at', 'trashed_at', 'sort_order',
    ];

    protected $casts = [
        'is_pinned'   => 'boolean',
        'pinned_at'   => 'datetime',
        'archived_at' => 'datetime',
        'trashed_at'  => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            $model->uuid = (string) Str::uuid();
        });
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active')->whereNull('archived_at')->whereNull('trashed_at');
    }

    public function scopeArchived($query)
    {
        return $query->whereNotNull('archived_at')->whereNull('trashed_at');
    }

    public function scopeTrashed($query)
    {
        return $query->whereNotNull('trashed_at');
    }

    public function scopeForUser($query, User $user)
    {
        if ($user->isAdmin()) {
            return $query;
        }
        return $query->where(function ($q) use ($user) {
            $q->where('owner_id', $user->id)
              ->orWhere('visibility', 'public')
              ->orWhereHas('collaborators', function ($c) use ($user) {
                  $c->where('subject_type', 'user')
                    ->where('subject_id', $user->id)
                    ->whereNull('revoked_at');
              });
        });
    }

    // Relationships
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function checklistItems()
    {
        return $this->hasMany(NoteChecklistItem::class)->orderBy('sort_order');
    }

    public function labels()
    {
        return $this->belongsToMany(NoteLabel::class, 'note_label_map', 'note_id', 'label_id');
    }

    public function reminders()
    {
        return $this->hasMany(NoteReminder::class);
    }

    public function attachments()
    {
        return $this->hasMany(NoteAttachment::class)->where('status', 'active');
    }

    public function collaborators()
    {
        return $this->hasMany(NoteCollaborator::class);
    }

    public function comments()
    {
        return $this->hasMany(NoteComment::class)->whereNull('parent_id')->where('status', 'active');
    }

    public function auditLogs()
    {
        return $this->hasMany(NoteAuditLog::class)->latest();
    }
}
