<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('note_checklist_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('note_id')->constrained('notes')->cascadeOnDelete();
            $table->string('content');
            $table->boolean('is_checked')->default(false);
            $table->timestamp('checked_at')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index('note_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('note_checklist_items');
    }
};
