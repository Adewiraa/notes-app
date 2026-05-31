<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('note_collaborators', function (Blueprint $table) {
            $table->id();
            $table->foreignId('note_id')->constrained('notes')->cascadeOnDelete();
            $table->enum('subject_type', ['user', 'role', 'department']);
            $table->unsignedBigInteger('subject_id');
            $table->enum('permission', ['viewer', 'editor', 'commenter'])->default('viewer');
            $table->foreignId('invited_by')->constrained('users');
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();

            $table->index(['note_id', 'subject_type', 'subject_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('note_collaborators');
    }
};
