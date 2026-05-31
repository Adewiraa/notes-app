<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('note_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('note_id')->constrained('notes')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users');
            $table->text('body');
            $table->enum('status', ['active', 'deleted'])->default('active');
            $table->foreignId('parent_id')->nullable()->constrained('note_comments')->nullOnDelete();
            $table->timestamps();

            $table->index('note_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('note_comments');
    }
};
