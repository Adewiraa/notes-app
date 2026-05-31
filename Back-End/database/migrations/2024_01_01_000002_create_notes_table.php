<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notes', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->string('title')->nullable();
            $table->longText('content')->nullable();
            $table->enum('note_type', ['text', 'checklist', 'mixed'])->default('text');
            $table->string('color_key', 50)->nullable()->default('default');
            $table->enum('visibility', ['private', 'department', 'public'])->default('private');
            $table->enum('status', ['active', 'archived', 'trashed', 'deleted'])->default('active');
            $table->boolean('is_pinned')->default(false);
            $table->timestamp('pinned_at')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->timestamp('trashed_at')->nullable();
            $table->integer('sort_order')->default(0);
            $table->softDeletes();
            $table->timestamps();

            $table->index(['owner_id', 'status']);
            $table->index(['owner_id', 'is_pinned']);
            $table->fullText(['title', 'content']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notes');
    }
};
