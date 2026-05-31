<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'department_id',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password'          => 'hashed',
        'is_active'         => 'boolean',
    ];

    // JWT
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims(): array
    {
        return [
            'role'          => $this->role,
            'department_id' => $this->department_id,
        ];
    }

    // Roles
    public function isSuperAdmin(): bool  { return $this->role === 'super_admin'; }
    public function isAdmin(): bool       { return in_array($this->role, ['super_admin', 'admin']); }

    // Relationships
    public function notes()
    {
        return $this->hasMany(Note::class, 'owner_id');
    }

    public function labels()
    {
        return $this->hasMany(NoteLabel::class, 'owner_id');
    }

    public function collaborations()
    {
        return $this->hasMany(NoteCollaborator::class, 'subject_id')
            ->where('subject_type', 'user');
    }

    public function notifications()
    {
        return $this->hasMany(NoteNotification::class);
    }
}
